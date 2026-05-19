using Carter;
using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Minerva.Api.Infrastructure.Data;

namespace Minerva.Api.Features.Notes.CreateNote;

public record CreateNoteRequest(string Type, string Content, int? PageNumber);

public record CreateNoteCommand(Guid BookId, string Type, string Content, int? PageNumber)
    : IRequest<BookNoteDto?>;

public class CreateNoteHandler(MinervaDbContext db) : IRequestHandler<CreateNoteCommand, BookNoteDto?>
{
    public async Task<BookNoteDto?> Handle(CreateNoteCommand command, CancellationToken ct)
    {
        var bookExists = await db.Books.AnyAsync(b => b.Id == command.BookId, ct);
        if (!bookExists)
            return null;

        var note = new BookNote
        {
            Id = Guid.NewGuid(),
            BookId = command.BookId,
            Type = command.Type.Trim(),
            Content = command.Content.Trim(),
            PageNumber = command.PageNumber,
            CreatedAt = DateTime.UtcNow,
        };

        db.Notes.Add(note);
        await db.SaveChangesAsync(ct);

        return BookNoteDto.FromNote(note);
    }
}

public class CreateNoteValidator : AbstractValidator<CreateNoteCommand>
{
    public CreateNoteValidator()
    {
        RuleFor(x => x.Type)
            .Must(BookNoteTypes.IsValid)
            .WithMessage($"Type must be one of: {string.Join(", ", BookNoteTypes.All)}.");

        RuleFor(x => x.Content)
            .NotEmpty()
            .MaximumLength(NoteValidation.MaxContentLength);

        RuleFor(x => x.PageNumber)
            .GreaterThan(0)
            .When(x => x.PageNumber.HasValue);
    }
}

public class CreateNoteModule : ICarterModule
{
    public void AddRoutes(IEndpointRouteBuilder app)
    {
        app.MapPost("/api/books/{id:guid}/notes", async (Guid id, CreateNoteRequest req, ISender sender) =>
        {
            var result = await sender.Send(new CreateNoteCommand(id, req.Type, req.Content, req.PageNumber));
            return result is null
                ? Results.NotFound()
                : Results.Created($"/api/books/{id}/notes/{result.Id}", result);
        })
        .WithName("CreateBookNote");
    }
}
