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
        // Gán RestaurantId mặc định cho đơn demo hoặc lấy từ logic khác
        var firstRestaurant = await _context.Restaurants.FirstOrDefaultAsync();
        if (firstRestaurant == null) return BadRequest("Hệ thống chưa có nhà hàng nào");

        feedback.RestaurantId = firstRestaurant.Id;
        feedback.CreatedAtUtc = DateTime.UtcNow;
        _context.Feedbacks.Add(feedback);
        await _context.SaveChangesAsync();
        return Ok(new { message = "Gửi góp ý thành công" });
    }

    [Authorize(Roles = "Owner,Manager")]
    [HttpGet]
    public async Task<IActionResult> GetAll()
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
