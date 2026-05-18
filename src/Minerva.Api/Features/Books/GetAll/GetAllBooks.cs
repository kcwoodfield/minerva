using Carter;
using MediatR;

namespace Minerva.Api.Features.Books.GetAll;

public record GetAllBooksRequest(
    int Page = 1,
    int PageSize = 25,
    string? Search = null,
    string? SortBy = "dateAdded",
    bool Ascending = false);

public record GetAllBooksResponse(List<BookDto> Items, int Total, int Page, int PageSize);

public class GetAllBooksModule : ICarterModule
{
    public void AddRoutes(IEndpointRouteBuilder app)
    {
        app.MapGet("/api/books", async (
            int page,
            int pageSize,
            string? search,
            string? sortBy,
            bool ascending,
            ISender sender) =>
        {
            var request = new GetAllBooksRequest(
                page == 0 ? 1 : page,
                pageSize == 0 ? 25 : pageSize,
                search,
                sortBy ?? "dateAdded",
                ascending);
            var result = await sender.Send(new GetAllBooksQuery(request));
            return Results.Ok(result);
        })
        .WithName("GetAllBooks")
        .WithOpenApi();
    }
}
