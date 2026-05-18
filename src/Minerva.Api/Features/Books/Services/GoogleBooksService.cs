using System.Text.Json;
using Microsoft.Extensions.Configuration;

namespace Minerva.Api.Features.Books.Services;

public class GoogleBooksService(IHttpClientFactory httpClientFactory, IConfiguration configuration)
{
    public async Task<BookMetadata?> LookupByISBN(string isbn)
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

            var response = await client.GetAsync(url);
            // Quota / auth errors — let composite fall back to Open Library
            if (!response.IsSuccessStatusCode) return null;

            using var doc = JsonDocument.Parse(await response.Content.ReadAsStringAsync());
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

            return new BookMetadata(title, author, publisher, pubDate, pageCount, description, genre, language, coverUrl);
        }
        catch
        {
            return null;
        }
    }
}
