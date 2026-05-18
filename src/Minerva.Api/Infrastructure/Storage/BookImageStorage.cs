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
        if (!IsManagedUrl(url)) return null;
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
