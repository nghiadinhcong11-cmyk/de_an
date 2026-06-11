using RestaurantPOS.Infrastructure.Common;

namespace RestaurantPOS.Modules.TableManagement.Entities;

public class Booking : BaseEntity
{
    public Guid RestaurantId { get; set; }
    public Guid BranchId { get; set; }
    public Guid? CustomerId { get; set; }

    public string CustomerName { get; set; } = string.Empty;
    public string CustomerPhone { get; set; } = string.Empty;
    public DateTime BookingDate { get; set; }
    public int NumberOfGuests { get; set; }
    public string Status { get; set; } = "Pending"; // Pending, Confirmed, Rejected, Cancelled, Completed
    public string? Notes { get; set; }
}
