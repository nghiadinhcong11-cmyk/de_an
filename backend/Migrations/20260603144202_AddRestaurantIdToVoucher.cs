using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace RestaurantPOS.Migrations
{
    /// <inheritdoc />
    public partial class AddRestaurantIdToVoucher : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("DELETE FROM \"Vouchers\"");
            migrationBuilder.AddColumn<Guid>(
                name: "RestaurantId",
                table: "Vouchers",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.CreateIndex(
                name: "IX_Vouchers_RestaurantId",
                table: "Vouchers",
                column: "RestaurantId");

            migrationBuilder.AddForeignKey(
                name: "FK_Vouchers_Restaurants_RestaurantId",
                table: "Vouchers",
                column: "RestaurantId",
                principalTable: "Restaurants",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Vouchers_Restaurants_RestaurantId",
                table: "Vouchers");

            migrationBuilder.DropIndex(
                name: "IX_Vouchers_RestaurantId",
                table: "Vouchers");

            migrationBuilder.DropColumn(
                name: "RestaurantId",
                table: "Vouchers");
        }
    }
}
