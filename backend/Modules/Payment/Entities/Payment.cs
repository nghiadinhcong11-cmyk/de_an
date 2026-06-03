using RestaurantPOS.Infrastructure.Common;
using RestaurantPOS.Modules.Ordering.Entities;

namespace RestaurantPOS.Modules.Payment.Entities;

public class Payment : BaseEntity
{
    public Guid OrderId { get; set; }
    public string Method { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public string Status { get; set; } = string.Empty;

    // Navigation Properties
    public Order Order { get; set; } = null!;
    public ICollection<PaymentTransaction> Transactions { get; set; } = [];
    public ICollection<Refund> Refunds { get; set; } = [];
}