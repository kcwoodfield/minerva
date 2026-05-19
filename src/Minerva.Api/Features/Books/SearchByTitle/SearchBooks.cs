using Carter;
using MediatR;
using Minerva.Api.Features.Books.Services;

namespace Minerva.Api.Features.Books.SearchByTitle;

public record SearchBooksQuery(string Query) : IRequest<IReadOnlyList<BookMetadata>>;

public class SearchBooksModule : ICarterModule
{
    public void AddRoutes(IEndpointRouteBuilder app)
    {
        app.MapGet("/api/books/search", async (string? q, ISender sender) =>
        {
            var trimmed = (q ?? "").Trim();
            if (trimmed.Length < 2) return Results.Ok(Array.Empty<BookMetadata>());
            var results = await sender.Send(new SearchBooksQuery(trimmed));
            return Results.Ok(results);
        });
    }
}

public class SearchBooksHandler(GoogleBooksService googleBooks, OpenLibraryBooksService openLibrary)
    : IRequestHandler<SearchBooksQuery, IReadOnlyList<BookMetadata>>
{
    private const int MaxResults = 8;

    public async Task<IReadOnlyList<BookMetadata>> Handle(SearchBooksQuery query, CancellationToken ct)
    {
        var googleTask = googleBooks.SearchByTitle(query.Query, MaxResults, ct);
        var olTask = openLibrary.SearchByTitle(query.Query, MaxResults, ct);
        await Task.WhenAll(googleTask, olTask);
        var googleResults = await googleTask;
        var olResults = await olTask;

        // Google Books first; fill remaining slots with OL entries not already represented
        var seen = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
        var merged = new List<BookMetadata>(MaxResults);

        foreach (var item in googleResults.Concat(olResults))
        {
            if (merged.Count >= MaxResults) break;

            // Deduplicate on ISBN-13, then fall back to normalised title+author
            var key = !string.IsNullOrWhiteSpace(item.Isbn13)
                ? item.Isbn13!
                : $"{item.Title?.ToLowerInvariant().Trim()}|{item.Author?.ToLowerInvariant().Trim()}";

            if (seen.Add(key))
                merged.Add(item);
        }

        return merged;
    }
}
