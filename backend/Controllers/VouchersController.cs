using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using RestaurantPOS.Infrastructure.Common;
using RestaurantPOS.Infrastructure.Data;
using RestaurantPOS.Modules.CRM.Entities;

namespace RestaurantPOS.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class VouchersController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly IHubContext<NotificationHub> _hubContext;

    public VouchersController(AppDbContext context, IHubContext<NotificationHub> hubContext)
    {
        _context = context;
        _hubContext = hubContext;
    }

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

        // Đảm bảo các giá trị thời gian được xử lý chính xác (Kind UTC)
        voucher.StartDate = DateTime.SpecifyKind(voucher.StartDate, DateTimeKind.Utc);
        voucher.EndDate = DateTime.SpecifyKind(voucher.EndDate, DateTimeKind.Utc);
        voucher.CreatedAtUtc = DateTime.UtcNow;

        _context.Vouchers.Add(voucher);
        await _context.SaveChangesAsync();

        // Thông báo có mã giảm giá mới
        await _hubContext.Clients.Group($"restaurant:{voucher.RestaurantId}").SendAsync("VoucherCreated", new {
            voucherId = voucher.Id,
            code = voucher.Code,
            name = voucher.Name,
            discountValue = voucher.DiscountValue,
            discountType = voucher.DiscountType
        });

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
        var restaurantIdStr = User.FindFirstValue("RestaurantId");
        if (string.IsNullOrEmpty(restaurantIdStr)) return Unauthorized();
        var restaurantId = Guid.Parse(restaurantIdStr);

        var existing = await _context.Vouchers.FindAsync(id);
        if (existing == null) return NotFound();

        // Bảo vệ: Chỉ cho phép cập nhật voucher thuộc về nhà hàng của mình
        if (existing.RestaurantId != restaurantId && existing.RestaurantId != Guid.Empty)
            return Forbid();

        existing.RestaurantId = restaurantId; // Gán lại để chắc chắn không bị null/empty
        existing.Name = voucher.Name;
        existing.Code = voucher.Code;
        existing.DiscountValue = voucher.DiscountValue;
        existing.DiscountType = voucher.DiscountType;
        existing.MinOrderAmount = voucher.MinOrderAmount;
        existing.UsageLimit = voucher.UsageLimit;
        existing.StartDate = DateTime.SpecifyKind(voucher.StartDate, DateTimeKind.Utc);
        existing.EndDate = DateTime.SpecifyKind(voucher.EndDate, DateTimeKind.Utc);
        existing.IsActive = voucher.IsActive;
        existing.UpdatedAtUtc = DateTime.UtcNow;

        try
        {
            await _context.SaveChangesAsync();

            // Thông báo cập nhật voucher
            await _hubContext.Clients.Group($"restaurant:{existing.RestaurantId}").SendAsync("VoucherUpdated", new {
                voucherId = existing.Id,
                code = existing.Code,
                isActive = existing.IsActive
            });

            return Ok(existing);
        }
        catch (DbUpdateException ex)
        {
            return StatusCode(500, new { error = "Database error", detail = ex.InnerException?.Message ?? ex.Message });
        }
    }

    [HttpPost("{id}/toggle")]
    public async Task<IActionResult> Toggle(Guid id)
    {
        var voucher = await _context.Vouchers.FindAsync(id);
        if (voucher == null) return NotFound();

        voucher.IsActive = !voucher.IsActive;
        await _context.SaveChangesAsync();

        // Gửi thông báo SignalR đến tất cả mọi người trong nhóm nhà hàng
        await _hubContext.Clients.Group($"restaurant:{voucher.RestaurantId}").SendAsync("VoucherStatusChanged", new {
            voucherId = voucher.Id,
            code = voucher.Code,
            isActive = voucher.IsActive
        });

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