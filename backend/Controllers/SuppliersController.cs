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
public class SuppliersController : ControllerBase
{
    private readonly AppDbContext _context;
    public SuppliersController(AppDbContext context) => _context = context;

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var resId = Guid.Parse(User.FindFirstValue("RestaurantId")!);
        var suppliers = await _context.Suppliers
            .Where(s => s.RestaurantId == resId)
            .OrderBy(s => s.Name)
            .ToListAsync();
        return Ok(suppliers);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] Supplier supplier)
    {
        supplier.RestaurantId = Guid.Parse(User.FindFirstValue("RestaurantId")!);
        _context.Suppliers.Add(supplier);
        await _context.SaveChangesAsync();
        return Ok(supplier);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] Supplier supplier)
    {
        var existing = await _context.Suppliers.FindAsync(id);
        if (existing == null) return NotFound();
        existing.Name = supplier.Name;
        existing.Phone = supplier.Phone;
        existing.Address = supplier.Address;
        existing.Notes = supplier.Notes;
        await _context.SaveChangesAsync();
        return Ok(existing);
    }
}
