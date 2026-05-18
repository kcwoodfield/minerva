namespace Minerva.Api.Features.Books;

public class Book
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Author { get; set; } = string.Empty;
    public string Isbn13 { get; set; } = string.Empty;
    public string? Isbn10 { get; set; }
    public int Pages { get; set; }
    public int Rating { get; set; }
    public string? Review { get; set; }
    public int Completed { get; set; }
    public string? Publisher { get; set; }
    public DateTime? PublicationDate { get; set; }
    public string? Genre { get; set; }
    public string? SubGenre { get; set; }
    public string? Language { get; set; }
    public string? Format { get; set; }
    public string? Edition { get; set; }
    public string? Translator { get; set; }
    public string? Summary { get; set; }
    public List<string> Tags { get; set; } = new();
    public string? CoverImageUrl { get; set; }
    public DateTime DateAdded { get; set; }
    public DateTime Timestamp { get; set; }
}
