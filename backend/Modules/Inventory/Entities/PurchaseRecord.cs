using RestaurantPOS.Infrastructure.Common;

namespace RestaurantPOS.Modules.Inventory.Entities;

public class PurchaseRecord : BaseEntity
{
    public Guid RestaurantId { get; set; }
    public Guid BranchId { get; set; } // Nhập hàng cho chi nhánh nào
    public DateTime PurchaseDate { get; set; }
    public Guid? SupplierId { get; set; }
    public decimal TotalAmount { get; set; }
    public string? Notes { get; set; }

    // Navigation
    public Supplier? Supplier { get; set; }
    public ICollection<PurchaseItem> Items { get; set; } = [];
}

public class PurchaseItem : BaseEntity
{
    public Guid PurchaseRecordId { get; set; }
    public Guid IngredientId { get; set; }
    public decimal Quantity { get; set; }
    public decimal UnitPrice { get; set; }
    public decimal Amount { get; set; }

    // Navigation
    public PurchaseRecord? PurchaseRecord { get; set; }
    public Ingredient? Ingredient { get; set; }
}
