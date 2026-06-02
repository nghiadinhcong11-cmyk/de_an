using RestaurantPOS.Infrastructure.Common;

namespace RestaurantPOS.Modules.Ordering.Entities;

public class CustomerSession : BaseEntity
{
    public Guid TableId { get; set; }
    public Guid? CustomerId { get; set; }
    public string SessionToken { get; set; } = string.Empty;
    public DateTime StartedAtUtc { get; set; }
    public DateTime? EndedAtUtc { get; set; }
}