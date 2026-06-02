using RestaurantPOS.Infrastructure.Common;

namespace RestaurantPOS.Modules.Core.Entities;

public class BranchSetting : BaseEntity
{
    public Guid BranchId { get; set; }
    public decimal ServiceCharge { get; set; }
    public string Currency { get; set; } = "VND";
    public TimeOnly OpenTime { get; set; }
    public TimeOnly CloseTime { get; set; }
}