using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RestaurantPOS.Infrastructure.Data;
using RestaurantPOS.Modules.Menu.Entities;

namespace RestaurantPOS.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class MenuController : ControllerBase
{
    private readonly AppDbContext _context;

    public MenuController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet("categories")]
    public async Task<IActionResult> GetCategories()
    {
        var restaurantId = Guid.Parse(User.FindFirstValue("RestaurantId")!);
        var categories = await _context.Categories
            .Where(c => c.RestaurantId == restaurantId)
            .OrderBy(c => c.DisplayOrder)
            .ToListAsync();
        return Ok(categories);
    }

    [HttpPost("categories")]
    public async Task<IActionResult> CreateCategory([FromBody] Category category)
    {
        category.RestaurantId = Guid.Parse(User.FindFirstValue("RestaurantId")!);
        _context.Categories.Add(category);
        await _context.SaveChangesAsync();
        return Ok(category);
    }

    [HttpGet("products")]
    public async Task<IActionResult> GetProducts([FromQuery] Guid? categoryId)
    {
        var restaurantId = Guid.Parse(User.FindFirstValue("RestaurantId")!);
        var query = _context.Products.AsQueryable();

        // Filter theo nhà hàng thông qua Category
        var categoryIds = await _context.Categories
            .Where(c => c.RestaurantId == restaurantId)
            .Select(c => c.Id)
            .ToListAsync();

        query = query.Where(p => categoryIds.Contains(p.CategoryId));

        if (categoryId.HasValue)
            query = query.Where(p => p.CategoryId == categoryId);

        return Ok(await query.ToListAsync());
    }

    [HttpPost("products")]
    public async Task<IActionResult> CreateProduct([FromBody] Product product)
    {
        _context.Products.Add(product);
        await _context.SaveChangesAsync();
        return Ok(product);
    }
}