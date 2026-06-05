using RestaurantPOS.Infrastructure.Common;

namespace RestaurantPOS.Modules.CRM.Entities;

public class Feedback : BaseEntity
{
    public Guid RestaurantId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Subject { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public bool IsRead { get; set; } = false;
}
