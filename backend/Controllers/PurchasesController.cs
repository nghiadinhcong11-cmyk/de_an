using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RestaurantPOS.Infrastructure.Data;
using RestaurantPOS.Modules.Inventory.Entities;

namespace RestaurantPOS.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class PurchasesController : ControllerBase
{
    private readonly AppDbContext _context;
    public PurchasesController(AppDbContext context) => _context = context;

    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] Guid? branchId, [FromQuery] DateTime? start, [FromQuery] DateTime? end)
    {
        var resId = Guid.Parse(User.FindFirstValue("RestaurantId")!);
        var query = _context.PurchaseRecords
            .Include(p => p.Supplier)
            .Include(p => p.Items).ThenInclude(i => i.Ingredient)
            .Where(p => p.RestaurantId == resId);

        if (branchId.HasValue) query = query.Where(p => p.BranchId == branchId);
        if (start.HasValue) query = query.Where(p => p.PurchaseDate >= start.Value);
        if (end.HasValue) query = query.Where(p => p.PurchaseDate <= end.Value);

        var records = await query.OrderByDescending(p => p.PurchaseDate).ToListAsync();
        return Ok(records);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] PurchaseRecord record)
    {
        record.RestaurantId = Guid.Parse(User.FindFirstValue("RestaurantId")!);
        record.CreatedAtUtc = DateTime.UtcNow;

        decimal total = 0;
        foreach (var item in record.Items)
        {
            item.Amount = item.Quantity * item.UnitPrice;
            total += item.Amount;
        }
        record.TotalAmount = total;

        _context.PurchaseRecords.Add(record);
        await _context.SaveChangesAsync();
        return Ok(record);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var record = await _context.PurchaseRecords.FindAsync(id);
        if (record == null) return NotFound();
        _context.PurchaseRecords.Remove(record);
        await _context.SaveChangesAsync();
        return Ok();
    }
}
