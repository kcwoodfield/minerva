using System.Text.Json;
using Microsoft.Extensions.Logging;

namespace Minerva.Api.Features.Books.Services;

public class OpenLibraryBooksService(
    IHttpClientFactory httpClientFactory,
    ILogger<OpenLibraryBooksService> logger) : IBookLookupService
{
    private const int MaxAuthorFetches = 3;

    public async Task<BookMetadata?> LookupByISBN(string isbn, CancellationToken cancellationToken = default)
    {
        var normalized = IsbnHelper.Normalize(isbn);
        if (normalized is null) return null;

        var client = BookMetadataHttpClient.Create(httpClientFactory);

        foreach (var variant in IsbnHelper.LookupVariants(normalized))
        {
            cancellationToken.ThrowIfCancellationRequested();

            var result = await LookupVariantAsync(client, variant, cancellationToken);
            if (result is not null) return result;
        }

        logger.LogWarning("Open Library returned no data for ISBN {Isbn}", normalized);
        return null;
    }

    /// <summary>Runs search, books API, and isbn.json in parallel; returns the first hit.</summary>
    private async Task<BookMetadata?> LookupVariantAsync(
        HttpClient client,
        string isbn,
        CancellationToken cancellationToken)
    {
        using var raceCts = CancellationTokenSource.CreateLinkedTokenSource(cancellationToken);
        var raceToken = raceCts.Token;

        var strategies = new[]
        {
            TrySearchAsync(client, isbn, raceToken),
            TryBooksApiAsync(client, isbn, raceToken),
            TryIsbnJsonAsync(client, isbn, raceToken),
        };

        var pending = strategies.ToList();

        while (pending.Count > 0)
        {
            var completed = await Task.WhenAny(pending);
            pending.Remove(completed);

            BookMetadata? result;
            try
            {
                result = await completed;
            }
            catch (OperationCanceledException) when (raceToken.IsCancellationRequested)
            {
                return null;
            }

            if (result is null) continue;

            await raceCts.CancelAsync();
            return result;
        }

        return null;
    }

    private async Task<BookMetadata?> TryBooksApiAsync(
        HttpClient client,
        string isbn,
        CancellationToken cancellationToken)
    {
        try
        {
            var url = $"https://openlibrary.org/api/books?bibkeys=ISBN:{isbn}&format=json&jscmd=data";
            var response = await client.GetAsync(url, cancellationToken);
            if (!response.IsSuccessStatusCode) return null;

            using var doc = JsonDocument.Parse(await response.Content.ReadAsStringAsync(cancellationToken));
            var key = $"ISBN:{isbn}";
            if (!doc.RootElement.TryGetProperty(key, out var book))
                return null;

            var workKey = ExtractWorkKey(book);
            var mapped = MapFromBooksApi(book);
            return mapped is null ? null : await EnrichDescriptionAsync(client, mapped, workKey, cancellationToken);
        }
        catch (OperationCanceledException) when (cancellationToken.IsCancellationRequested)
        {
            throw;
        }
        catch (Exception ex)
        {
            logger.LogDebug(ex, "Open Library books API failed for {Isbn}", isbn);
            return null;
        }
    }

    private async Task<BookMetadata?> TryIsbnJsonAsync(
        HttpClient client,
        string isbn,
        CancellationToken cancellationToken)
    {
        try
        {
            var url = $"https://openlibrary.org/isbn/{isbn}.json";
            var response = await client.GetAsync(url, cancellationToken);
            if (!response.IsSuccessStatusCode) return null;

            using var doc = JsonDocument.Parse(await response.Content.ReadAsStringAsync(cancellationToken));
            var root = doc.RootElement;
            var workKey = ExtractWorkKey(root);

            var title = root.TryGetProperty("title", out var t) ? t.GetString() : null;

            string? author = null;
            if (root.TryGetProperty("authors", out var authorRefs) && authorRefs.GetArrayLength() > 0)
            {
                var authorKeys = authorRefs.EnumerateArray()
                    .Select(authorRef => authorRef.TryGetProperty("key", out var keyEl) ? keyEl.GetString() : null)
                    .Where(key => !string.IsNullOrWhiteSpace(key))
                    .Take(MaxAuthorFetches)
                    .ToList();

                var nameTasks = authorKeys.Select(key => FetchAuthorNameAsync(client, key!, cancellationToken));
                var names = (await Task.WhenAll(nameTasks))
                    .Where(name => !string.IsNullOrWhiteSpace(name))
                    .ToList();

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

            var meta = new BookMetadata(title, author, publisher, pubDate, pageCount, null, null, null, coverUrl);
            return await EnrichDescriptionAsync(client, meta, workKey, cancellationToken);
        }
        catch (OperationCanceledException) when (cancellationToken.IsCancellationRequested)
        {
            throw;
        }
        catch (Exception ex)
        {
            logger.LogDebug(ex, "Open Library isbn.json failed for {Isbn}", isbn);
            return null;
        }
    }

    private static async Task<string?> FetchAuthorNameAsync(
        HttpClient client,
        string authorKey,
        CancellationToken cancellationToken)
    {
        try
        {
            var path = authorKey.TrimStart('/');
            var response = await client.GetAsync($"https://openlibrary.org/{path}.json", cancellationToken);
            if (!response.IsSuccessStatusCode) return null;

            using var doc = JsonDocument.Parse(await response.Content.ReadAsStringAsync(cancellationToken));
            return doc.RootElement.TryGetProperty("name", out var n) ? n.GetString() : null;
        }
        catch (OperationCanceledException) when (cancellationToken.IsCancellationRequested)
        {
            throw;
        }
        catch
        {
            return null;
        }
    }

    private async Task<BookMetadata?> TrySearchAsync(
        HttpClient client,
        string isbn,
        CancellationToken cancellationToken)
    {
        try
        {
            var url = $"https://openlibrary.org/search.json?isbn={isbn}&limit=1";
            var response = await client.GetAsync(url, cancellationToken);
            if (!response.IsSuccessStatusCode) return null;

            using var doc = JsonDocument.Parse(await response.Content.ReadAsStringAsync(cancellationToken));
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

            string? genre = null;
            if (doc0.TryGetProperty("subject", out var subjects) && subjects.GetArrayLength() > 0)
                genre = subjects[0].GetString();

            string? workKey = null;
            if (doc0.TryGetProperty("key", out var keyEl))
            {
                var key = keyEl.GetString();
                if (!string.IsNullOrWhiteSpace(key) && key.StartsWith("/works/", StringComparison.Ordinal))
                    workKey = key;
            }

            string? description = null;
            if (doc0.TryGetProperty("first_sentence", out var firstSentence))
            {
                description = firstSentence.ValueKind switch
                {
                    JsonValueKind.String => firstSentence.GetString(),
                    JsonValueKind.Array when firstSentence.GetArrayLength() > 0 =>
                        firstSentence[0].GetString(),
                    _ => null,
                };
                description = DescriptionSanitizer.Sanitize(description);
            }

            if (string.IsNullOrWhiteSpace(title) && string.IsNullOrWhiteSpace(author))
                return null;

            var meta = new BookMetadata(
                title, author, publisher, pubDate, pageCount, description, genre, null, coverUrl);
            return await EnrichDescriptionAsync(client, meta, workKey, cancellationToken);
        }
        catch (OperationCanceledException) when (cancellationToken.IsCancellationRequested)
        {
            throw;
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

    private static string? ExtractWorkKey(JsonElement element)
    {
        if (!element.TryGetProperty("works", out var works) || works.GetArrayLength() == 0)
            return null;

        var first = works[0];
        if (first.ValueKind == JsonValueKind.Object && first.TryGetProperty("key", out var keyEl))
            return keyEl.GetString();

        return null;
    }

    private static async Task<BookMetadata> EnrichDescriptionAsync(
        HttpClient client,
        BookMetadata meta,
        string? workKey,
        CancellationToken cancellationToken)
    {
        if (!string.IsNullOrWhiteSpace(meta.Description) || cancellationToken.IsCancellationRequested)
            return meta;

        var fromWork = await FetchWorkDescriptionAsync(client, workKey, cancellationToken);
        if (fromWork is null) return meta;

        return meta with { Description = fromWork };
    }

    private static async Task<string?> FetchWorkDescriptionAsync(
        HttpClient client,
        string? workKey,
        CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(workKey)) return null;

        try
        {
            var path = workKey.TrimStart('/');
            var response = await client.GetAsync($"https://openlibrary.org/{path}.json", cancellationToken);
            if (!response.IsSuccessStatusCode) return null;

            using var doc = JsonDocument.Parse(await response.Content.ReadAsStringAsync(cancellationToken));
            var root = doc.RootElement;

            var description = ParseWorkDescriptionProperty(root);
            if (description is not null) return DescriptionSanitizer.Sanitize(description);

            if (root.TryGetProperty("first_sentence", out var firstSentence))
            {
                var sentence = firstSentence.ValueKind switch
                {
                    JsonValueKind.String => firstSentence.GetString(),
                    JsonValueKind.Object when firstSentence.TryGetProperty("value", out var v) => v.GetString(),
                    _ => null,
                };
                return DescriptionSanitizer.Sanitize(sentence);
            }

            return null;
        }
        catch (OperationCanceledException) when (cancellationToken.IsCancellationRequested)
        {
            throw;
        }
        catch
        {
            return null;
        }
    }

    private static string? ParseWorkDescriptionProperty(JsonElement workRoot)
    {
        if (!workRoot.TryGetProperty("description", out var descEl)) return null;

        return descEl.ValueKind switch
        {
            JsonValueKind.String => descEl.GetString(),
            JsonValueKind.Object when descEl.TryGetProperty("value", out var val) => val.GetString(),
            _ => null,
        };
    }
}
