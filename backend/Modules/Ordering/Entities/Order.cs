using RestaurantPOS.Infrastructure.Common;
using RestaurantPOS.Modules.Core.Entities;
using RestaurantPOS.Modules.TableManagement.Entities;
using RestaurantPOS.Modules.CRM.Entities;

namespace RestaurantPOS.Modules.Ordering.Entities;

public class Order : BaseEntity
{
    public string OrderNumber { get; set; } = string.Empty;
    public Guid RestaurantId { get; set; }
    public Guid BranchId { get; set; }
    public Guid TableId { get; set; }
    public Guid? CustomerId { get; set; }
    public Guid CreatedByUserId { get; set; } // Nhân viên tạo đơn

    public string Status { get; set; } = "Pending";
    public string PaymentStatus { get; set; } = "Pending";
    public decimal Subtotal { get; set; }
    public decimal DiscountAmount { get; set; }
    public decimal TotalAmount { get; set; }

    // Navigation Properties
    public Restaurant Restaurant { get; set; } = null!;
    public Branch Branch { get; set; } = null!;
    public DiningTable Table { get; set; } = null!;
    public Customer? Customer { get; set; }
    public User CreatedByUser { get; set; } = null!;
    public ICollection<OrderItem> OrderItems { get; set; } = [];
}