using RestaurantPOS.Infrastructure.Common;

namespace RestaurantPOS.Modules.Payment.Entities;

public class Refund : BaseEntity
{
    public Guid PaymentId { get; set; }
    public decimal Amount { get; set; }
    public string? Reason { get; set; }
    public Guid CreatedByUserId { get; set; }
}