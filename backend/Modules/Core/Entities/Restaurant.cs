public class Restaurant : BaseEntity
{
    public string Name { get; set; } = string.Empty;

    public string? ContactPhone { get; set; }

    public string? ContactEmail { get; set; }

    public ICollection<Branch> Branches { get; set; } = [];
}