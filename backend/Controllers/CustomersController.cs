using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RestaurantPOS.Infrastructure.Data;

namespace RestaurantPOS.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class CustomersController : ControllerBase
{
    private readonly AppDbContext _context;
    public CustomersController(AppDbContext context) => _context = context;

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var restaurantId = Guid.Parse(User.FindFirstValue("RestaurantId")!);
        var customers = await _context.Customers.Where(c => c.RestaurantId == restaurantId).ToListAsync();
        return Ok(customers);
    }
}