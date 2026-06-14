using RestaurantPOS.Modules.Ordering.Entities;
using RestaurantPOS.Modules.TableManagement.Entities;

namespace RestaurantPOS.Modules.Core.Entities;

public class Branch : BaseEntity
{
    public string Name { get; set; } = string.Empty;

    public string? Address { get; set; }

    public string? Phone { get; set; }

    public Guid RestaurantId { get; set; }

    public Guid? ManagerUserId { get; set; }

    public bool IsActive { get; set; } = true;

    public Restaurant Restaurant { get; set; } = null!;

    public User? ManagerUser { get; set; }

    public ICollection<DiningTable> DiningTables { get; set; } = [];

    public ICollection<Order> Orders { get; set; } = [];
}