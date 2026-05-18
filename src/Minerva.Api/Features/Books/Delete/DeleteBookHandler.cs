using MediatR;
using Minerva.Api.Infrastructure.Data;

namespace Minerva.Api.Features.Books.Delete;

public class DeleteBookHandler(MinervaDbContext db) : IRequestHandler<DeleteBookCommand, bool>
{
    public async Task<bool> Handle(DeleteBookCommand command, CancellationToken ct)
    {
        var book = await db.Books.FindAsync([command.Id], ct);
        if (book is null) return false;

        db.Books.Remove(book);
        await db.SaveChangesAsync(ct);
        return true;
    }
}
