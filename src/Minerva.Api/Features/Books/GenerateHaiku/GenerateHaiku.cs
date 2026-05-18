using Carter;
using MediatR;
using Minerva.Api.Features.Books.Services.Haiku;

namespace Minerva.Api.Features.Books.GenerateHaiku;

public record GenerateHaikuRequest(string Title, string Author, string? Summary);

public record GenerateHaikuResponse(string Haiku);

public record GenerateHaikuCommand(string Title, string Author, string? Summary)
    : IRequest<GenerateHaikuResult>;

public enum GenerateHaikuOutcome
{
    Success,
    NotConfigured,
    Failed,
}

public record GenerateHaikuResult(GenerateHaikuOutcome Outcome, string? Haiku, string? Message);

public class GenerateHaikuModule : ICarterModule
{
    public void AddRoutes(IEndpointRouteBuilder app)
    {
        app.MapPost("/api/books/generate-haiku", async (GenerateHaikuRequest request, ISender sender) =>
        {
            if (string.IsNullOrWhiteSpace(request.Title) || string.IsNullOrWhiteSpace(request.Author))
                return Results.BadRequest(new { message = "Title and author are required to generate a haiku." });

            var result = await sender.Send(new GenerateHaikuCommand(
                request.Title.Trim(),
                request.Author.Trim(),
                string.IsNullOrWhiteSpace(request.Summary) ? null : request.Summary.Trim()));

            return result.Outcome switch
            {
                GenerateHaikuOutcome.Success => Results.Ok(new GenerateHaikuResponse(result.Haiku!)),
                GenerateHaikuOutcome.NotConfigured => Results.Json(
                    new { message = result.Message },
                    statusCode: StatusCodes.Status503ServiceUnavailable),
                _ => Results.Json(
                    new { message = result.Message ?? "Failed to generate haiku." },
                    statusCode: StatusCodes.Status502BadGateway),
            };
        })
        .WithName("GenerateHaiku")
        .WithOpenApi();
    }
}

public class GenerateHaikuHandler(IHaikuGenerationService haikuService)
    : IRequestHandler<GenerateHaikuCommand, GenerateHaikuResult>
{
    public async Task<GenerateHaikuResult> Handle(GenerateHaikuCommand command, CancellationToken cancellationToken)
    {
        if (!haikuService.IsConfigured)
        {
            return new GenerateHaikuResult(
                GenerateHaikuOutcome.NotConfigured,
                null,
                "Haiku generation is not configured. Set HaikuGeneration:Provider to Ollama or Anthropic and the matching credentials.");
        }

        try
        {
            var haiku = await haikuService.GenerateAsync(
                command.Title,
                command.Author,
                command.Summary,
                cancellationToken);

            return new GenerateHaikuResult(GenerateHaikuOutcome.Success, haiku, null);
        }
        catch (Exception ex)
        {
            return new GenerateHaikuResult(
                GenerateHaikuOutcome.Failed,
                null,
                ex.Message);
        }
    }
}
