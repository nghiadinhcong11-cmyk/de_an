using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace RestaurantPOS.Migrations
{
    public partial class UpdateDiningTableUniqueConstraint : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_DiningTables_TableNumber_BranchId",
                table: "DiningTables");

            migrationBuilder.CreateIndex(
                name: "IX_DiningTables_TableNumber_BranchId_ZoneId",
                table: "DiningTables",
                columns: new[] { "TableNumber", "BranchId", "ZoneId" },
                unique: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_DiningTables_TableNumber_BranchId_ZoneId",
                table: "DiningTables");

            migrationBuilder.CreateIndex(
                name: "IX_DiningTables_TableNumber_BranchId",
                table: "DiningTables",
                columns: new[] { "TableNumber", "BranchId" },
                unique: true);
        }
    }
}
