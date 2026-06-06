using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RestaurantPOS.DTOs;
using RestaurantPOS.Infrastructure.Data;
using RestaurantPOS.Modules.Menu.Entities;
using RestaurantPOS.Modules.Inventory.Entities;

namespace RestaurantPOS.Controllers;

[ApiController]
[Route("api/[controller]")]
public class MenuController : ControllerBase
{
    private readonly AppDbContext _context;
    public MenuController(AppDbContext context) => _context = context;

    [AllowAnonymous]
    [HttpGet("categories")]
    public async Task<IActionResult> GetCategories([FromQuery] Guid? restaurantId)
    {
        var finalResId = restaurantId ?? GetRestaurantIdFromToken();
        if (finalResId == Guid.Empty) return BadRequest("Thiếu thông tin nhà hàng");

        var categories = await _context.Categories
            .Where(c => c.RestaurantId == finalResId)
            .OrderBy(c => c.DisplayOrder)
            .ToListAsync();
        return Ok(categories);
    }

    [Authorize]
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

    [Authorize]
    [HttpPut("categories/{id}")]
    public async Task<IActionResult> UpdateCategory(Guid id, [FromBody] Category category)
    {
        var existing = await _context.Categories.FindAsync(id);
        if (existing == null) return NotFound();

        existing.Name = category.Name;
        existing.DisplayOrder = category.DisplayOrder;
        existing.Description = category.Description;

        await _context.SaveChangesAsync();
        return Ok(existing);
    }

    [Authorize]
    [HttpDelete("categories/{id}")]
    public async Task<IActionResult> DeleteCategory(Guid id)
    {
        var category = await _context.Categories.FindAsync(id);
        if (category == null) return NotFound();

        // Kiểm tra xem có sản phẩm nào thuộc danh mục này không
        if (await _context.Products.AnyAsync(p => p.CategoryId == id))
        {
            return BadRequest("Không thể xóa danh mục đang có sản phẩm. Vui lòng chuyển sản phẩm sang danh mục khác trước.");
        }

        _context.Categories.Remove(category);
        await _context.SaveChangesAsync();
        return Ok();
    }

    [AllowAnonymous]
    [HttpGet("products")]
    public async Task<IActionResult> GetProducts([FromQuery] Guid? restaurantId, [FromQuery] Guid? categoryId)
    {
        var finalResId = restaurantId ?? GetRestaurantIdFromToken();
        if (finalResId == Guid.Empty) return BadRequest("Thiếu thông tin nhà hàng");

        var query = _context.Products.Where(p => p.RestaurantId == finalResId && p.IsAvailable);
        if (categoryId.HasValue) query = query.Where(p => p.CategoryId == categoryId);

        return Ok(await query.ToListAsync());
    }

    [Authorize]
    [HttpPost("products")]
    public async Task<IActionResult> CreateProduct([FromBody] ProductCreateUpdateDto dto)
    {
        var resId = GetRestaurantIdFromToken();
        var product = new Product {
            RestaurantId = resId,
            CategoryId = dto.CategoryId,
            Name = dto.Name,
            Price = dto.Price,
            IsAvailable = true
        };
        _context.Products.Add(product);
        await _context.SaveChangesAsync();
        return Ok(product);
    }

    [Authorize]
    [HttpPut("products/{id}")]
    public async Task<IActionResult> UpdateProduct(Guid id, [FromBody] ProductCreateUpdateDto dto)
    {
        var product = await _context.Products.FindAsync(id);
        if (product == null) return NotFound();
        product.Name = dto.Name;
        product.Price = dto.Price;
        product.CategoryId = dto.CategoryId;
        await _context.SaveChangesAsync();
        return Ok(product);
    }

    [Authorize]
    [HttpDelete("products/{id}")]
    public async Task<IActionResult> DeleteProduct(Guid id)
    {
        var product = await _context.Products.FindAsync(id);
        if (product == null) return NotFound();
        _context.Products.Remove(product);
        await _context.SaveChangesAsync();
        return Ok();
    }

    private Guid GetRestaurantIdFromToken()
    {
        var idStr = User.FindFirstValue("RestaurantId");
        return string.IsNullOrEmpty(idStr) ? Guid.Empty : Guid.Parse(idStr);
    }
}