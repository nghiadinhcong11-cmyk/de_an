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

        return Ok(new { categories, products, branchName = branch.Name, tableNumber = table.TableNumber });
    }

    // 2. Khách gửi yêu cầu gọi món (Order Request)
    [HttpPost("submit-request")]
    public async Task<IActionResult> SubmitOrderRequest([FromBody] CreateOrderRequestDto dto)
    {
        var table = await _context.DiningTables.FindAsync(dto.TableId);
        if (table == null) return BadRequest("Bàn không hợp lệ");

        using var transaction = await _context.Database.BeginTransactionAsync();
        try
        {
            var request = new OrderRequest
            {
                BranchId = table.BranchId,
                TableId = dto.TableId,
                CustomerName = dto.CustomerName,
                Status = "Pending"
            };

            _context.OrderRequests.Add(request);
            await _context.SaveChangesAsync();

            foreach (var item in dto.Items)
            {
                _context.OrderRequestItems.Add(new OrderRequestItem
                {
                    OrderRequestId = request.Id,
                    ProductId = item.ProductId,
                    VariantId = item.VariantId,
                    Quantity = item.Quantity,
                    Note = item.Note
                });
            }

            await _context.SaveChangesAsync();
            await transaction.CommitAsync();

            // Gửi thông báo Real-time tới nhân viên của chi nhánh
            await _hubContext.Clients.All.SendAsync("ReceiveNewOrderRequest", new {
                requestId = request.Id,
                tableNumber = table.TableNumber
            });

            return Ok(new { message = "Gửi yêu cầu gọi món thành công!", requestId = request.Id });
        }
        catch (Exception)
        {
            await transaction.RollbackAsync();
            return StatusCode(500, "Có lỗi xảy ra khi gọi món");
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