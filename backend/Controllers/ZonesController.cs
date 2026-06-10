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
public class ZonesController : ControllerBase
{
    private readonly AppDbContext _context;
    public ZonesController(AppDbContext context) => _context = context;

    [HttpGet]
    public async Task<IActionResult> GetByBranch([FromQuery] Guid branchId)
    {
        var zones = await _context.Zones
            .Where(z => z.BranchId == branchId)
            .OrderBy(z => z.DisplayOrder)
            .ToListAsync();
        return Ok(zones);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] Zone zone)
    {
        try
        {
            zone.CreatedAtUtc = DateTime.UtcNow;
            _context.Zones.Add(zone);
            await _context.SaveChangesAsync();
            return Ok(zone);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Lỗi khi tạo khu vực", details = ex.Message, inner = ex.InnerException?.Message });
        }
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] Zone zone)
    {
        var existing = await _context.Zones.FindAsync(id);
        if (existing == null) return NotFound();

        existing.Name = zone.Name;
        existing.DisplayOrder = zone.DisplayOrder;

        await _context.SaveChangesAsync();
        return Ok(existing);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var zone = await _context.Zones.FindAsync(id);
        if (zone == null) return NotFound();

        // Kiểm tra xem có bàn nào thuộc Zone này không
        if (await _context.DiningTables.AnyAsync(t => t.ZoneId == id))
        {
            return BadRequest("Không thể xóa khu vực đang có bàn. Vui lòng chuyển bàn sang khu vực khác trước.");
        }

        _context.Zones.Remove(zone);
        await _context.SaveChangesAsync();
        return Ok();
    }
}
