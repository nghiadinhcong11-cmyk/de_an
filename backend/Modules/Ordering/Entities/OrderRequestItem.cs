using RestaurantPOS.Infrastructure.Common;
using RestaurantPOS.Modules.Menu.Entities;

namespace RestaurantPOS.Modules.Ordering.Entities;

public class OrderRequestItem : BaseEntity
{
    public Guid OrderRequestId { get; set; }
    public Guid ProductId { get; set; }
    public Guid? VariantId { get; set; }
    public int Quantity { get; set; }
    public string? Note { get; set; }

    // Navigation Property
    public Product Product { get; set; } = null!;
}