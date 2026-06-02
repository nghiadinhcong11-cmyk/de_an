using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using RestaurantPOS.DTOs;
using RestaurantPOS.Infrastructure.Data;
using RestaurantPOS.Modules.Core.Entities;

namespace RestaurantPOS.Services;

public interface IAuthService
{
    Task<LoginResponse?> LoginAsync(LoginRequest request);
    Task<bool> RegisterOwnerAsync(RegisterOwnerRequest request);
}

public class AuthService : IAuthService
{
    private readonly AppDbContext _context;
    private readonly IConfiguration _configuration;

    public AuthService(AppDbContext context, IConfiguration configuration)
    {
        _context = context;
        _configuration = configuration;
    }

    public async Task<LoginResponse?> LoginAsync(LoginRequest request)
    {
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Username == request.Username);

        if (user == null || !BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
            return null;

        var token = GenerateJwtToken(user);

        return new LoginResponse
        {
            Token = token,
            Username = user.Username,
            FullName = user.FullName,
            Role = "Owner" // Tạm thời để Owner, sau này sẽ lấy từ bảng Roles
        };
    }

    public async Task<bool> RegisterOwnerAsync(RegisterOwnerRequest request)
    {
        if (await _context.Users.AnyAsync(u => u.Username == request.Username))
            return false;

        using var transaction = await _context.Database.BeginTransactionAsync();
        try
        {
            // 1. Tạo Nhà hàng
            var restaurant = new Restaurant { Name = request.RestaurantName };
            _context.Restaurants.Add(restaurant);
            await _context.SaveChangesAsync();

            // 2. Tạo User Owner
            var user = new User
            {
                RestaurantId = restaurant.Id,
                Username = request.Username,
                FullName = request.FullName,
                Email = request.Email,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
                IsActive = true
            };
            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            // 3. Gán quyền Owner cho User này
            var ownerRole = await _context.Roles.FirstOrDefaultAsync(r => r.Name == "Owner");
            if (ownerRole != null)
            {
                _context.UserRoles.Add(new UserRole { UserId = user.Id, RoleId = ownerRole.Id });
                await _context.SaveChangesAsync();
            }

            await transaction.CommitAsync();
            return true;
        }
        catch
        {
            await transaction.RollbackAsync();
            return false;
        }
    }

    private string GenerateJwtToken(User user)
    {
        var jwtSettings = _configuration.GetSection("Jwt");
        var key = Encoding.ASCII.GetBytes(jwtSettings["Key"]!);

        var tokenDescriptor = new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity(new[]
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(ClaimTypes.Name, user.Username),
                new Claim("RestaurantId", user.RestaurantId.ToString())
            }),
            Expires = DateTime.UtcNow.AddMinutes(double.Parse(jwtSettings["DurationInMinutes"]!)),
            SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature),
            Issuer = jwtSettings["Issuer"],
            Audience = jwtSettings["Audience"]
        };

        var tokenHandler = new JwtSecurityTokenHandler();
        var token = tokenHandler.CreateToken(tokenDescriptor);
        return tokenHandler.WriteToken(token);
    }
}