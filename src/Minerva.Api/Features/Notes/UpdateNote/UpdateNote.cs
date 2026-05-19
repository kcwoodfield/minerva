using Carter;
using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Minerva.Api.Infrastructure.Data;

namespace Minerva.Api.Features.Notes.UpdateNote;

public record UpdateNoteRequest(string Content, int? PageNumber);

public record UpdateNoteCommand(Guid BookId, Guid NoteId, string Content, int? PageNumber)
    : IRequest<BookNoteDto?>;

public class UpdateNoteHandler(MinervaDbContext db) : IRequestHandler<UpdateNoteCommand, BookNoteDto?>
{
    public async Task<BookNoteDto?> Handle(UpdateNoteCommand command, CancellationToken ct)
    {
        var note = await db.Notes.FirstOrDefaultAsync(
            n => n.Id == command.NoteId && n.BookId == command.BookId,
            ct);

        if (note is null)
            return null;

        note.Content = command.Content.Trim();
        note.PageNumber = command.PageNumber;
        await db.SaveChangesAsync(ct);

        return BookNoteDto.FromNote(note);
    }
}

public class UpdateNoteValidator : AbstractValidator<UpdateNoteCommand>
{
    public UpdateNoteValidator()
    {
        RuleFor(x => x.Content)
            .NotEmpty()
            .MaximumLength(NoteValidation.MaxContentLength);

        RuleFor(x => x.PageNumber)
            .GreaterThan(0)
            .When(x => x.PageNumber.HasValue);
    }
}

public class UpdateNoteModule : ICarterModule
{
    public void AddRoutes(IEndpointRouteBuilder app)
    {
        app.MapPut("/api/books/{id:guid}/notes/{noteId:guid}", async (
            Guid id,
            Guid noteId,
            UpdateNoteRequest req,
            ISender sender) =>
        {
            var result = await sender.Send(new UpdateNoteCommand(id, noteId, req.Content, req.PageNumber));
            return result is null ? Results.NotFound() : Results.Ok(result);
        })
        .WithName("UpdateBookNote");
    }
}
