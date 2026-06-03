using RestaurantPOS.Infrastructure.Common;
using RestaurantPOS.Modules.Core.Entities;

namespace RestaurantPOS.Modules.Menu.Entities;

public class Product : BaseEntity
{
    public Guid RestaurantId { get; set; }
    public Guid CategoryId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public decimal Price { get; set; }
    public string? ImageUrl { get; set; }
    public bool IsAvailable { get; set; } = true;

    // Navigation Properties
    public Restaurant Restaurant { get; set; } = null!;
    public Category Category { get; set; } = null!;
    public ICollection<ProductVariant> Variants { get; set; } = [];
}