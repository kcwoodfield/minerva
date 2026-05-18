using System.Text.Json;
using System.Text.Json.Serialization;

namespace Minerva.Api.Infrastructure.Json;

/// <summary>Treats JSON "" as null for nullable DateTime (common from HTML form payloads).</summary>
public sealed class NullableDateTimeJsonConverter : JsonConverter<DateTime?>
{
    public override DateTime? Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
    {
        if (reader.TokenType == JsonTokenType.Null)
            return null;

        if (reader.TokenType == JsonTokenType.String)
        {
            var text = reader.GetString();
            if (string.IsNullOrWhiteSpace(text))
                return null;
            if (DateTime.TryParse(text, out var parsed))
                return parsed;
            throw new JsonException($"Invalid date: {text}");
        }

        if (reader.TokenType == JsonTokenType.Number && reader.TryGetInt64(out var unixMs))
            return DateTimeOffset.FromUnixTimeMilliseconds(unixMs).UtcDateTime;

        throw new JsonException($"Unexpected token {reader.TokenType} for DateTime?");
    }

    public override void Write(Utf8JsonWriter writer, DateTime? value, JsonSerializerOptions options)
    {
        if (value is null)
            writer.WriteNullValue();
        else
            writer.WriteStringValue(value.Value.ToString("O"));
    }
}
