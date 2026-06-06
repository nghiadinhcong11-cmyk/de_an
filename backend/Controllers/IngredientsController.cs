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
public class IngredientsController : ControllerBase
{
    private readonly AppDbContext _context;
    public IngredientsController(AppDbContext context) => _context = context;

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var resId = Guid.Parse(User.FindFirstValue("RestaurantId")!);
        var ingredients = await _context.Ingredients
            .Where(i => i.RestaurantId == resId)
            .OrderBy(i => i.Name)
            .ToListAsync();
        return Ok(ingredients);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] Ingredient ingredient)
    {
        ingredient.RestaurantId = Guid.Parse(User.FindFirstValue("RestaurantId")!);
        _context.Ingredients.Add(ingredient);
        await _context.SaveChangesAsync();
        return Ok(ingredient);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] Ingredient ingredient)
    {
        var existing = await _context.Ingredients.FindAsync(id);
        if (existing == null) return NotFound();
        existing.Name = ingredient.Name;
        existing.Unit = ingredient.Unit;
        existing.IsActive = ingredient.IsActive;
        await _context.SaveChangesAsync();
        return Ok(existing);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var existing = await _context.Ingredients.FindAsync(id);
        if (existing == null) return NotFound();
        _context.Ingredients.Remove(existing);
        await _context.SaveChangesAsync();
        return Ok();
    }
}
