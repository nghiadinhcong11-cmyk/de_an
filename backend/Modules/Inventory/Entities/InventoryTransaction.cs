using RestaurantPOS.Infrastructure.Common;

namespace RestaurantPOS.Modules.Inventory.Entities;

public class InventoryTransaction : BaseEntity
{
    public Guid IngredientId { get; set; }
    public string Type { get; set; } = string.Empty;
    public decimal Quantity { get; set; }
    public Guid? ReferenceId { get; set; }

    // Navigation Property
    public Ingredient Ingredient { get; set; } = null!;
}