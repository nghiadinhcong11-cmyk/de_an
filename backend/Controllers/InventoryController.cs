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
public class InventoryController : ControllerBase
{
    private readonly AppDbContext _context;
    public InventoryController(AppDbContext context) => _context = context;

    [HttpGet]
    public async Task<IActionResult> GetInventory()
    {
        var restaurantId = Guid.Parse(User.FindFirstValue("RestaurantId")!);
        var branchIds = await _context.Branches.Where(b => b.RestaurantId == restaurantId).Select(b => b.Id).ToListAsync();

        var ingredients = await _context.Ingredients
            .Where(i => branchIds.Contains(i.BranchId))
            .ToListAsync();

        return Ok(ingredients);
    }

    [HttpPost]
    public async Task<IActionResult> CreateIngredient([FromBody] Ingredient ingredient)
    {
        _context.Ingredients.Add(ingredient);
        await _context.SaveChangesAsync();
        return Ok(ingredient);
    }
}