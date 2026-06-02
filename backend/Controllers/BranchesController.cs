using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RestaurantPOS.DTOs;
using RestaurantPOS.Infrastructure.Data;
using RestaurantPOS.Modules.Core.Entities;

namespace RestaurantPOS.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class BranchesController : ControllerBase
{
    private readonly AppDbContext _context;

    public BranchesController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetBranches()
    {
        var restaurantId = Guid.Parse(User.FindFirstValue("RestaurantId")!);
        var branches = await _context.Branches
            .Where(b => b.RestaurantId == restaurantId)
            .ToListAsync();
        return Ok(branches);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] BranchCreateDto dto)
    {
        var restaurantId = Guid.Parse(User.FindFirstValue("RestaurantId")!);

        var branch = new Branch
        {
            RestaurantId = restaurantId,
            Name = dto.Name,
            Phone = dto.Phone,
            Address = dto.Address,
            IsActive = true
        };

        _context.Branches.Add(branch);
        await _context.SaveChangesAsync();

        return Ok(branch);
    }
}