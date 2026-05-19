using FluentValidation;

namespace Minerva.Api.Features.Books.Create;

public class CreateBookValidator : AbstractValidator<CreateBookRequest>
{
    public CreateBookValidator()
    {
        RuleFor(x => x.Title).NotEmpty().MaximumLength(500);
        RuleFor(x => x.Author).NotEmpty().MaximumLength(300);
        RuleFor(x => x.Isbn13).NotEmpty();
        RuleFor(x => x.Pages).GreaterThanOrEqualTo(0);
        RuleFor(x => x.Rating).InclusiveBetween(0, 5);
        RuleFor(x => x.Completed).InclusiveBetween(0, 100);
    }
}
