using RestaurantPOS.Infrastructure.Common;

namespace RestaurantPOS.Modules.Payment.Entities;

public class Payment : BaseEntity
{
    public Guid OrderId { get; set; }
    public string Method { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public string Status { get; set; } = string.Empty;
}