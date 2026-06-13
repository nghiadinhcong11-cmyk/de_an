using RestaurantPOS.Modules.Ordering.Entities;
using RestaurantPOS.Modules.TableManagement.Entities;

public class Branch : BaseEntity
{
    public string Name { get; set; } = string.Empty;

    public string Address { get; set; } = string.Empty;

    public Guid RestaurantId { get; set; }

    public Guid? ManagerUserId { get; set; }

    public Restaurant Restaurant { get; set; } = null!;

    public User? ManagerUser { get; set; }

    public ICollection<DiningTable> DiningTables { get; set; } = [];

    public ICollection<Order> Orders { get; set; } = [];
}