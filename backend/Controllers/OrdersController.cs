using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using RestaurantPOS.Infrastructure.Common;
using RestaurantPOS.Infrastructure.Data;
using RestaurantPOS.Modules.Ordering.Entities;

namespace RestaurantPOS.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class OrdersController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly IHubContext<NotificationHub> _hubContext;

    public OrdersController(AppDbContext context, IHubContext<NotificationHub> hubContext)
    {
        _context = context;
        _hubContext = hubContext;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var resIdStr = User.FindFirstValue("RestaurantId");
        if (string.IsNullOrEmpty(resIdStr)) return Unauthorized();
        var restaurantId = Guid.Parse(resIdStr);

        var orders = await _context.Orders
            .Include(o => o.OrderItems)
                .ThenInclude(oi => oi.Product)
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
                .ThenInclude(oi => oi.Product)
            .Where(o => o.CustomerId == userId)
            .OrderByDescending(o => o.CreatedAtUtc)
            .ToListAsync();

        return Ok(orders);
    }

    [HttpGet("pending-requests")]
    public async Task<IActionResult> GetPendingRequests()
    {
        var resIdStr = User.FindFirstValue("RestaurantId");
        if (string.IsNullOrEmpty(resIdStr)) return Unauthorized();
        var restaurantId = Guid.Parse(resIdStr);

        var branchIds = await _context.Branches
            .Where(b => b.RestaurantId == restaurantId)
            .Select(b => b.Id).ToListAsync();

        var requests = await _context.OrderRequests
            .Include(r => r.OrderRequestItems)
                .ThenInclude(ri => ri.Product)
            .Where(r => branchIds.Contains(r.BranchId) && r.Status == "Pending")
            .OrderByDescending(r => r.CreatedAtUtc)
            .Select(r => new {
                r.Id,
                r.BranchId,
                r.TableId,
                r.CustomerName,
                r.Status,
                r.CreatedAtUtc,
                TableNumber = _context.DiningTables.Where(t => t.Id == r.TableId).Select(t => t.TableNumber).FirstOrDefault(),
                OrderRequestItems = r.OrderRequestItems.Select(ri => new {
                    ri.Id,
                    ri.Quantity,
                    ri.Note,
                    Product = new {
                        ri.Product.Name,
                        ri.Product.Price
                    }
                })
            })
            .ToListAsync();

        return Ok(requests);
    }

    [HttpPost("approve-request/{requestId}")]
    public async Task<IActionResult> ApproveRequest(Guid requestId)
    {
        var request = await _context.OrderRequests.FindAsync(requestId);
        if (request == null) return NotFound();

        var requestItems = await _context.OrderRequestItems
            .Where(i => i.OrderRequestId == requestId).ToListAsync();

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

            // THÔNG BÁO CHO KHÁCH: Đơn hàng đã được duyệt
            await _hubContext.Clients.All.SendAsync("OrderStatusUpdated", new {
                orderId = order.Id,
                orderNumber = order.OrderNumber,
                newStatus = "Đã tiếp nhận & Đang chuẩn bị"
            });

            return Ok(new { message = "Duyệt món thành công", orderId = order.Id });
        }
        catch
        {
            await transaction.RollbackAsync();
            return BadRequest();
        }
    }

    [HttpPost("reject-request/{requestId}")]
    public async Task<IActionResult> RejectRequest(Guid requestId)
    {
        var request = await _context.OrderRequests.FindAsync(requestId);
        if (request == null) return NotFound();

        request.Status = "Rejected";
        await _context.SaveChangesAsync();

        await _hubContext.Clients.All.SendAsync("OrderStatusUpdated", new {
            requestId = request.Id,
            newStatus = "Đã bị từ chối"
        });

        return Ok(new { message = "Đã từ chối yêu cầu" });
    }

    [HttpPut("{id}/status")]
    public async Task<IActionResult> UpdateStatus(Guid id, [FromBody] string status)
    {
        var order = await _context.Orders.FindAsync(id);
        if (order == null) return NotFound();

        order.Status = status;
        await _context.SaveChangesAsync();

        // THÔNG BÁO CHO KHÁCH: Trạng thái thay đổi (Vd: Ready, Served)
        await _hubContext.Clients.All.SendAsync("OrderStatusUpdated", new {
            orderId = order.Id,
            orderNumber = order.OrderNumber,
            newStatus = status
        });

        return Ok(order);
    }
}