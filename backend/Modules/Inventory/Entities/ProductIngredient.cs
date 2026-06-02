using RestaurantPOS.Infrastructure.Common;

namespace RestaurantPOS.Modules.Inventory.Entities;

public class ProductIngredient : BaseEntity
{
    public Guid ProductId { get; set; }
    public Guid IngredientId { get; set; }
    public decimal Quantity { get; set; }
}