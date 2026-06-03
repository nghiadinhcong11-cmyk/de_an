using RestaurantPOS.Infrastructure.Common;
using RestaurantPOS.Modules.Core.Entities;

namespace RestaurantPOS.Modules.Payment.Entities;

public class Refund : BaseEntity
{
    public Guid PaymentId { get; set; }
    public decimal Amount { get; set; }
    public string? Reason { get; set; }
    public Guid CreatedByUserId { get; set; }

    // Navigation Properties
    public Payment Payment { get; set; } = null!;
    public User CreatedByUser { get; set; } = null!;
}