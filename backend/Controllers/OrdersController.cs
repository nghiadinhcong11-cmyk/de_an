using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RestaurantPOS.Infrastructure.Data;

namespace RestaurantPOS.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class OrdersController : ControllerBase
{
    private readonly AppDbContext _context;
    public OrdersController(AppDbContext context) => _context = context;

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var restaurantId = Guid.Parse(User.FindFirstValue("RestaurantId")!);
        var orders = await _context.Orders
            .Where(o => o.RestaurantId == restaurantId)
            .OrderByDescending(o => o.CreatedAtUtc)
            .ToListAsync();
        return Ok(orders);
    }

    [HttpPut("{id}/status")]
    public async Task<IActionResult> UpdateStatus(Guid id, [FromBody] string status)
    {
        var order = await _context.Orders.FindAsync(id);
        if (order == null) return NotFound();
        order.Status = status;
        await _context.SaveChangesAsync();
        return Ok(order);
    }
}