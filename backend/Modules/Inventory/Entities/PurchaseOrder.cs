using RestaurantPOS.Infrastructure.Common;
using RestaurantPOS.Modules.Core.Entities;

namespace RestaurantPOS.Modules.Inventory.Entities;

public class PurchaseOrder : BaseEntity
{
    public Guid SupplierId { get; set; }
    public Guid BranchId { get; set; }
    public Guid CreatedByUserId { get; set; }
    public string OrderNumber { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public decimal TotalAmount { get; set; }

    // Navigation Properties
    public Supplier Supplier { get; set; } = null!;
    public User CreatedByUser { get; set; } = null!;
    public Branch Branch { get; set; } = null!;
}