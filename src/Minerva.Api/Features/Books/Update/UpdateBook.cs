using Carter;
using MediatR;

namespace Minerva.Api.Features.Books.Update;

public record UpdateBookRequest(
    string? Title,
    string? Author,
    string? Isbn13,
    string? Isbn10,
    int? Pages,
    int? Rating,
    string? Review,
    int? Completed,
    string? Publisher,
    DateTime? PublicationDate,
    string? Genre,
    string? SubGenre,
    string? Language,
    string? Format,
    string? Edition,
    string? Translator,
    string? Summary,
    string? Haiku,
    List<string>? Tags,
    string? CoverImageUrl);

public class UpdateBookModule : ICarterModule
{
    public void AddRoutes(IEndpointRouteBuilder app)
    {
        app.MapPut("/api/books/{id:guid}", async (Guid id, UpdateBookRequest request, ISender sender) =>
        {
            var result = await sender.Send(new UpdateBookCommand(id, request));
            return result is null ? Results.NotFound() : Results.Ok(result);
        })
        .WithName("UpdateBook")
        .WithOpenApi();
    }
}
