using Microsoft.AspNetCore.Mvc;
using RestaurantPOS.DTOs;
using RestaurantPOS.Services;

namespace RestaurantPOS.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;

    public AuthController(IAuthService authService)
    {
        _authService = authService;
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

    [HttpGet("find-restaurant/{id}")]
    public async Task<IActionResult> FindRestaurant(Guid id)
    {
        // API để nhân viên tìm quán trước khi xin vào làm
        // Giả sử dùng ID (Guid) để tìm kiếm
        return Ok();
    }
}