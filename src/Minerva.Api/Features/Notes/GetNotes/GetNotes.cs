using Carter;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Minerva.Api.Infrastructure.Data;

namespace Minerva.Api.Features.Notes.GetNotes;

public record GetNotesQuery(Guid BookId) : IRequest<IReadOnlyList<BookNoteDto>?>;

public class GetNotesHandler(MinervaDbContext db) : IRequestHandler<GetNotesQuery, IReadOnlyList<BookNoteDto>?>
{
    public async Task<IReadOnlyList<BookNoteDto>?> Handle(GetNotesQuery query, CancellationToken ct)
    {
        var bookExists = await db.Books.AsNoTracking().AnyAsync(b => b.Id == query.BookId, ct);
        if (!bookExists)
            return null;

        return await db.Notes
            .AsNoTracking()
            .Where(n => n.BookId == query.BookId)
            .OrderBy(n => n.CreatedAt)
            .Select(n => new BookNoteDto(n.Id, n.BookId, n.Type, n.Content, n.PageNumber, n.CreatedAt))
            .ToListAsync(ct);
    }
}

public class GetNotesModule : ICarterModule
{
    public void AddRoutes(IEndpointRouteBuilder app)
    {
        app.MapGet("/api/books/{id:guid}/notes", async (Guid id, ISender sender) =>
        {
            var notes = await sender.Send(new GetNotesQuery(id));
            return notes is null ? Results.NotFound() : Results.Ok(notes);
        })
        .WithName("GetBookNotes");
    }
}
