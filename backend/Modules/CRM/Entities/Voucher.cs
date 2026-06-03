using RestaurantPOS.Infrastructure.Common;
using RestaurantPOS.Modules.Core.Entities;

namespace RestaurantPOS.Modules.CRM.Entities;

public class Voucher : BaseEntity
{
    public Guid? BranchId { get; set; }
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string DiscountType { get; set; } = string.Empty;
    public decimal DiscountValue { get; set; }
    public decimal MinOrderAmount { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public int UsageLimit { get; set; }
    public bool IsActive { get; set; }

    // Navigation Properties
    public Branch? Branch { get; set; }
    public ICollection<VoucherUsage> Usages { get; set; } = [];
}