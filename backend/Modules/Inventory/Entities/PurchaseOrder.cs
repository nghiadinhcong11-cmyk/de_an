using RestaurantPOS.Infrastructure.Common;

namespace RestaurantPOS.Modules.Inventory.Entities;

public class PurchaseOrder : BaseEntity
{
    public Guid SupplierId { get; set; }
    public Guid BranchId { get; set; }
    public Guid CreatedByUserId { get; set; }
    public string OrderNumber { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public decimal TotalAmount { get; set; }
}