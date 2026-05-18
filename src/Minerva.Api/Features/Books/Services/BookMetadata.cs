namespace Minerva.Api.Features.Books.Services;

public record BookMetadata(
    string? Title,
    string? Author,
    string? Publisher,
    DateTime? PublicationDate,
    int? PageCount,
    string? Description,
    string? Genre,
    string? Language,
    string? CoverImageUrl);
