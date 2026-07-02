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
        try
        {
            var resIdStr = User.FindFirstValue("RestaurantId");
            if (string.IsNullOrEmpty(resIdStr)) return Unauthorized();
            var restaurantId = Guid.Parse(resIdStr);

            var nowVn = DateTime.UtcNow.AddHours(7);
            var sevenDaysAgo = nowVn.Date.AddDays(-7).AddHours(-7);
            var fourteenDaysAgo = nowVn.Date.AddDays(-14).AddHours(-7);

            // 1. Lấy danh sách ID chi nhánh trước để query nhanh hơn
            var branchIds = await _context.Branches
                .Where(b => b.RestaurantId == restaurantId)
                .Select(b => b.Id)
                .ToListAsync();

            // 2. Doanh thu kỳ này & kỳ trước
            var currentRevenue = await _context.Orders
                .Where(o => o.RestaurantId == restaurantId && o.Status == "Completed" && o.CreatedAtUtc >= sevenDaysAgo)
                .SumAsync(o => (decimal?)o.TotalAmount) ?? 0;

            var previousRevenue = await _context.Orders
                .Where(o => o.RestaurantId == restaurantId && o.Status == "Completed" && o.CreatedAtUtc >= fourteenDaysAgo && o.CreatedAtUtc < sevenDaysAgo)
                .SumAsync(o => (decimal?)o.TotalAmount) ?? 0;

            // 3. Chi phí kỳ này & kỳ trước
            var currentExpenses = await _context.Expenses
                .Where(e => branchIds.Contains(e.BranchId) && e.CreatedAtUtc >= sevenDaysAgo)
                .SumAsync(e => (decimal?)e.Amount) ?? 0;

            var previousExpenses = await _context.Expenses
                .Where(e => branchIds.Contains(e.BranchId) && e.CreatedAtUtc >= fourteenDaysAgo && e.CreatedAtUtc < sevenDaysAgo)
                .SumAsync(e => (decimal?)e.Amount) ?? 0;

            // 4. Lượng đơn hàng
            var currentOrderCount = await _context.Orders.CountAsync(o => o.RestaurantId == restaurantId && o.CreatedAtUtc >= sevenDaysAgo);
            var prevOrderCount = await _context.Orders.CountAsync(o => o.RestaurantId == restaurantId && o.CreatedAtUtc >= fourteenDaysAgo && o.CreatedAtUtc < sevenDaysAgo);

            // 5. Khách hàng
            var totalCustomers = await _context.Customers.CountAsync(c => c.RestaurantId == restaurantId);
            var prevTotalCustomers = await _context.Customers.CountAsync(c => c.RestaurantId == restaurantId && c.CreatedAtUtc < sevenDaysAgo);

            // Tính toán trend
            var revenueTrend = CalculateGrowth(currentRevenue, previousRevenue);
            var orderTrend = CalculateGrowth(currentOrderCount, prevOrderCount);
            var profitTrend = CalculateGrowth(currentRevenue - currentExpenses, previousRevenue - previousExpenses);
            var customerTrend = CalculateGrowth(totalCustomers, prevTotalCustomers);

            return Ok(new BusinessOverviewDto
            {
                TotalRevenue = await _context.Orders.Where(o => o.RestaurantId == restaurantId && o.Status == "Completed").SumAsync(o => (decimal?)o.TotalAmount) ?? 0,
                TotalExpenses = await _context.Expenses.Where(e => branchIds.Contains(e.BranchId)).SumAsync(e => (decimal?)e.Amount) ?? 0,
                NetProfit = (await _context.Orders.Where(o => o.RestaurantId == restaurantId && o.Status == "Completed").SumAsync(o => (decimal?)o.TotalAmount) ?? 0) -
                            (await _context.Expenses.Where(e => branchIds.Contains(e.BranchId)).SumAsync(e => (decimal?)e.Amount) ?? 0),
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
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Lỗi khi lấy dữ liệu tổng quan", details = ex.Message, inner = ex.InnerException?.Message });
        }
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
        try
        {
            var resIdStr = User.FindFirstValue("RestaurantId");
            if (string.IsNullOrEmpty(resIdStr)) return Unauthorized();
            var restaurantId = Guid.Parse(resIdStr);
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
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Lỗi khi lấy dữ liệu doanh thu 7 ngày", details = ex.Message });
        }
    }

    // 3. Top 5 món ăn bán chạy nhất
    [HttpGet("top-products")]
    public async Task<IActionResult> GetTopProducts()
    {
        try
        {
            var resIdStr = User.FindFirstValue("RestaurantId");
            if (string.IsNullOrEmpty(resIdStr)) return Unauthorized();
            var restaurantId = Guid.Parse(resIdStr);

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
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Lỗi khi lấy top sản phẩm", details = ex.Message });
        }
    }

    // 4. Thống kê nhanh theo ca cho nhân viên (Hôm nay - Giờ VN)
    [HttpGet("today-shift-summary")]
    public async Task<IActionResult> GetTodayShiftSummary()
    {
        try
        {
            var resIdStr = User.FindFirstValue("RestaurantId");
            if (string.IsNullOrEmpty(resIdStr)) return Unauthorized();
            var restaurantId = Guid.Parse(resIdStr);
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
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Lỗi khi lấy thống kê ca", details = ex.Message });
        }
    }

    // 5. Doanh thu theo chi nhánh
    [HttpGet("revenue-by-branch")]
    public async Task<IActionResult> GetRevenueByBranch()
    {
        try
        {
            var resIdStr = User.FindFirstValue("RestaurantId");
            if (string.IsNullOrEmpty(resIdStr)) return Unauthorized();
            var restaurantId = Guid.Parse(resIdStr);

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
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Lỗi khi lấy doanh thu theo chi nhánh", details = ex.Message });
        }
    }

    // 6. Doanh thu theo tháng (Trong năm nay)
    [HttpGet("monthly-revenue")]
    public async Task<IActionResult> GetMonthlyRevenue()
    {
        try
        {
            var resIdStr = User.FindFirstValue("RestaurantId");
            if (string.IsNullOrEmpty(resIdStr)) return Unauthorized();
            var restaurantId = Guid.Parse(resIdStr);
            var year = DateTime.UtcNow.Year;

            // Lấy tất cả đơn hàng đã hoàn thành trong năm nay của nhà hàng
            var orders = await _context.Orders
                .Where(o => o.RestaurantId == restaurantId && o.Status == "Completed" && o.CreatedAtUtc.Year == year)
                .Select(o => new { o.CreatedAtUtc.Month, o.TotalAmount })
                .ToListAsync();

            // Trả về đủ 12 tháng, tháng nào không có dữ liệu thì doanh thu = 0
            var report = Enumerable.Range(1, 12).Select(month => new
            {
                Month = $"Tháng {month}",
                Revenue = orders.Where(o => o.Month == month).Sum(o => o.TotalAmount)
            }).ToList();

            return Ok(report);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Lỗi khi lấy doanh thu tháng", details = ex.Message, inner = ex.InnerException?.Message });
        }
    }

    // 7. Doanh thu theo năm (5 năm gần nhất)
    [HttpGet("yearly-revenue")]
    public async Task<IActionResult> GetYearlyRevenue()
    {
        try
        {
            var resIdStr = User.FindFirstValue("RestaurantId");
            if (string.IsNullOrEmpty(resIdStr)) return Unauthorized();
            var restaurantId = Guid.Parse(resIdStr);
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
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Lỗi khi lấy doanh thu năm", details = ex.Message });
        }
    }

    // 8. Thống kê hiệu suất nhân viên (Đánh giá từ khách hàng)
    [HttpGet("staff-performance")]
    public async Task<IActionResult> GetStaffPerformance([FromQuery] int? month, [FromQuery] int? year)
    {
        try
        {
            var resIdStr = User.FindFirstValue("RestaurantId");
            if (string.IsNullOrEmpty(resIdStr) || !Guid.TryParse(resIdStr, out var restaurantId))
                return Unauthorized();

            // 1. Lấy dữ liệu đánh giá thô vào bộ nhớ để xử lý linh hoạt
            var feedbacksQuery = _context.Feedbacks
                .Where(f => f.RestaurantId == restaurantId && f.StaffId != null);

            if (month.HasValue && year.HasValue)
            {
                feedbacksQuery = feedbacksQuery.Where(f => f.CreatedAtUtc.Month == month.Value && f.CreatedAtUtc.Year == year.Value);
            }

            var rawFeedbacks = await feedbacksQuery
                .Select(f => new { f.StaffId, f.ServiceRating })
                .ToListAsync();

            if (!rawFeedbacks.Any()) return Ok(new List<object>());

            // 2. Tính toán hiệu suất trên bộ nhớ
            var performanceData = rawFeedbacks
                .GroupBy(f => f.StaffId)
                .Select(g => new
                {
                    StaffId = g.Key,
                    AverageRating = g.Average(f => (double)f.ServiceRating),
                    FeedbackCount = g.Count(),
                    FiveStarCount = g.Count(f => f.ServiceRating == 5),
                    OneStarCount = g.Count(f => f.ServiceRating == 1)
                })
                .ToList();

            var staffIds = performanceData.Select(p => p.StaffId!.Value).ToList();
            var staffNames = await _context.Users
                .Where(u => staffIds.Contains(u.Id))
                .ToDictionaryAsync(u => u.Id, u => u.FullName);

            var result = performanceData.Select(p =>
            {
                double avg = p.AverageRating;
                double ratingScore = avg * 14;
                double quantityScore = Math.Min(p.FeedbackCount, 50) * 0.6;
                double totalScore = Math.Round(ratingScore + quantityScore, 1);

                return new
                {
                    p.StaffId,
                    StaffName = staffNames.GetValueOrDefault(p.StaffId!.Value, "Nhân viên"),
                    AverageRating = Math.Round(avg, 1),
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
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Lỗi khi lấy hiệu suất nhân viên", details = ex.Message });
        }
    }

    // 9. Thống kê số lượng đơn theo giờ (Mặc định múi giờ VN UTC+7)
    [HttpGet("orders-by-hour")]
    public async Task<IActionResult> GetOrdersByHour([FromQuery] int? dayOfWeek)
    {
        try
        {
            var resIdStr = User.FindFirstValue("RestaurantId");
            if (string.IsNullOrEmpty(resIdStr) || !Guid.TryParse(resIdStr, out var restaurantId))
                return Unauthorized();

            var startDate = DateTime.UtcNow.Date.AddDays(-30);

            var orders = await _context.Orders
                .Where(o => o.RestaurantId == restaurantId && o.CreatedAtUtc >= startDate && o.Status == "Completed")
                .Select(o => o.CreatedAtUtc)
                .ToListAsync();

            var report = Enumerable.Range(0, 24).Select(hour =>
            {
                var ordersInHour = orders.Where(dt => dt.AddHours(7).Hour == hour);

                if (dayOfWeek.HasValue)
                {
                    ordersInHour = ordersInHour.Where(dt => (int)dt.AddHours(7).DayOfWeek == dayOfWeek.Value);
                }

                // Tính trung bình: Tổng số đơn tại giờ đó / số ngày tương ứng trong 30 ngày
                // Tìm số lượng ngày (Thứ X) duy nhất xuất hiện trong tập dữ liệu
                var uniqueDays = ordersInHour.Select(dt => dt.AddHours(7).Date).Distinct().Count();
                double averageCount = uniqueDays > 0 ? (double)ordersInHour.Count() / uniqueDays : 0;

                return new
                {
                    Hour = $"{hour}h",
                    OrderCount = Math.Round(averageCount, 1) // Trả về số trung bình
                };
            }).ToList();

            return Ok(report);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Lỗi khi thống kê đơn theo giờ", details = ex.Message });
        }
    }
}
