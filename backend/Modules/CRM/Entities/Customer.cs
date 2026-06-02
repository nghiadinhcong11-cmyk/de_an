using RestaurantPOS.Infrastructure.Common;

namespace RestaurantPOS.Modules.CRM.Entities;

public class Customer : BaseEntity
{
    public Guid RestaurantId { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string PhoneNumber { get; set; } = string.Empty;
    public string? Email { get; set; }
    public int Points { get; set; }
    public decimal TotalSpent { get; set; } // Tổng tiền đã chi
    public DateTime? LastVisitAtUtc { get; set; } // Lần cuối ghé quán
}