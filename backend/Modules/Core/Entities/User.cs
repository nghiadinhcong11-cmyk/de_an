using RestaurantPOS.Infrastructure.Common;

namespace RestaurantPOS.Modules.Core.Entities;

public class User : BaseEntity
{
    public Guid RestaurantId { get; set; }
    public Guid? BranchId { get; set; }
    public string Username { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public string? AvatarUrl { get; set; }
    public string? Email { get; set; }
    public string? PhoneNumber { get; set; }
    public bool IsActive { get; set; } = true;
    public bool IsApproved { get; set; } = true; // Thêm trường này
    public DateTime? LastLoginUtc { get; set; }
}