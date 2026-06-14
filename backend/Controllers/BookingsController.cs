using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using RestaurantPOS.Infrastructure.Common;
using RestaurantPOS.Infrastructure.Data;
using RestaurantPOS.Modules.TableManagement.Entities;

namespace RestaurantPOS.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class BookingsController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly IHubContext<NotificationHub> _hubContext;

    public BookingsController(AppDbContext context, IHubContext<NotificationHub> hubContext)
    {
        _context = context;
        _hubContext = hubContext;
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] Booking booking)
    {
        try
        {
            var restaurantIdStr = User.FindFirstValue("RestaurantId");
            if (string.IsNullOrEmpty(restaurantIdStr))
            {
                // Nếu là khách hàng đặt bàn, lấy restaurantId từ chi nhánh
                var branch = await _context.Branches.FindAsync(booking.BranchId);
                if (branch == null) return BadRequest(new { message = "Chi nhánh không tồn tại" });
                booking.RestaurantId = branch.RestaurantId;
            }
            else
            {
                booking.RestaurantId = Guid.Parse(restaurantIdStr);
            }

            var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!string.IsNullOrEmpty(userIdStr))
            {
                booking.CustomerId = Guid.Parse(userIdStr);
                var customer = await _context.Customers.FindAsync(booking.CustomerId);
                if (customer != null)
                {
                    if (string.IsNullOrEmpty(booking.CustomerName)) booking.CustomerName = customer.FullName;
                    if (string.IsNullOrEmpty(booking.CustomerPhone)) booking.CustomerPhone = customer.PhoneNumber;
                }
            }

            booking.Status = "Pending";
            booking.CreatedAtUtc = DateTime.UtcNow;

            // Đảm bảo BookingDate là UTC để Postgres không lỗi
            booking.BookingDate = DateTime.SpecifyKind(booking.BookingDate, DateTimeKind.Utc);

            _context.Bookings.Add(booking);
            await _context.SaveChangesAsync();

            var branchEntity = await _context.Branches.FindAsync(booking.BranchId);
            var branchName = branchEntity?.Name ?? "Chi nhánh";
            var restaurantGroup = $"restaurant:{booking.RestaurantId}";
            var branchGroup = booking.BranchId.ToString();

            // Load table info if selected
            string tableInfo = "Bàn tự do";
            string zoneName = "Chung";
            if (booking.TableId.HasValue)
            {
                var table = await _context.DiningTables.Include(t => t.Zone).FirstOrDefaultAsync(t => t.Id == booking.TableId.Value);
                if (table != null)
                {
                    tableInfo = $"Bàn {table.TableNumber}";
                    zoneName = table.Zone?.Name ?? "Chung";
                }
            }

            var payload = new {
                bookingId = booking.Id,
                customerName = booking.CustomerName,
                customerPhone = booking.CustomerPhone,
                customerAvatar = customer?.AvatarUrl,
                bookingDate = booking.BookingDate,
                numberOfGuests = booking.NumberOfGuests,
                tableInfo = tableInfo,
                zoneName = zoneName,
                notes = booking.Notes,
                branchId = booking.BranchId,
                branchName = branchName,
                status = booking.Status
            };

            // Notify owner/manager across the restaurant and staff in the matching branch
            await _hubContext.Clients.Group(restaurantGroup).SendAsync("NewBookingReceived", payload);
            await _hubContext.Clients.Group(branchGroup).SendAsync("NewBookingReceived", payload);

            return Ok(booking);
        }
        catch (DbUpdateException ex)
        {
            return StatusCode(500, new {
                error = "Database error",
                message = ex.InnerException?.Message ?? ex.Message
            });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = "Internal server error", message = ex.Message });
        }
    }

    [HttpGet("my-bookings")]
    public async Task<IActionResult> GetMyBookings()
    {
        var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userIdStr)) return Unauthorized();
        var userId = Guid.Parse(userIdStr);

        var bookings = await _context.Bookings
            .Where(b => b.CustomerId == userId)
            .OrderByDescending(b => b.BookingDate)
            .ToListAsync();

        return Ok(bookings);
    }

    [Authorize(Roles = "Owner,Manager")]
    [HttpGet("owner")]
    public async Task<IActionResult> GetForOwner([FromQuery] Guid? branchId)
    {
        var resId = Guid.Parse(User.FindFirstValue("RestaurantId")!);
        var query = _context.Bookings
            .Include(b => b.Table)
                .ThenInclude(t => t!.Zone)
            .Include(b => b.Branch)
            .Where(b => b.RestaurantId == resId);

        if (branchId.HasValue) query = query.Where(b => b.BranchId == branchId);

        var bookings = await query.OrderByDescending(b => b.BookingDate)
            .Select(b => new {
                b.Id,
                b.BranchId,
                BranchName = b.Branch.Name,
                b.TableId,
                TableNumber = b.Table != null ? b.Table.TableNumber : null,
                ZoneName = (b.Table != null && b.Table.Zone != null) ? b.Table.Zone.Name : null,
                b.CustomerId,
                CustomerName = b.CustomerName,
                CustomerPhone = b.CustomerPhone,
                CustomerAvatar = b.Customer != null ? b.Customer.AvatarUrl : null,
                b.BookingDate,
                b.NumberOfGuests,
                b.Status,
                b.Notes,
                b.CreatedAtUtc
            })
            .ToListAsync();
        return Ok(bookings);
    }

    [Authorize(Roles = "Owner,Manager")]
    [HttpPost("{id}/confirm")]
    public async Task<IActionResult> Confirm(Guid id)
    {
        var booking = await _context.Bookings.FindAsync(id);
        if (booking == null) return NotFound();

        booking.Status = "Confirmed";
        await _context.SaveChangesAsync();

        var payload = new {
            bookingId = booking.Id,
            status = "Confirmed",
            branchId = booking.BranchId,
            branchName = (await _context.Branches.FindAsync(booking.BranchId))?.Name ?? "Chi nhánh"
        };

        await _hubContext.Clients.Group(booking.BranchId.ToString()).SendAsync("BookingStatusUpdated", payload);
        await _hubContext.Clients.Group($"restaurant:{booking.RestaurantId}").SendAsync("BookingStatusUpdated", payload);

        return Ok();
    }

    [Authorize(Roles = "Owner,Manager")]
    [HttpPost("{id}/reject")]
    public async Task<IActionResult> Reject(Guid id)
    {
        var booking = await _context.Bookings.FindAsync(id);
        if (booking == null) return NotFound();

        booking.Status = "Rejected";
        await _context.SaveChangesAsync();

        var payload = new {
            bookingId = booking.Id,
            status = "Rejected",
            branchId = booking.BranchId,
            branchName = (await _context.Branches.FindAsync(booking.BranchId))?.Name ?? "Chi nhánh"
        };

        await _hubContext.Clients.Group(booking.BranchId.ToString()).SendAsync("BookingStatusUpdated", payload);
        await _hubContext.Clients.Group($"restaurant:{booking.RestaurantId}").SendAsync("BookingStatusUpdated", payload);

        return Ok();
    }
}
