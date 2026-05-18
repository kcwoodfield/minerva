namespace Minerva.Api.Features.Books.Services;

public class BookLookupOptions
{
    public const string SectionName = "BookLookup";

    /// <summary>Max time for a single HTTP call to Google Books or Open Library.</summary>
    public int RequestTimeoutSeconds { get; set; } = 8;

    /// <summary>Max time for the full ISBN lookup (all providers and fallbacks).</summary>
    public int OverallTimeoutSeconds { get; set; } = 25;
}
