using Carter;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Minerva.Api.Infrastructure.Data;

namespace Minerva.Api.Features.Books.GetStats;

public record BookStatsDto(
    int TotalBooks,
    int TotalFinished,
    int TotalReading,
    int TotalPagesRead,
    double AverageRating,
    int BooksThisYear);

public record GetBookStatsQuery : IRequest<BookStatsDto>;

public class GetBookStatsModule : ICarterModule
{
    public void AddRoutes(IEndpointRouteBuilder app)
    {
        app.MapGet("/api/books/stats", async (ISender sender) =>
        {
            var result = await sender.Send(new GetBookStatsQuery());
            return Results.Ok(result);
        })
        .WithName("GetBookStats")
        .WithOpenApi();
    }
}

public class GetBookStatsHandler(MinervaDbContext db) : IRequestHandler<GetBookStatsQuery, BookStatsDto>
{
    public async Task<BookStatsDto> Handle(GetBookStatsQuery _, CancellationToken ct)
    {
        var thisYear = DateTime.UtcNow.Year;

        var stats = await db.Books
            .GroupBy(_ => 1)
            .Select(g => new
            {
                TotalBooks      = g.Count(),
                TotalFinished   = g.Count(b => b.Completed == 100),
                TotalReading    = g.Count(b => b.Completed > 0 && b.Completed < 100),
                TotalPagesRead  = g.Where(b => b.Completed == 100).Sum(b => (int?)b.Pages) ?? 0,
                RatingSum       = g.Where(b => b.Rating > 0).Sum(b => (int?)b.Rating) ?? 0,
                RatingCount     = g.Count(b => b.Rating > 0),
                BooksThisYear   = g.Count(b => b.DateAdded.Year == thisYear),
            })
            .FirstOrDefaultAsync(ct);

        if (stats is null)
            return new BookStatsDto(0, 0, 0, 0, 0, 0);

        var avg = stats.RatingCount > 0
            ? Math.Round((double)stats.RatingSum / stats.RatingCount, 1)
            : 0;

        return new BookStatsDto(
            stats.TotalBooks,
            stats.TotalFinished,
            stats.TotalReading,
            stats.TotalPagesRead,
            avg,
            stats.BooksThisYear);
    }
}
