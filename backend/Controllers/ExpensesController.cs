using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RestaurantPOS.Infrastructure.Data;
using RestaurantPOS.Modules.Finance.Entities;

namespace RestaurantPOS.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class ExpensesController : ControllerBase
{
    private readonly AppDbContext _context;
    public ExpensesController(AppDbContext context) => _context = context;

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var resIdStr = User.FindFirstValue("RestaurantId");
        if (string.IsNullOrEmpty(resIdStr)) return Unauthorized();
        var restaurantId = Guid.Parse(resIdStr);

        var branchIds = await _context.Branches
            .Where(b => b.RestaurantId == restaurantId)
            .Select(b => b.Id)
            .ToListAsync();

        var expenses = await _context.Expenses
            .Where(e => branchIds.Contains(e.BranchId))
            .OrderByDescending(e => e.CreatedAtUtc)
            .ToListAsync();

        return Ok(expenses);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] Expense expense)
    {
        var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userIdStr)) return Unauthorized();

        expense.CreatedByUserId = Guid.Parse(userIdStr);
        expense.CreatedAtUtc = DateTime.UtcNow;

        if (expense.ExpenseDate == default)
            expense.ExpenseDate = DateOnly.FromDateTime(DateTime.UtcNow);

        _context.Expenses.Add(expense);
        await _context.SaveChangesAsync();
        return Ok(expense);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var expense = await _context.Expenses.FindAsync(id);
        if (expense == null) return NotFound();

        _context.Expenses.Remove(expense);
        await _context.SaveChangesAsync();
        return Ok();
    }

    [HttpGet("summary")]
    public async Task<IActionResult> GetSummary()
    {
        var resIdStr = User.FindFirstValue("RestaurantId");
        if (string.IsNullOrEmpty(resIdStr)) return Unauthorized();
        var restaurantId = Guid.Parse(resIdStr);

        var branchIds = await _context.Branches
            .Where(b => b.RestaurantId == restaurantId)
            .Select(b => b.Id)
            .ToListAsync();

        var now = DateTime.UtcNow;
        var startOfMonth = new DateOnly(now.Year, now.Month, 1);
        var today = DateOnly.FromDateTime(now);

        var expenses = await _context.Expenses
            .Where(e => branchIds.Contains(e.BranchId))
            .ToListAsync();

        var summary = new
        {
            Today = expenses.Where(e => e.ExpenseDate == today).Sum(e => e.Amount),
            ThisMonth = expenses.Where(e => e.ExpenseDate >= startOfMonth).Sum(e => e.Amount),
            Total = expenses.Sum(e => e.Amount)
        };

        return Ok(summary);
    }
}
