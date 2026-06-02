using RestaurantPOS.Infrastructure.Common;

namespace RestaurantPOS.Modules.TableManagement.Entities;

public class DiningTable : BaseEntity
{
    public Guid BranchId { get; set; }
    public string TableNumber { get; set; } = string.Empty;
    public int Capacity { get; set; }
    public string? QrCode { get; set; }
    public string Status { get; set; } = "Available";
}