using System.Net;
using System.Net.Sockets;

namespace Minerva.Api.Infrastructure.Storage;

/// <summary>Restricts server-side cover fetches to known book-metadata CDNs.</summary>
public static class CoverImageUrlPolicy
{
    private static readonly string[] AllowedHosts =
    [
        "covers.openlibrary.org",
        "books.google.com",
        "books.googleusercontent.com",
        "ssl.gstatic.com",
        "lh3.googleusercontent.com",
    ];

    public static bool TryValidate(string? url, out Uri? uri, out string? error)
    {
        uri = null;
        error = null;

        if (string.IsNullOrWhiteSpace(url))
        {
            error = "URL is required.";
            return false;
        }

        if (!Uri.TryCreate(url.Trim(), UriKind.Absolute, out var parsed)
            || parsed.Scheme is not "http" and not "https")
        {
            error = "Cover URL must be an absolute http or https URL.";
            return false;
        }

        if (!IsAllowedHost(parsed.Host))
        {
            error = "Cover URL host is not allowlisted.";
            return false;
        }

        if (ResolvesToBlockedAddress(parsed))
        {
            error = "Cover URL resolves to a blocked address.";
            return false;
        }

        uri = parsed;
        return true;
    }

    private static bool IsAllowedHost(string host)
    {
        foreach (var allowed in AllowedHosts)
        {
            if (host.Equals(allowed, StringComparison.OrdinalIgnoreCase)
                || host.EndsWith("." + allowed, StringComparison.OrdinalIgnoreCase))
                return true;
        }

        return false;
    }

    private static bool ResolvesToBlockedAddress(Uri uri)
    {
        try
        {
            var addresses = Dns.GetHostAddresses(uri.DnsSafeHost);
            return addresses.Length == 0 || addresses.Any(IsBlockedAddress);
        }
        catch
        {
            return true;
        }
    }

    private static bool IsBlockedAddress(IPAddress address)
    {
        if (IPAddress.IsLoopback(address))
            return true;

        if (address.AddressFamily == AddressFamily.InterNetworkV6)
        {
            if (address.IsIPv6LinkLocal || address.IsIPv6SiteLocal)
                return true;

            var bytes = address.GetAddressBytes();
            if (bytes[0] == 0xfc || bytes[0] == 0xfd) // unique local
                return true;
        }

        if (address.AddressFamily != AddressFamily.InterNetwork)
            return false;

        var b = address.GetAddressBytes();
        return b[0] switch
        {
            0 => true,
            10 => true,
            127 => true,
            169 when b[1] == 254 => true,
            172 when b[1] is >= 16 and <= 31 => true,
            192 when b[1] == 168 => true,
            _ => false,
        };
    }
}
