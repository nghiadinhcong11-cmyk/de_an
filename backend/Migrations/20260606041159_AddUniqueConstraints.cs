using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace RestaurantPOS.Migrations
{
    /// <inheritdoc />
    public partial class AddUniqueConstraints : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Cleanup duplicates before creating unique indexes (PostgreSQL specific MIN for UUID)
            migrationBuilder.Sql("DELETE FROM \"DiningTables\" WHERE \"Id\" NOT IN (SELECT MIN(\"Id\"::text)::uuid FROM \"DiningTables\" GROUP BY \"TableNumber\", \"BranchId\")");
            migrationBuilder.Sql("DELETE FROM \"Branches\" WHERE \"Id\" NOT IN (SELECT MIN(\"Id\"::text)::uuid FROM \"Branches\" GROUP BY \"Name\", \"RestaurantId\")");
            migrationBuilder.Sql("DELETE FROM \"Zones\" WHERE \"Id\" NOT IN (SELECT MIN(\"Id\"::text)::uuid FROM \"Zones\" GROUP BY \"Name\", \"BranchId\")");
            migrationBuilder.Sql("DELETE FROM \"Categories\" WHERE \"Id\" NOT IN (SELECT MIN(\"Id\"::text)::uuid FROM \"Categories\" GROUP BY \"Name\", \"RestaurantId\")");
            migrationBuilder.Sql("DELETE FROM \"Products\" WHERE \"Id\" NOT IN (SELECT MIN(\"Id\"::text)::uuid FROM \"Products\" GROUP BY \"Name\", \"RestaurantId\")");
            migrationBuilder.Sql("DELETE FROM \"Vouchers\" WHERE \"Id\" NOT IN (SELECT MIN(\"Id\"::text)::uuid FROM \"Vouchers\" GROUP BY \"Code\", \"RestaurantId\")");
            migrationBuilder.Sql("DELETE FROM \"Users\" WHERE \"Id\" NOT IN (SELECT MIN(\"Id\"::text)::uuid FROM \"Users\" GROUP BY \"Username\")");
            migrationBuilder.Sql("DELETE FROM \"Restaurants\" WHERE \"Id\" NOT IN (SELECT MIN(\"Id\"::text)::uuid FROM \"Restaurants\" GROUP BY \"Name\")");

            migrationBuilder.CreateIndex(
                name: "IX_Zones_Name_BranchId",
                table: "Zones",
                columns: new[] { "Name", "BranchId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Vouchers_Code_RestaurantId",
                table: "Vouchers",
                columns: new[] { "Code", "RestaurantId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Users_Username",
                table: "Users",
                column: "Username",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Restaurants_Name",
                table: "Restaurants",
                column: "Name",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Products_Name_RestaurantId",
                table: "Products",
                columns: new[] { "Name", "RestaurantId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_DiningTables_TableNumber_BranchId",
                table: "DiningTables",
                columns: new[] { "TableNumber", "BranchId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Categories_Name_RestaurantId",
                table: "Categories",
                columns: new[] { "Name", "RestaurantId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Branches_Name_RestaurantId",
                table: "Branches",
                columns: new[] { "Name", "RestaurantId" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Zones_Name_BranchId",
                table: "Zones");

            migrationBuilder.DropIndex(
                name: "IX_Vouchers_Code_RestaurantId",
                table: "Vouchers");

            migrationBuilder.DropIndex(
                name: "IX_Users_Username",
                table: "Users");

            migrationBuilder.DropIndex(
                name: "IX_Restaurants_Name",
                table: "Restaurants");

            migrationBuilder.DropIndex(
                name: "IX_Products_Name_RestaurantId",
                table: "Products");

            migrationBuilder.DropIndex(
                name: "IX_DiningTables_TableNumber_BranchId",
                table: "DiningTables");

            migrationBuilder.DropIndex(
                name: "IX_Categories_Name_RestaurantId",
                table: "Categories");

            migrationBuilder.DropIndex(
                name: "IX_Branches_Name_RestaurantId",
                table: "Branches");
        }
    }
}
