using MediatR;
using Minerva.Api.Infrastructure;
using Minerva.Api.Infrastructure.Data;
using Minerva.Api.Infrastructure.Storage;

namespace Minerva.Api.Features.Books.Create;

public record CreateBookCommand(CreateBookRequest Request) : IRequest<BookDto>;

public class CreateBookHandler(MinervaDbContext db, BookImageStorage storage, IHttpClientFactory httpClientFactory)
    : IRequestHandler<CreateBookCommand, BookDto>
{
    public async Task<BookDto> Handle(CreateBookCommand command, CancellationToken ct)
    {
        var req = command.Request;
        var bookId = Guid.NewGuid();

        string? coverImageUrl = req.CoverImageUrl;
        if (!string.IsNullOrWhiteSpace(coverImageUrl) && !storage.IsManagedUrl(coverImageUrl))
        {
            var client = httpClientFactory.CreateClient("CoverProxy");
            coverImageUrl = await storage.DownloadAndSaveAsync(bookId, coverImageUrl, client, ct);
        }

        var book = new Book
        {
            Id = bookId,
            Title = req.Title,
            Author = req.Author,
            Isbn13 = req.Isbn13,
            Isbn10 = req.Isbn10,
            Pages = req.Pages,
            Rating = req.Rating,
            Review = req.Review,
            Completed = req.Completed,
            Publisher = req.Publisher,
            PublicationDate = DateTimeUtc.Normalize(req.PublicationDate),
            Genre = req.Genre,
            SubGenre = req.SubGenre,
            Language = req.Language,
            Format = req.Format,
            Edition = req.Edition,
            Translator = req.Translator,
            Summary = req.Summary,
            Haiku = req.Haiku,
            Tags = req.Tags ?? [],
            CoverImageUrl = coverImageUrl,
            CoverSourceUrl = req.CoverImageUrl,
            DateAdded = DateTime.UtcNow,
            Timestamp = DateTime.UtcNow,
        };

        db.Books.Add(book);
        await db.SaveChangesAsync(ct);

        return BookDto.FromBook(book);
    }
}
