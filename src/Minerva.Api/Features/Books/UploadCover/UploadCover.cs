using Carter;
using MediatR;
using Minerva.Api.Features.Books;
using Minerva.Api.Infrastructure.Data;
using Minerva.Api.Infrastructure.Storage;

namespace Minerva.Api.Features.Books.UploadCover;

public record UploadCoverCommand(Guid BookId, IFormFile File) : IRequest<BookDto?>;

public record DeleteCoverCommand(Guid BookId) : IRequest<BookDto?>;

public class UploadCoverModule : ICarterModule
{
    public void AddRoutes(IEndpointRouteBuilder app)
    {
        app.MapPost("/api/books/{id:guid}/cover", async (Guid id, IFormFile file, ISender sender) =>
        {
            if (file.Length == 0)
                return Results.BadRequest(new { message = "No file uploaded." });

            try
            {
                var result = await sender.Send(new UploadCoverCommand(id, file));
                return result is null
                    ? Results.NotFound()
                    : Results.Ok(new { url = result.CoverImageUrl });
            }
            catch (InvalidOperationException ex)
            {
                return Results.BadRequest(new { message = ex.Message });
            }
        })
        .DisableAntiforgery()
        .WithName("UploadBookCover")
        .WithOpenApi();

        app.MapDelete("/api/books/{id:guid}/cover", async (Guid id, ISender sender) =>
        {
            var result = await sender.Send(new DeleteCoverCommand(id));
            return result is null ? Results.NotFound() : Results.NoContent();
        })
        .WithName("DeleteBookCover")
        .WithOpenApi();
    }
}

public class UploadCoverHandler(MinervaDbContext db, BookImageStorage storage)
    : IRequestHandler<UploadCoverCommand, BookDto?>
{
    public async Task<BookDto?> Handle(UploadCoverCommand command, CancellationToken ct)
    {
        var book = await db.Books.FindAsync([command.BookId], ct);
        if (book is null) return null;

        storage.DeleteIfManaged(book.CoverImageUrl);
        book.CoverImageUrl = await storage.SaveAsync(command.BookId, command.File, ct);
        book.Timestamp = DateTime.UtcNow;

        await db.SaveChangesAsync(ct);
        return BookDto.FromBook(book);
    }
}

public class DeleteCoverHandler(MinervaDbContext db, BookImageStorage storage)
    : IRequestHandler<DeleteCoverCommand, BookDto?>
{
    public async Task<BookDto?> Handle(DeleteCoverCommand command, CancellationToken ct)
    {
        var book = await db.Books.FindAsync([command.BookId], ct);
        if (book is null) return null;

        storage.DeleteIfManaged(book.CoverImageUrl);
        book.CoverImageUrl = null;
        book.Timestamp = DateTime.UtcNow;

        await db.SaveChangesAsync(ct);
        return BookDto.FromBook(book);
    }
}
