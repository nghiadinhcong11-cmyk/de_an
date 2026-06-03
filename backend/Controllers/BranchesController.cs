using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RestaurantPOS.Infrastructure.Data;
using RestaurantPOS.Modules.Core.Entities;
using RestaurantPOS.DTOs;

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
        var resIdStr = User.FindFirstValue("RestaurantId");
        if (string.IsNullOrEmpty(resIdStr)) return Unauthorized();
        var restaurantId = Guid.Parse(resIdStr);

        var branches = await _context.Branches
            .Where(b => b.RestaurantId == restaurantId)
            .Select(b => new BranchDto
            {
                Id = b.Id,
                Name = b.Name,
                Address = b.Address,
                Phone = b.Phone,
                IsActive = b.IsActive
            })
            .ToListAsync();

        return Ok(branches);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] BranchCreateDto dto)
    {
        var resIdStr = User.FindFirstValue("RestaurantId");
        if (string.IsNullOrEmpty(resIdStr)) return Unauthorized();

        var branch = new Branch
        {
            RestaurantId = Guid.Parse(resIdStr),
            Name = dto.Name,
            Address = dto.Address,
            Phone = dto.Phone,
            IsActive = true
        };

        _context.Branches.Add(branch);
        await _context.SaveChangesAsync();

        return Ok(new BranchDto
        {
            Id = branch.Id,
            Name = branch.Name,
            Address = branch.Address,
            Phone = branch.Phone,
            IsActive = branch.IsActive
        });
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] BranchCreateDto dto)
    {
        var branch = await _context.Branches.FindAsync(id);
        if (branch == null) return NotFound();

        branch.Name = dto.Name;
        branch.Address = dto.Address;
        branch.Phone = dto.Phone;

        await _context.SaveChangesAsync();
        return Ok(branch);
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