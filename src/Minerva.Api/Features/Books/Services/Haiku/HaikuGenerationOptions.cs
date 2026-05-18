namespace Minerva.Api.Features.Books.Services.Haiku;

public class HaikuGenerationOptions
{
    public const string SectionName = "HaikuGeneration";

    /// <summary>Ollama or Anthropic. Empty disables generation.</summary>
    public string Provider { get; set; } = "";

    public int TimeoutSeconds { get; set; } = 60;

    public OllamaOptions Ollama { get; set; } = new();
    public AnthropicOptions Anthropic { get; set; } = new();
}

public class OllamaOptions
{
    public string BaseUrl { get; set; } = "http://localhost:11434";
    public string Model { get; set; } = "llama3.2";
}

public class AnthropicOptions
{
    public string ApiKey { get; set; } = "";
    public string Model { get; set; } = "claude-sonnet-4-20250514";
}
