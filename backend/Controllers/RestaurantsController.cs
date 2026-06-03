using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RestaurantPOS.DTOs;
using RestaurantPOS.Infrastructure.Data;

namespace RestaurantPOS.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class RestaurantsController : ControllerBase
{
    private readonly AppDbContext _context;

    public RestaurantsController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet("my-restaurant")]
    public async Task<IActionResult> GetMyRestaurant()
    {
        var restaurantIdStr = User.FindFirstValue("RestaurantId");
        if (string.IsNullOrEmpty(restaurantIdStr)) return Unauthorized();

        var restaurantId = Guid.Parse(restaurantIdStr);
        var restaurant = await _context.Restaurants
            .Include(r => r.Branches)
            .FirstOrDefaultAsync(r => r.Id == restaurantId);

        if (restaurant == null) return NotFound();

        // Chuyển sang DTO để tránh lỗi Object Cycle
        var dto = new RestaurantDto
        {
            Id = restaurant.Id,
            Name = restaurant.Name,
            ContactPhone = restaurant.ContactPhone,
            ContactEmail = restaurant.ContactEmail,
            Address = restaurant.Address,
            LogoUrl = restaurant.LogoUrl,
            IsActive = restaurant.IsActive,
            Branches = restaurant.Branches.Select(b => new BranchDto
            {
                Id = b.Id,
                Name = b.Name,
                Phone = b.Phone,
                Address = b.Address,
                IsActive = b.IsActive
            }).ToList()
        };

        return Ok(dto);
    }

    [HttpPut]
    public async Task<IActionResult> Update([FromBody] RestaurantUpdateDto dto)
    {
        var restaurantIdStr = User.FindFirstValue("RestaurantId");
        if (string.IsNullOrEmpty(restaurantIdStr)) return Unauthorized();

        var restaurantId = Guid.Parse(restaurantIdStr);
        var restaurant = await _context.Restaurants.FindAsync(restaurantId);

        if (restaurant == null) return NotFound();

        restaurant.Name = dto.Name;
        restaurant.ContactPhone = dto.ContactPhone;
        restaurant.ContactEmail = dto.ContactEmail;
        restaurant.Address = dto.Address;
        restaurant.LogoUrl = dto.LogoUrl;

        await _context.SaveChangesAsync();
        return Ok(restaurant);
    }
}