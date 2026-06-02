using RestaurantPOS.Infrastructure.Common;

namespace RestaurantPOS.Modules.Ordering.Entities;

public class OrderRequest : BaseEntity
{
    public Guid BranchId { get; set; }
    public Guid TableId { get; set; }
    public string? CustomerName { get; set; }
    public string Status { get; set; } = "Pending";

    public ICollection<OrderRequestItem> OrderRequestItems { get; set; } = new List<OrderRequestItem>();
}