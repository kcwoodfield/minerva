using MediatR;
using Microsoft.EntityFrameworkCore;
using Minerva.Api.Infrastructure;
using Minerva.Api.Infrastructure.Data;
using Minerva.Api.Infrastructure.Storage;

namespace Minerva.Api.Features.Books.Update;

public record UpdateBookCommand(Guid Id, UpdateBookRequest Request) : IRequest<BookDto?>;

public class UpdateBookHandler(MinervaDbContext db, BookImageStorage storage, IHttpClientFactory httpClientFactory)
    : IRequestHandler<UpdateBookCommand, BookDto?>
{
    public async Task<BookDto?> Handle(UpdateBookCommand command, CancellationToken ct)
    {
        var book = await db.Books.FindAsync([command.Id], ct);
        if (book is null) return null;

        var req = command.Request;
        if (req.Title is not null) book.Title = req.Title;
        if (req.Author is not null) book.Author = req.Author;
        if (req.Isbn13 is not null) book.Isbn13 = req.Isbn13;
        if (req.Isbn10 is not null) book.Isbn10 = req.Isbn10;
        if (req.Pages is not null) book.Pages = req.Pages.Value;
        if (req.Rating is not null) book.Rating = req.Rating.Value;
        if (req.Review is not null) book.Review = req.Review;
        if (req.Completed is not null) book.Completed = req.Completed.Value;
        if (req.Publisher is not null) book.Publisher = req.Publisher;
        if (req.PublicationDate is not null) book.PublicationDate = DateTimeUtc.Normalize(req.PublicationDate);
        if (req.Genre is not null) book.Genre = req.Genre;
        if (req.SubGenre is not null) book.SubGenre = req.SubGenre;
        if (req.Language is not null) book.Language = req.Language;
        if (req.Format is not null) book.Format = req.Format;
        if (req.Edition is not null) book.Edition = req.Edition;
        if (req.Translator is not null) book.Translator = req.Translator;
        if (req.Summary is not null) book.Summary = req.Summary;
        if (req.Haiku is not null) book.Haiku = req.Haiku;
        if (req.Tags is not null) book.Tags = req.Tags;
        if (req.CoverImageUrl is not null)
        {
            if (storage.IsManagedUrl(req.CoverImageUrl))
            {
                book.CoverImageUrl = req.CoverImageUrl;
            }
            else if (!string.IsNullOrWhiteSpace(req.CoverImageUrl))
            {
                var client = httpClientFactory.CreateClient("CoverProxy");
                var localPath = await storage.DownloadAndSaveAsync(command.Id, req.CoverImageUrl, client, ct);
                if (localPath is not null)
                {
                    storage.DeleteIfManaged(book.CoverImageUrl);
                    book.CoverImageUrl = localPath;
                    book.CoverSourceUrl = req.CoverImageUrl;
                }
            }
        }
        book.Timestamp = DateTime.UtcNow;

        await db.SaveChangesAsync(ct);
        return BookDto.FromBook(book);
    }
}
