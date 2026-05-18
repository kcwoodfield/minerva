using Carter;
using MediatR;
using Minerva.Api.Features.Books.Services;

namespace Minerva.Api.Features.Books.SearchByTitle;

public record SearchBooksQuery(string Query) : IRequest<IReadOnlyList<BookMetadata>>;

public class SearchBooksModule : ICarterModule
{
    public void AddRoutes(IEndpointRouteBuilder app)
    {
        app.MapGet("/api/books/search", async (string q, ISender sender) =>
        {
            var trimmed = (q ?? "").Trim();
            if (trimmed.Length < 2) return Results.Ok(Array.Empty<BookMetadata>());
            var results = await sender.Send(new SearchBooksQuery(trimmed));
            return Results.Ok(results);
        });
    }
}

public class SearchBooksHandler(GoogleBooksService googleBooks)
    : IRequestHandler<SearchBooksQuery, IReadOnlyList<BookMetadata>>
{
    public Task<IReadOnlyList<BookMetadata>> Handle(SearchBooksQuery query, CancellationToken ct) =>
        googleBooks.SearchByTitle(query.Query, cancellationToken: ct);
}
