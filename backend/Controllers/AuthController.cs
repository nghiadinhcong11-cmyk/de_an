using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RestaurantPOS.DTOs;
using RestaurantPOS.Infrastructure.Data;
using RestaurantPOS.Modules.Core.Entities;
using RestaurantPOS.Services;

namespace RestaurantPOS.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;
    private readonly AppDbContext _context;

    public AuthController(IAuthService authService, AppDbContext context)
    {
        _authService = authService;
        _context = context;
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        var response = await _authService.LoginAsync(request);
        if (response == null)
            return Unauthorized(new { message = "Sai tài khoản hoặc mật khẩu" });

        return Ok(response);
    }

    [HttpPost("register-owner")]
    public async Task<IActionResult> RegisterOwner([FromBody] RegisterOwnerRequest request)
    {
        var result = await _authService.RegisterOwnerAsync(request);
        if (!result)
            return BadRequest(new { message = "Tên đăng nhập đã tồn tại hoặc có lỗi xảy ra" });

        return Ok(new { message = "Đăng ký chủ nhà hàng thành công" });
    }

    [HttpPost("register-employee")]
    public async Task<IActionResult> RegisterEmployee([FromBody] RegisterEmployeeRequest request)
    {
        var result = await _authService.RegisterEmployeeAsync(request);
        if (!result) return BadRequest(new { message = "Lỗi đăng ký nhân viên" });
        return Ok(new { message = "Yêu cầu tham gia đã được gửi!" });
    }

    [HttpPost("register-customer")]
    public async Task<IActionResult> RegisterCustomer([FromBody] RegisterCustomerRequest request)
    {
        var result = await _authService.RegisterCustomerAsync(request);
        if (!result) return BadRequest(new { message = "Số điện thoại đã được đăng ký" });
        return Ok(new { message = "Đăng ký thành viên thành công!" });
    }

    [HttpGet("find-restaurant-info")]
    public async Task<IActionResult> FindRestaurantInfo()
    {
        var restaurant = await _context.Restaurants.FirstOrDefaultAsync();
        if (restaurant == null) return NotFound();
        return Ok(restaurant);
    }

    [HttpGet("featured-restaurants")]
    public async Task<IActionResult> GetFeaturedRestaurants()
    {
        var restaurants = await _context.Restaurants
            .Take(6)
            .ToListAsync();
        return Ok(restaurants);
    }

    [HttpGet("search-restaurants")]
    public async Task<IActionResult> SearchRestaurants([FromQuery] string name)
    {
        var restaurants = await _context.Restaurants
            .Where(r => string.IsNullOrEmpty(name) || r.Name.ToLower().Contains(name.ToLower()))
            .Take(10) // Giới hạn 10 kết quả
            .ToListAsync();
        return Ok(restaurants);
    }
}