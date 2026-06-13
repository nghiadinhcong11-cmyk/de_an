namespace RestaurantPOS.Modules.Core.Entities;

public class Restaurant : BaseEntity
{
    public string Name { get; set; } = string.Empty;

    public string? Address { get; set; }

    public string? ContactPhone { get; set; }

    public string? ContactEmail { get; set; }

    public string? LogoUrl { get; set; }

    public bool IsActive { get; set; } = true;

    public ICollection<Branch> Branches { get; set; } = [];
}