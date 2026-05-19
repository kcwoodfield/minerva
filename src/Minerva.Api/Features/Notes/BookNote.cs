using Minerva.Api.Features.Books;

namespace Minerva.Api.Features.Notes;

public class BookNote
{
    public Guid Id { get; set; }
    public Guid BookId { get; set; }
    public Book Book { get; set; } = null!;
    public string Type { get; set; } = BookNoteTypes.Note;
    public string Content { get; set; } = string.Empty;
    public int? PageNumber { get; set; }
    public DateTime CreatedAt { get; set; }
}

public record BookNoteDto(Guid Id, Guid BookId, string Type, string Content, int? PageNumber, DateTime CreatedAt)
{
    public static BookNoteDto FromNote(BookNote n) =>
        new(n.Id, n.BookId, n.Type, n.Content, n.PageNumber, n.CreatedAt);
}
