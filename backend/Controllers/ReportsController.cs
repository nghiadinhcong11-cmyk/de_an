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
        // Chuyển sang múi giờ VN để tính toán ngày chính xác
        var nowVn = DateTime.UtcNow.AddHours(7);
        var sevenDaysAgo = nowVn.Date.AddDays(-7).AddHours(-7); // Chuyển ngược lại UTC để query DB
        var fourteenDaysAgo = nowVn.Date.AddDays(-14).AddHours(-7);

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

    // 4. Thống kê nhanh theo ca cho nhân viên (Hôm nay - Giờ VN)
    [HttpGet("today-shift-summary")]
    public async Task<IActionResult> GetTodayShiftSummary()
    {
        var restaurantId = Guid.Parse(User.FindFirstValue("RestaurantId")!);
        var todayVn = DateTime.UtcNow.AddHours(7).Date;
        var startOfTodayUtc = todayVn.AddHours(-7);

        var ordersToday = await _context.Orders
            .Where(o => o.RestaurantId == restaurantId && o.CreatedAtUtc >= startOfTodayUtc && o.Status == "Completed")
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

    // 8. Thống kê hiệu suất nhân viên (Đánh giá từ khách hàng)
    [HttpGet("staff-performance")]
    public async Task<IActionResult> GetStaffPerformance([FromQuery] int? month, [FromQuery] int? year)
    {
        var restaurantId = Guid.Parse(User.FindFirstValue("RestaurantId")!);

        var query = _context.Feedbacks
            .Where(f => f.RestaurantId == restaurantId && f.StaffId != null);

        if (month.HasValue && year.HasValue)
        {
            query = query.Where(f => f.CreatedAtUtc.Month == month.Value && f.CreatedAtUtc.Year == year.Value);
        }

        var performance = await query
            .GroupBy(f => f.StaffId)
            .Select(g => new
            {
                StaffId = g.Key,
                AverageRating = (double)g.Average(f => f.ServiceRating),
                FeedbackCount = g.Count(),
                FiveStarCount = g.Count(f => f.ServiceRating == 5),
                OneStarCount = g.Count(f => f.ServiceRating == 1)
            })
            .ToListAsync();

        var staffIds = performance.Select(p => p.StaffId!.Value).ToList();
        var staffNames = await _context.Users
            .Where(u => staffIds.Contains(u.Id))
            .ToDictionaryAsync(u => u.Id, u => u.FullName);

        var result = performance.Select(p =>
        {
            // Công thức tính điểm hiệu suất: 70% từ số sao trung bình, 30% từ số lượng đánh giá (tối đa 50 lượt)
            double ratingScore = p.AverageRating * 14; // Max 70 (5 * 14)
            double quantityScore = Math.Min(p.FeedbackCount, 50) * 0.6; // Max 30 (50 * 0.6)
            double totalScore = Math.Round(ratingScore + quantityScore, 1);

            return new
            {
                p.StaffId,
                StaffName = staffNames.GetValueOrDefault(p.StaffId!.Value, "Ẩn danh"),
                p.AverageRating,
                p.FeedbackCount,
                p.FiveStarCount,
                p.OneStarCount,
                PerformanceScore = totalScore
            };
        })
        .OrderByDescending(x => x.PerformanceScore)
        .ToList();

        return Ok(result);
    }

    // 9. Thống kê số lượng đơn theo giờ (Mặc định múi giờ VN UTC+7)
    [HttpGet("orders-by-hour")]
    public async Task<IActionResult> GetOrdersByHour([FromQuery] int? dayOfWeek)
    {
        var restaurantId = Guid.Parse(User.FindFirstValue("RestaurantId")!);
        // Lấy dữ liệu trong 30 ngày gần nhất để có tập mẫu đủ lớn
        var startDate = DateTime.UtcNow.Date.AddDays(-30);

        var orders = await _context.Orders
            .Where(o => o.RestaurantId == restaurantId && o.CreatedAtUtc >= startDate && o.Status == "Completed")
            .ToListAsync();

        var report = Enumerable.Range(0, 24).Select(hour =>
        {
            var ordersInHour = orders.Where(o => o.CreatedAtUtc.AddHours(7).Hour == hour);

            if (dayOfWeek.HasValue)
            {
                ordersInHour = ordersInHour.Where(o => (int)o.CreatedAtUtc.AddHours(7).DayOfWeek == dayOfWeek.Value);
            }

            // Tính trung bình: Tổng số đơn tại giờ đó / số ngày tương ứng trong 30 ngày
            // Tìm số lượng ngày (Thứ X) duy nhất xuất hiện trong tập dữ liệu
            var uniqueDays = ordersInHour.Select(o => o.CreatedAtUtc.AddHours(7).Date).Distinct().Count();
            double averageCount = uniqueDays > 0 ? (double)ordersInHour.Count() / uniqueDays : 0;

            return new
            {
                Hour = $"{hour}h",
                OrderCount = Math.Round(averageCount, 1) // Trả về số trung bình
            };
        }).ToList();

        return Ok(report);
    }
}
