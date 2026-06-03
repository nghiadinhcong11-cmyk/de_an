using RestaurantPOS.Infrastructure.Common;
using RestaurantPOS.Modules.Core.Entities;
using RestaurantPOS.Modules.Ordering.Entities;

namespace RestaurantPOS.Modules.CRM.Entities;

public class Customer : BaseEntity
{
    public Guid RestaurantId { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string? AvatarUrl { get; set; }
    public string PhoneNumber { get; set; } = string.Empty;
    public string? Email { get; set; }
    public int Points { get; set; }
    public decimal TotalSpent { get; set; }
    public DateTime? LastVisitAtUtc { get; set; }

    // Navigation Properties
    public Restaurant Restaurant { get; set; } = null!;
    public ICollection<CustomerPointHistory> PointHistories { get; set; } = [];
    public ICollection<Order> Orders { get; set; } = [];
    public ICollection<VoucherUsage> VoucherUsages { get; set; } = [];
}