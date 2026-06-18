using RestaurantPOS.Infrastructure.Common;

namespace RestaurantPOS.Modules.CRM.Entities;

public class Feedback : BaseEntity
{
    public Guid RestaurantId { get; set; }
    public Guid? CustomerId { get; set; } // Optional: link to customer
    public Guid? OrderId { get; set; }    // Optional: link to specific order
    public Guid? BranchId { get; set; }
    public Guid? StaffId { get; set; }   // Link to staff being rated
    public string Name { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? TableNumber { get; set; }
    public string? OrderNumber { get; set; }
    public string? InvoiceId { get; set; }
    public string Status { get; set; } = "New"; // New, Responded, Resolved
    public string? InternalNotes { get; set; }
    public string? AttachmentUrl { get; set; }

    // Ratings (1-5 stars)
    public int ServiceRating { get; set; }
    public int FoodRating { get; set; }
    public int PriceRating { get; set; }
    public int AtmosphereRating { get; set; }

    public string Message { get; set; } = string.Empty;
    public bool IsRead { get; set; } = false;
}
