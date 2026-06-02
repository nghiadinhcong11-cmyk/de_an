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
        var restaurantId = User.FindFirstValue("RestaurantId");
        var restaurant = await _context.Restaurants
            .Include(r => r.Branches)
            .FirstOrDefaultAsync(r => r.Id == Guid.Parse(restaurantId!));

        if (restaurant == null) return NotFound();
        return Ok(restaurant);
    }

    [HttpPut]
    public async Task<IActionResult> Update([FromBody] RestaurantUpdateDto dto)
    {
        var restaurantId = User.FindFirstValue("RestaurantId");
        var restaurant = await _context.Restaurants.FindAsync(Guid.Parse(restaurantId!));

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