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
            var path = Path.Combine(storage.RootPath, fileName);
            if (File.Exists(path))
            {
                var contentType = BookImageStorage.GetContentType(fileName) ?? "image/jpeg";
                return Results.File(await File.ReadAllBytesAsync(path, ct), contentType);
            }
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
}
