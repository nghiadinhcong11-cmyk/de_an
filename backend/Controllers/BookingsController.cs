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

            // Notify Owner/Manager via SignalR (Branch specific group)
            await _hubContext.Clients.Group(booking.BranchId.ToString()).SendAsync("NewBookingReceived", new {
                bookingId = booking.Id,
                customerName = booking.CustomerName,
                bookingDate = booking.BookingDate,
                numberOfGuests = booking.NumberOfGuests,
                branchId = booking.BranchId
            });

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
        var query = _context.Bookings.Where(b => b.RestaurantId == resId);

        if (branchId.HasValue) query = query.Where(b => b.BranchId == branchId);

        var bookings = await query.OrderByDescending(b => b.BookingDate).ToListAsync();
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

        // Notify Customer & Staff
        await _hubContext.Clients.All.SendAsync("BookingStatusUpdated", new {
            bookingId = booking.Id,
            status = "Confirmed"
        });

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

        await _hubContext.Clients.All.SendAsync("BookingStatusUpdated", new {
            bookingId = booking.Id,
            status = "Rejected"
        });

        return Ok();
    }
}
