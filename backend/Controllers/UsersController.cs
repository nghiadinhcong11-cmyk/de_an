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
            .Select(u => new {
                u.Id,
                u.Username,
                u.FullName,
                u.AvatarUrl,
                u.Email,
                u.PhoneNumber,
                u.IsActive,
                BranchName = _context.Branches.Where(b => b.Id == u.BranchId).Select(b => b.Name).FirstOrDefault() ?? "Toàn hệ thống",
                RoleName = _context.UserRoles
                    .Where(ur => ur.UserId == u.Id)
                    .Join(_context.Roles, ur => ur.RoleId, r => r.Id, (ur, r) => r.Name)
                    .FirstOrDefault() ?? "Nhân viên"
            })
            .ToListAsync();
        return Ok(users);
    }

    [HttpGet("pending-requests")]
    public async Task<IActionResult> GetPendingRequests()
    {
        var restaurantId = Guid.Parse(User.FindFirstValue("RestaurantId")!);
        var pendingUsers = await _context.Users
            .Where(u => u.RestaurantId == restaurantId && u.IsActive == false)
            .Select(u => new {
                u.Id,
                u.Username,
                u.FullName,
                u.AvatarUrl,
                u.BranchId,
                BranchName = _context.Branches.Where(b => b.Id == u.BranchId).Select(b => b.Name).FirstOrDefault() ?? "Toàn hệ thống",
                RoleName = _context.UserRoles
                    .Where(ur => ur.UserId == u.Id)
                    .Join(_context.Roles, ur => ur.RoleId, r => r.Id, (ur, r) => r.Name)
                    .FirstOrDefault() ?? "Nhân viên"
            })
            .ToListAsync();
        return Ok(pendingUsers);
    }

    [HttpGet("roles")]
    public async Task<IActionResult> GetRoles()
    {
        return Ok(await _context.Roles.ToListAsync());
    }

    [HttpPut("{userId}")]
    public async Task<IActionResult> UpdateEmployee(Guid userId, [FromBody] UpdateEmployeeRequest request)
    {
        var user = await _context.Users.FindAsync(userId);
        if (user == null) return NotFound();

        // Cập nhật chi nhánh
        user.BranchId = request.BranchId;

        // Cập nhật vai trò
        if (!string.IsNullOrEmpty(request.RoleName))
        {
            var role = await _context.Roles.FirstOrDefaultAsync(r => r.Name == request.RoleName);
            if (role != null)
            {
                var userRole = await _context.UserRoles.FirstOrDefaultAsync(ur => ur.UserId == userId);
                if (userRole != null)
                {
                    _context.UserRoles.Remove(userRole);
                }
                _context.UserRoles.Add(new UserRole { UserId = userId, RoleId = role.Id });
            }
        }

        await _context.SaveChangesAsync();
        return Ok(new { message = "Cập nhật thành công" });
    }

    public class UpdateEmployeeRequest
    {
        public Guid? BranchId { get; set; }
        public string? RoleName { get; set; }
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
        return Ok(new { message = "Đã từ chối yêu cầu gia nhập" });
    }
}