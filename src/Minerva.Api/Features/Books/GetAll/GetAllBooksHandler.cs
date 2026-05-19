using MediatR;
using Microsoft.EntityFrameworkCore;
using Minerva.Api.Infrastructure.Data;

namespace Minerva.Api.Features.Books.GetAll;

public record GetAllBooksQuery(GetAllBooksRequest Request) : IRequest<GetAllBooksResponse>;

public class GetAllBooksHandler(MinervaDbContext db) : IRequestHandler<GetAllBooksQuery, GetAllBooksResponse>
{
    public async Task<GetAllBooksResponse> Handle(GetAllBooksQuery query, CancellationToken ct)
    {
        var req = query.Request;
        var q = db.Books.AsQueryable();

        q = req.Archived == true
            ? q.Where(b => b.Archived)
            : q.Where(b => !b.Archived);

        if (!string.IsNullOrWhiteSpace(req.Search))
        {
            var term = req.Search.Trim();
            var pattern = $"%{term}%";
            q = q.Where(b =>
                EF.Functions.ILike(b.Title, pattern) ||
                EF.Functions.ILike(b.Author, pattern) ||
                b.Isbn13.Contains(term));
        }

        q = req.SortBy?.ToLower() switch
        {
            "title" => req.Ascending ? q.OrderBy(b => b.Title) : q.OrderByDescending(b => b.Title),
            "author" => req.Ascending ? q.OrderBy(b => b.Author) : q.OrderByDescending(b => b.Author),
            "rating" => req.Ascending ? q.OrderBy(b => b.Rating) : q.OrderByDescending(b => b.Rating),
            "pages" => req.Ascending ? q.OrderBy(b => b.Pages) : q.OrderByDescending(b => b.Pages),
            "completed" => req.Ascending ? q.OrderBy(b => b.Completed) : q.OrderByDescending(b => b.Completed),
            "genre" => req.Ascending ? q.OrderBy(b => b.Genre) : q.OrderByDescending(b => b.Genre),
            "dateadded" => req.Ascending ? q.OrderBy(b => b.DateAdded) : q.OrderByDescending(b => b.DateAdded),
            _ => req.Ascending ? q.OrderBy(b => b.DateAdded) : q.OrderByDescending(b => b.DateAdded),
        };

        var total = await q.CountAsync(ct);
        var items = await q
            .Skip((req.Page - 1) * req.PageSize)
            .Take(req.PageSize)
            .Select(b => BookDto.FromBook(b))
            .ToListAsync(ct);

        return new GetAllBooksResponse(items, total, req.Page, req.PageSize);
    }
}
