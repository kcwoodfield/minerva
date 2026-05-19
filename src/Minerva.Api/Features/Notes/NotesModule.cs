using Carter;
using Microsoft.EntityFrameworkCore;
using Minerva.Api.Infrastructure.Data;

namespace Minerva.Api.Features.Notes;

public record CreateNoteRequest(string Type, string Content, int? PageNumber);
public record UpdateNoteRequest(string Content, int? PageNumber);

public class NotesModule : ICarterModule
{
    public void AddRoutes(IEndpointRouteBuilder app)
    {
        app.MapGet("/api/books/{id:guid}/notes", async (Guid id, MinervaDbContext db) =>
        {
            var notes = await db.Notes
                .Where(n => n.BookId == id)
                .OrderBy(n => n.CreatedAt)
                .Select(n => BookNoteDto.FromNote(n))
                .ToListAsync();
            return Results.Ok(notes);
        });

        app.MapPost("/api/books/{id:guid}/notes", async (Guid id, CreateNoteRequest req, MinervaDbContext db) =>
        {
            var note = new BookNote
            {
                Id = Guid.NewGuid(),
                BookId = id,
                Type = req.Type,
                Content = req.Content.Trim(),
                PageNumber = req.PageNumber,
                CreatedAt = DateTime.UtcNow,
            };
            db.Notes.Add(note);
            await db.SaveChangesAsync();
            return Results.Created($"/api/books/{id}/notes/{note.Id}", BookNoteDto.FromNote(note));
        });

        app.MapPut("/api/books/{id:guid}/notes/{noteId:guid}", async (Guid id, Guid noteId, UpdateNoteRequest req, MinervaDbContext db) =>
        {
            var note = await db.Notes.FirstOrDefaultAsync(n => n.Id == noteId && n.BookId == id);
            if (note is null) return Results.NotFound();
            note.Content = req.Content.Trim();
            note.PageNumber = req.PageNumber;
            await db.SaveChangesAsync();
            return Results.Ok(BookNoteDto.FromNote(note));
        });

        app.MapDelete("/api/books/{id:guid}/notes/{noteId:guid}", async (Guid id, Guid noteId, MinervaDbContext db) =>
        {
            var note = await db.Notes.FirstOrDefaultAsync(n => n.Id == noteId && n.BookId == id);
            if (note is null) return Results.NotFound();
            db.Notes.Remove(note);
            await db.SaveChangesAsync();
            return Results.NoContent();
        });
    }
}
