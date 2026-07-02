using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RestaurantPOS.Infrastructure.Data;
using RestaurantPOS.Modules.Core.Entities;
using RestaurantPOS.DTOs;

namespace RestaurantPOS.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class BranchesController : ControllerBase
{
    private readonly AppDbContext _context;
    public BranchesController(AppDbContext context) => _context = context;

    [AllowAnonymous]
    [HttpGet("public")]
    public async Task<IActionResult> GetPublicBranches([FromQuery] Guid? restaurantId)
    {
        try
        {
            var query = _context.Branches.Where(b => b.IsActive);

            if (restaurantId.HasValue && restaurantId.Value != Guid.Empty)
            {
                query = query.Where(b => b.RestaurantId == restaurantId.Value);
            }

            var branches = await query.ToListAsync();

            if (branches.Count == 0 && (!restaurantId.HasValue || restaurantId == Guid.Empty))
            {
                branches = await _context.Branches
                    .Where(b => b.IsActive)
                    .Take(10)
                    .ToListAsync();
            }

            // Tính toán rating trung bình cho từng chi nhánh dựa trên Feedbacks
            var branchIds = branches.Select(b => b.Id).ToList();

            var feedbackStats = await _context.Feedbacks
                .Where(f => f.BranchId != null && branchIds.Contains(f.BranchId.Value))
                .Select(f => new { f.BranchId, f.ServiceRating, f.FoodRating, f.PriceRating, f.AtmosphereRating })
                .ToListAsync();

            var ratings = feedbackStats
                .GroupBy(f => f.BranchId!.Value)
                .ToDictionary(
                    g => g.Key,
                    g => new {
                        AverageRating = g.Average(f => (f.ServiceRating + f.FoodRating + f.PriceRating + f.AtmosphereRating) / 4.0),
                        ReviewCount = g.Count()
                    }
                );

            var result = branches.Select(b => new {
                b.Id,
                b.RestaurantId,
                b.Name,
                b.Address,
                b.Phone,
                b.IsActive,
                AverageRating = ratings.ContainsKey(b.Id) ? Math.Round(ratings[b.Id].AverageRating, 1) : 5.0,
                ReviewCount = ratings.ContainsKey(b.Id) ? ratings[b.Id].ReviewCount : 0
            }).ToList();

            return Ok(result);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new {
                message = "Lỗi khi tải danh sách chi nhánh",
                details = ex.Message,
                inner = ex.InnerException?.Message
            });
        }
    }

    [Authorize]
    [HttpGet]
    public async Task<IActionResult> GetBranches()
    {
        var resIdStr = User.FindFirstValue("RestaurantId");
        if (string.IsNullOrEmpty(resIdStr)) return Unauthorized();
        var restaurantId = Guid.Parse(resIdStr);

        var branches = await _context.Branches
            .Where(b => b.RestaurantId == restaurantId)
            .Select(b => new BranchDto
            {
                Id = b.Id,
                RestaurantId = b.RestaurantId,
                Name = b.Name,
                Address = b.Address,
                Phone = b.Phone,
                IsActive = b.IsActive
            })
            .ToListAsync();

        return Ok(branches);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] BranchCreateDto dto)
    {
        var resIdStr = User.FindFirstValue("RestaurantId");
        if (string.IsNullOrEmpty(resIdStr)) return Unauthorized();

        var branch = new Branch
        {
            RestaurantId = Guid.Parse(resIdStr),
            Name = dto.Name,
            Address = dto.Address,
            Phone = dto.Phone,
            IsActive = true
        };

        _context.Branches.Add(branch);
        await _context.SaveChangesAsync();

        return Ok(new BranchDto
        {
            Id = branch.Id,
            RestaurantId = branch.RestaurantId,
            Name = branch.Name,
            Address = branch.Address,
            Phone = branch.Phone,
            IsActive = branch.IsActive
        });
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] BranchCreateDto dto)
    {
        var branch = await _context.Branches.FindAsync(id);
        if (branch == null) return NotFound();

        branch.Name = dto.Name;
        branch.Address = dto.Address;
        branch.Phone = dto.Phone;

        await _context.SaveChangesAsync();
        return Ok(branch);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var branch = await _context.Branches.FindAsync(id);
        if (branch == null) return NotFound();
        _context.Branches.Remove(branch);
        await _context.SaveChangesAsync();
        return Ok();
    }
}
