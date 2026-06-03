using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RestaurantPOS.DTOs;
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
        var restaurantIdStr = User.FindFirstValue("RestaurantId");
        if (string.IsNullOrEmpty(restaurantIdStr)) return Unauthorized();
        var restaurantId = Guid.Parse(restaurantIdStr);

        var categories = await _context.Categories
            .Where(c => c.RestaurantId == restaurantId)
            .OrderBy(c => c.DisplayOrder)
            .ToListAsync();
        return Ok(categories);
    }

    [HttpPost("categories")]
    public async Task<IActionResult> CreateCategory([FromBody] Category category)
    {
        var restaurantIdStr = User.FindFirstValue("RestaurantId");
        if (string.IsNullOrEmpty(restaurantIdStr)) return Unauthorized();

        category.RestaurantId = Guid.Parse(restaurantIdStr);
        _context.Categories.Add(category);
        await _context.SaveChangesAsync();
        return Ok(category);
    }

    [HttpGet("products")]
    public async Task<IActionResult> GetProducts([FromQuery] Guid? categoryId)
    {
        var restaurantIdStr = User.FindFirstValue("RestaurantId");
        if (string.IsNullOrEmpty(restaurantIdStr)) return Unauthorized();
        var restaurantId = Guid.Parse(restaurantIdStr);

        var query = _context.Products.Where(p => p.RestaurantId == restaurantId);

        if (categoryId.HasValue)
            query = query.Where(p => p.CategoryId == categoryId);

        var products = await query.ToListAsync();
        return Ok(products);
    }

    [HttpPost("products")]
    public async Task<IActionResult> CreateProduct([FromBody] ProductCreateUpdateDto dto)
    {
        var restaurantIdStr = User.FindFirstValue("RestaurantId");
        if (string.IsNullOrEmpty(restaurantIdStr)) return Unauthorized();

        var product = new Product
        {
            RestaurantId = Guid.Parse(restaurantIdStr),
            CategoryId = dto.CategoryId,
            Name = dto.Name,
            Description = dto.Description,
            Price = dto.Price,
            ImageUrl = dto.ImageUrl,
            IsAvailable = dto.IsAvailable
        };

        _context.Products.Add(product);
        await _context.SaveChangesAsync();
        return Ok(product);
    }

    [HttpPut("products/{id}")]
    public async Task<IActionResult> UpdateProduct(Guid id, [FromBody] ProductCreateUpdateDto dto)
    {
        var restaurantIdStr = User.FindFirstValue("RestaurantId");
        if (string.IsNullOrEmpty(restaurantIdStr)) return Unauthorized();
        var restaurantId = Guid.Parse(restaurantIdStr);

        var existing = await _context.Products
            .FirstOrDefaultAsync(p => p.Id == id && p.RestaurantId == restaurantId);

        if (existing == null) return NotFound();

        existing.Name = dto.Name;
        existing.Price = dto.Price;
        existing.CategoryId = dto.CategoryId;
        existing.Description = dto.Description;
        existing.IsAvailable = dto.IsAvailable;
        existing.ImageUrl = dto.ImageUrl;

        await _context.SaveChangesAsync();
        return Ok(existing);
    }

    [HttpDelete("products/{id}")]
    public async Task<IActionResult> DeleteProduct(Guid id)
    {
        var restaurantIdStr = User.FindFirstValue("RestaurantId");
        if (string.IsNullOrEmpty(restaurantIdStr)) return Unauthorized();
        var restaurantId = Guid.Parse(restaurantIdStr);

        var product = await _context.Products
            .FirstOrDefaultAsync(p => p.Id == id && p.RestaurantId == restaurantId);

        if (product == null) return NotFound();

        _context.Products.Remove(product);
        await _context.SaveChangesAsync();
        return Ok();
    }
}