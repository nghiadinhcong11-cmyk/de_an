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
        var restaurantId = Guid.Parse(User.FindFirstValue("RestaurantId")!);
        var branchIds = await _context.Branches.Where(b => b.RestaurantId == restaurantId).Select(b => b.Id).ToListAsync();
        var tables = await _context.DiningTables.Where(t => branchIds.Contains(t.BranchId)).ToListAsync();
        return Ok(tables);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] DiningTable table)
    {
        _context.DiningTables.Add(table);
        await _context.SaveChangesAsync();
        return Ok(table);
    }
}