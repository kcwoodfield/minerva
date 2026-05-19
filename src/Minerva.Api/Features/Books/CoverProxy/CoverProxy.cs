using Carter;
using Microsoft.EntityFrameworkCore;
using Minerva.Api.Infrastructure.Data;
using Minerva.Api.Infrastructure.Storage;

namespace Minerva.Api.Features.Books.CoverProxy;

public class CoverProxyModule : ICarterModule
{
    public void AddRoutes(IEndpointRouteBuilder app)
    {
        app.MapGet("/api/books/{id:guid}/cover", ProxyBookCover);
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

        var fileName = storage.GetLocalFileName(book.CoverImageUrl);
        if (fileName is not null)
        {
            var resolved = ResolveLocalCoverPath(storage.RootPath, fileName);
            if (resolved is not null)
            {
                var (path, name) = resolved.Value;
                var contentType = BookImageStorage.GetContentType(name) ?? "image/jpeg";
                return Results.File(path, contentType);
            }
        }

        var bookIdFiles = Directory.Exists(storage.RootPath)
            ? Directory.EnumerateFiles(storage.RootPath, $"{id}.*").Take(1).ToList()
            : [];
        if (bookIdFiles.Count > 0)
        {
            var path = bookIdFiles[0];
            var name = Path.GetFileName(path);
            var contentType = BookImageStorage.GetContentType(name) ?? "image/jpeg";
            return Results.File(path, contentType);
        }

        var sourceUrl = book.CoverSourceUrl ?? book.CoverImageUrl;
        if (string.IsNullOrWhiteSpace(sourceUrl)
            || storage.IsManagedUrl(sourceUrl)
            || !CoverImageUrlPolicy.TryValidate(sourceUrl, out var uri, out _))
        {
            return Results.NotFound();
        }

        try
        {
            var client = httpClientFactory.CreateClient("CoverProxy");
            using var response = await client.GetAsync(uri, HttpCompletionOption.ResponseHeadersRead, ct);
            if (!response.IsSuccessStatusCode)
                return Results.NotFound();

            var mediaType = response.Content.Headers.ContentType?.MediaType ?? "image/jpeg";
            var stream = await response.Content.ReadAsStreamAsync(ct);
            return Results.Stream(stream, mediaType);
        }
        catch (Exception ex) when (ex is HttpRequestException
            || (ex is OperationCanceledException && !ct.IsCancellationRequested))
        {
            return Results.NotFound();
        }
    }

  private static (string Path, string FileName)? ResolveLocalCoverPath(string root, string fileName)
    {
        var exact = Path.Combine(root, fileName);
        if (File.Exists(exact)) return (exact, fileName);

        var stem = Path.GetFileNameWithoutExtension(fileName);
        foreach (var ext in new[] { ".jpg", ".jpeg", ".png", ".webp", ".gif" })
        {
            var altName = stem + ext;
            var alt = Path.Combine(root, altName);
            if (File.Exists(alt)) return (alt, altName);
        }

        return null;
    }
}
