using RestaurantPOS.Infrastructure.Common;

namespace RestaurantPOS.Modules.Menu.Entities;

public class ProductVariant : BaseEntity
{
    public Guid ProductId { get; set; }
    public string Name { get; set; } = string.Empty;
    public decimal PriceAdjustment { get; set; }
}