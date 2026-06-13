using System;

namespace RestaurantPOS.Modules.Core.Entities;

public class User : BaseEntity
{
    public string Username { get; set; } = string.Empty;

    public string PasswordHash { get; set; } = string.Empty;

    public string FullName { get; set; } = string.Empty;

    public string? Email { get; set; }

    public string? PhoneNumber { get; set; }

    public string? AvatarUrl { get; set; }

    public Guid RestaurantId { get; set; }

    public Guid? BranchId { get; set; }

    public bool IsActive { get; set; } = true;

    public bool IsApproved { get; set; } = true;

    public DateTime? LastLoginUtc { get; set; }

    public ICollection<UserRole> UserRoles { get; set; } = [];
}