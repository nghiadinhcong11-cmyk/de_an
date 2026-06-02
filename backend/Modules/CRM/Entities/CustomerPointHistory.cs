using RestaurantPOS.Infrastructure.Common;

namespace RestaurantPOS.Modules.CRM.Entities;

public class CustomerPointHistory : BaseEntity
{
    public Guid CustomerId { get; set; }
    public int Points { get; set; }
    public string Type { get; set; } = string.Empty;
    public string? Description { get; set; }
}