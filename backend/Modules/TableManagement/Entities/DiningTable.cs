using RestaurantPOS.Infrastructure.Common;

namespace RestaurantPOS.Modules.TableManagement.Entities;

public class DiningTable : BaseEntity
{
    public Guid BranchId { get; set; }
    public string? Zone { get; set; } // Ví dụ: Tầng 1, Tầng 2, Sân thượng, Ngoài trời
    public string TableNumber { get; set; } = string.Empty;
    public int Capacity { get; set; }
    public string? QrCode { get; set; }
    public string Status { get; set; } = "Available";
}