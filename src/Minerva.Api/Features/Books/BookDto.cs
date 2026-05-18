namespace Minerva.Api.Features.Books;

public record BookDto(
    Guid Id,
    string Title,
    string Author,
    string Isbn13,
    string? Isbn10,
    int Pages,
    int Rating,
    string? Review,
    int Completed,
    string? Publisher,
    DateTime? PublicationDate,
    string? Genre,
    string? SubGenre,
    string? Language,
    string? Format,
    string? Edition,
    string? Translator,
    string? Summary,
    List<string> Tags,
    string? CoverImageUrl,
    DateTime DateAdded,
    DateTime Timestamp)
{
    public static BookDto FromBook(Book book) => new(
        book.Id, book.Title, book.Author, book.Isbn13, book.Isbn10,
        book.Pages, book.Rating, book.Review, book.Completed,
        book.Publisher, book.PublicationDate, book.Genre, book.SubGenre,
        book.Language, book.Format, book.Edition, book.Translator,
        book.Summary, book.Tags, book.CoverImageUrl,
        book.DateAdded, book.Timestamp);
}
