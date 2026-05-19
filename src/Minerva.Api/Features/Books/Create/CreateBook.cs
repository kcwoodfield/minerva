using Carter;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Minerva.Api.Features.Books;
using Npgsql;

namespace Minerva.Api.Features.Books.Create;

public record CreateBookRequest(
    string Title,
    string Author,
    string Isbn13,
    string? Isbn10,
    int? Pages,
    int Rating,
    string? Review,
    int Completed,
    string? Publisher,
    DateTime? PublicationDate,
    string? Genre,
    string? SubGenre,
    string? Series,
    bool? IsFiction,
    string? Format,
    string? Edition,
    string? Translator,
    string? Summary,
    string? Haiku,
    List<string>? Tags,
    string? CoverImageUrl);

public class CreateBookModule : ICarterModule
{
    public void AddRoutes(IEndpointRouteBuilder app)
    {
        app.MapPost("/api/books", async (CreateBookRequest request, ISender sender) =>
        {
            try
            {
                var command = new CreateBookCommand(request);
                var result = await sender.Send(command);
                return Results.Created($"/api/books/{result.Id}", result);
            }
            catch (DbUpdateException ex)
                when (ex.InnerException is PostgresException { SqlState: "23505" })
            {
                return Results.Conflict(new { message = "A book with this ISBN-13 already exists in your library." });
            }
        })
        .WithName("CreateBook")
        .WithOpenApi();
    }
}
