namespace Minerva.Api.Features.Books.Services;

public static class BookMetadataHttpClient
{
    public const string Name = "BookMetadata";

    public static HttpClient Create(IHttpClientFactory factory) =>
        factory.CreateClient(Name);
}
