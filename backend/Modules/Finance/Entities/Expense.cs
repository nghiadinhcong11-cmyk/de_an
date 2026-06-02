using RestaurantPOS.Infrastructure.Common;

namespace RestaurantPOS.Modules.Finance.Entities;

public class Expense : BaseEntity
{
    public Guid BranchId { get; set; }
    public string Title { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public DateOnly ExpenseDate { get; set; }
    public string? Description { get; set; }
    public Guid CreatedByUserId { get; set; }
}