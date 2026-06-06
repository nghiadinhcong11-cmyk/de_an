using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using RestaurantPOS.Infrastructure.Common;
using RestaurantPOS.Infrastructure.Data;
using RestaurantPOS.Modules.Ordering.Entities;
using RestaurantPOS.Modules.CRM.Entities;
using RestaurantPOS.Modules.TableManagement.Entities;
using RestaurantPOS.Modules.Payment.Entities;

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
        var branchIdStr = User.FindFirstValue("BranchId");

        if (string.IsNullOrEmpty(resIdStr)) return Unauthorized();
        var restaurantId = Guid.Parse(resIdStr);

        var query = _context.Orders
            .Include(o => o.OrderItems)
                .ThenInclude(oi => oi.Product)
            .Include(o => o.Customer)
            .Include(o => o.Table)
            .Include(o => o.Branch)
            .Where(o => o.RestaurantId == restaurantId);

        // Nếu là nhân viên, chỉ xem đơn của chi nhánh mình
        if (!string.IsNullOrEmpty(branchIdStr))
        {
            var branchId = Guid.Parse(branchIdStr);
            query = query.Where(o => o.BranchId == branchId);
        }

        var orders = await query
            .OrderByDescending(o => o.CreatedAtUtc)
            .Select(o => new {
                o.Id,
                o.OrderNumber,
                o.Status,
                o.PaymentStatus,
                o.TotalAmount,
                o.DiscountAmount,
                o.Subtotal,
                o.CreatedAtUtc,
                o.TableId,
                TableNumber = o.Table.TableNumber,
                BranchName = o.Branch.Name,
                BranchAddress = o.Branch.Address,
                CustomerName = o.Customer != null ? o.Customer.FullName : "Khách vãng lai",
                CustomerPhone = o.Customer != null ? o.Customer.PhoneNumber : null,
                Items = o.OrderItems.Select(oi => new {
                    oi.Product.Name,
                    oi.Quantity,
                    oi.UnitPrice,
                    oi.TotalPrice
                })
            })
            .ToListAsync();

        return Ok(orders);
    }

    [HttpPost]
    public async Task<IActionResult> CreateOrder([FromBody] CreateOrderManualDto dto)
    {
        var resIdStr = User.FindFirstValue("RestaurantId");
        if (string.IsNullOrEmpty(resIdStr)) return Unauthorized();
        var restaurantId = Guid.Parse(resIdStr);

        var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
        var userId = Guid.Parse(userIdStr!);

        var table = await _context.DiningTables.FindAsync(dto.TableId);
        if (table == null) return BadRequest("Bàn không tồn tại");

        using var transaction = await _context.Database.BeginTransactionAsync();
        try
        {
            var order = new Order
            {
                OrderNumber = $"POS-{DateTime.Now.Ticks.ToString().Substring(10)}",
                RestaurantId = restaurantId,
                BranchId = table.BranchId,
                TableId = dto.TableId,
                CreatedByUserId = userId,
                Status = "Preparing",
                PaymentStatus = "Pending"
            };

            _context.Orders.Add(order);
            await _context.SaveChangesAsync();

            decimal total = 0;
            foreach (var item in dto.Items)
            {
                var product = await _context.Products.FindAsync(item.ProductId);
                if (product == null) continue;

                var itemTotal = product.Price * item.Quantity;
                _context.OrderItems.Add(new OrderItem
                {
                    OrderId = order.Id,
                    ProductId = item.ProductId,
                    Quantity = item.Quantity,
                    UnitPrice = product.Price,
                    TotalPrice = itemTotal
                });
                total += itemTotal;
            }

            order.TotalAmount = total;
            order.Subtotal = total;

            // Cập nhật trạng thái bàn
            table.Status = "Occupied";

            await _context.SaveChangesAsync();
            await transaction.CommitAsync();

            return Ok(order);
        }
        catch (Exception ex)
        {
            await transaction.RollbackAsync();
            return BadRequest(ex.Message);
        }
    }

    public class CreateOrderManualDto
    {
        public Guid TableId { get; set; }
        public List<OrderItemDto> Items { get; set; } = [];
    }

    public class OrderItemDto
    {
        public Guid ProductId { get; set; }
        public int Quantity { get; set; }
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
            .Include(o => o.Branch)
            .Include(o => o.Table)
            .Where(o => o.CustomerId == userId)
            .OrderByDescending(o => o.CreatedAtUtc)
            .Select(o => new {
                o.Id,
                o.OrderNumber,
                o.Status,
                o.PaymentStatus,
                o.TotalAmount,
                o.CreatedAtUtc,
                BranchName = o.Branch.Name,
                BranchAddress = o.Branch.Address,
                TableNumber = o.Table.TableNumber,
                OrderItems = o.OrderItems.Select(oi => new {
                    oi.Id,
                    oi.Quantity,
                    oi.TotalPrice,
                    Product = new { oi.Product.Name }
                })
            })
            .ToListAsync();

        return Ok(orders);
    }

    [HttpPost("{id}/confirm")]
    public async Task<IActionResult> ConfirmOrder(Guid id)
    {
        var order = await _context.Orders.FindAsync(id);
        if (order == null) return NotFound();

        order.Status = "Confirmed";

        // Gán nhân viên xác nhận vào đơn hàng
        var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!string.IsNullOrEmpty(userIdStr))
        {
            order.CreatedByUserId = Guid.Parse(userIdStr);
        }

        await _context.SaveChangesAsync();

        // THÔNG BÁO CHO BẾP & KHÁCH
        await _hubContext.Clients.All.SendAsync("OrderStatusUpdated", new {
            orderId = order.Id,
            newStatus = "Confirmed",
            message = "Đơn hàng đã được xác nhận & Đã gửi vào bếp"
        });

        return Ok(new { message = "Xác nhận đơn thành công" });
    }

    [HttpGet("pending-requests")]
    [HttpGet("pending-confirmation")]
    public async Task<IActionResult> GetPendingConfirmation()
    {
        var resIdStr = User.FindFirstValue("RestaurantId");
        var branchIdStr = User.FindFirstValue("BranchId");
        if (string.IsNullOrEmpty(resIdStr)) return Unauthorized();

        var query = _context.Orders
            .Include(o => o.OrderItems).ThenInclude(oi => oi.Product)
            .Include(o => o.Table)
            .Where(o => o.RestaurantId == Guid.Parse(resIdStr) && (o.Status == "PendingConfirmation" || o.Status == "Pending"));

        if (!string.IsNullOrEmpty(branchIdStr))
            query = query.Where(o => o.BranchId == Guid.Parse(branchIdStr));

        var results = await query.OrderByDescending(o => o.CreatedAtUtc)
            .Select(o => new {
                o.Id,
                o.OrderNumber,
                o.Status,
                o.PaymentStatus,
                o.TotalAmount,
                TableNumber = o.Table.TableNumber,
                BranchName = o.Branch.Name,
                BranchAddress = o.Branch.Address,
                Items = o.OrderItems.Select(oi => new {
                    ProductName = oi.Product.Name,
                    oi.Quantity,
                    Price = oi.UnitPrice
                })
            })
            .ToListAsync();

        return Ok(results);
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

            // Cập nhật trạng thái bàn sang "Occupied"
            var table = await _context.DiningTables.FindAsync(request.TableId);
            if (table != null)
            {
                table.Status = "Occupied";
            }

            await _context.SaveChangesAsync();
            await transaction.CommitAsync();

            // THÔNG BÁO CHO KHÁCH: Đơn hàng đã được duyệt
            await _hubContext.Clients.All.SendAsync("OrderStatusUpdated", new {
                orderId = order.Id,
                orderNumber = order.OrderNumber,
                newStatus = "Đã tiếp nhận & Đang chuẩn bị",
                tableId = order.TableId,
                tableStatus = "Occupied"
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

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var order = await _context.Orders
            .Include(o => o.OrderItems)
                .ThenInclude(oi => oi.Product)
            .Include(o => o.Table)
            .FirstOrDefaultAsync(o => o.Id == id);

        if (order == null) return NotFound();
        return Ok(order);
    }

    [HttpPost("{id}/items")]
    public async Task<IActionResult> AddItemsToOrder(Guid id, [FromBody] List<OrderItemDto> items)
    {
        var order = await _context.Orders.Include(o => o.OrderItems).FirstOrDefaultAsync(o => o.Id == id);
        if (order == null) return NotFound();

        using var transaction = await _context.Database.BeginTransactionAsync();
        try
        {
            decimal additionalTotal = 0;
            foreach (var item in items)
            {
                var product = await _context.Products.FindAsync(item.ProductId);
                if (product == null) continue;

                var itemTotal = product.Price * item.Quantity;
                _context.OrderItems.Add(new OrderItem
                {
                    OrderId = order.Id,
                    ProductId = item.ProductId,
                    Quantity = item.Quantity,
                    UnitPrice = product.Price,
                    TotalPrice = itemTotal
                });
                additionalTotal += itemTotal;
            }

            order.Subtotal += additionalTotal;
            order.TotalAmount += additionalTotal;

            await _context.SaveChangesAsync();
            await transaction.CommitAsync();

            return Ok(order);
        }
        catch (Exception ex)
        {
            await transaction.RollbackAsync();
            return BadRequest(ex.Message);
        }
    }

    [HttpPost("{id}/payment")]
    public async Task<IActionResult> ProcessPayment(Guid id, [FromBody] PaymentRequest request)
    {
        var order = await _context.Orders.FindAsync(id);
        if (order == null) return NotFound();

        using var transaction = await _context.Database.BeginTransactionAsync();
        try
        {
            // 1. Áp dụng Voucher (nếu có)
            if (!string.IsNullOrEmpty(request.VoucherCode))
            {
                var voucher = await _context.Vouchers.FirstOrDefaultAsync(v => v.Code == request.VoucherCode && v.IsActive && v.RestaurantId == order.RestaurantId);
                if (voucher != null && order.Subtotal >= voucher.MinOrderAmount)
                {
                    if (voucher.DiscountType?.ToLower() == "percentage")
                    {
                        order.DiscountAmount = Math.Round(order.Subtotal * (voucher.DiscountValue / 100));
                    }
                    else
                    {
                        order.DiscountAmount = voucher.DiscountValue;
                    }
                    order.TotalAmount = Math.Max(0, order.Subtotal - order.DiscountAmount);
                }
            }

            // 2. Tích điểm nếu có số điện thoại
            if (!string.IsNullOrEmpty(request.PhoneNumber))
            {
                var customer = await _context.Customers.FirstOrDefaultAsync(c => c.PhoneNumber == request.PhoneNumber);
                if (customer == null)
                {
                    customer = new Customer
                    {
                        RestaurantId = order.RestaurantId,
                        FullName = request.CustomerName ?? "Khách hàng mới",
                        PhoneNumber = request.PhoneNumber,
                        Points = 0,
                        TotalSpent = 0
                    };
                    _context.Customers.Add(customer);
                    await _context.SaveChangesAsync();
                }

                int earnedPoints = (int)Math.Floor(order.TotalAmount / 10000);
                customer.Points += earnedPoints;
                customer.TotalSpent += order.TotalAmount;
                customer.LastVisitAtUtc = DateTime.UtcNow;
                order.CustomerId = customer.Id;

                _context.CustomerPointHistories.Add(new CustomerPointHistory
                {
                    CustomerId = customer.Id,
                    OrderId = order.Id,
                    Points = earnedPoints,
                    Type = "Earn",
                    Description = $"Tích điểm từ đơn hàng {order.OrderNumber}"
                });
            }

            // 3. Cập nhật trạng thái đơn hàng
            order.Status = "Completed";
            order.PaymentStatus = "Paid";

            // 4. Tạo bản ghi thanh toán
            var payment = new Payment
            {
                OrderId = order.Id,
                Method = request.Method ?? "Cash",
                Amount = order.TotalAmount,
                Status = "Success"
            };
            _context.Payments.Add(payment);

            // 5. Giải phóng bàn
            var table = await _context.DiningTables.FindAsync(order.TableId);
            if (table != null)
            {
                table.Status = "Available";
            }

            await _context.SaveChangesAsync();
            await transaction.CommitAsync();

            // 5. Lấy thông tin VietQR nếu thanh toán qua QR
            string? qrUrl = null;
            if (payment.Method == "QR")
            {
                var account = await _context.PaymentAccounts
                    .Where(a => a.BranchId == order.BranchId && a.IsActive)
                    .OrderByDescending(a => a.IsDefault)
                    .FirstOrDefaultAsync();

                if (account != null)
                {
                    qrUrl = $"https://img.vietqr.io/image/{account.BankCode}-{account.AccountNumber}-compact.png?amount={order.TotalAmount}&addInfo=Thanh toan don {order.OrderNumber}&accountName={Uri.EscapeDataString(account.AccountName)}";
                }
            }

            return Ok(new {
                message = "Thanh toán thành công",
                qrUrl,
                totalAmount = order.TotalAmount,
                discountAmount = order.DiscountAmount
            });
        }
        catch (Exception ex)
        {
            await transaction.RollbackAsync();
            return BadRequest(ex.Message);
        }
    }

    public class PaymentRequest
    {
        public string? PhoneNumber { get; set; }
        public string? CustomerName { get; set; }
        public string? VoucherCode { get; set; }
        public string? Method { get; set; } // Cash hoặc QR
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