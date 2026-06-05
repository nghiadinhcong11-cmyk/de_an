using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace RestaurantPOS.Migrations
{
    /// <inheritdoc />
    public partial class CreateZonesTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Zone",
                table: "DiningTables");

            migrationBuilder.AddColumn<Guid>(
                name: "ZoneId",
                table: "DiningTables",
                type: "uuid",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "Zones",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    BranchId = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "text", nullable: false),
                    DisplayOrder = table.Column<int>(type: "integer", nullable: false),
                    CreatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Zones", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Zones_Branches_BranchId",
                        column: x => x.BranchId,
                        principalTable: "Branches",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_DiningTables_ZoneId",
                table: "DiningTables",
                column: "ZoneId");

            migrationBuilder.CreateIndex(
                name: "IX_Zones_BranchId",
                table: "Zones",
                column: "BranchId");

            migrationBuilder.AddForeignKey(
                name: "FK_DiningTables_Zones_ZoneId",
                table: "DiningTables",
                column: "ZoneId",
                principalTable: "Zones",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_DiningTables_Zones_ZoneId",
                table: "DiningTables");

            migrationBuilder.DropTable(
                name: "Zones");

            migrationBuilder.DropIndex(
                name: "IX_DiningTables_ZoneId",
                table: "DiningTables");

            migrationBuilder.DropColumn(
                name: "ZoneId",
                table: "DiningTables");

            migrationBuilder.AddColumn<string>(
                name: "Zone",
                table: "DiningTables",
                type: "text",
                nullable: true);
        }
    }
}
