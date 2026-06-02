using RestaurantPOS.Infrastructure.Common;

namespace RestaurantPOS.Modules.Payment.Entities;

public class PaymentAccount : BaseEntity
{
    public Guid BranchId { get; set; }
    public string BankCode { get; set; } = string.Empty;
    public string AccountNumber { get; set; } = string.Empty;
    public string AccountName { get; set; } = string.Empty;
    public bool IsDefault { get; set; }
    public bool IsActive { get; set; } = true;
}