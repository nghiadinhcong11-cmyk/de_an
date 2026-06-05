using RestaurantPOS.Infrastructure.Common;

namespace RestaurantPOS.Modules.TableManagement.Entities;

public class Zone : BaseEntity
{
    public Guid BranchId { get; set; }
    public string Name { get; set; } = string.Empty;
    public int DisplayOrder { get; set; }

    // Navigation
    public ICollection<DiningTable> Tables { get; set; } = [];
}
