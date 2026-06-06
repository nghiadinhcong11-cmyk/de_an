using RestaurantPOS.Infrastructure.Common;

namespace RestaurantPOS.Modules.Inventory.Entities;

public class Supplier : BaseEntity
{
    public Guid RestaurantId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Phone { get; set; }
    public string? Address { get; set; }
    public string? Notes { get; set; }
}
