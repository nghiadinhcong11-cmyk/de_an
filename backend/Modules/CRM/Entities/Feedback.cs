using RestaurantPOS.Infrastructure.Common;

namespace RestaurantPOS.Modules.CRM.Entities;

public class Feedback : BaseEntity
{
    public Guid RestaurantId { get; set; }
    public Guid? CustomerId { get; set; } // Optional: link to customer
    public string Name { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;

    // Ratings (1-5 stars)
    public int ServiceRating { get; set; }
    public int FoodRating { get; set; }
    public int PriceRating { get; set; }
    public int AtmosphereRating { get; set; }

    public string Message { get; set; } = string.Empty;
    public bool IsRead { get; set; } = false;
}
