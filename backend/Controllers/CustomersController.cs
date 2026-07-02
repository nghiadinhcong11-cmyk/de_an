using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RestaurantPOS.Infrastructure.Data;
using RestaurantPOS.Modules.CRM.Entities;

namespace RestaurantPOS.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class CustomersController : ControllerBase
{
    private readonly AppDbContext _context;
    public CustomersController(AppDbContext context) => _context = context;

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var restaurantId = Guid.Parse(User.FindFirstValue("RestaurantId")!);
        return Ok(await _context.Customers.Where(c => c.RestaurantId == restaurantId).ToListAsync());
    }

    [HttpGet("me")]
    public async Task<IActionResult> GetMyProfile()
    {
        var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userIdStr)) return Unauthorized();

        var userId = Guid.Parse(userIdStr);
        var customer = await _context.Customers.FindAsync(userId);
        if (customer == null) return NotFound();
        return Ok(customer);
    }

    [HttpPut("me")]
    public async Task<IActionResult> UpdateMyProfile([FromBody] UpdateCustomerProfileRequest request)
    {
        var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userIdStr)) return Unauthorized();

        var userId = Guid.Parse(userIdStr);
        var customer = await _context.Customers.FindAsync(userId);
        if (customer == null) return NotFound();

        customer.FullName = request.FullName;
        if (!string.IsNullOrEmpty(request.AvatarUrl))
        {
            customer.AvatarUrl = request.AvatarUrl;
        }

        await _context.SaveChangesAsync();
        return Ok(customer);
    }

    public class UpdateCustomerProfileRequest
    {
        public string FullName { get; set; } = string.Empty;
        public string? AvatarUrl { get; set; }
    }

    [HttpGet("me/points-history")]
    public async Task<IActionResult> GetMyPointsHistory()
    {
        try
        {
            var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userIdStr)) return Unauthorized();
            var userId = Guid.Parse(userIdStr);

            var history = await _context.CustomerPointHistories
                .Include(h => h.Order)
                    .ThenInclude(o => o!.OrderItems)
                        .ThenInclude(oi => oi.Product)
                .Include(h => h.Order)
                    .ThenInclude(o => o!.CreatedByUser)
                .Where(h => h.CustomerId == userId)
                .OrderByDescending(h => h.CreatedAtUtc)
                .ToListAsync();

            if (!history.Any()) return Ok(new List<object>());

            var orderIds = history.Where(h => h.OrderId.HasValue).Select(h => h.OrderId!.Value).ToList();
            var feedbacks = await _context.Feedbacks
                .Where(f => f.OrderId != null && orderIds.Contains(f.OrderId.Value))
                .Select(f => new { f.OrderId, f.Message, f.ServiceRating, f.FoodRating, f.PriceRating, f.AtmosphereRating })
                .ToListAsync();

            var result = history.Select(h => new {
                h.Id,
                h.Points,
                h.Type,
                h.Description,
                h.CreatedAtUtc,
                Order = h.Order != null ? new {
                    h.Order.Id,
                    h.Order.OrderNumber,
                    h.Order.TotalAmount,
                    h.Order.Status,
                    h.Order.IsReviewed,
                    Rating = feedbacks.Where(f => f.OrderId == h.Order.Id)
                                      .Select(f => (f.ServiceRating + f.FoodRating + f.PriceRating + f.AtmosphereRating) / 4.0)
                                      .FirstOrDefault(),
                    ReviewMessage = feedbacks.Where(f => f.OrderId == h.Order.Id).Select(f => f.Message).FirstOrDefault(),
                    CreatedByUserName = h.Order.CreatedByUser != null ? h.Order.CreatedByUser.FullName : "Hệ thống",
                    Items = h.Order.OrderItems.Select(oi => new {
                        ProductName = oi.Product?.Name ?? "Sản phẩm",
                        oi.Quantity,
                        oi.TotalPrice
                    })
                } : null
            });

            return Ok(result);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new {
                message = "Lỗi khi lấy lịch sử điểm thưởng",
                details = ex.Message,
                inner = ex.InnerException?.Message
            });
        }
    }

    [HttpPost("loyalty/add-points")]
    public async Task<IActionResult> AddLoyaltyPoints([FromBody] LoyaltyRequest request)
    {
        var restaurantId = Guid.Parse(User.FindFirstValue("RestaurantId")!);

        var order = await _context.Orders.FindAsync(request.OrderId);
        if (order == null) return NotFound("Không tìm thấy đơn hàng");

        var customer = await _context.Customers.FirstOrDefaultAsync(c => c.PhoneNumber == request.PhoneNumber);
        if (customer == null)
        {
            customer = new Customer
            {
                RestaurantId = restaurantId,
                FullName = request.FullName,
                PhoneNumber = request.PhoneNumber,
                Points = 0,
                TotalSpent = 0
            };
            _context.Customers.Add(customer);
            await _context.SaveChangesAsync();
        }

        int earnedPoints = (int)Math.Floor(order.TotalAmount / 10000);

        customer.Points += earnedPoints;
        customer.TotalSpent += order.TotalAmount;
        customer.LastVisitAtUtc = DateTime.UtcNow;

        _context.CustomerPointHistories.Add(new CustomerPointHistory
        {
            CustomerId = customer.Id,
            OrderId = order.Id,
            Points = earnedPoints,
            Type = "Earn",
            Description = $"Tích điểm từ đơn hàng #{order.OrderNumber}"
        });

        await _context.SaveChangesAsync();

        return Ok(new {
            customerId = customer.Id,
            customerName = customer.FullName,
            earnedPoints,
            totalPoints = customer.Points
        });
    }

    public class LoyaltyRequest {
        public string PhoneNumber { get; set; } = string.Empty;
        public string FullName { get; set; } = string.Empty;
        public Guid OrderId { get; set; }
    }
}