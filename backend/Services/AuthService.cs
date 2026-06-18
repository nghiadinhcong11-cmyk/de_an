using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using RestaurantPOS.DTOs;
using RestaurantPOS.Infrastructure.Data;
using RestaurantPOS.Modules.Core.Entities;
using RestaurantPOS.Modules.CRM.Entities;

namespace RestaurantPOS.Services;

public interface IAuthService
{
    Task<LoginResponse?> LoginAsync(LoginRequest request);
    Task<bool> RegisterOwnerAsync(RegisterOwnerRequest request);
    Task<bool> RegisterEmployeeAsync(RegisterEmployeeRequest request);
    Task<bool> RegisterCustomerAsync(RegisterCustomerRequest request);
    Task<bool> ChangePasswordAsync(Guid userId, string oldPassword, string newPassword);
    Task<bool> ResetPasswordAsync(string username, string email, string newPassword);
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

    // Hàm phụ trợ để đảm bảo Role luôn tồn tại
    private async Task<Guid> EnsureRoleExistsAsync(string roleName)
    {
        var role = await _context.Roles.FirstOrDefaultAsync(r => r.Name == roleName);
        if (role == null)
        {
            role = new Role { Name = roleName, Description = $"Tự động tạo cho {roleName}" };
            _context.Roles.Add(role);
            await _context.SaveChangesAsync();
        }
        return role.Id;
    }

    public async Task<bool> RegisterCustomerAsync(RegisterCustomerRequest request)
    {
        if (await _context.Customers.AnyAsync(c => c.PhoneNumber == request.PhoneNumber))
            return false;

        var restaurantId = request.RestaurantId;
        if (restaurantId == Guid.Empty)
        {
            var firstRestaurant = await _context.Restaurants.FirstOrDefaultAsync();
            if (firstRestaurant == null) return false;
            restaurantId = firstRestaurant.Id;
        }

        var customer = new Customer
        {
            RestaurantId = restaurantId,
            FullName = request.FullName,
            PhoneNumber = request.PhoneNumber,
            Email = request.Email,
            Points = 0,
            TotalSpent = 0
        };

        _context.Customers.Add(customer);
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<LoginResponse?> LoginAsync(LoginRequest request)
    {
        var user = await _context.Users
            .FirstOrDefaultAsync(u => u.Username == request.Username && u.IsActive && u.IsApproved);

        if (user != null && BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
        {
            var userRole = await _context.UserRoles
                .Where(ur => ur.UserId == user.Id)
                .Join(_context.Roles, ur => ur.RoleId, r => r.Id, (ur, r) => r.Name)
                .FirstOrDefaultAsync() ?? "Waiter";

            var token = GenerateJwtToken(user.Id, user.Username, userRole, user.RestaurantId, user.BranchId);
            return new LoginResponse
            {
                Id = user.Id,
                Token = token,
                Username = user.Username,
                FullName = user.FullName,
                Role = userRole,
                RestaurantId = user.RestaurantId,
                BranchId = user.BranchId
            };
        }

        var customer = await _context.Customers
            .FirstOrDefaultAsync(c => c.PhoneNumber == request.Username);

        if (customer != null)
        {
             var token = GenerateJwtToken(customer.Id, customer.PhoneNumber, "Customer", customer.RestaurantId, null);
             return new LoginResponse
             {
                 Id = customer.Id,
                 Token = token,
                 Username = customer.PhoneNumber,
                 FullName = customer.FullName,
                 Role = "Customer",
                 RestaurantId = customer.RestaurantId,
                 BranchId = null
             };
        }

        return null;
    }

    public async Task<bool> RegisterOwnerAsync(RegisterOwnerRequest request)
    {
        if (await _context.Users.AnyAsync(u => u.Username == request.Username)) return false;

        using var transaction = await _context.Database.BeginTransactionAsync();
        try
        {
            var restaurant = new Restaurant { Name = request.RestaurantName };
            _context.Restaurants.Add(restaurant);
            await _context.SaveChangesAsync();

            var user = new User
            {
                RestaurantId = restaurant.Id,
                Username = request.Username,
                FullName = request.FullName,
                Email = request.Email,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
                IsActive = true,
                IsApproved = true
            };
            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            // ĐẢM BẢO ROLE OWNER LUÔN CÓ
            var roleId = await EnsureRoleExistsAsync("Owner");
            _context.UserRoles.Add(new UserRole { UserId = user.Id, RoleId = roleId });
            await _context.SaveChangesAsync();

            await transaction.CommitAsync();
            return true;
        }
        catch
        {
            await transaction.RollbackAsync();
            return false;
        }
    }

    public async Task<bool> RegisterEmployeeAsync(RegisterEmployeeRequest request)
    {
        if (await _context.Users.AnyAsync(u => u.Username == request.Username)) return false;

        var user = new User
        {
            RestaurantId = request.RestaurantId,
            BranchId = request.BranchId,
            Username = request.Username,
            FullName = request.FullName,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
            IsActive = false,
            IsApproved = false
        };

        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        // ĐẢM BẢO ROLE NHÂN VIÊN LUÔN CÓ
        var roleId = await EnsureRoleExistsAsync(request.RoleName ?? "Waiter");
        _context.UserRoles.Add(new UserRole { UserId = user.Id, RoleId = roleId });
        await _context.SaveChangesAsync();

        return true;
    }

    public async Task<bool> ChangePasswordAsync(Guid userId, string oldPassword, string newPassword)
    {
        var user = await _context.Users.FindAsync(userId);
        if (user == null || !BCrypt.Net.BCrypt.Verify(oldPassword, user.PasswordHash))
            return false;

        user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(newPassword);
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> ResetPasswordAsync(string username, string email, string newPassword)
    {
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Username == username && u.Email == email);
        if (user == null) return false;

        user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(newPassword);
        await _context.SaveChangesAsync();
        return true;
    }

    private string GenerateJwtToken(Guid userId, string username, string role, Guid restaurantId, Guid? branchId)
    {
        var jwtSettings = _configuration.GetSection("Jwt");
        var key = Encoding.ASCII.GetBytes(jwtSettings["Key"]!);

        var claims = new List<Claim>
        {
            new Claim(ClaimTypes.NameIdentifier, userId.ToString()),
            new Claim(ClaimTypes.Name, username),
            new Claim(ClaimTypes.Role, role),
            new Claim("RestaurantId", restaurantId.ToString())
        };

        if (branchId.HasValue)
        {
            claims.Add(new Claim("BranchId", branchId.Value.ToString()));
        }

        var tokenDescriptor = new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity(claims),
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
