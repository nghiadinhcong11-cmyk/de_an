using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RestaurantPOS.Infrastructure.Data;

namespace RestaurantPOS.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class ReportsController : ControllerBase
{
    private readonly AppDbContext _context;
    public ReportsController(AppDbContext context) => _context = context;

    [HttpGet("dashboard-stats")]
    public async Task<IActionResult> GetDashboardStats()
    {
        var restaurantId = Guid.Parse(User.FindFirstValue("RestaurantId")!);

        var today = DateTime.UtcNow.Date;

        var todayOrders = await _context.Orders
            .Where(o => o.RestaurantId == restaurantId && o.CreatedAtUtc >= today)
            .ToListAsync();

        var totalRevenue = todayOrders.Sum(o => o.TotalAmount);
        var orderCount = todayOrders.Count;

        var activeTables = await _context.DiningTables
            .Where(t => _context.Branches.Where(b => b.RestaurantId == restaurantId).Select(b => b.Id).Contains(t.BranchId) && t.Status == "Occupied")
            .CountAsync();

        return Ok(new {
            todayRevenue = totalRevenue,
            todayOrders = orderCount,
            activeTables = activeTables,
            totalCustomers = await _context.Customers.CountAsync(c => c.RestaurantId == restaurantId)
        });
    }
}