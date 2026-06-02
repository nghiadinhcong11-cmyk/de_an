using RestaurantPOS.Infrastructure.Common;

namespace RestaurantPOS.Modules.CRM.Entities;

public class CustomerPointHistory : BaseEntity
{
    public Guid CustomerId { get; set; }
    public Guid? OrderId { get; set; } // Liên kết với đơn hàng (nếu có)
    public int Points { get; set; }
    public string Type { get; set; } = "Earn"; // Earn, Redeem, Adjust
    public string? Description { get; set; }
}