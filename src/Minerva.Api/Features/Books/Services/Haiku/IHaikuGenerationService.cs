namespace Minerva.Api.Features.Books.Services.Haiku;

public interface IHaikuGenerationService
{
  bool IsConfigured { get; }

  Task<string> GenerateAsync(
    string title,
    string author,
    string? summary,
    CancellationToken cancellationToken = default);
}
