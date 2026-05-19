namespace Minerva.Api.Features.Notes;

public class BookNote
{
    public Guid Id { get; set; }
    public Guid BookId { get; set; }
    public string Type { get; set; } = "note"; // note | quote | highlight
    public string Content { get; set; } = string.Empty;
    public int? PageNumber { get; set; }
    public DateTime CreatedAt { get; set; }
}

public record BookNoteDto(Guid Id, Guid BookId, string Type, string Content, int? PageNumber, DateTime CreatedAt)
{
    public static BookNoteDto FromNote(BookNote n) =>
        new(n.Id, n.BookId, n.Type, n.Content, n.PageNumber, n.CreatedAt);
}
