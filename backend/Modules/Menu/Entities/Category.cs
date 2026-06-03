using RestaurantPOS.Infrastructure.Common;
using RestaurantPOS.Modules.Core.Entities;

namespace RestaurantPOS.Modules.Menu.Entities;

public class Category : BaseEntity
{
    public Guid RestaurantId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public int DisplayOrder { get; set; }

    // Navigation Property
    public Restaurant Restaurant { get; set; } = null!;
}