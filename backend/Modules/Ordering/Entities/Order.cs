using RestaurantPOS.Infrastructure.Common;

namespace RestaurantPOS.Modules.Ordering.Entities;

public class Order : BaseEntity
{
    public string OrderNumber { get; set; } = string.Empty;
    public Guid RestaurantId { get; set; }
    public Guid BranchId { get; set; }
    public Guid TableId { get; set; }
    public Guid? CustomerId { get; set; }
    public Guid CreatedByUserId { get; set; }
    public string Status { get; set; } = "Pending";
    public string PaymentStatus { get; set; } = "Pending";
    public decimal Subtotal { get; set; }
    public decimal DiscountAmount { get; set; }
    public decimal TotalAmount { get; set; }

    public ICollection<OrderItem> OrderItems { get; set; } = new List<OrderItem>();
}