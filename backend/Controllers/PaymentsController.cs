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

    [HttpGet("accounts")]
    public async Task<IActionResult> GetAccounts()
    {
        var resIdStr = User.FindFirstValue("RestaurantId");
        if (string.IsNullOrEmpty(resIdStr)) return Unauthorized();
        var restaurantId = Guid.Parse(resIdStr);

        var branchIds = await _context.Branches
            .Where(b => b.RestaurantId == restaurantId)
            .Select(b => b.Id)
            .ToListAsync();

        var accounts = await _context.PaymentAccounts
            .Where(a => branchIds.Contains(a.BranchId))
            .ToListAsync();

        return Ok(accounts);
    }

    [HttpPost("accounts")]
    public async Task<IActionResult> CreateAccount([FromBody] PaymentAccount account)
    {
        var resIdStr = User.FindFirstValue("RestaurantId");
        if (string.IsNullOrEmpty(resIdStr)) return Unauthorized();

        var branch = await _context.Branches.FindAsync(account.BranchId);
        if (branch == null || branch.RestaurantId != Guid.Parse(resIdStr))
            return BadRequest("Chi nhánh không hợp lệ");

        if (account.IsDefault)
        {
            var otherDefaults = await _context.PaymentAccounts
                .Where(a => a.BranchId == account.BranchId && a.IsDefault)
                .ToListAsync();
            foreach (var d in otherDefaults) d.IsDefault = false;
        }

        account.IsActive = true;
        _context.PaymentAccounts.Add(account);
        await _context.SaveChangesAsync();
        return Ok(account);
    }

    [HttpPut("accounts/{id}")]
    public async Task<IActionResult> UpdateAccount(Guid id, [FromBody] PaymentAccount account)
    {
        var existing = await _context.PaymentAccounts.FindAsync(id);
        if (existing == null) return NotFound();

        existing.BankCode = account.BankCode;
        existing.AccountNumber = account.AccountNumber;
        existing.AccountName = account.AccountName;
        existing.IsActive = account.IsActive;
        existing.IsDefault = account.IsDefault;

        await _context.SaveChangesAsync();
        return Ok(existing);
    }

    [HttpDelete("accounts/{id}")]
    public async Task<IActionResult> DeleteAccount(Guid id)
    {
        var account = await _context.PaymentAccounts.FindAsync(id);
        if (account == null) return NotFound();
        _context.PaymentAccounts.Remove(account);
        await _context.SaveChangesAsync();
        return Ok();
    }

    // Endpoints tương thích ngược cho trang cấu hình đơn giản
    [HttpGet("config")]
    public async Task<IActionResult> GetDefaultConfig()
    {
        var resIdStr = User.FindFirstValue("RestaurantId");
        if (string.IsNullOrEmpty(resIdStr)) return Unauthorized();
        var restaurantId = Guid.Parse(resIdStr);

        var firstBranch = await _context.Branches.FirstOrDefaultAsync(b => b.RestaurantId == restaurantId);
        if (firstBranch == null) return NotFound("Chưa có chi nhánh nào");

        var account = await _context.PaymentAccounts
            .FirstOrDefaultAsync(a => a.BranchId == firstBranch.Id && a.IsDefault);

        // Nếu không có mặc định, lấy tài khoản đầu tiên
        account ??= await _context.PaymentAccounts.FirstOrDefaultAsync(a => a.BranchId == firstBranch.Id);

        return Ok(account);
    }

    [HttpPost("config")]
    public async Task<IActionResult> UpdateDefaultConfig([FromBody] PaymentAccount account)
    {
        var resIdStr = User.FindFirstValue("RestaurantId");
        if (string.IsNullOrEmpty(resIdStr)) return Unauthorized();
        var restaurantId = Guid.Parse(resIdStr);

        var firstBranch = await _context.Branches.FirstOrDefaultAsync(b => b.RestaurantId == restaurantId);
        if (firstBranch == null) return BadRequest("Chưa có chi nhánh để gán cấu hình");

        var existing = await _context.PaymentAccounts
            .FirstOrDefaultAsync(a => a.BranchId == firstBranch.Id && (a.IsDefault || a.AccountNumber == account.AccountNumber));

        if (existing != null)
        {
            existing.BankCode = account.BankCode;
            existing.AccountNumber = account.AccountNumber;
            existing.AccountName = account.AccountName;
            existing.IsDefault = true;
        }
        else
        {
            account.BranchId = firstBranch.Id;
            account.IsDefault = true;
            _context.PaymentAccounts.Add(account);
        }

        await _context.SaveChangesAsync();
        return Ok();
    }
}