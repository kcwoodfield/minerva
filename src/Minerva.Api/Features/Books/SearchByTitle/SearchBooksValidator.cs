using FluentValidation;

namespace Minerva.Api.Features.Books.SearchByTitle;

public class SearchBooksValidator : AbstractValidator<SearchBooksQuery>
{
    public SearchBooksValidator()
    {
        RuleFor(x => x.Query)
            .NotEmpty()
            .MinimumLength(2)
            .MaximumLength(200);
    }
}
