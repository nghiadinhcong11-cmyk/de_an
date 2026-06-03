using RestaurantPOS.Infrastructure.Common;

namespace RestaurantPOS.Modules.Core.Entities;

public class Branch : BaseEntity
{
    public Guid RestaurantId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Phone { get; set; }
    public string? Address { get; set; }
    public bool IsActive { get; set; } = true;

    // Quan hệ tới Quản lý
    public Guid? ManagerUserId { get; set; }
    public User? ManagerUser { get; set; }

    // Navigation Properties
    public Restaurant Restaurant { get; set; } = null!;
    public ICollection<RestaurantPOS.Modules.TableManagement.Entities.DiningTable> DiningTables { get; set; } = [];
    public ICollection<RestaurantPOS.Modules.Ordering.Entities.Order> Orders { get; set; } = [];
}