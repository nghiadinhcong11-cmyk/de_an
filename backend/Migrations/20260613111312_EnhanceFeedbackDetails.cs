using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace RestaurantPOS.Migrations
{
    /// <inheritdoc />
    public partial class EnhanceFeedbackDetails : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "AttachmentUrl",
                table: "Feedbacks",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "BranchId",
                table: "Feedbacks",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "InternalNotes",
                table: "Feedbacks",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "InvoiceId",
                table: "Feedbacks",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "OrderNumber",
                table: "Feedbacks",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Status",
                table: "Feedbacks",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "TableNumber",
                table: "Feedbacks",
                type: "text",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "AttachmentUrl",
                table: "Feedbacks");

            migrationBuilder.DropColumn(
                name: "BranchId",
                table: "Feedbacks");

            migrationBuilder.DropColumn(
                name: "InternalNotes",
                table: "Feedbacks");

            migrationBuilder.DropColumn(
                name: "InvoiceId",
                table: "Feedbacks");

            migrationBuilder.DropColumn(
                name: "OrderNumber",
                table: "Feedbacks");

            migrationBuilder.DropColumn(
                name: "Status",
                table: "Feedbacks");

            migrationBuilder.DropColumn(
                name: "TableNumber",
                table: "Feedbacks");
        }
    }
}
