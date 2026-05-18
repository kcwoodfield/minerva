namespace Minerva.Api.Features.Books.Services;

/// <summary>Queries Google Books and Open Library in parallel and merges the best fields from each.</summary>
public class CompositeBookLookupService(
    GoogleBooksService googleBooks,
    OpenLibraryBooksService openLibrary) : IBookLookupService
{
    public async Task<BookMetadata?> LookupByISBN(string isbn)
    {
        var normalized = IsbnHelper.Normalize(isbn);
        if (normalized is null) return null;

        var googleTask = googleBooks.LookupByISBN(normalized);
        var openLibraryTask = openLibrary.LookupByISBN(normalized);

        await Task.WhenAll(googleTask, openLibraryTask);

        return BookMetadataMerger.Merge(await googleTask, await openLibraryTask);
    }
}
