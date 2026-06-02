using RestaurantPOS.Infrastructure.Common;

namespace RestaurantPOS.Modules.System.Entities;

public class UserShift : BaseEntity
{
    public Guid UserId { get; set; }
    public Guid BranchId { get; set; }
    public DateTime CheckInUtc { get; set; }
    public DateTime? CheckOutUtc { get; set; }
}