using Carter;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Minerva.Api.Infrastructure.Data;

namespace Minerva.Api.Features.Notes.DeleteNote;

public record DeleteNoteCommand(Guid BookId, Guid NoteId) : IRequest<bool>;

public class DeleteNoteHandler(MinervaDbContext db) : IRequestHandler<DeleteNoteCommand, bool>
{
    public async Task<bool> Handle(DeleteNoteCommand command, CancellationToken ct)
    {
        var note = await db.Notes.FirstOrDefaultAsync(
            n => n.Id == command.NoteId && n.BookId == command.BookId,
            ct);

        if (note is null)
            return false;

        db.Notes.Remove(note);
        await db.SaveChangesAsync(ct);
        return true;
    }
}

public class DeleteNoteModule : ICarterModule
{
    public void AddRoutes(IEndpointRouteBuilder app)
    {
        app.MapDelete("/api/books/{id:guid}/notes/{noteId:guid}", async (Guid id, Guid noteId, ISender sender) =>
        {
            var deleted = await sender.Send(new DeleteNoteCommand(id, noteId));
            return deleted ? Results.NoContent() : Results.NotFound();
        })
        .WithName("DeleteBookNote");
    }
}
