using Carter;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace Minerva.Api.Features.Books.GetAll;

public record GetAllBooksRequest(
    int Page = 1,
    int PageSize = 25,
    string? Search = null,
    string? SortBy = "dateAdded",
    bool Ascending = false,
    bool? Archived = false);

public record GetAllBooksResponse(List<BookDto> Items, int Total, int Page, int PageSize);

public class GetAllBooksModule : ICarterModule
{
    public void AddRoutes(IEndpointRouteBuilder app)
    {
        app.MapGet("/api/books", async ([AsParameters] GetAllBooksRequest request, ISender sender) =>
        {
            var normalized = request with
            {
                Page = request.Page == 0 ? 1 : request.Page,
                PageSize = request.PageSize == 0 ? 25 : request.PageSize,
                SortBy = request.SortBy ?? "dateAdded",
                Archived = request.Archived ?? false,
            };
            var result = await sender.Send(new GetAllBooksQuery(normalized));
            return Results.Ok(result);
        })
        .WithName("GetAllBooks")
        .WithOpenApi();
    }
}
