namespace Minerva.Api.Features.Books.Services;

/// <summary>Tries Google Books first, then Open Library (no API key required).</summary>
public class CompositeBookLookupService(
    GoogleBooksService googleBooks,
    OpenLibraryBooksService openLibrary) : IBookLookupService
{
    public async Task<BookMetadata?> LookupByISBN(string isbn)
    {
        var normalized = IsbnHelper.Normalize(isbn);
        if (normalized is null) return null;

        var fromGoogle = await googleBooks.LookupByISBN(normalized);
        if (fromGoogle is not null) return fromGoogle;

        return await openLibrary.LookupByISBN(normalized);
    }
}
