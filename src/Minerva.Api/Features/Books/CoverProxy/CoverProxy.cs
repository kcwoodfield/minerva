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
        CancellationToken ct)
    {
        var book = await db.Books.AsNoTracking().FirstOrDefaultAsync(b => b.Id == id, ct);
        if (book is null) return Results.NotFound();

        var fileName = storage.GetLocalFileName(book.CoverImageUrl);
        if (fileName is null) return Results.NotFound();

        var path = Path.Combine(storage.RootPath, fileName);
        if (!File.Exists(path)) return Results.NotFound();

        var contentType = BookImageStorage.GetContentType(fileName) ?? "image/jpeg";
        return Results.File(await File.ReadAllBytesAsync(path, ct), contentType);
    }
}
