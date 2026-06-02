using RestaurantPOS.Infrastructure.Common;

namespace RestaurantPOS.Modules.Ordering.Entities;

public class OrderRequestItem : BaseEntity
{
    public Guid OrderRequestId { get; set; }
    public Guid ProductId { get; set; }
    public Guid? VariantId { get; set; }
    public int Quantity { get; set; }
    public string? Note { get; set; }
}