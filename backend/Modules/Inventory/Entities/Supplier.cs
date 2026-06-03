using RestaurantPOS.Infrastructure.Common;
using RestaurantPOS.Modules.Core.Entities;

namespace RestaurantPOS.Modules.Inventory.Entities;

public class Supplier : BaseEntity
{
    public Guid RestaurantId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Phone { get; set; }
    public string? Email { get; set; }
    public string? Address { get; set; }

    // Navigation Properties
    public Restaurant Restaurant { get; set; } = null!;
}