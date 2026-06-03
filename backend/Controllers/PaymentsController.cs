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
    public async Task<IActionResult> GetConfig()
    {
        var resIdStr = User.FindFirstValue("RestaurantId");
        if (string.IsNullOrEmpty(resIdStr)) return Unauthorized();
        var restaurantId = Guid.Parse(resIdStr);

        var branch = await _context.Branches.FirstOrDefaultAsync(b => b.RestaurantId == restaurantId);
        if (branch == null) return NotFound("Chưa có chi nhánh nào");

        var account = await _context.PaymentAccounts.FirstOrDefaultAsync(a => a.BranchId == branch.Id);
        if (account == null) return NotFound("Chưa cấu hình tài khoản");

        return Ok(account);
    }

    [HttpPost("config")]
    public async Task<IActionResult> UpdateConfig([FromBody] PaymentAccount account)
    {
        var resIdStr = User.FindFirstValue("RestaurantId");
        var restaurantId = Guid.Parse(resIdStr!);
        var branch = await _context.Branches.FirstAsync(b => b.RestaurantId == restaurantId);

        var existing = await _context.PaymentAccounts.FirstOrDefaultAsync(a => a.BranchId == branch.Id);
        if (existing != null)
        {
            existing.BankCode = account.BankCode;
            existing.AccountNumber = account.AccountNumber;
            existing.AccountName = account.AccountName;
        }
        else
        {
            account.BranchId = branch.Id;
            _context.PaymentAccounts.Add(account);
        }

        await _context.SaveChangesAsync();
        return Ok();
    }
}