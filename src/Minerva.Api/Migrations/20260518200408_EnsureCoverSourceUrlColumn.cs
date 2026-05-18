using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Minerva.Api.Migrations
{
    /// <inheritdoc />
    public partial class EnsureCoverSourceUrlColumn : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(
                """
                ALTER TABLE "Books" ADD COLUMN IF NOT EXISTS "CoverSourceUrl" text;
                UPDATE "Books"
                SET "CoverSourceUrl" = "CoverImageUrl"
                WHERE "CoverSourceUrl" IS NULL
                  AND "CoverImageUrl" IS NOT NULL
                  AND "CoverImageUrl" NOT LIKE '/uploads/covers/%'
                  AND "CoverImageUrl" NOT LIKE '/assets/images/%';
                """);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "CoverSourceUrl",
                table: "Books");
        }
    }
}
