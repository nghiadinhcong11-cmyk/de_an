namespace RestaurantPOS.Modules.Core.Entities;

public class User : BaseEntity
{
    public string Username { get; set; } = string.Empty;

    public string PasswordHash { get; set; } = string.Empty;

    public string FullName { get; set; } = string.Empty;

    public Guid RestaurantId { get; set; }

    public Guid? BranchId { get; set; }

    public ICollection<UserRole> UserRoles { get; set; } = [];
}