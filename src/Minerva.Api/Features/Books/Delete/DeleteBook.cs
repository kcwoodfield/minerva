using Carter;
using MediatR;

namespace Minerva.Api.Features.Books.Delete;

public record DeleteBookCommand(Guid Id) : IRequest<bool>;

public class DeleteBookModule : ICarterModule
{
    public void AddRoutes(IEndpointRouteBuilder app)
    {
        app.MapDelete("/api/books/{id:guid}", async (Guid id, ISender sender) =>
        {
            var deleted = await sender.Send(new DeleteBookCommand(id));
            return deleted ? Results.NoContent() : Results.NotFound();
        })
        .WithName("DeleteBook")
        .WithOpenApi();
    }
}
