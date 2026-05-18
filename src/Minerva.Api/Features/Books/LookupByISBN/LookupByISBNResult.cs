using Minerva.Api.Features.Books.Services;

namespace Minerva.Api.Features.Books.LookupByISBN;

public enum LookupByISBNOutcome
{
    Found,
    NotFound,
    TimedOut,
}

public record LookupByISBNResult(BookMetadata? Metadata, LookupByISBNOutcome Outcome);
