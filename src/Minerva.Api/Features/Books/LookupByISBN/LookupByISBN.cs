using Carter;
using MediatR;
using Microsoft.Extensions.Options;
using Minerva.Api.Features.Books.Services;

namespace Minerva.Api.Features.Books.LookupByISBN;

public record LookupByISBNQuery(string ISBN) : IRequest<LookupByISBNResult>;

public class LookupByISBNModule : ICarterModule
{
    public void AddRoutes(IEndpointRouteBuilder app)
    {
        app.MapGet("/api/books/lookup/{isbn}", async (string isbn, ISender sender) =>
        {
            if (IsbnHelper.Normalize(isbn) is null)
                return Results.BadRequest(new { message = "Invalid ISBN. Enter 10 or 13 digits." });

            var result = await sender.Send(new LookupByISBNQuery(isbn));
            return result.Outcome switch
            {
                LookupByISBNOutcome.Found => Results.Ok(result.Metadata),
                LookupByISBNOutcome.TimedOut => Results.Json(
                    new { message = "ISBN lookup timed out. Try again, or enter book details manually." },
                    statusCode: StatusCodes.Status504GatewayTimeout),
                _ => Results.NotFound(new { message = "No book found for that ISBN." }),
            };
        })
        .WithName("LookupByISBN")
        .WithOpenApi();
    }
}

public class LookupByISBNHandler(
    IBookLookupService lookupService,
    IOptions<BookLookupOptions> options) : IRequestHandler<LookupByISBNQuery, LookupByISBNResult>
{
    public async Task<LookupByISBNResult> Handle(LookupByISBNQuery query, CancellationToken cancellationToken)
    {
        var settings = options.Value;
        using var timeoutCts = new CancellationTokenSource(
            TimeSpan.FromSeconds(settings.OverallTimeoutSeconds));
        using var linkedCts = CancellationTokenSource.CreateLinkedTokenSource(
            cancellationToken, timeoutCts.Token);

        try
        {
            var metadata = await lookupService.LookupByISBN(query.ISBN, linkedCts.Token);
            return metadata is null
                ? new LookupByISBNResult(null, LookupByISBNOutcome.NotFound)
                : new LookupByISBNResult(metadata, LookupByISBNOutcome.Found);
        }
        catch (OperationCanceledException) when (timeoutCts.IsCancellationRequested
                                                 && !cancellationToken.IsCancellationRequested)
        {
            return new LookupByISBNResult(null, LookupByISBNOutcome.TimedOut);
        }
    }
}
