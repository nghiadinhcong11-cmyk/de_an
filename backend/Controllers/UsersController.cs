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

    public UsersController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetEmployees()
    {
        var restaurantId = Guid.Parse(User.FindFirstValue("RestaurantId")!);
        var users = await _context.Users
            .Where(u => u.RestaurantId == restaurantId)
            .ToListAsync();
        return Ok(users);
    }

    [HttpPost]
    public async Task<IActionResult> CreateEmployee([FromBody] User employee)
    {
        var restaurantId = Guid.Parse(User.FindFirstValue("RestaurantId")!);

        if (await _context.Users.AnyAsync(u => u.Username == employee.Username))
            return BadRequest(new { message = "Tên đăng nhập đã tồn tại" });

        employee.RestaurantId = restaurantId;
        employee.PasswordHash = BCrypt.Net.BCrypt.HashPassword("123456"); // Mật khẩu mặc định cho nhân viên mới

        _context.Users.Add(employee);
        await _context.SaveChangesAsync();

        return Ok(employee);
    }
}