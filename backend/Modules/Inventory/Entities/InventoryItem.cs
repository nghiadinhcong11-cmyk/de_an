using RestaurantPOS.Infrastructure.Common;

namespace RestaurantPOS.Modules.Inventory.Entities;

public class InventoryItem : BaseEntity
{
    public Guid IngredientId { get; set; }
    public decimal CurrentQuantity { get; set; }
    public decimal MinimumQuantity { get; set; }

    // Navigation Property
    public Ingredient Ingredient { get; set; } = null!;
}