using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RestaurantPOS.Infrastructure.Data;
using RestaurantPOS.Modules.CRM.Entities;

namespace RestaurantPOS.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class VouchersController : ControllerBase
{
    private readonly AppDbContext _context;
    public VouchersController(AppDbContext context) => _context = context;

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var restaurantIdStr = User.FindFirstValue("RestaurantId");
        if (string.IsNullOrEmpty(restaurantIdStr)) return Unauthorized();
        var restaurantId = Guid.Parse(restaurantIdStr);

        var vouchers = await _context.Vouchers
            .Where(v => v.RestaurantId == restaurantId)
            .ToListAsync();
        return Ok(vouchers);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] Voucher voucher)
    {
        var restaurantIdStr = User.FindFirstValue("RestaurantId");
        if (string.IsNullOrEmpty(restaurantIdStr)) return Unauthorized();

        voucher.RestaurantId = Guid.Parse(restaurantIdStr);

        // Tự động gán các giá trị mặc định để tránh lỗi database
        voucher.CreatedAtUtc = DateTime.UtcNow;
        voucher.StartDate = DateTime.UtcNow;
        voucher.EndDate = DateTime.UtcNow.AddMonths(1);
        voucher.IsActive = true;

        _context.Vouchers.Add(voucher);
        await _context.SaveChangesAsync();
        return Ok(voucher);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var voucher = await _context.Vouchers.FindAsync(id);
        if (voucher == null) return NotFound();
        _context.Vouchers.Remove(voucher);
        await _context.SaveChangesAsync();
        return Ok();
    }
}