using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RestaurantPOS.Infrastructure.Data;
using RestaurantPOS.Modules.TableManagement.Entities;

namespace RestaurantPOS.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class TablesController : ControllerBase
{
    private readonly AppDbContext _context;
    public TablesController(AppDbContext context) => _context = context;

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var restaurantIdStr = User.FindFirstValue("RestaurantId");
        var branchIdStr = User.FindFirstValue("BranchId"); // Nếu là nhân viên sẽ có ID chi nhánh

        if (string.IsNullOrEmpty(restaurantIdStr)) return Unauthorized();
        var restaurantId = Guid.Parse(restaurantIdStr);

        var query = _context.DiningTables.AsQueryable();

        // 1. Nếu là nhân viên (có BranchId), chỉ lấy bàn của chi nhánh đó
        if (!string.IsNullOrEmpty(branchIdStr))
        {
            var branchId = Guid.Parse(branchIdStr);
            query = query.Where(t => t.BranchId == branchId);
        }
        else
        {
            // 2. Nếu là Owner (không có BranchId), lấy tất cả chi nhánh của RestaurantId đó
            var branchIds = await _context.Branches
                .Where(b => b.RestaurantId == restaurantId)
                .Select(b => b.Id)
                .ToListAsync();
            query = query.Where(t => branchIds.Contains(t.BranchId));
        }

        var tables = await query
            .OrderBy(t => t.TableNumber)
            .Select(t => new {
                t.Id,
                t.BranchId,
                t.TableNumber,
                t.Capacity,
                t.Zone,
                t.Status,
                BranchName = _context.Branches.Where(b => b.Id == t.BranchId).Select(b => b.Name).FirstOrDefault()
            })
            .ToListAsync();

        return Ok(tables);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] DiningTable table)
    {
        if (table.BranchId == Guid.Empty) return BadRequest("Phải chọn chi nhánh");

        table.Status = "Available";
        _context.DiningTables.Add(table);
        await _context.SaveChangesAsync();
        return Ok(table);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var table = await _context.DiningTables.FindAsync(id);
        if (table == null) return NotFound();

        _context.DiningTables.Remove(table);
        await _context.SaveChangesAsync();
        return Ok(new { message = "Đã xóa bàn" });
    }
}