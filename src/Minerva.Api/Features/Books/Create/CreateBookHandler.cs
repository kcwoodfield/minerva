using MediatR;
using Minerva.Api.Infrastructure;
using Minerva.Api.Infrastructure.Data;

namespace Minerva.Api.Features.Books.Create;

public record CreateBookCommand(CreateBookRequest Request) : IRequest<BookDto>;

public class CreateBookHandler(MinervaDbContext db) : IRequestHandler<CreateBookCommand, BookDto>
{
    public async Task<BookDto> Handle(CreateBookCommand command, CancellationToken ct)
    {
        var req = command.Request;
        var book = new Book
        {
            Id = Guid.NewGuid(),
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
            Tags = req.Tags ?? [],
            CoverImageUrl = req.CoverImageUrl,
            DateAdded = DateTime.UtcNow,
            Timestamp = DateTime.UtcNow,
        };

        db.Books.Add(book);
        await db.SaveChangesAsync(ct);

        return BookDto.FromBook(book);
    }
}
