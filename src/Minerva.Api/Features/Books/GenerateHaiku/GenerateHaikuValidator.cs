using FluentValidation;

namespace Minerva.Api.Features.Books.GenerateHaiku;

public class GenerateHaikuValidator : AbstractValidator<GenerateHaikuCommand>
{
    public GenerateHaikuValidator()
    {
        RuleFor(x => x.Title).NotEmpty().MaximumLength(500);
        RuleFor(x => x.Author).NotEmpty().MaximumLength(300);
        RuleFor(x => x.Summary).MaximumLength(5000).When(x => x.Summary is not null);
    }
}
