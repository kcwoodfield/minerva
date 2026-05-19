using Carter;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Minerva.Api.Infrastructure.Data;

namespace Minerva.Api.Features.Books.GetStats;

public record MonthlyCount(string Month, int Year, int Count);
public record NamedCount(string Name, int Count);

public record BookStatsDto(
    int TotalBooks,
    int TotalFinished,
    int TotalReading,
    int TotalPagesRead,
    double AverageRating,
    int BooksThisYear,
    IReadOnlyList<MonthlyCount> BooksByMonth,
    IReadOnlyList<NamedCount> TopGenres,
    IReadOnlyList<NamedCount> TopAuthors,
    int FictionCount,
    int NonFictionCount);

public record GetBookStatsQuery : IRequest<BookStatsDto>;

public class GetBookStatsModule : ICarterModule
{
    public void AddRoutes(IEndpointRouteBuilder app)
    {
        app.MapGet("/api/books/stats", async (ISender sender) =>
            Results.Ok(await sender.Send(new GetBookStatsQuery())))
        .WithName("GetBookStats")
        .WithOpenApi();
    }
}

public class GetBookStatsHandler(MinervaDbContext db) : IRequestHandler<GetBookStatsQuery, BookStatsDto>
{
    public async Task<BookStatsDto> Handle(GetBookStatsQuery _, CancellationToken ct)
    {
        var books = await db.Books
            .Where(b => !b.Archived)
            .Select(b => new
            {
                b.DateAdded,
                b.Completed,
                b.Pages,
                b.Rating,
                b.Genre,
                b.Author,
                b.IsFiction,
            })
            .ToListAsync(ct);

        if (books.Count == 0)
            return new BookStatsDto(0, 0, 0, 0, 0, 0, [], [], [], 0, 0);

        var now       = DateTime.UtcNow;
        var thisYear  = now.Year;

        var totalFinished  = books.Count(b => b.Completed == 100);
        var totalReading   = books.Count(b => b.Completed > 0 && b.Completed < 100);
        var totalPages     = books.Where(b => b.Completed == 100).Sum(b => b.Pages);
        var ratedBooks     = books.Where(b => b.Rating > 0).ToList();
        var avgRating      = ratedBooks.Count > 0 ? Math.Round(ratedBooks.Average(b => (double)b.Rating), 1) : 0;
        var thisYearCount  = books.Count(b => b.DateAdded.Year == thisYear);

        // Last 12 months — keyed by (year, month)
        var byYearMonth = books
            .GroupBy(b => (b.DateAdded.Year, b.DateAdded.Month))
            .ToDictionary(g => g.Key, g => g.Count());

        var booksByMonth = Enumerable.Range(0, 12)
            .Select(i => now.AddMonths(-11 + i))
            .Select(d => new MonthlyCount(
                d.ToString("MMM"),
                d.Year,
                byYearMonth.GetValueOrDefault((d.Year, d.Month))))
            .ToList();

        var topGenres = books
            .Where(b => !string.IsNullOrWhiteSpace(b.Genre))
            .GroupBy(b => b.Genre!)
            .Select(g => new NamedCount(g.Key, g.Count()))
            .OrderByDescending(g => g.Count)
            .Take(6)
            .ToList();

        var topAuthors = books
            .GroupBy(b => b.Author)
            .Where(g => g.Count() >= 2)
            .Select(g => new NamedCount(g.Key, g.Count()))
            .OrderByDescending(g => g.Count)
            .Take(5)
            .ToList();

        return new BookStatsDto(
            books.Count,
            totalFinished,
            totalReading,
            totalPages,
            avgRating,
            thisYearCount,
            booksByMonth,
            topGenres,
            topAuthors,
            books.Count(b => b.IsFiction == true),
            books.Count(b => b.IsFiction == false));
    }
}
