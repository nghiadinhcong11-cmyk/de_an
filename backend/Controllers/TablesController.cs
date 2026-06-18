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
    public async Task<IActionResult> GetAll([FromQuery] Guid? branchId)
    {
        try
        {
            var restaurantIdStr = User.FindFirstValue("RestaurantId");
            var branchIdFromToken = User.FindFirstValue("BranchId");

            Guid restaurantId;
            if (string.IsNullOrEmpty(restaurantIdStr))
            {
                // Nếu không có RestaurantId trong token (khách hàng vãng lai/vừa login),
                // thì yêu cầu phải có branchId để truy vấn
                if (!branchId.HasValue) return BadRequest("Phải cung cấp branchId hoặc đăng nhập quyền quản lý");

                var branch = await _context.Branches.FindAsync(branchId.Value);
                if (branch == null) return NotFound("Chi nhánh không tồn tại");
                restaurantId = branch.RestaurantId;
            }
            else
            {
                restaurantId = Guid.Parse(restaurantIdStr);
            }

            var query = _context.DiningTables
                .Include(t => t.Zone)
                .AsQueryable();

            if (branchId.HasValue)
            {
                query = query.Where(t => t.BranchId == branchId.Value);
            }
            else if (!string.IsNullOrEmpty(branchIdFromToken))
            {
                query = query.Where(t => t.BranchId == Guid.Parse(branchIdFromToken));
            }
            else
            {
                var branchIds = await _context.Branches
                    .Where(b => b.RestaurantId == restaurantId)
                    .Select(b => b.Id)
                    .ToListAsync();
                query = query.Where(t => branchIds.Contains(t.BranchId));
            }

            var tables = await query
                .OrderBy(t => t.TableNumber)
                .ToListAsync();

            // Lấy danh sách tên chi nhánh để map vào kết quả
            var allBranchNames = await _context.Branches
                .Where(b => b.RestaurantId == restaurantId)
                .ToDictionaryAsync(b => b.Id, b => b.Name);

            var result = tables.Select(t => new {
                t.Id,
                t.BranchId,
                t.ZoneId,
                t.TableNumber,
                t.Capacity,
                t.Status,
                t.Note,
                t.PosX,
                t.PosY,
                ZoneName = t.Zone?.Name ?? "Chung",
                BranchName = allBranchNames.GetValueOrDefault(t.BranchId, "Không xác định")
            });

            return Ok(result);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Lỗi máy chủ", details = ex.Message });
        }
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] DiningTable table)
    {
        try
        {
            if (table.BranchId == Guid.Empty) return BadRequest(new { message = "Phải chọn chi nhánh" });
            if (string.IsNullOrEmpty(table.TableNumber)) return BadRequest(new { message = "Phải nhập số bàn" });

            if (table.ZoneId == Guid.Empty) table.ZoneId = null;

            // 1. Kiểm tra xem bàn đã tồn tại chưa (Ràng buộc theo Zone để cho phép trùng số bàn ở các khu vực khác nhau)
            var exists = await _context.DiningTables.AnyAsync(t =>
                t.BranchId == table.BranchId &&
                t.TableNumber == table.TableNumber &&
                t.ZoneId == table.ZoneId);

            if (exists) {
                var zoneName = "Chung";
                if (table.ZoneId != null) {
                    var zone = await _context.Zones.FindAsync(table.ZoneId);
                    zoneName = zone?.Name ?? "Khu vực";
                }
                return BadRequest(new { message = $"Bàn số {table.TableNumber} đã tồn tại ở khu vực {zoneName}" });
            }

            // 2. Thiết lập các giá trị mặc định
            table.Id = Guid.NewGuid();
            table.Status = "Available";
            table.CreatedAtUtc = DateTime.UtcNow;
            table.Zone = null;

            if (table.ZoneId == Guid.Empty) table.ZoneId = null;

            _context.DiningTables.Add(table);
            await _context.SaveChangesAsync();

            return Ok(table);
        }
        catch (DbUpdateException ex)
        {
            var message = ex.InnerException?.Message ?? ex.Message;
            if (message.Contains("IX_DiningTables_TableNumber"))
            {
                return BadRequest(new { message = $"Bàn số {table.TableNumber} đã tồn tại trong khu vực này." });
            }
            return StatusCode(500, new { message = "Lỗi cơ sở dữ liệu", details = message });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new {
                message = "Lỗi khi tạo bàn",
                details = ex.Message,
                inner = ex.InnerException?.Message
            });
        }
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] DiningTable updateData)
    {
        var table = await _context.DiningTables.FindAsync(id);
        if (table == null) return NotFound();

        table.TableNumber = updateData.TableNumber;
        table.Capacity = updateData.Capacity;
        table.Note = updateData.Note;
        table.ZoneId = updateData.ZoneId == Guid.Empty ? null : updateData.ZoneId;

        await _context.SaveChangesAsync();
        return Ok(table);
    }

    [HttpPut("{id}/position")]
    public async Task<IActionResult> UpdatePosition(Guid id, [FromBody] PositionDto pos)
    {
        var table = await _context.DiningTables.FindAsync(id);
        if (table == null) return NotFound();

        table.PosX = pos.PosX;
        table.PosY = pos.PosY;

        await _context.SaveChangesAsync();
        return Ok();
    }

    [HttpPut("{id}/status")]
    public async Task<IActionResult> UpdateStatus(Guid id, [FromBody] string status)
    {
        var table = await _context.DiningTables.FindAsync(id);
        if (table == null) return NotFound();

        table.Status = status;
        await _context.SaveChangesAsync();
        return Ok();
    }

    public class PositionDto
    {
        public double PosX { get; set; }
        public double PosY { get; set; }
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