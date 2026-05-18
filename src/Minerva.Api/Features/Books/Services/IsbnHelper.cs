using System.Text.RegularExpressions;

namespace Minerva.Api.Features.Books.Services;

public static partial class IsbnHelper
{
    /// <summary>Strips separators and returns 10- or 13-digit ISBN, or null if invalid.</summary>
    public static string? Normalize(string? isbn)
    {
        if (string.IsNullOrWhiteSpace(isbn)) return null;

        var digits = NonDigitRegex().Replace(isbn.ToUpperInvariant(), "");
        if (digits.Length == 13) return digits;
        if (digits.Length == 10) return digits;
        return null;
    }

    /// <summary>ISBN-10 equivalent for 978-prefixed ISBN-13 (for alternate lookups).</summary>
    public static string? ToIsbn10(string isbn13)
    {
        if (isbn13.Length != 13 || !isbn13.StartsWith("978", StringComparison.Ordinal))
            return null;

        var body = isbn13[3..12];
        var sum = 0;
        for (var i = 0; i < 9; i++)
            sum += (body[i] - '0') * (10 - i);

        var check = (11 - (sum % 11)) % 11;
        var checkChar = check == 10 ? 'X' : (char)('0' + check);
        return body + checkChar;
    }

    public static IEnumerable<string> LookupVariants(string normalized)
    {
        yield return normalized;
        if (normalized.Length == 13)
        {
            var isbn10 = ToIsbn10(normalized);
            if (isbn10 is not null) yield return isbn10;
        }
    }

    [GeneratedRegex(@"[^0-9X]")]
    private static partial Regex NonDigitRegex();
}
