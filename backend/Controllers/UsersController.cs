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
            .Where(u => u.RestaurantId == restaurantId && u.IsApproved == true)
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

    [HttpDelete("delete/{userId}")]
    public async Task<IActionResult> DeleteEmployee(Guid userId)
    {
        var restaurantId = Guid.Parse(User.FindFirstValue("RestaurantId")!);
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == userId && u.RestaurantId == restaurantId);
        if (user == null) return NotFound();

        // Không cho phép xóa chính mình (Owner)
        var currentUserId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        if (userId == currentUserId) return BadRequest("Không thể xóa tài khoản của chính mình");

        // Xóa các bản ghi liên quan (UserRoles)
        var userRoles = _context.UserRoles.Where(ur => ur.UserId == userId);
        _context.UserRoles.RemoveRange(userRoles);

        _context.Users.Remove(user);
        await _context.SaveChangesAsync();
        return Ok(new { message = "Đã xóa nhân viên thành công" });
    }

    [HttpPost("toggle-active/{userId}")]
    public async Task<IActionResult> ToggleActive(Guid userId)
    {
        var restaurantId = Guid.Parse(User.FindFirstValue("RestaurantId")!);
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == userId && u.RestaurantId == restaurantId);
        if (user == null) return NotFound();

        var currentUserId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        if (userId == currentUserId) return BadRequest("Không thể tự khóa tài khoản của mình");

        user.IsActive = !user.IsActive;
        await _context.SaveChangesAsync();
        return Ok(new { message = user.IsActive ? "Đã mở khóa tài khoản" : "Đã khóa tài khoản" });
    }

    [HttpGet("pending-requests")]
    public async Task<IActionResult> GetPendingRequests()
    {
        var restaurantId = Guid.Parse(User.FindFirstValue("RestaurantId")!);
        var pendingUsers = await _context.Users
            .Where(u => u.RestaurantId == restaurantId && u.IsApproved == false)
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

    [HttpPost("roles")]
    public async Task<IActionResult> CreateRole([FromBody] Role role)
    {
        if (string.IsNullOrEmpty(role.Name)) return BadRequest("Tên vai trò không được để trống");

        // Tránh trùng tên
        if (await _context.Roles.AnyAsync(r => r.Name == role.Name))
            return BadRequest("Vai trò này đã tồn tại");

        _context.Roles.Add(role);
        await _context.SaveChangesAsync();
        return Ok(role);
    }

    [HttpDelete("roles/{id}")]
    public async Task<IActionResult> DeleteRole(Guid id)
    {
        var role = await _context.Roles.FindAsync(id);
        if (role == null) return NotFound();

        // Không cho phép xóa các vai trò hệ thống quan trọng
        var systemRoles = new[] { "Owner", "Manager", "Waiter", "Cashier" };
        if (systemRoles.Contains(role.Name))
            return BadRequest("Không thể xóa vai trò hệ thống mặc định");

        // Kiểm tra xem có user nào đang dùng vai trò này không
        if (await _context.UserRoles.AnyAsync(ur => ur.RoleId == id))
            return BadRequest("Không thể xóa vai trò đang có nhân viên sử dụng");

        _context.Roles.Remove(role);
        await _context.SaveChangesAsync();
        return Ok(new { message = "Đã xóa vai trò thành công" });
    }

    [HttpGet("me")]
    public async Task<IActionResult> GetMyProfile()
    {
        var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userIdStr)) return Unauthorized();

        var userId = Guid.Parse(userIdStr);
        var user = await _context.Users.FindAsync(userId);
        if (user == null) return NotFound();

        return Ok(new {
            user.Id,
            user.Username,
            user.FullName,
            user.AvatarUrl,
            user.Email,
            user.PhoneNumber,
            BranchName = _context.Branches.Where(b => b.Id == user.BranchId).Select(b => b.Name).FirstOrDefault() ?? "Toàn hệ thống",
            RoleName = _context.UserRoles
                .Where(ur => ur.UserId == user.Id)
                .Join(_context.Roles, ur => ur.RoleId, r => r.Id, (ur, r) => r.Name)
                .FirstOrDefault() ?? "Nhân viên"
        });
    }

    [HttpPut("me")]
    public async Task<IActionResult> UpdateMyProfile([FromBody] UpdateMyProfileRequest request)
    {
        var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userIdStr)) return Unauthorized();

        var userId = Guid.Parse(userIdStr);
        var user = await _context.Users.FindAsync(userId);
        if (user == null) return NotFound();

        user.FullName = request.FullName;
        user.Email = request.Email;
        user.PhoneNumber = request.PhoneNumber;
        if (!string.IsNullOrEmpty(request.AvatarUrl))
        {
            user.AvatarUrl = request.AvatarUrl;
        }

        await _context.SaveChangesAsync();
        return Ok(user);
    }

    public class UpdateMyProfileRequest
    {
        public string FullName { get; set; } = string.Empty;
        public string? Email { get; set; }
        public string? PhoneNumber { get; set; }
        public string? AvatarUrl { get; set; }
    }

    [HttpPost]
    public async Task<IActionResult> CreateEmployee([FromBody] CreateEmployeeRequest request)
    {
        var restaurantId = Guid.Parse(User.FindFirstValue("RestaurantId")!);

        if (await _context.Users.AnyAsync(u => u.Username == request.Username))
            return BadRequest(new { message = "Tên đăng nhập đã tồn tại" });

        var user = new User
        {
            RestaurantId = restaurantId,
            BranchId = request.BranchId,
            Username = request.Username,
            FullName = request.FullName,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
            IsActive = true,
            IsApproved = true
        };

        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        var role = await _context.Roles.FirstOrDefaultAsync(r => r.Name == request.RoleName);
        if (role != null)
        {
            _context.UserRoles.Add(new UserRole { UserId = user.Id, RoleId = role.Id });
            await _context.SaveChangesAsync();
        }

        return Ok(new { message = "Tạo nhân viên thành công" });
    }

    public class CreateEmployeeRequest
    {
        public string FullName { get; set; } = string.Empty;
        public string Username { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
        public string RoleName { get; set; } = string.Empty;
        public Guid? BranchId { get; set; }
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
        user.IsApproved = true;
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