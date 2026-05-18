using System.Net;
using Carter;
using Microsoft.EntityFrameworkCore;
using Minerva.Api.Infrastructure.Data;
using Minerva.Api.Infrastructure.Storage;

namespace Minerva.Api.Features.Books.CoverProxy;

public class CoverProxyModule : ICarterModule
{
    private static readonly HashSet<string> AllowedHosts = new(StringComparer.OrdinalIgnoreCase)
    {
        "covers.openlibrary.org",
        "books.google.com",
        "books.googleapis.com",
        "books.googleusercontent.com",
    };

    public void AddRoutes(IEndpointRouteBuilder app)
    {
        app.MapGet("/api/covers/proxy", ProxyCover);
        app.MapGet("/api/books/{id:guid}/cover", ProxyBookCover);
    }

    private static async Task<IResult> ProxyCover(
        string url,
        IHttpClientFactory httpClientFactory,
        CancellationToken ct)
    {
        if (!TryParseAllowedUrl(url, out var uri))
            return Results.BadRequest(new { message = "Invalid or disallowed cover URL." });

        return await FetchAndReturn(httpClientFactory, uri, ct);
    }

    private static async Task<IResult> ProxyBookCover(
        Guid id,
        MinervaDbContext db,
        BookImageStorage storage,
        IHttpClientFactory httpClientFactory,
        CancellationToken ct)
    {
        var book = await db.Books.AsNoTracking().FirstOrDefaultAsync(b => b.Id == id, ct);
        if (book is null) return Results.NotFound();

        if (storage.IsManagedUrl(book.CoverImageUrl))
        {
            var fileName = storage.GetLocalFileName(book.CoverImageUrl);
            if (fileName is null) return Results.NotFound();
            var path = Path.Combine(storage.RootPath, fileName);
            if (!File.Exists(path)) return Results.NotFound();
            var contentType = BookImageStorage.GetContentType(fileName) ?? "image/jpeg";
            return Results.File(await File.ReadAllBytesAsync(path, ct), contentType);
        }

        var external = book.CoverSourceUrl ?? book.CoverImageUrl;
        if (string.IsNullOrWhiteSpace(external) || !TryParseAllowedUrl(external, out var uri))
            return Results.NotFound();

        foreach (var candidate in GetCoverUriCandidates(uri))
        {
            var result = await FetchAndReturn(httpClientFactory, candidate, ct);
            if (result is not null) return result;
        }

        return Results.NotFound();
    }

    private static IEnumerable<Uri> GetCoverUriCandidates(Uri uri)
    {
        yield return uri;

        var s = uri.ToString();
        foreach (var (from, to) in new[] { ("-S.jpg", "-M.jpg"), ("-M.jpg", "-L.jpg"), ("-S.jpg", "-L.jpg") })
        {
            if (s.Contains(from, StringComparison.OrdinalIgnoreCase))
                yield return new Uri(s.Replace(from, to, StringComparison.OrdinalIgnoreCase));
        }
    }

    private static bool TryParseAllowedUrl(string url, out Uri uri)
    {
        uri = null!;
        if (string.IsNullOrWhiteSpace(url) || !Uri.TryCreate(url.Trim(), UriKind.Absolute, out var parsed))
            return false;
        if (parsed.Scheme is not "http" and not "https")
            return false;
        if (!AllowedHosts.Contains(parsed.Host))
            return false;
        uri = parsed;
        return true;
    }

    private static async Task<IResult?> FetchAndReturn(
        IHttpClientFactory httpClientFactory,
        Uri uri,
        CancellationToken ct)
    {
        var client = httpClientFactory.CreateClient("CoverProxy");

        foreach (var requestUri in new[] { uri, ToHttpFallback(uri) })
        {
            if (requestUri is null) continue;

            try
            {
                using var request = new HttpRequestMessage(HttpMethod.Get, requestUri);
                request.Headers.TryAddWithoutValidation("User-Agent", "Minerva/1.0 (personal library app; cover-proxy)");

                using var response = await client.SendAsync(request, HttpCompletionOption.ResponseHeadersRead, ct);
                if (response.StatusCode is not HttpStatusCode.OK) continue;

                var contentType = response.Content.Headers.ContentType?.MediaType;
                if (contentType is null || !contentType.StartsWith("image/", StringComparison.OrdinalIgnoreCase))
                    contentType = "image/jpeg";

                var bytes = await response.Content.ReadAsByteArrayAsync(ct);
                if (bytes.Length == 0) continue;

                return Results.File(bytes, contentType);
            }
            catch (HttpRequestException)
            {
                // try next candidate
            }
        }

        return null;
    }

    private static Uri? ToHttpFallback(Uri uri)
    {
        if (uri.Scheme != Uri.UriSchemeHttps) return null;
        var builder = new UriBuilder(uri) { Scheme = Uri.UriSchemeHttp, Port = -1 };
        return builder.Uri;
    }
}
