namespace Minerva.Api.Features.Notes;

public static class BookNoteTypes
{
    public const string Note = "note";
    public const string Quote = "quote";
    public const string Highlight = "highlight";

    public static readonly HashSet<string> All = new(StringComparer.Ordinal)
    {
        Note,
        Quote,
        Highlight,
    };

    public static bool IsValid(string? type) =>
        !string.IsNullOrWhiteSpace(type) && All.Contains(type.Trim());
}
