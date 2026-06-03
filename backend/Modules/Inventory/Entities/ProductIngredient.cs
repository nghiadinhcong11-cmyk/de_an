using RestaurantPOS.Infrastructure.Common;
using RestaurantPOS.Modules.Menu.Entities;

namespace RestaurantPOS.Modules.Inventory.Entities;

public class ProductIngredient : BaseEntity
{
    public Guid ProductId { get; set; }
    public Guid IngredientId { get; set; }
    public decimal Quantity { get; set; }

    // Navigation Properties
    public Product Product { get; set; } = null!;
    public Ingredient Ingredient { get; set; } = null!;
}