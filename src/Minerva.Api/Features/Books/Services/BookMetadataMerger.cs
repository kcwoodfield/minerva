namespace Minerva.Api.Features.Books.Services;

public static class BookMetadataMerger
{
    /// <summary>Combines Google and Open Library results; Google wins when both have a value.</summary>
    public static BookMetadata? Merge(BookMetadata? primary, BookMetadata? secondary)
    {
        if (primary is null && secondary is null) return null;
        if (primary is null) return secondary;
        if (secondary is null) return primary;

        return new BookMetadata(
            Title: Coalesce(primary.Title, secondary.Title),
            Author: Coalesce(primary.Author, secondary.Author),
            Publisher: Coalesce(primary.Publisher, secondary.Publisher),
            PublicationDate: primary.PublicationDate ?? secondary.PublicationDate,
            PageCount: primary.PageCount ?? secondary.PageCount,
            Description: Coalesce(primary.Description, secondary.Description),
            Genre: Coalesce(primary.Genre, secondary.Genre),
            Language: Coalesce(primary.Language, secondary.Language),
            CoverImageUrl: Coalesce(primary.CoverImageUrl, secondary.CoverImageUrl));
    }

    private static string? Coalesce(string? first, string? second) =>
        !string.IsNullOrWhiteSpace(first) ? first : second;
}
