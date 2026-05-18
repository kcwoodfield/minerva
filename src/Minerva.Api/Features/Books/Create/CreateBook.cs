using Carter;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using Minerva.Api.Features.Books;

namespace Minerva.Api.Features.Books.Create;

public record CreateBookRequest(
    string Title,
    string Author,
    string Isbn13,
    string? Isbn10,
    int Pages,
    int Rating,
    string? Review,
    int Completed,
    string? Publisher,
    DateTime? PublicationDate,
    string? Genre,
    string? SubGenre,
    string? Language,
    string? Format,
    string? Edition,
    string? Translator,
    string? Summary,
    List<string>? Tags,
    string? CoverImageUrl);

public class CreateBookModule : ICarterModule
{
    public void AddRoutes(IEndpointRouteBuilder app)
    {
        app.MapPost("/api/books", async (CreateBookRequest request, ISender sender) =>
        {
            var command = new CreateBookCommand(request);
            var result = await sender.Send(command);
            return Results.Created($"/api/books/{result.Id}", result);
        })
        .WithName("CreateBook")
        .WithOpenApi();
    }
}
