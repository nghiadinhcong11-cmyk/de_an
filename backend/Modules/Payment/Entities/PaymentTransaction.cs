using RestaurantPOS.Infrastructure.Common;

namespace RestaurantPOS.Modules.Payment.Entities;

public class PaymentTransaction : BaseEntity
{
    public Guid PaymentId { get; set; }
    public string? ReferenceCode { get; set; }
    public string? TransactionCode { get; set; }
    public decimal Amount { get; set; }
    public string Status { get; set; } = string.Empty;
    public DateTime? PaidAtUtc { get; set; }
}