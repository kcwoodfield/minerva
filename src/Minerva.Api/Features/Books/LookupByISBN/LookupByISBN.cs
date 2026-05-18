using Carter;
using MediatR;
using Minerva.Api.Features.Books.Services;

namespace Minerva.Api.Features.Books.LookupByISBN;

public record LookupByISBNQuery(string ISBN) : IRequest<BookMetadata?>;

public class LookupByISBNModule : ICarterModule
{
    public void AddRoutes(IEndpointRouteBuilder app)
    {
        app.MapGet("/api/books/lookup/{isbn}", async (string isbn, ISender sender) =>
        {
            var result = await sender.Send(new LookupByISBNQuery(isbn));
            return result is null ? Results.NotFound() : Results.Ok(result);
        })
        .WithName("LookupByISBN")
        .WithOpenApi();
    }
}

public class LookupByISBNHandler(IBookLookupService lookupService) : IRequestHandler<LookupByISBNQuery, BookMetadata?>
{
    public Task<BookMetadata?> Handle(LookupByISBNQuery query, CancellationToken ct)
        => lookupService.LookupByISBN(query.ISBN);
}
