using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Minerva.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddBookHaiku : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Haiku",
                table: "Books",
                type: "character varying(500)",
                maxLength: 500,
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Haiku",
                table: "Books");
        }
    }
}
