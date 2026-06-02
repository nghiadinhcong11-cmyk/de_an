using RestaurantPOS.Infrastructure.Common;

namespace RestaurantPOS.Modules.Core.Entities;

public class Branch : BaseEntity
{
    public Guid RestaurantId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Phone { get; set; }
    public string? Address { get; set; }
    public Guid? ManagerUserId { get; set; }
    public bool IsActive { get; set; } = true;

    public Restaurant Restaurant { get; set; } = null!;
}