namespace Minerva.Api.Infrastructure.Storage;

public class BookImageStorageOptions
{
    public const string SectionName = "BookImages";
    public string RootPath { get; set; } = string.Empty;
    public string PublicPathPrefix { get; set; } = "/assets/images";
    public long MaxBytes { get; set; } = 5 * 1024 * 1024;
}
