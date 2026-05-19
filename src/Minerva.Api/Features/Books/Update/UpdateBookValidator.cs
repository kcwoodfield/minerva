using FluentValidation;
using Minerva.Api.Infrastructure.Storage;

namespace Minerva.Api.Features.Books.Update;

public class UpdateBookValidator : AbstractValidator<UpdateBookCommand>
{
    public UpdateBookValidator(BookImageStorage storage)
    {
        RuleFor(x => x.Request.Title).NotEmpty().MaximumLength(500).When(x => x.Request.Title is not null);
        RuleFor(x => x.Request.Author).NotEmpty().MaximumLength(300).When(x => x.Request.Author is not null);
        RuleFor(x => x.Request.Pages).GreaterThanOrEqualTo(0).When(x => x.Request.Pages.HasValue);
        RuleFor(x => x.Request.Rating).InclusiveBetween(0, 5).When(x => x.Request.Rating.HasValue);
        RuleFor(x => x.Request.Completed).InclusiveBetween(0, 100).When(x => x.Request.Completed.HasValue);
        RuleFor(x => x.Request.Haiku).MaximumLength(500).When(x => x.Request.Haiku is not null);

        RuleFor(x => x.Request.CoverImageUrl)
            .Must(url => string.IsNullOrWhiteSpace(url) || storage.IsManagedUrl(url) || CoverImageUrlPolicy.TryValidate(url, out _, out _))
            .WithMessage("Cover URL must be a managed upload path or an allowlisted external image host.")
            .When(x => x.Request.CoverImageUrl is not null);
    }
}
