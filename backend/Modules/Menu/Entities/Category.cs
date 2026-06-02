using RestaurantPOS.Infrastructure.Common;

namespace RestaurantPOS.Modules.Menu.Entities;

public class Category : BaseEntity
{
    public Guid RestaurantId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public int DisplayOrder { get; set; }
}