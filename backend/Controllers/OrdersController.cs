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

    // 1. Lấy tất cả Đơn hàng chính thức (đã duyệt)
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

    // 2. Lấy danh sách yêu cầu chờ duyệt từ khách (QR)
    [HttpGet("pending-requests")]
    public async Task<IActionResult> GetPendingRequests()
    {
        var restaurantId = Guid.Parse(User.FindFirstValue("RestaurantId")!);
        var branchIds = await _context.Branches
            .Where(b => b.RestaurantId == restaurantId)
            .Select(b => b.Id).ToListAsync();

        var requests = await _context.OrderRequests
            .Where(r => branchIds.Contains(r.BranchId) && r.Status == "Pending")
            .OrderByDescending(r => r.CreatedAtUtc)
            .ToListAsync();

        return Ok(requests);
    }

    // 3. API DUYỆT MÓN: Chuyển Request thành Order thật
    [HttpPost("approve-request/{requestId}")]
    public async Task<IActionResult> ApproveRequest(Guid requestId)
    {
        var request = await _context.OrderRequests.FindAsync(requestId);
        if (request == null) return NotFound("Yêu cầu không tồn tại");

        var requestItems = await _context.OrderRequestItems
            .Where(i => i.OrderRequestId == requestId).ToListAsync();

        using var transaction = await _context.Database.BeginTransactionAsync();
        try
        {
            // Tạm lấy RestaurantId từ chi nhánh
            var branch = await _context.Branches.FindAsync(request.BranchId);

            // Tạo Order chính thức
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

            // Chuyển từng món sang OrderItems
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
                    TotalPrice = itemTotal,
                    Note = reqItem.Note
                });
                total += itemTotal;
            }

            order.TotalAmount = total;
            order.Subtotal = total;

            // Cập nhật trạng thái Request và Bàn
            request.Status = "Approved";
            var table = await _context.DiningTables.FindAsync(request.TableId);
            if (table != null) table.Status = "Occupied";

            await _context.SaveChangesAsync();
            await transaction.CommitAsync();

            return Ok(new { message = "Đã duyệt món và tạo đơn hàng", orderId = order.Id });
        }
        catch (Exception)
        {
            await transaction.RollbackAsync();
            return BadRequest("Có lỗi xảy ra khi duyệt món");
        }
    }

    [HttpDelete("reject-request/{requestId}")]
    public async Task<IActionResult> RejectRequest(Guid requestId)
    {
        var request = await _context.OrderRequests.FindAsync(requestId);
        if (request == null) return NotFound();
        request.Status = "Rejected";
        await _context.SaveChangesAsync();
        return Ok(new { message = "Đã từ chối yêu cầu" });
    }
}