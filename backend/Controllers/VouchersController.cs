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
        var restaurantId = Guid.Parse(User.FindFirstValue("RestaurantId")!);
        var branchIds = await _context.Branches.Where(b => b.RestaurantId == restaurantId).Select(b => b.Id).ToListAsync();
        var vouchers = await _context.Vouchers.Where(v => v.BranchId == null || branchIds.Contains(v.BranchId.Value)).ToListAsync();
        return Ok(vouchers);
    }

    [HttpPost("redeem/{voucherId}")]
    public async Task<IActionResult> RedeemVoucher(Guid voucherId)
    {
        var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        var customer = await _context.Customers.FirstOrDefaultAsync(c => c.Id == userId);
        if (customer == null) return NotFound("Không tìm thấy thông tin thành viên");

        var voucher = await _context.Vouchers.FindAsync(voucherId);
        if (voucher == null || !voucher.IsActive) return BadRequest("Voucher không khả dụng");

        int requiredPoints = (int)voucher.DiscountValue * 10;

        if (customer.Points < requiredPoints)
            return BadRequest($"Bạn cần {requiredPoints} điểm để đổi mã này. Hiện tại bạn có {customer.Points} điểm.");

        using var transaction = await _context.Database.BeginTransactionAsync();
        try
        {
            customer.Points -= requiredPoints;

            _context.CustomerPointHistories.Add(new CustomerPointHistory
            {
                CustomerId = customer.Id,
                Points = -requiredPoints,
                Type = "Redeem",
                Description = $"Đổi điểm lấy mã giảm giá: {voucher.Code}"
            });

            _context.VoucherUsages.Add(new VoucherUsage
            {
                VoucherId = voucher.Id,
                CustomerId = customer.Id,
                UsedAtUtc = DateTime.UtcNow,
                DiscountAmount = voucher.DiscountValue
            });

            await _context.SaveChangesAsync();
            await transaction.CommitAsync();

            return Ok(new { message = "Đổi điểm thành công!", remainingPoints = customer.Points });
        }
        catch
        {
            await transaction.RollbackAsync();
            return StatusCode(500, "Lỗi hệ thống khi đổi điểm");
        }
    }
}