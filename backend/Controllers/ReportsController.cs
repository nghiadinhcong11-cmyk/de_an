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
        var now = DateTime.UtcNow;
        var sevenDaysAgo = now.AddDays(-7);
        var fourteenDaysAgo = now.AddDays(-14);

        // Lấy dữ liệu kỳ này (7 ngày gần nhất)
        var currentOrders = await _context.Orders
            .Where(o => o.RestaurantId == restaurantId && o.Status == "Completed" && o.CreatedAtUtc >= sevenDaysAgo)
            .ToListAsync();

        var currentRevenue = currentOrders.Sum(o => o.TotalAmount);
        var currentExpenses = await _context.Expenses
            .Where(e => _context.Branches.Where(b => b.RestaurantId == restaurantId).Select(b => b.Id).Contains(e.BranchId) && e.CreatedAtUtc >= sevenDaysAgo)
            .SumAsync(e => e.Amount);

        // Lấy dữ liệu kỳ trước (7 ngày trước đó)
        var previousOrders = await _context.Orders
            .Where(o => o.RestaurantId == restaurantId && o.Status == "Completed" && o.CreatedAtUtc >= fourteenDaysAgo && o.CreatedAtUtc < sevenDaysAgo)
            .ToListAsync();

        var previousRevenue = previousOrders.Sum(o => o.TotalAmount);
        var previousExpenses = await _context.Expenses
            .Where(e => _context.Branches.Where(b => b.RestaurantId == restaurantId).Select(b => b.Id).Contains(e.BranchId) && e.CreatedAtUtc >= fourteenDaysAgo && e.CreatedAtUtc < sevenDaysAgo)
            .SumAsync(e => e.Amount);

        // Tính toán tỷ lệ tăng trưởng
        var revenueTrend = CalculateGrowth(currentRevenue, previousRevenue);
        var orderTrend = CalculateGrowth(currentOrders.Count, previousOrders.Count);
        var profitTrend = CalculateGrowth(currentRevenue - currentExpenses, previousRevenue - previousExpenses);

        var totalCustomers = await _context.Customers.CountAsync(c => c.RestaurantId == restaurantId);
        var prevTotalCustomers = await _context.Customers.CountAsync(c => c.RestaurantId == restaurantId && c.CreatedAtUtc < sevenDaysAgo);
        var customerTrend = CalculateGrowth(totalCustomers, prevTotalCustomers);

        return Ok(new BusinessOverviewDto
        {
            TotalRevenue = await _context.Orders.Where(o => o.RestaurantId == restaurantId && o.Status == "Completed").SumAsync(o => o.TotalAmount),
            TotalExpenses = await _context.Expenses.Where(e => _context.Branches.Where(b => b.RestaurantId == restaurantId).Select(b => b.Id).Contains(e.BranchId)).SumAsync(e => e.Amount),
            NetProfit = await _context.Orders.Where(o => o.RestaurantId == restaurantId && o.Status == "Completed").SumAsync(o => o.TotalAmount) -
                        await _context.Expenses.Where(e => _context.Branches.Where(b => b.RestaurantId == restaurantId).Select(b => b.Id).Contains(e.BranchId)).SumAsync(e => e.Amount),
            TotalOrders = await _context.Orders.CountAsync(o => o.RestaurantId == restaurantId),
            TotalCustomers = totalCustomers,

            RevenueTrend = revenueTrend.trend,
            IsRevenueUp = revenueTrend.isUp,
            OrderTrend = orderTrend.trend,
            IsOrderUp = orderTrend.isUp,
            ProfitTrend = profitTrend.trend,
            IsProfitUp = profitTrend.isUp,
            CustomerTrend = customerTrend.trend,
            IsCustomerUp = customerTrend.isUp
        });
    }

    private (string trend, bool isUp) CalculateGrowth(decimal current, decimal previous)
    {
        if (previous == 0) return (current > 0 ? "+100%" : "0%", true);
        var growth = ((current - previous) / previous) * 100;
        return (Math.Abs(growth).ToString("F1") + "%", growth >= 0);
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

    // 5. Doanh thu theo chi nhánh
    [HttpGet("revenue-by-branch")]
    public async Task<IActionResult> GetRevenueByBranch()
    {
        var restaurantId = Guid.Parse(User.FindFirstValue("RestaurantId")!);

        var report = await _context.Orders
            .Include(o => o.Branch)
            .Where(o => o.RestaurantId == restaurantId && o.Status == "Completed")
            .GroupBy(o => o.Branch.Name)
            .Select(g => new
            {
                Name = g.Key,
                Revenue = g.Sum(o => o.TotalAmount)
            })
            .OrderByDescending(x => x.Revenue)
            .ToListAsync();

        return Ok(report);
    }

    // 6. Doanh thu theo tháng (Trong năm nay)
    [HttpGet("monthly-revenue")]
    public async Task<IActionResult> GetMonthlyRevenue()
    {
        var restaurantId = Guid.Parse(User.FindFirstValue("RestaurantId")!);
        var year = DateTime.UtcNow.Year;

        var orders = await _context.Orders
            .Where(o => o.RestaurantId == restaurantId && o.Status == "Completed" && o.CreatedAtUtc.Year == year)
            .ToListAsync();

        var report = Enumerable.Range(1, 12).Select(month => new
        {
            Month = $"Tháng {month}",
            Revenue = orders.Where(o => o.CreatedAtUtc.Month == month).Sum(o => o.TotalAmount)
        }).ToList();

        return Ok(report);
    }

    // 7. Doanh thu theo năm (5 năm gần nhất)
    [HttpGet("yearly-revenue")]
    public async Task<IActionResult> GetYearlyRevenue()
    {
        var restaurantId = Guid.Parse(User.FindFirstValue("RestaurantId")!);
        var currentYear = DateTime.UtcNow.Year;

        var orders = await _context.Orders
            .Where(o => o.RestaurantId == restaurantId && o.Status == "Completed" && o.CreatedAtUtc.Year > currentYear - 5)
            .ToListAsync();

        var report = Enumerable.Range(currentYear - 4, 5).Select(year => new
        {
            Year = year.ToString(),
            Revenue = orders.Where(o => o.CreatedAtUtc.Year == year).Sum(o => o.TotalAmount)
        }).ToList();

        return Ok(report);
    }
}