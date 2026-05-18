using System.Text.Json;
using Microsoft.Extensions.Logging;

namespace Minerva.Api.Features.Books.Services;

public class OpenLibraryBooksService(
    IHttpClientFactory httpClientFactory,
    ILogger<OpenLibraryBooksService> logger) : IBookLookupService
{
    public async Task<BookMetadata?> LookupByISBN(string isbn)
    {
        var normalized = IsbnHelper.Normalize(isbn);
        if (normalized is null) return null;

        var client = BookMetadataHttpClient.Create(httpClientFactory);

        foreach (var variant in IsbnHelper.LookupVariants(normalized))
        {
            var fromBooksApi = await TryBooksApiAsync(client, variant);
            if (fromBooksApi is not null) return fromBooksApi;

            var fromIsbnJson = await TryIsbnJsonAsync(client, variant);
            if (fromIsbnJson is not null) return fromIsbnJson;

            var fromSearch = await TrySearchAsync(client, variant);
            if (fromSearch is not null) return fromSearch;
        }

        logger.LogWarning("Open Library returned no data for ISBN {Isbn}", normalized);
        return null;
    }

    private async Task<BookMetadata?> TryBooksApiAsync(HttpClient client, string isbn)
    {
        try
        {
            var url = $"https://openlibrary.org/api/books?bibkeys=ISBN:{isbn}&format=json&jscmd=data";
            var response = await client.GetAsync(url);
            if (!response.IsSuccessStatusCode) return null;

            using var doc = JsonDocument.Parse(await response.Content.ReadAsStringAsync());
            var key = $"ISBN:{isbn}";
            if (!doc.RootElement.TryGetProperty(key, out var book))
                return null;

            return MapFromBooksApi(book);
        }
        catch (Exception ex)
        {
            logger.LogDebug(ex, "Open Library books API failed for {Isbn}", isbn);
            return null;
        }
    }

    private async Task<BookMetadata?> TryIsbnJsonAsync(HttpClient client, string isbn)
    {
        try
        {
            var url = $"https://openlibrary.org/isbn/{isbn}.json";
            var response = await client.GetAsync(url);
            if (!response.IsSuccessStatusCode) return null;

            using var doc = JsonDocument.Parse(await response.Content.ReadAsStringAsync());
            var root = doc.RootElement;

            var title = root.TryGetProperty("title", out var t) ? t.GetString() : null;

            string? author = null;
            if (root.TryGetProperty("authors", out var authorRefs) && authorRefs.GetArrayLength() > 0)
            {
                var names = new List<string>();
                foreach (var authorRef in authorRefs.EnumerateArray())
                {
                    if (!authorRef.TryGetProperty("key", out var keyEl)) continue;
                    var key = keyEl.GetString();
                    if (string.IsNullOrWhiteSpace(key)) continue;
                    var name = await FetchAuthorNameAsync(client, key);
                    if (!string.IsNullOrWhiteSpace(name)) names.Add(name);
                }
                if (names.Count > 0) author = string.Join(", ", names);
            }

            string? publisher = null;
            if (root.TryGetProperty("publishers", out var publishers) && publishers.GetArrayLength() > 0)
                publisher = publishers[0].GetString();

            DateTime? pubDate = null;
            if (root.TryGetProperty("publish_date", out var pd))
            {
                var dateStr = pd.GetString();
                if (!string.IsNullOrWhiteSpace(dateStr) && DateTime.TryParse(dateStr, out var parsed))
                    pubDate = parsed;
            }

            int? pageCount = root.TryGetProperty("number_of_pages", out var pages) ? pages.GetInt32() : null;

            string? coverUrl = null;
            if (root.TryGetProperty("covers", out var covers) && covers.GetArrayLength() > 0)
            {
                var coverId = covers[0].GetInt64();
                coverUrl = $"https://covers.openlibrary.org/b/id/{coverId}-M.jpg";
            }

            if (string.IsNullOrWhiteSpace(title) && string.IsNullOrWhiteSpace(author))
                return null;

            return new BookMetadata(title, author, publisher, pubDate, pageCount, null, null, null, coverUrl);
        }
        catch (Exception ex)
        {
            logger.LogDebug(ex, "Open Library isbn.json failed for {Isbn}", isbn);
            return null;
        }
    }

    private static async Task<string?> FetchAuthorNameAsync(HttpClient client, string authorKey)
    {
        try
        {
            var path = authorKey.TrimStart('/');
            var response = await client.GetAsync($"https://openlibrary.org/{path}.json");
            if (!response.IsSuccessStatusCode) return null;

            using var doc = JsonDocument.Parse(await response.Content.ReadAsStringAsync());
            return doc.RootElement.TryGetProperty("name", out var n) ? n.GetString() : null;
        }
        catch
        {
            return null;
        }
    }

    private async Task<BookMetadata?> TrySearchAsync(HttpClient client, string isbn)
    {
        try
        {
            var url = $"https://openlibrary.org/search.json?isbn={isbn}&limit=1";
            var response = await client.GetAsync(url);
            if (!response.IsSuccessStatusCode) return null;

            using var doc = JsonDocument.Parse(await response.Content.ReadAsStringAsync());
            if (!doc.RootElement.TryGetProperty("docs", out var docs) || docs.GetArrayLength() == 0)
                return null;

            var doc0 = docs[0];
            var title = doc0.TryGetProperty("title", out var t) ? t.GetString() : null;

            string? author = null;
            if (doc0.TryGetProperty("author_name", out var names) && names.GetArrayLength() > 0)
                author = string.Join(", ", names.EnumerateArray().Select(n => n.GetString()).Where(n => n is not null));

            string? publisher = null;
            if (doc0.TryGetProperty("publisher", out var pubs) && pubs.GetArrayLength() > 0)
                publisher = pubs[0].GetString();

            int? pageCount = doc0.TryGetProperty("number_of_pages_median", out var pages)
                ? pages.GetInt32()
                : null;

            int? year = doc0.TryGetProperty("first_publish_year", out var y) ? y.GetInt32() : null;
            DateTime? pubDate = year.HasValue ? new DateTime(year.Value, 1, 1) : null;

            string? coverUrl = null;
            if (doc0.TryGetProperty("cover_i", out var coverId))
                coverUrl = $"https://covers.openlibrary.org/b/id/{coverId.GetInt64()}-M.jpg";

            if (string.IsNullOrWhiteSpace(title) && string.IsNullOrWhiteSpace(author))
                return null;

            return new BookMetadata(title, author, publisher, pubDate, pageCount, null, null, null, coverUrl);
        }
        catch (Exception ex)
        {
            logger.LogDebug(ex, "Open Library search failed for {Isbn}", isbn);
            return null;
        }
    }

    private static BookMetadata? MapFromBooksApi(JsonElement book)
    {
        var title = book.TryGetProperty("title", out var t) ? t.GetString() : null;

        string? author = null;
        if (book.TryGetProperty("authors", out var authors) && authors.GetArrayLength() > 0)
        {
            author = string.Join(
                ", ",
                authors.EnumerateArray()
                    .Select(a => a.TryGetProperty("name", out var n) ? n.GetString() : null)
                    .Where(n => !string.IsNullOrWhiteSpace(n)));
        }

        string? publisher = null;
        if (book.TryGetProperty("publishers", out var publishers) && publishers.GetArrayLength() > 0)
            publisher = publishers[0].GetString();

        DateTime? pubDate = null;
        if (book.TryGetProperty("publish_date", out var pd))
        {
            var dateStr = pd.GetString();
            if (!string.IsNullOrWhiteSpace(dateStr) && DateTime.TryParse(dateStr, out var parsed))
                pubDate = parsed;
        }

        int? pageCount = book.TryGetProperty("number_of_pages", out var pages) ? pages.GetInt32() : null;

        string? genre = null;
        if (book.TryGetProperty("subjects", out var subjects) && subjects.GetArrayLength() > 0)
        {
            var first = subjects[0];
            genre = first.ValueKind == JsonValueKind.Object && first.TryGetProperty("name", out var sn)
                ? sn.GetString()
                : first.GetString();
        }

        string? coverUrl = null;
        if (book.TryGetProperty("cover", out var cover))
        {
            if (cover.TryGetProperty("medium", out var medium))
                coverUrl = medium.GetString();
            else if (cover.TryGetProperty("small", out var small))
                coverUrl = small.GetString();
        }

        if (string.IsNullOrWhiteSpace(title) && string.IsNullOrWhiteSpace(author))
            return null;

        return new BookMetadata(title, author, publisher, pubDate, pageCount, null, genre, null, coverUrl);
    }
}
