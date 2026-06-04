using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RestaurantPOS.DTOs;
using RestaurantPOS.Infrastructure.Data;

namespace RestaurantPOS.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class ReportsController : ControllerBase
{
    private readonly AppDbContext _context;
    public ReportsController(AppDbContext context) => _context = context;

    // 1. Tổng quan kinh doanh (Doanh thu, Chi phí, Lợi nhuận)
    [HttpGet("overview")]
    public async Task<IActionResult> GetOverview()
    {
        var restaurantId = Guid.Parse(User.FindFirstValue("RestaurantId")!);

        var totalRevenue = await _context.Orders
            .Where(o => o.RestaurantId == restaurantId && o.Status == "Completed")
            .SumAsync(o => o.TotalAmount);

        var totalExpenses = await _context.Expenses
            .Where(e => _context.Branches.Where(b => b.RestaurantId == restaurantId).Select(b => b.Id).Contains(e.BranchId))
            .SumAsync(e => e.Amount);

        return Ok(new BusinessOverviewDto
        {
            TotalRevenue = totalRevenue,
            TotalExpenses = totalExpenses,
            NetProfit = totalRevenue - totalExpenses,
            TotalOrders = await _context.Orders.CountAsync(o => o.RestaurantId == restaurantId),
            TotalCustomers = await _context.Customers.CountAsync(c => c.RestaurantId == restaurantId)
        });
    }

    // 2. Doanh thu 7 ngày gần nhất (Cho biểu đồ AreaChart)
    [HttpGet("revenue-last-7-days")]
    public async Task<IActionResult> GetRevenueLast7Days()
    {
        var restaurantId = Guid.Parse(User.FindFirstValue("RestaurantId")!);
        var startDate = DateTime.UtcNow.Date.AddDays(-6);

        var orders = await _context.Orders
            .Where(o => o.RestaurantId == restaurantId && o.CreatedAtUtc >= startDate && o.Status == "Completed")
            .ToListAsync();

        var report = Enumerable.Range(0, 7).Select(offset =>
        {
            var date = startDate.AddDays(offset);
            return new RevenueReportDto
            {
                Date = date.ToString("dd/MM"),
                Revenue = orders.Where(o => o.CreatedAtUtc.Date == date).Sum(o => o.TotalAmount)
            };
        }).ToList();

        return Ok(report);
    }

    // 3. Top 5 món ăn bán chạy nhất
    [HttpGet("top-products")]
    public async Task<IActionResult> GetTopProducts()
    {
        var restaurantId = Guid.Parse(User.FindFirstValue("RestaurantId")!);

        var topProducts = await _context.OrderItems
            .Include(oi => oi.Product)
            .Where(oi => oi.Order.RestaurantId == restaurantId && oi.Order.Status == "Completed")
            .GroupBy(oi => oi.Product.Name)
            .Select(g => new TopProductDto
            {
                Name = g.Key,
                Quantity = g.Sum(x => x.Quantity),
                Revenue = g.Sum(x => x.TotalPrice)
            })
            .OrderByDescending(x => x.Quantity)
            .Take(5)
            .ToListAsync();

        return Ok(topProducts);
    }

    // 4. Thống kê nhanh theo ca cho nhân viên (Hôm nay)
    [HttpGet("today-shift-summary")]
    public async Task<IActionResult> GetTodayShiftSummary()
    {
        var restaurantId = Guid.Parse(User.FindFirstValue("RestaurantId")!);
        var today = DateTime.UtcNow.Date;

        var ordersToday = await _context.Orders
            .Where(o => o.RestaurantId == restaurantId && o.CreatedAtUtc >= today && o.Status == "Completed")
            .ToListAsync();

        var paymentsToday = await _context.Payments
            .Where(p => ordersToday.Select(o => o.Id).Contains(p.OrderId))
            .ToListAsync();

        return Ok(new
        {
            TotalRevenue = ordersToday.Sum(o => o.TotalAmount),
            TotalOrders = ordersToday.Count,
            CashRevenue = paymentsToday.Where(p => p.Method == "Cash").Sum(p => p.Amount),
            QrRevenue = paymentsToday.Where(p => p.Method == "QR").Sum(p => p.Amount)
        });
    }
}