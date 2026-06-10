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

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] Voucher voucher)
    {
        var existing = await _context.Vouchers.FindAsync(id);
        if (existing == null) return NotFound();

        existing.Name = voucher.Name;
        existing.Code = voucher.Code;
        existing.DiscountValue = voucher.DiscountValue;
        existing.DiscountType = voucher.DiscountType;
        existing.MinOrderAmount = voucher.MinOrderAmount;
        existing.StartDate = voucher.StartDate;
        existing.EndDate = voucher.EndDate;
        existing.IsActive = voucher.IsActive;

        await _context.SaveChangesAsync();
        return Ok(existing);
    }

    [HttpPost("{id}/toggle")]
    public async Task<IActionResult> Toggle(Guid id)
    {
        var voucher = await _context.Vouchers.FindAsync(id);
        if (voucher == null) return NotFound();

        voucher.IsActive = !voucher.IsActive;
        await _context.SaveChangesAsync();
        return Ok(new { isActive = voucher.IsActive });
    }

    [HttpPost("{id}/redeem")]
    public async Task<IActionResult> Redeem(Guid id)
    {
        var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userIdStr)) return Unauthorized();
        var userId = Guid.Parse(userIdStr);

        var voucher = await _context.Vouchers.FindAsync(id);
        if (voucher == null) return NotFound("Voucher không tồn tại");

        var customer = await _context.Customers.FindAsync(userId);
        if (customer == null) return NotFound("Không tìm thấy khách hàng");

        int cost = (int)voucher.DiscountValue * 10; // Giả sử 1% giảm giá = 10 điểm

        if (customer.Points < cost)
            return BadRequest("Bạn không đủ điểm để đổi voucher này");

        using var transaction = await _context.Database.BeginTransactionAsync();
        try
        {
            // 1. Trừ điểm khách hàng
            customer.Points -= cost;

            // 2. Lưu lịch sử đổi điểm
            _context.CustomerPointHistories.Add(new CustomerPointHistory
            {
                CustomerId = customer.Id,
                Points = -cost,
                Type = "Redeem",
                Description = $"Đổi điểm lấy mã giảm giá: {voucher.Name}"
            });

            // 3. Tạo bản ghi sử dụng voucher (Lưu ý: VoucherUsage có thể dùng để lưu mã code mới cho khách)
            _context.VoucherUsages.Add(new VoucherUsage
            {
                VoucherId = voucher.Id,
                CustomerId = customer.Id,
                UsedAtUtc = DateTime.UtcNow
            });

            await _context.SaveChangesAsync();
            await transaction.CommitAsync();

            return Ok(new { message = "Đổi điểm thành công!", remainingPoints = customer.Points });
        }
        catch (Exception ex)
        {
            await transaction.RollbackAsync();
            return BadRequest(ex.Message);
        }
    }
}