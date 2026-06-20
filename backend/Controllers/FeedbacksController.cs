using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RestaurantPOS.Infrastructure.Data;
using RestaurantPOS.Modules.CRM.Entities;

namespace RestaurantPOS.Controllers;

[ApiController]
[Route("api/[controller]")]
public class FeedbacksController : ControllerBase
{
    private readonly AppDbContext _context;
    public FeedbacksController(AppDbContext context) => _context = context;

    [AllowAnonymous]
    [HttpPost]
    public async Task<IActionResult> SubmitFeedback([FromBody] Feedback feedback)
    {
        try
        {
            // 1. Lấy thông tin nhà hàng
            var resIdStr = User.FindFirstValue("RestaurantId");
            Guid restaurantId;

            if (!string.IsNullOrEmpty(resIdStr))
            {
                restaurantId = Guid.Parse(resIdStr);
            }
            else
            {
                var firstRestaurant = await _context.Restaurants.FirstOrDefaultAsync();
                if (firstRestaurant == null) return BadRequest("Hệ thống chưa có nhà hàng nào");
                restaurantId = firstRestaurant.Id;
            }

            feedback.RestaurantId = restaurantId;
            feedback.CreatedAtUtc = DateTime.UtcNow;
            feedback.Status = string.IsNullOrWhiteSpace(feedback.Status) ? "New" : feedback.Status;

            // 2. Nếu khách hàng đã đăng nhập, gán CustomerId và tặng điểm thưởng
            var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!string.IsNullOrEmpty(userIdStr))
            {
                var customerId = Guid.Parse(userIdStr);
                var customer = await _context.Customers.FindAsync(customerId);
                if (customer != null)
                {
                    feedback.CustomerId = customer.Id;
                    feedback.Name = customer.FullName;
                    feedback.Email = customer.Email ?? "";

                    // Tặng 5 điểm cho mỗi lần đánh giá
                    int rewardPoints = 5;
                    customer.Points += rewardPoints;

                    _context.CustomerPointHistories.Add(new CustomerPointHistory
                    {
                        CustomerId = customer.Id,
                        Points = rewardPoints,
                        Type = "Earn",
                        Description = "Thưởng điểm cho góp ý & đánh giá chất lượng"
                    });
                }
            }

            // 2b. Nếu feedback gắn với đơn hàng, tự lấy bối cảnh vận hành
            if (feedback.OrderId.HasValue)
            {
                var order = await _context.Orders
                    .Include(o => o.Table)
                    .Include(o => o.Branch)
                    .FirstOrDefaultAsync(o => o.Id == feedback.OrderId.Value);

                if (order != null)
                {
                    feedback.BranchId = order.BranchId;
                    feedback.OrderNumber = order.OrderNumber;
                    feedback.InvoiceId = order.OrderNumber;
                    feedback.TableNumber = order.Table?.TableNumber;
                    feedback.StaffId = order.CreatedByUserId;
                    if (feedback.CustomerId == null)
                    {
                        feedback.CustomerId = order.CustomerId;
                    }
                }
            }

            _context.Feedbacks.Add(feedback);

            // 3. Nếu đánh giá cho đơn hàng cụ thể, đánh dấu đơn hàng đã được đánh giá
            if (feedback.OrderId.HasValue)
            {
                var order = await _context.Orders.FindAsync(feedback.OrderId.Value);
                if (order != null)
                {
                    order.IsReviewed = true;
                }
            }

            await _context.SaveChangesAsync();

            return Ok(new { message = "Gửi góp ý thành công! Bạn đã được tặng 5 điểm thưởng." });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Lỗi khi gửi góp ý", details = ex.Message, inner = ex.InnerException?.Message });
        }
    }

    [AllowAnonymous]
    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] Guid? restaurantId)
    {
        try
        {
            var resIdStr = User.FindFirstValue("RestaurantId");
            Guid targetRestaurantId;

            if (!string.IsNullOrEmpty(resIdStr))
            {
                targetRestaurantId = Guid.Parse(resIdStr);
            }
            else if (restaurantId.HasValue)
            {
                targetRestaurantId = restaurantId.Value;
            }
            else
            {
                // Mặc định lấy nhà hàng đầu tiên nếu không có thông tin
                var firstRestaurant = await _context.Restaurants.FirstOrDefaultAsync();
                if (firstRestaurant == null) return BadRequest("Không xác định được nhà hàng");
                targetRestaurantId = firstRestaurant.Id;
            }

            var isStaff = User.Identity?.IsAuthenticated == true && (User.IsInRole("Owner") || User.IsInRole("Manager"));

            var feedbacksQuery = _context.Feedbacks
                .Where(f => f.RestaurantId == targetRestaurantId);

            // Nếu không phải quản lý, chỉ xem được các đánh giá công khai (ví dụ >= 4 sao)
            // và không thấy thông tin nhạy cảm
            if (!isStaff)
            {
                feedbacksQuery = feedbacksQuery.Where(f => (f.ServiceRating + f.FoodRating + f.PriceRating + f.AtmosphereRating) / 4 >= 4);
            }

            var feedbacks = await feedbacksQuery
                .OrderByDescending(f => f.CreatedAtUtc)
                .ToListAsync();

            var orderIds = feedbacks.Where(f => f.OrderId.HasValue).Select(f => f.OrderId!.Value).ToList();
            var customerIds = feedbacks.Where(f => f.CustomerId.HasValue).Select(f => f.CustomerId!.Value).ToList();
            var branchIds = feedbacks.Where(f => f.BranchId.HasValue).Select(f => f.BranchId!.Value).ToList();

            var orders = await _context.Orders
                .Where(o => orderIds.Contains(o.Id))
                .Include(o => o.Table)
                .Include(o => o.Branch)
                .Include(o => o.Customer)
                .ToListAsync();

            var customers = await _context.Customers
                .Where(c => customerIds.Contains(c.Id))
                .ToListAsync();

            var branches = await _context.Branches
                .Where(b => branchIds.Contains(b.Id))
                .ToListAsync();

            var result = feedbacks.Select(f =>
            {
                var order = orders.FirstOrDefault(o => o.Id == f.OrderId);
                var customer = customers.FirstOrDefault(c => c.Id == f.CustomerId) ?? order?.Customer;
                var branch = branches.FirstOrDefault(b => b.Id == f.BranchId) ?? order?.Branch;

                // Dữ liệu tối giản cho Khách hàng
                if (!isStaff)
                {
                    return new
                    {
                        f.Id,
                        Name = string.IsNullOrEmpty(f.Name) ? "Khách hàng" : f.Name,
                        BranchName = branch?.Name ?? order?.Branch?.Name ?? "Nhà hàng",
                        f.ServiceRating,
                        f.FoodRating,
                        f.PriceRating,
                        f.AtmosphereRating,
                        f.Message,
                        f.CreatedAtUtc
                    } as object;
                }

                // Dữ liệu đầy đủ cho Quản lý
                return new
                {
                    f.Id,
                    f.RestaurantId,
                    f.CustomerId,
                    f.OrderId,
                    f.BranchId,
                    f.Name,
                    f.Email,
                    CustomerPhone = customer?.PhoneNumber ?? "",
                    CustomerTier = GetLoyaltyTier(customer?.Points ?? 0),
                    CustomerPoints = customer?.Points ?? 0,
                    OrderNumber = f.OrderNumber ?? order?.OrderNumber,
                    InvoiceId = f.InvoiceId ?? order?.OrderNumber,
                    TableNumber = f.TableNumber ?? order?.Table?.TableNumber,
                    BranchName = branch?.Name ?? order?.Branch?.Name ?? "Chưa xác định",
                    BranchAddress = branch?.Address ?? order?.Branch?.Address ?? "",
                    BranchPhone = branch?.Phone ?? order?.Branch?.Phone ?? "",
                    f.ServiceRating,
                    f.FoodRating,
                    f.PriceRating,
                    f.AtmosphereRating,
                    f.Message,
                    f.IsRead,
                    f.Status,
                    f.InternalNotes,
                    f.AttachmentUrl,
                    f.CreatedAtUtc
                };
            });

            return Ok(result);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Lỗi máy chủ khi tải góp ý", details = ex.Message });
        }
    }

    [Authorize(Roles = "Owner,Manager")]
    [HttpPut("{id}/read")]
    public async Task<IActionResult> MarkAsRead(Guid id)
    {
        var feedback = await _context.Feedbacks.FindAsync(id);
        if (feedback == null) return NotFound();

        feedback.IsRead = true;
        await _context.SaveChangesAsync();
        return Ok();
    }

    [Authorize(Roles = "Owner,Manager")]
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var feedback = await _context.Feedbacks.FindAsync(id);
        if (feedback == null) return NotFound();

        _context.Feedbacks.Remove(feedback);
        await _context.SaveChangesAsync();
        return Ok();
    }

    [Authorize(Roles = "Owner,Manager")]
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateFeedback(Guid id, [FromBody] FeedbackUpdateDto dto)
    {
        var feedback = await _context.Feedbacks.FindAsync(id);
        if (feedback == null) return NotFound();

        if (!string.IsNullOrWhiteSpace(dto.Status))
        {
            feedback.Status = dto.Status;
        }

        feedback.InternalNotes = dto.InternalNotes;
        feedback.AttachmentUrl = dto.AttachmentUrl;
        await _context.SaveChangesAsync();
        return Ok(new { message = "Đã cập nhật góp ý" });
    }

    private static string GetLoyaltyTier(int points)
    {
        if (points >= 2000) return "Gold";
        if (points >= 1000) return "Silver";
        if (points >= 500) return "Bronze";
        return "Member";
    }

    public class FeedbackUpdateDto
    {
        public string? Status { get; set; }
        public string? InternalNotes { get; set; }
        public string? AttachmentUrl { get; set; }
    }
}
