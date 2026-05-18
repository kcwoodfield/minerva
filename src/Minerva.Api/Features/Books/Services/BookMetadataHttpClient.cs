namespace Minerva.Api.Features.Books.Services;

public static class BookMetadataHttpClient
{
    public const string Name = "BookMetadata";

    public static HttpClient Create(IHttpClientFactory factory)
    {
        var client = factory.CreateClient(Name);
        client.Timeout = TimeSpan.FromSeconds(15);
        return client;
    }
}
