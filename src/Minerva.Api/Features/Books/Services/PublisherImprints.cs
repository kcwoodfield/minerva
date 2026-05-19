namespace Minerva.Api.Features.Books.Services;

/// <summary>Publisher names that double as series/imprint identifiers.</summary>
public static class PublisherImprints
{
    private static readonly HashSet<string> Imprints = new(StringComparer.OrdinalIgnoreCase)
    {
        "Penguin Classics", "Penguin Modern Classics", "Penguin Popular Classics",
        "Penguin Great Ideas", "Pelican Books",
        "Oxford World's Classics",
        "Everyman's Library",
        "Library of America",
        "Modern Library",
        "New York Review Books Classics", "NYRB Classics",
        "Vintage Classics",
        "Signet Classics",
        "Dover Thrift Editions",
        "Wordsworth Classics",
        "Barnes & Noble Classics",
        "Canongate Classics",
        "Folio Society",
        "Anchor Books",
        "Picador Classic",
    };

    /// <summary>Returns the publisher value if it is a known imprint, otherwise null.</summary>
    public static string? AsImprint(string? publisher) =>
        !string.IsNullOrWhiteSpace(publisher) && Imprints.Contains(publisher.Trim())
            ? publisher.Trim()
            : null;
}
