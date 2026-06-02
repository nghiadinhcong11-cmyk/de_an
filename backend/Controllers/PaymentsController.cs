using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RestaurantPOS.Infrastructure.Data;
using RestaurantPOS.Modules.Payment.Entities;

namespace RestaurantPOS.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class PaymentsController : ControllerBase
{
    private readonly AppDbContext _context;
    public PaymentsController(AppDbContext context) => _context = context;

    [HttpGet("config")]
    public async Task<IActionResult> GetPaymentConfig()
    {
        var restaurantId = Guid.Parse(User.FindFirstValue("RestaurantId")!);
        var branch = await _context.Branches.FirstOrDefaultAsync(b => b.RestaurantId == restaurantId);
        if (branch == null) return NotFound();

        var account = await _context.PaymentAccounts.FirstOrDefaultAsync(a => a.BranchId == branch.Id && a.IsActive);
        return Ok(account);
    }

    [HttpPost("config")]
    public async Task<IActionResult> UpdatePaymentConfig([FromBody] PaymentAccount account)
    {
        var restaurantId = Guid.Parse(User.FindFirstValue("RestaurantId")!);
        var branch = await _context.Branches.FirstOrDefaultAsync(b => b.RestaurantId == restaurantId);
        if (branch == null) return NotFound();

        var existing = await _context.PaymentAccounts.FirstOrDefaultAsync(a => a.BranchId == branch.Id);
        if (existing != null)
        {
            existing.BankCode = account.BankCode;
            existing.AccountNumber = account.AccountNumber;
            existing.AccountName = account.AccountName;
            existing.IsActive = true;
        }
        else
        {
            account.BranchId = branch.Id;
            account.IsDefault = true;
            account.IsActive = true;
            _context.PaymentAccounts.Add(account);
        }

        await _context.SaveChangesAsync();
        return Ok(account);
    }

    [AllowAnonymous]
    [HttpGet("generate-qr/{orderId}")]
    public async Task<IActionResult> GenerateVietQR(Guid orderId)
    {
        var order = await _context.Orders.FindAsync(orderId);
        if (order == null) return NotFound("Không tìm thấy đơn hàng");

        var account = await _context.PaymentAccounts.FirstOrDefaultAsync(a => a.BranchId == order.BranchId && a.IsActive);
        if (account == null) return BadRequest("Chi nhánh chưa cấu hình tài khoản nhận tiền");

        // Format VietQR link
        // Template 'compact' is common for simple display
        var qrUrl = $"https://img.vietqr.io/image/{account.BankCode}-{account.AccountNumber}-compact.png?amount={order.TotalAmount}&addInfo=Thanh toan don hang {order.OrderNumber}&accountName={Uri.EscapeDataString(account.AccountName)}";

        return Ok(new { qrUrl, amount = order.TotalAmount, orderNumber = order.OrderNumber });
    }
}