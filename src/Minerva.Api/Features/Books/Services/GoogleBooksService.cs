using System.Net;
using System.Text.Json;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace Minerva.Api.Features.Books.Services;

public class GoogleBooksService(
    IHttpClientFactory httpClientFactory,
    IConfiguration configuration,
    ILogger<GoogleBooksService> logger)
{
    public async Task<BookMetadata?> LookupByISBN(string isbn, CancellationToken cancellationToken = default)
    {
        var normalized = IsbnHelper.Normalize(isbn);
        if (normalized is null) return null;

        try
        {
            var client = BookMetadataHttpClient.Create(httpClientFactory);

            var apiKey = configuration["GoogleBooks:ApiKey"];
            var url = string.IsNullOrWhiteSpace(apiKey)
                ? $"https://www.googleapis.com/books/v1/volumes?q=isbn:{normalized}"
                : $"https://www.googleapis.com/books/v1/volumes?q=isbn:{normalized}&key={apiKey}";

            var response = await client.GetAsync(url, cancellationToken);
            if (response.StatusCode == HttpStatusCode.TooManyRequests)
            {
                logger.LogWarning(
                    "Google Books quota exceeded for ISBN {Isbn}. Configure GoogleBooks:ApiKey or retry later.",
                    normalized);
                return null;
            }

            if (!response.IsSuccessStatusCode) return null;

            using var doc = JsonDocument.Parse(await response.Content.ReadAsStringAsync(cancellationToken));
            var root = doc.RootElement;

            if (!root.TryGetProperty("items", out var items) || items.GetArrayLength() == 0)
                return null;

            var info = items[0].GetProperty("volumeInfo");

            string? title = info.TryGetProperty("title", out var t) ? t.GetString() : null;

            string? author = null;
            if (info.TryGetProperty("authors", out var authors) && authors.GetArrayLength() > 0)
                author = string.Join(", ", authors.EnumerateArray().Select(a => a.GetString()));

            string? publisher = info.TryGetProperty("publisher", out var pub) ? pub.GetString() : null;

            DateTime? pubDate = null;
            if (info.TryGetProperty("publishedDate", out var pd) && DateTime.TryParse(pd.GetString(), out var parsed))
                pubDate = parsed;

            int? pageCount = info.TryGetProperty("pageCount", out var pc) ? pc.GetInt32() : null;
            var rawDescription = info.TryGetProperty("description", out var desc) ? desc.GetString() : null;
            string? description = DescriptionSanitizer.Sanitize(rawDescription);

            string? genre = null;
            if (info.TryGetProperty("categories", out var cats) && cats.GetArrayLength() > 0)
                genre = cats[0].GetString();

            string? language = info.TryGetProperty("language", out var lang) ? lang.GetString() : null;

            string? coverUrl = null;
            if (info.TryGetProperty("imageLinks", out var imgs) && imgs.TryGetProperty("thumbnail", out var thumb))
                coverUrl = thumb.GetString();

            string? isbn13 = null, isbn10 = null;
            if (info.TryGetProperty("industryIdentifiers", out var idList))
            {
                foreach (var idEl in idList.EnumerateArray())
                {
                    var idType = idEl.TryGetProperty("type", out var idTypeEl) ? idTypeEl.GetString() : null;
                    var idVal = idEl.TryGetProperty("identifier", out var idValEl) ? idValEl.GetString() : null;
                    if (idType == "ISBN_13") isbn13 = idVal;
                    else if (idType == "ISBN_10") isbn10 = idVal;
                }
            }

            return new BookMetadata(title, author, publisher, pubDate, pageCount, description, genre, language, coverUrl, isbn13, isbn10);
        }
        catch (OperationCanceledException) when (cancellationToken.IsCancellationRequested)
        {
            throw;
        }
        catch (Exception ex)
        {
            logger.LogDebug(ex, "Google Books lookup failed for ISBN {Isbn}", isbn);
            return null;
        }
    }

    public async Task<IReadOnlyList<BookMetadata>> SearchByTitle(string query, int maxResults = 8, CancellationToken cancellationToken = default)
    {
        try
        {
            var client = BookMetadataHttpClient.Create(httpClientFactory);
            var encoded = Uri.EscapeDataString(query);
            var apiKey = configuration["GoogleBooks:ApiKey"];
            var url = string.IsNullOrWhiteSpace(apiKey)
                ? $"https://www.googleapis.com/books/v1/volumes?q={encoded}&maxResults={maxResults}&orderBy=relevance"
                : $"https://www.googleapis.com/books/v1/volumes?q={encoded}&maxResults={maxResults}&orderBy=relevance&key={apiKey}";

            var response = await client.GetAsync(url, cancellationToken);
            if (!response.IsSuccessStatusCode) return [];

            using var doc = JsonDocument.Parse(await response.Content.ReadAsStringAsync(cancellationToken));
            var root = doc.RootElement;
            if (!root.TryGetProperty("items", out var items)) return [];

            var results = new List<BookMetadata>();
            foreach (var item in items.EnumerateArray())
            {
                if (!item.TryGetProperty("volumeInfo", out var info)) continue;
                var title = info.TryGetProperty("title", out var t) ? t.GetString() : null;
                if (string.IsNullOrWhiteSpace(title)) continue;

                string? author = null;
                if (info.TryGetProperty("authors", out var authors) && authors.GetArrayLength() > 0)
                    author = string.Join(", ", authors.EnumerateArray().Select(a => a.GetString()));

                string? publisher = info.TryGetProperty("publisher", out var pub) ? pub.GetString() : null;

                DateTime? pubDate = null;
                if (info.TryGetProperty("publishedDate", out var pd) && DateTime.TryParse(pd.GetString(), out var parsed))
                    pubDate = parsed;

                int? pageCount = info.TryGetProperty("pageCount", out var pc) ? pc.GetInt32() : null;
                var rawDesc = info.TryGetProperty("description", out var desc) ? desc.GetString() : null;
                string? description = DescriptionSanitizer.Sanitize(rawDesc);

                string? genre = null;
                if (info.TryGetProperty("categories", out var cats) && cats.GetArrayLength() > 0)
                    genre = cats[0].GetString();

                string? language = info.TryGetProperty("language", out var lang) ? lang.GetString() : null;

                string? coverUrl = null;
                if (info.TryGetProperty("imageLinks", out var imgs) && imgs.TryGetProperty("thumbnail", out var thumb))
                    coverUrl = thumb.GetString();

                string? isbn13 = null, isbn10 = null;
                if (info.TryGetProperty("industryIdentifiers", out var ids))
                {
                    foreach (var idEl in ids.EnumerateArray())
                    {
                        var idType = idEl.TryGetProperty("type", out var it) ? it.GetString() : null;
                        var idVal = idEl.TryGetProperty("identifier", out var iv) ? iv.GetString() : null;
                        if (idType == "ISBN_13") isbn13 = idVal;
                        else if (idType == "ISBN_10") isbn10 = idVal;
                    }
                }

                results.Add(new BookMetadata(title, author, publisher, pubDate, pageCount, description, genre, language, coverUrl, isbn13, isbn10));
            }

            return results;
        }
        catch (OperationCanceledException) when (cancellationToken.IsCancellationRequested)
        {
            throw;
        }
        catch (Exception ex)
        {
            logger.LogDebug(ex, "Google Books title search failed for query {Query}", query);
            return [];
        }
    }
}
