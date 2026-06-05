using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using RestaurantPOS.DTOs;
using RestaurantPOS.Infrastructure.Common;
using RestaurantPOS.Infrastructure.Data;
using RestaurantPOS.Modules.Ordering.Entities;

namespace RestaurantPOS.Controllers;

[ApiController]
[Route("api/[controller]")]
public class QROrderingController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly IHubContext<NotificationHub> _hubContext;

    public QROrderingController(AppDbContext context, IHubContext<NotificationHub> hubContext)
    {
        _context = context;
        _hubContext = hubContext;
    }

    // 1. Lấy thực đơn của chi nhánh khi quét QR bàn
    [HttpGet("menu/{tableId}")]
    public async Task<IActionResult> GetMenuByTable(Guid tableId)
    {
        var table = await _context.DiningTables.FindAsync(tableId);
        if (table == null) return NotFound("Bàn không tồn tại");

        var branch = await _context.Branches.FindAsync(table.BranchId);
        if (branch == null) return NotFound("Chi nhánh không tồn tại");

        var categories = await _context.Categories
            .Where(c => c.RestaurantId == branch.RestaurantId)
            .OrderBy(c => c.DisplayOrder)
            .ToListAsync();

        var categoryIds = categories.Select(c => c.Id).ToList();
        var products = await _context.Products
            .Where(p => categoryIds.Contains(p.CategoryId) && p.IsAvailable)
            .ToListAsync();

        return Ok(new {
            categories,
            products,
            branchName = branch.Name,
            tableNumber = table.TableNumber,
            restaurantId = branch.RestaurantId
        });
    }

    // 2. Khách gửi yêu cầu gọi món (Tạo Order chờ xác nhận)
    [HttpPost("submit-request")]
    public async Task<IActionResult> SubmitOrderRequest([FromBody] CreateOrderRequestDto dto)
    {
        var table = await _context.DiningTables.FindAsync(dto.TableId);
        if (table == null) return BadRequest("Bàn không hợp lệ");

        var branch = await _context.Branches.FindAsync(table.BranchId);

        using var transaction = await _context.Database.BeginTransactionAsync();
        try
        {
            // 1. Tạo Order chính thức ở trạng thái chờ xác nhận
            var order = new Order
            {
                OrderNumber = $"QR-{DateTime.Now.Ticks.ToString().Substring(10)}",
                RestaurantId = branch!.RestaurantId,
                BranchId = table.BranchId,
                TableId = dto.TableId,
                Status = "PendingConfirmation", // Trạng thái mới
                PaymentStatus = "Pending",
                CreatedAtUtc = DateTime.UtcNow
            };

            _context.Orders.Add(order);
            await _context.SaveChangesAsync();

            decimal total = 0;
            var orderItems = new List<OrderItem>();

            foreach (var item in dto.Items)
            {
                var product = await _context.Products.FindAsync(item.ProductId);
                if (product == null) continue;

                var itemTotal = product.Price * item.Quantity;
                orderItems.Add(new OrderItem
                {
                    OrderId = order.Id,
                    ProductId = item.ProductId,
                    Quantity = item.Quantity,
                    UnitPrice = product.Price,
                    TotalPrice = itemTotal
                });
                total += itemTotal;
            }

            if (!orderItems.Any()) return BadRequest("Đơn hàng không có món ăn hợp lệ");

            _context.OrderItems.AddRange(orderItems);
            order.Subtotal = total;
            order.TotalAmount = total;

            // 2. Khóa bàn ngay lập tức
            table.Status = "Occupied";

            await _context.SaveChangesAsync();
            await transaction.CommitAsync();

            // 3. Thông báo Real-time cho nhân viên
            await _hubContext.Clients.All.SendAsync("ReceiveNewOrderRequest", new {
                orderId = order.Id,
                tableNumber = table.TableNumber,
                totalAmount = order.TotalAmount
            });

            return Ok(new { message = "Gửi yêu cầu thành công, vui lòng chờ nhân viên xác nhận!", orderId = order.Id });
        }
        catch (Exception ex)
        {
            await transaction.RollbackAsync();
            return StatusCode(500, ex.Message);
        }
    }

    [HttpGet("generate-qr-request/{requestId}")]
    public async Task<IActionResult> GenerateQRForRequest(Guid requestId)
    {
        var request = await _context.OrderRequests.FindAsync(requestId);
        if (request == null) return NotFound();

        var account = await _context.PaymentAccounts
            .Where(a => a.BranchId == request.BranchId && a.IsActive)
            .OrderByDescending(a => a.IsDefault)
            .FirstOrDefaultAsync();

        if (account == null) return BadRequest("Chi nhánh chưa cấu hình thanh toán");

        var items = await _context.OrderRequestItems.Where(i => i.OrderRequestId == requestId).ToListAsync();
        decimal total = 0;
        foreach (var item in items)
        {
            var product = await _context.Products.FindAsync(item.ProductId);
            total += (product?.Price ?? 0) * item.Quantity;
        }

        var qrUrl = $"https://img.vietqr.io/image/{account.BankCode}-{account.AccountNumber}-compact.png?amount={total}&addInfo=Ban {request.TableId.ToString().Substring(0, 4)} thanh toan&accountName={Uri.EscapeDataString(account.AccountName)}";

        return Ok(new { qrUrl, amount = total });
    }
}