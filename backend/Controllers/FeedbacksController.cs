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

            _context.Feedbacks.Add(feedback);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Gửi góp ý thành công! Bạn đã được tặng 5 điểm thưởng." });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Lỗi khi gửi góp ý", details = ex.Message, inner = ex.InnerException?.Message });
        }
    }

    [Authorize(Roles = "Owner,Manager")]
    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        try
        {
            var resIdStr = User.FindFirstValue("RestaurantId");
            if (string.IsNullOrEmpty(resIdStr)) return Unauthorized();
            var restaurantId = Guid.Parse(resIdStr);

            var feedbacks = await _context.Feedbacks
                .Where(f => f.RestaurantId == restaurantId)
                .OrderByDescending(f => f.CreatedAtUtc)
                .ToListAsync();
            return Ok(feedbacks);
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
}
