using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RestaurantPOS.Infrastructure.Data;
using RestaurantPOS.Modules.Core.Entities;

namespace RestaurantPOS.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class UsersController : ControllerBase
{
    private readonly AppDbContext _context;
    public UsersController(AppDbContext context) => _context = context;

    [HttpGet]
    public async Task<IActionResult> GetEmployees()
    {
        var restaurantId = Guid.Parse(User.FindFirstValue("RestaurantId")!);
        var users = await _context.Users
            .Where(u => u.RestaurantId == restaurantId && u.IsActive == true)
            .ToListAsync();
        return Ok(users);
    }

    [HttpGet("pending-requests")]
    public async Task<IActionResult> GetPendingRequests()
    {
        var restaurantId = Guid.Parse(User.FindFirstValue("RestaurantId")!);
        var pendingUsers = await _context.Users
            .Where(u => u.RestaurantId == restaurantId && u.IsActive == false)
            .ToListAsync();
        return Ok(pendingUsers);
    }

    [HttpPost("approve/{userId}")]
    public async Task<IActionResult> ApproveEmployee(Guid userId)
    {
        var user = await _context.Users.FindAsync(userId);
        if (user == null) return NotFound();

        user.IsActive = true;
        await _context.SaveChangesAsync();
        return Ok(new { message = "Đã duyệt nhân viên thành công" });
    }

    [HttpDelete("reject/{userId}")]
    public async Task<IActionResult> RejectEmployee(Guid userId)
    {
        var user = await _context.Users.FindAsync(userId);
        if (user == null) return NotFound();

        _context.Users.Remove(user);
        await _context.SaveChangesAsync();
        return Ok(new { message = "Đã từ chối yêu cầu" });
    }
}