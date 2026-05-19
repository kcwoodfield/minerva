using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;
using Microsoft.Extensions.Options;

namespace Minerva.Api.Features.Books.Services.Haiku;

public class HaikuGenerationService(
    IHttpClientFactory httpClientFactory,
    IOptions<HaikuGenerationOptions> options) : IHaikuGenerationService
{
    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
        DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull,
    };

    public bool IsConfigured => GetProvider() is not null;

    public async Task<string> GenerateAsync(
        string title,
        string author,
        string? summary,
        CancellationToken cancellationToken = default)
    {
        var provider = GetProvider()
            ?? throw new InvalidOperationException("Haiku generation is not configured. Set HaikuGeneration:Provider to Ollama or Anthropic.");

        var prompt = BuildPrompt(title, author, summary);
        return provider switch
        {
            HaikuProvider.Ollama => await GenerateWithOllamaAsync(prompt, cancellationToken),
            HaikuProvider.Anthropic => await GenerateWithAnthropicAsync(prompt, cancellationToken),
            _ => throw new InvalidOperationException($"Unsupported haiku provider: {options.Value.Provider}"),
        };
    }

    private HaikuProvider? GetProvider() => options.Value.Provider.Trim().ToLowerInvariant() switch
    {
        "ollama" => HaikuProvider.Ollama,
        "anthropic" or "claude" => HaikuProvider.Anthropic,
        _ => null,
    };

    private static string BuildPrompt(string title, string author, string? summary)
    {
        var sb = new StringBuilder();
        sb.AppendLine($"Write a haiku (classic 5-7-5 syllable structure in English) inspired by the book \"{title}\" by {author}.");
        if (!string.IsNullOrWhiteSpace(summary))
        {
            var excerpt = summary.Length > 800 ? summary[..800] + "…" : summary;
            sb.AppendLine();
            sb.AppendLine("Book description:");
            sb.AppendLine(excerpt);
        }
        sb.AppendLine();
        sb.AppendLine("Return only the haiku as three short lines. No title, quotation marks, labels, explanation, dashes, or hyphens.");
        return sb.ToString();
    }

    private async Task<string> GenerateWithOllamaAsync(string prompt, CancellationToken cancellationToken)
    {
        var settings = options.Value.Ollama;
        var client = httpClientFactory.CreateClient(HaikuHttpClient.Name);
        var baseUrl = settings.BaseUrl.TrimEnd('/');
        var body = new
        {
            model = settings.Model,
            messages = new[] { new { role = "user", content = prompt } },
            stream = false,
        };

        using var response = await client.PostAsJsonAsync($"{baseUrl}/api/chat", body, JsonOptions, cancellationToken);
        response.EnsureSuccessStatusCode();

        var payload = await response.Content.ReadFromJsonAsync<OllamaChatResponse>(JsonOptions, cancellationToken);
        var text = payload?.Message?.Content?.Trim();
        if (string.IsNullOrWhiteSpace(text))
            throw new InvalidOperationException("Ollama returned an empty haiku.");

        return NormalizeHaiku(text);
    }

    private async Task<string> GenerateWithAnthropicAsync(string prompt, CancellationToken cancellationToken)
    {
        var settings = options.Value.Anthropic;
        if (string.IsNullOrWhiteSpace(settings.ApiKey))
            throw new InvalidOperationException("Anthropic API key is not configured (HaikuGeneration:Anthropic:ApiKey).");

        var client = httpClientFactory.CreateClient(HaikuHttpClient.Name);
        using var request = new HttpRequestMessage(HttpMethod.Post, "https://api.anthropic.com/v1/messages");
        request.Headers.Add("x-api-key", settings.ApiKey);
        request.Headers.Add("anthropic-version", "2023-06-01");
        request.Content = JsonContent.Create(new
        {
            model = settings.Model,
            max_tokens = settings.MaxOutputTokens,
            messages = new[] { new { role = "user", content = prompt } },
        }, options: JsonOptions);

        using var response = await client.SendAsync(request, cancellationToken);
        response.EnsureSuccessStatusCode();

        var payload = await response.Content.ReadFromJsonAsync<AnthropicMessageResponse>(JsonOptions, cancellationToken);
        var text = payload?.Content?.FirstOrDefault(c => c.Type == "text")?.Text?.Trim();
        if (string.IsNullOrWhiteSpace(text))
            throw new InvalidOperationException("Anthropic returned an empty haiku.");

        return NormalizeHaiku(text);
    }

    private static string NormalizeHaiku(string text)
    {
        var lines = text
            .Replace("\r\n", "\n", StringComparison.Ordinal)
            .Replace("—", "", StringComparison.Ordinal)
            .Replace("–", "", StringComparison.Ordinal)
            .Replace("-", "", StringComparison.Ordinal)
            .Split('\n', StringSplitOptions.TrimEntries | StringSplitOptions.RemoveEmptyEntries)
            .Take(3)
            .ToArray();

        if (lines.Length < 3)
            return text.Trim();

        return string.Join('\n', lines);
    }

    private enum HaikuProvider
    {
        Ollama,
        Anthropic,
    }

    private sealed record OllamaChatResponse(OllamaMessage? Message);
    private sealed record OllamaMessage(string? Content);
    private sealed record AnthropicMessageResponse(List<AnthropicContentBlock>? Content);
    private sealed record AnthropicContentBlock(string? Type, string? Text);
}

public static class HaikuHttpClient
{
    public const string Name = "HaikuGeneration";
}
