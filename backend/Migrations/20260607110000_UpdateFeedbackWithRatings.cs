using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace RestaurantPOS.Migrations
{
    public partial class UpdateFeedbackWithRatings : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Subject",
                table: "Feedbacks");

            migrationBuilder.AddColumn<int>(
                name: "AtmosphereRating",
                table: "Feedbacks",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<Guid>(
                name: "CustomerId",
                table: "Feedbacks",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "FoodRating",
                table: "Feedbacks",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "PriceRating",
                table: "Feedbacks",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "ServiceRating",
                table: "Feedbacks",
                type: "integer",
                nullable: false,
                defaultValue: 0);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "AtmosphereRating",
                table: "Feedbacks");

            migrationBuilder.DropColumn(
                name: "CustomerId",
                table: "Feedbacks");

            migrationBuilder.DropColumn(
                name: "FoodRating",
                table: "Feedbacks");

            migrationBuilder.DropColumn(
                name: "PriceRating",
                table: "Feedbacks");

            migrationBuilder.DropColumn(
                name: "ServiceRating",
                table: "Feedbacks");

            migrationBuilder.AddColumn<string>(
                name: "Subject",
                table: "Feedbacks",
                type: "text",
                nullable: false,
                defaultValue: "");
        }
    }
}
