namespace Minerva.Api.Features.Books.Services;

public interface IBookLookupService
{
    Task<BookMetadata?> LookupByISBN(string isbn, CancellationToken cancellationToken = default);
}
