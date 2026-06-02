using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RestaurantPOS.Infrastructure.Data;
using RestaurantPOS.Modules.Core.Entities;

namespace RestaurantPOS.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class BranchesController : ControllerBase
{
    private readonly AppDbContext _context;
    public BranchesController(AppDbContext context) => _context = context;

    [HttpGet]
    public async Task<IActionResult> GetBranches()
    {
        var restaurantId = Guid.Parse(User.FindFirstValue("RestaurantId")!);
        return Ok(await _context.Branches.Where(b => b.RestaurantId == restaurantId).ToListAsync());
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] Branch branch)
    {
        branch.RestaurantId = Guid.Parse(User.FindFirstValue("RestaurantId")!);
        branch.IsActive = true;
        _context.Branches.Add(branch);
        await _context.SaveChangesAsync();
        return Ok(branch);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] Branch branch)
    {
        var existing = await _context.Branches.FindAsync(id);
        if (existing == null) return NotFound();

        existing.Name = branch.name; // Lưu ý viết thường/hoa theo Entity
        existing.Address = branch.address;
        existing.Phone = branch.phone;

        await _context.SaveChangesAsync();
        return Ok(existing);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var branch = await _context.Branches.FindAsync(id);
        if (branch == null) return NotFound();
        _context.Branches.Remove(branch);
        await _context.SaveChangesAsync();
        return Ok();
    }
}