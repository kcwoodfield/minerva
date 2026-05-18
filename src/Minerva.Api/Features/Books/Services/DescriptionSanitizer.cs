using System.Net;
using System.Text.RegularExpressions;

namespace Minerva.Api.Features.Books.Services;

public static partial class DescriptionSanitizer
{
    private const int MaxLength = 8000;

    [GeneratedRegex("<[^>]+>", RegexOptions.Compiled)]
    private static partial Regex HtmlTagRegex();

    [GeneratedRegex(@"\s+", RegexOptions.Compiled)]
    private static partial Regex WhitespaceRegex();

    public static string? Sanitize(string? raw)
    {
        if (string.IsNullOrWhiteSpace(raw)) return null;

        var decoded = WebUtility.HtmlDecode(raw);
        var stripped = HtmlTagRegex().Replace(decoded, " ");
        stripped = WhitespaceRegex().Replace(stripped, " ").Trim();

        if (string.IsNullOrWhiteSpace(stripped)) return null;

        if (stripped.Length > MaxLength)
            stripped = stripped[..MaxLength].TrimEnd() + "…";

        return stripped;
    }
}
