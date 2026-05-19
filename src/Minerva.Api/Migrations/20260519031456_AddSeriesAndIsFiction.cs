using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Minerva.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddSeriesAndIsFiction : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "IsFiction",
                table: "Books",
                type: "boolean",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Series",
                table: "Books",
                type: "text",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "IsFiction",
                table: "Books");

            migrationBuilder.DropColumn(
                name: "Series",
                table: "Books");
        }
    }
}
