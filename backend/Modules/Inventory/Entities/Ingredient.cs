using RestaurantPOS.Infrastructure.Common;

namespace RestaurantPOS.Modules.Inventory.Entities;

public class Ingredient : BaseEntity
{
    public Guid RestaurantId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Unit { get; set; } = string.Empty;
    public bool IsActive { get; set; } = true;
}
