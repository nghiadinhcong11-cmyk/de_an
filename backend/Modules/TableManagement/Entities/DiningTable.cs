using RestaurantPOS.Infrastructure.Common;

namespace RestaurantPOS.Modules.TableManagement.Entities;

public class DiningTable : BaseEntity
{
    public Guid BranchId { get; set; }
    public Guid? ZoneId { get; set; } // Liên kết đến bảng Zones
    public string TableNumber { get; set; } = string.Empty;
    public int Capacity { get; set; }
    public string? QrCode { get; set; }
    public string Status { get; set; } = "Available";

    // Navigation
    public Zone? Zone { get; set; }
}