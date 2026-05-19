using FluentValidation;

namespace Minerva.Api.Features.Books.GetAll;

public class GetAllBooksValidator : AbstractValidator<GetAllBooksQuery>
{
    private static readonly HashSet<string> AllowedSortFields = new(StringComparer.OrdinalIgnoreCase)
    {
        "title", "author", "rating", "pages", "completed", "genre", "dateadded",
    };

    public GetAllBooksValidator()
    {
        RuleFor(x => x.Request.Page).GreaterThanOrEqualTo(1);
        RuleFor(x => x.Request.PageSize).InclusiveBetween(1, 100);
        RuleFor(x => x.Request.Search).MaximumLength(200).When(x => x.Request.Search is not null);
        RuleFor(x => x.Request.SortBy)
            .Must(s => s is null || AllowedSortFields.Contains(s))
            .WithMessage("Invalid sort field.");
    }
}
