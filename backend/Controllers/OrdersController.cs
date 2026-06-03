using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RestaurantPOS.Infrastructure.Data;
using RestaurantPOS.Modules.Ordering.Entities;

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
            .Include(o => o.OrderItems)
            .ThenInclude(oi => oi.Product) // Sửa cách gọi ThenInclude cho ICollection
            .Where(o => o.RestaurantId == restaurantId)
            .OrderByDescending(o => o.CreatedAtUtc)
            .ToListAsync();
        return Ok(orders);
    }

    [HttpGet("customer/my-orders")]
    public async Task<IActionResult> GetMyOrders()
    {
        var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userIdStr)) return Unauthorized();
        var userId = Guid.Parse(userIdStr);

        var orders = await _context.Orders
            .Include(o => o.OrderItems)
            .ThenInclude(oi => oi.Product) // Sửa tương tự tại đây
            .Where(o => o.CustomerId == userId)
            .OrderByDescending(o => o.CreatedAtUtc)
            .ToListAsync();
        return Ok(orders);
    }

    [HttpGet("pending-requests")]
    public async Task<IActionResult> GetPendingRequests()
    {
        var restaurantId = Guid.Parse(User.FindFirstValue("RestaurantId")!);
        var branchIds = await _context.Branches.Where(b => b.RestaurantId == restaurantId).Select(b => b.Id).ToListAsync();
        var requests = await _context.OrderRequests
            .Include(r => r.OrderRequestItems)
            .Where(r => branchIds.Contains(r.BranchId) && r.Status == "Pending")
            .OrderByDescending(r => r.CreatedAtUtc)
            .ToListAsync();
        return Ok(requests);
    }

    [HttpPost("approve-request/{requestId}")]
    public async Task<IActionResult> ApproveRequest(Guid requestId)
    {
        var request = await _context.OrderRequests.FindAsync(requestId);
        if (request == null) return NotFound();
        var requestItems = await _context.OrderRequestItems.Where(i => i.OrderRequestId == requestId).ToListAsync();
        var branch = await _context.Branches.FindAsync(request.BranchId);

        using var transaction = await _context.Database.BeginTransactionAsync();
        try
        {
            var order = new Order
            {
                OrderNumber = $"ORD-{DateTime.Now.Ticks.ToString().Substring(10)}",
                RestaurantId = branch!.RestaurantId,
                BranchId = request.BranchId,
                TableId = request.TableId,
                CustomerId = request.TableId, // Giả sử dùng tạm TableId cho Customer nếu chưa login
                CreatedByUserId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!),
                Status = "Preparing",
                PaymentStatus = "Pending"
            };
            _context.Orders.Add(order);
            await _context.SaveChangesAsync();

            decimal total = 0;
            foreach (var reqItem in requestItems)
            {
                var product = await _context.Products.FindAsync(reqItem.ProductId);
                var itemTotal = (product?.Price ?? 0) * reqItem.Quantity;
                _context.OrderItems.Add(new OrderItem
                {
                    OrderId = order.Id,
                    ProductId = reqItem.ProductId,
                    Quantity = reqItem.Quantity,
                    UnitPrice = product?.Price ?? 0,
                    TotalPrice = itemTotal
                });
                total += itemTotal;
            }
            order.TotalAmount = total;
            order.Subtotal = total;
            request.Status = "Approved";
            await _context.SaveChangesAsync();
            await transaction.CommitAsync();
            return Ok(new { message = "Duyệt món thành công" });
        }
        catch { await transaction.RollbackAsync(); return BadRequest(); }
    }
}