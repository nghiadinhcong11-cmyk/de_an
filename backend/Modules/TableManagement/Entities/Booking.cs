using System;
using RestaurantPOS.Infrastructure.Common;
using RestaurantPOS.Modules.Core.Entities;
using RestaurantPOS.Modules.CRM.Entities;

namespace RestaurantPOS.Modules.TableManagement.Entities;

public class Booking : BaseEntity
{
    public Guid RestaurantId { get; set; }
    public Guid BranchId { get; set; }
    public Guid? TableId { get; set; }
    public Guid? CustomerId { get; set; }

    public string CustomerName { get; set; } = string.Empty;
    public string CustomerPhone { get; set; } = string.Empty;
    public DateTime BookingDate { get; set; }
    public int NumberOfGuests { get; set; }
    public string Status { get; set; } = "Pending"; // Pending, Confirmed, Rejected, Cancelled, Completed
    public string? Notes { get; set; }

    // Navigation Properties
    public virtual Branch? Branch { get; set; }
    public virtual DiningTable? Table { get; set; }
    public virtual Customer? Customer { get; set; }
}
