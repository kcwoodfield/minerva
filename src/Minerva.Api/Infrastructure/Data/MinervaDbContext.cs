using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.ChangeTracking;
using Minerva.Api.Features.Books;
using Minerva.Api.Features.Notes;

namespace Minerva.Api.Infrastructure.Data;

public class MinervaDbContext(DbContextOptions<MinervaDbContext> options) : DbContext(options)
{
    public DbSet<Book> Books => Set<Book>();
    public DbSet<BookNote> Notes => Set<BookNote>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Book>(entity =>
        {
            entity.HasKey(b => b.Id);

            entity.Property(b => b.Title).IsRequired().HasMaxLength(500);
            entity.Property(b => b.Author).IsRequired().HasMaxLength(300);
            entity.Property(b => b.Haiku).HasMaxLength(500);
            entity.Property(b => b.Isbn13).IsRequired();
            entity.HasIndex(b => b.Isbn13).IsUnique();

            var jsonOptions = new JsonSerializerOptions();
            var comparer = new ValueComparer<List<string>>(
                (a, b) => a != null && b != null && a.SequenceEqual(b),
                c => c.Aggregate(0, (a, v) => HashCode.Combine(a, v.GetHashCode())),
                c => c.ToList());

            entity.Property(b => b.Tags)
                .HasConversion(
                    v => JsonSerializer.Serialize(v, jsonOptions),
                    v => JsonSerializer.Deserialize<List<string>>(v, jsonOptions) ?? new List<string>())
                .Metadata.SetValueComparer(comparer);

            entity.Property(b => b.DateAdded).HasDefaultValueSql("NOW()");
            entity.Property(b => b.Timestamp).HasDefaultValueSql("NOW()");
        });

        modelBuilder.Entity<BookNote>(entity =>
        {
            entity.HasKey(n => n.Id);
            entity.Property(n => n.Type).IsRequired().HasMaxLength(20);
            entity.Property(n => n.Content).IsRequired().HasMaxLength(NoteValidation.MaxContentLength);
            entity.Property(n => n.CreatedAt).HasDefaultValueSql("NOW()");
            entity.HasIndex(n => n.BookId);

            entity.HasOne(n => n.Book)
                .WithMany()
                .HasForeignKey(n => n.BookId)
                .OnDelete(DeleteBehavior.Cascade);
        });
    }
}
