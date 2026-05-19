namespace Minerva.Api.Infrastructure.Storage;

public class BookImageStorage(BookImageStorageOptions options)
{
    private static readonly HashSet<string> AllowedExtensions = new(StringComparer.OrdinalIgnoreCase)
    {
        ".jpg", ".jpeg", ".png", ".webp", ".gif",
    };

    private static readonly Dictionary<string, string> ContentTypes = new(StringComparer.OrdinalIgnoreCase)
    {
        [".jpg"] = "image/jpeg",
        [".jpeg"] = "image/jpeg",
        [".png"] = "image/png",
        [".webp"] = "image/webp",
        [".gif"] = "image/gif",
    };

    private static readonly Dictionary<string, string> ContentTypeToExtension = new(StringComparer.OrdinalIgnoreCase)
    {
        ["image/jpeg"] = ".jpg",
        ["image/png"] = ".png",
        ["image/webp"] = ".webp",
        ["image/gif"] = ".gif",
    };

    public string RootPath => options.RootPath;
    public string PublicPathPrefix => options.PublicPathPrefix.TrimEnd('/');

    private static readonly string[] ManagedPrefixes = ["/uploads/covers/", "/assets/images/"];

    public bool IsManagedUrl(string? url)
    {
        if (string.IsNullOrWhiteSpace(url)) return false;
        return url.StartsWith($"{PublicPathPrefix}/", StringComparison.OrdinalIgnoreCase)
            || ManagedPrefixes.Any(p => url.StartsWith(p, StringComparison.OrdinalIgnoreCase));
    }

    public string? GetLocalFileName(string? url)
    {
        if (!IsManagedUrl(url) || url is null) return null;
        var path = url.Split('?', 2)[0];
        return Path.GetFileName(path);
    }

    public async Task<string> SaveAsync(Guid bookId, IFormFile file, CancellationToken ct)
    {
        var extension = Path.GetExtension(file.FileName);
        if (string.IsNullOrEmpty(extension) || !AllowedExtensions.Contains(extension))
            throw new InvalidOperationException("Unsupported image type. Use JPEG, PNG, WebP, or GIF.");

        if (file.Length <= 0 || file.Length > options.MaxBytes)
            throw new InvalidOperationException($"Image must be between 1 byte and {options.MaxBytes / (1024 * 1024)} MB.");

        Directory.CreateDirectory(options.RootPath);

        var fileName = $"{bookId}{extension.ToLowerInvariant()}";
        var fullPath = Path.Combine(options.RootPath, fileName);

        foreach (var existing in Directory.EnumerateFiles(options.RootPath, $"{bookId}.*"))
        {
            if (!string.Equals(existing, fullPath, StringComparison.OrdinalIgnoreCase))
                File.Delete(existing);
        }

        await using var stream = File.Create(fullPath);
        await file.CopyToAsync(stream, ct);

        return $"{PublicPathPrefix}/{fileName}";
    }

    public async Task<string?> DownloadAndSaveAsync(Guid bookId, string? url, HttpClient httpClient, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(url)) return null;
        if (!CoverImageUrlPolicy.TryValidate(url, out var uri, out _))
            return null;

        try
        {
            using var request = new HttpRequestMessage(HttpMethod.Get, uri);
            using var response = await httpClient.SendAsync(request, HttpCompletionOption.ResponseHeadersRead, ct);
            if (!response.IsSuccessStatusCode) return null;

            var contentType = response.Content.Headers.ContentType?.MediaType;
            if (contentType is null || !ContentTypeToExtension.TryGetValue(contentType, out var ext))
                return null;

            var bytes = await response.Content.ReadAsByteArrayAsync(ct);
            if (bytes.Length == 0 || bytes.Length > options.MaxBytes) return null;

            Directory.CreateDirectory(options.RootPath);
            var fileName = $"{bookId}{ext}";
            var fullPath = Path.Combine(options.RootPath, fileName);

            foreach (var existing in Directory.EnumerateFiles(options.RootPath, $"{bookId}.*"))
            {
                if (!string.Equals(existing, fullPath, StringComparison.OrdinalIgnoreCase))
                    File.Delete(existing);
            }

            await File.WriteAllBytesAsync(fullPath, bytes, ct);
            return $"{PublicPathPrefix}/{fileName}";
        }
        catch (Exception ex) when (ex is HttpRequestException
            || (ex is OperationCanceledException && !ct.IsCancellationRequested))
        {
            return null;
        }
    }

    public void DeleteIfManaged(string? url)
    {
        var fileName = GetLocalFileName(url);
        if (fileName is null) return;

        var fullPath = Path.Combine(options.RootPath, fileName);
        if (File.Exists(fullPath))
            File.Delete(fullPath);
    }

    public static string? GetContentType(string fileName) =>
        ContentTypes.TryGetValue(Path.GetExtension(fileName), out var type) ? type : null;
}
