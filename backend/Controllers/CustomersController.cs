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
        var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var customer = await _context.Customers.FindAsync(userId);
        if (customer == null) return NotFound();
        return Ok(customer);
    }

    [HttpPost("loyalty/add-points")]
    public async Task<IActionResult> AddLoyaltyPoints([FromBody] LoyaltyRequest request)
    {
        var restaurantId = Guid.Parse(User.FindFirstValue("RestaurantId")!);

        // 1. Kiểm tra đơn hàng
        var order = await _context.Orders.FindAsync(request.OrderId);
        if (order == null) return NotFound("Không tìm thấy đơn hàng");

        // 2. Tìm hoặc tạo khách hàng
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

        // 3. Tính điểm: 10,000 VND = 1 điểm
        int earnedPoints = (int)Math.Floor(order.TotalAmount / 10000);

        // 4. Cập nhật khách hàng
        customer.Points += earnedPoints;
        customer.TotalSpent += order.TotalAmount;
        customer.LastVisitAtUtc = DateTime.UtcNow;

        // 5. Lưu lịch sử
        _context.CustomerPointHistory.Add(new CustomerPointHistory
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