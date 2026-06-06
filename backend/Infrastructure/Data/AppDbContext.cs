using Microsoft.EntityFrameworkCore;
using RestaurantPOS.Modules.Core.Entities;
using RestaurantPOS.Modules.Menu.Entities;
using RestaurantPOS.Modules.Ordering.Entities;
using RestaurantPOS.Modules.TableManagement.Entities;
using RestaurantPOS.Modules.Payment.Entities;
using RestaurantPOS.Modules.CRM.Entities;
using RestaurantPOS.Modules.Inventory.Entities;
using RestaurantPOS.Modules.Finance.Entities;
using RestaurantPOS.Modules.System.Entities;

namespace RestaurantPOS.Infrastructure.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<Restaurant> Restaurants { get; set; }
    public DbSet<Branch> Branches { get; set; }
    public DbSet<BranchSetting> BranchSettings { get; set; }
    public DbSet<User> Users { get; set; }
    public DbSet<Role> Roles { get; set; }
    public DbSet<UserRole> UserRoles { get; set; }
    public DbSet<Category> Categories { get; set; }
    public DbSet<Product> Products { get; set; }
    public DbSet<ProductVariant> ProductVariants { get; set; }
    public DbSet<DiningTable> DiningTables { get; set; }
    public DbSet<Zone> Zones { get; set; }
    public DbSet<CustomerSession> CustomerSessions { get; set; }
    public DbSet<Order> Orders { get; set; }
    public DbSet<OrderItem> OrderItems { get; set; }
    public DbSet<OrderRequest> OrderRequests { get; set; }
    public DbSet<OrderRequestItem> OrderRequestItems { get; set; }
    public DbSet<PaymentAccount> PaymentAccounts { get; set; }
    public DbSet<Payment> Payments { get; set; }
    public DbSet<PaymentTransaction> PaymentTransactions { get; set; }
    public DbSet<Refund> Refunds { get; set; }
    public DbSet<Customer> Customers { get; set; }
    public DbSet<CustomerPointHistory> CustomerPointHistories { get; set; }
    public DbSet<Voucher> Vouchers { get; set; }
    public DbSet<VoucherUsage> VoucherUsages { get; set; }
    public DbSet<Feedback> Feedbacks { get; set; }
    public DbSet<Ingredient> Ingredients { get; set; }
    public DbSet<ProductIngredient> ProductIngredients { get; set; }
    public DbSet<InventoryItem> InventoryItems { get; set; }
    public DbSet<InventoryTransaction> InventoryTransactions { get; set; }
    public DbSet<Supplier> Suppliers { get; set; }
    public DbSet<PurchaseOrder> PurchaseOrders { get; set; }
    public DbSet<PurchaseOrderItem> PurchaseOrderItems { get; set; }
    public DbSet<Expense> Expenses { get; set; }
    public DbSet<UserShift> UserShifts { get; set; }
    public DbSet<AuditLog> AuditLogs { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // 1. CORE & AUTH
        modelBuilder.Entity<Restaurant>(r => {
            r.HasIndex(x => x.Name).IsUnique();
        });

        modelBuilder.Entity<Branch>(b => {
            b.HasIndex(x => new { x.Name, x.RestaurantId }).IsUnique();
            b.HasOne(x => x.Restaurant).WithMany(x => x.Branches).HasForeignKey(x => x.RestaurantId);
            b.HasOne(x => x.ManagerUser).WithMany().HasForeignKey(x => x.ManagerUserId).OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<User>(u => {
            u.HasIndex(x => x.Username).IsUnique();
        });

        modelBuilder.Entity<UserRole>(ur => {
            ur.HasKey(x => new { x.UserId, x.RoleId });
            ur.HasOne(x => x.User).WithMany().HasForeignKey(x => x.UserId);
            ur.HasOne(x => x.Role).WithMany().HasForeignKey(x => x.RoleId);
        });

        // 2. MENU
        modelBuilder.Entity<Category>(c => {
            c.HasIndex(x => new { x.Name, x.RestaurantId }).IsUnique();
            c.HasOne(x => x.Restaurant).WithMany().HasForeignKey(x => x.RestaurantId);
        });

        modelBuilder.Entity<Product>(p => {
            p.HasIndex(x => new { x.Name, x.RestaurantId }).IsUnique();
            p.HasOne(x => x.Restaurant).WithMany().HasForeignKey(x => x.RestaurantId).OnDelete(DeleteBehavior.Restrict);
            p.HasOne(x => x.Category).WithMany().HasForeignKey(x => x.CategoryId);
        });

        modelBuilder.Entity<ProductVariant>(pv => {
            pv.HasOne(x => x.Product).WithMany(x => x.Variants).HasForeignKey(x => x.ProductId);
        });

        // 3. TABLES & ORDERING
        modelBuilder.Entity<Zone>(z => {
            z.HasIndex(x => new { x.Name, x.BranchId }).IsUnique();
            z.HasOne<Branch>().WithMany().HasForeignKey(x => x.BranchId);
        });

        modelBuilder.Entity<DiningTable>(dt => {
            dt.HasIndex(x => new { x.TableNumber, x.BranchId }).IsUnique();
            dt.HasOne<Branch>().WithMany(x => x.DiningTables).HasForeignKey(x => x.BranchId);
            dt.HasOne(x => x.Zone).WithMany(x => x.Tables).HasForeignKey(x => x.ZoneId).OnDelete(DeleteBehavior.SetNull);
        });

        modelBuilder.Entity<Order>(o => {
            o.HasOne(x => x.Restaurant).WithMany().HasForeignKey(x => x.RestaurantId).OnDelete(DeleteBehavior.Restrict);
            o.HasOne(x => x.Branch).WithMany(x => x.Orders).HasForeignKey(x => x.BranchId);
            o.HasOne(x => x.Table).WithMany().HasForeignKey(x => x.TableId);
            o.HasOne(x => x.Customer).WithMany(x => x.Orders).HasForeignKey(x => x.CustomerId).OnDelete(DeleteBehavior.SetNull);
            o.HasOne(x => x.CreatedByUser).WithMany().HasForeignKey(x => x.CreatedByUserId).OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<OrderItem>(oi => {
            oi.HasOne(x => x.Order).WithMany(x => x.OrderItems).HasForeignKey(x => x.OrderId);
            oi.HasOne(x => x.Product).WithMany().HasForeignKey(x => x.ProductId);
        });

        modelBuilder.Entity<OrderRequest>(or => {
            or.HasOne<Branch>().WithMany().HasForeignKey(x => x.BranchId);
            or.HasOne<DiningTable>().WithMany().HasForeignKey(x => x.TableId);
        });

        modelBuilder.Entity<OrderRequestItem>(ori => {
            ori.HasOne(x => x.OrderRequest).WithMany(x => x.OrderRequestItems).HasForeignKey(x => x.OrderRequestId);
            ori.HasOne(x => x.Product).WithMany().HasForeignKey(x => x.ProductId);
        });

        // 4. PAYMENT
        modelBuilder.Entity<Payment>(p => {
            p.HasOne(x => x.Order).WithMany().HasForeignKey(x => x.OrderId);
        });

        modelBuilder.Entity<PaymentTransaction>(pt => {
            pt.HasOne(x => x.Payment).WithMany(x => x.Transactions).HasForeignKey(x => x.PaymentId);
        });

        modelBuilder.Entity<Refund>(r => {
            r.HasOne(x => x.Payment).WithMany(x => x.Refunds).HasForeignKey(x => x.PaymentId);
            r.HasOne(x => x.CreatedByUser).WithMany().HasForeignKey(x => x.CreatedByUserId).OnDelete(DeleteBehavior.Restrict);
        });

        // 5. CRM
        modelBuilder.Entity<Customer>(c => {
            c.HasOne(x => x.Restaurant).WithMany().HasForeignKey(x => x.RestaurantId);
        });

        modelBuilder.Entity<CustomerPointHistory>(cph => {
            cph.HasOne<Customer>().WithMany(x => x.PointHistories).HasForeignKey(x => x.CustomerId);
        });

        modelBuilder.Entity<Voucher>(v => {
            v.HasIndex(x => new { x.Code, x.RestaurantId }).IsUnique();
            v.HasOne<Restaurant>().WithMany().HasForeignKey(x => x.RestaurantId);
            v.HasOne(x => x.Branch).WithMany().HasForeignKey(x => x.BranchId);
        });

        modelBuilder.Entity<VoucherUsage>(vu => {
            vu.HasOne<Voucher>().WithMany(x => x.Usages).HasForeignKey(x => x.VoucherId);
            vu.HasOne<Customer>().WithMany(x => x.VoucherUsages).HasForeignKey(x => x.CustomerId);
        });

        modelBuilder.Entity<Feedback>(f => {
            f.HasOne<Restaurant>().WithMany().HasForeignKey(x => x.RestaurantId);
        });

        // 6. INVENTORY
        modelBuilder.Entity<Ingredient>(i => {
            i.HasOne<Branch>().WithMany().HasForeignKey(x => x.BranchId);
        });

        modelBuilder.Entity<ProductIngredient>(pi => {
            pi.HasKey(x => new { x.ProductId, x.IngredientId });
            pi.HasOne(x => x.Product).WithMany().HasForeignKey(x => x.ProductId);
            pi.HasOne(x => x.Ingredient).WithMany().HasForeignKey(x => x.IngredientId);
        });

        modelBuilder.Entity<InventoryItem>(ii => {
            ii.HasOne(x => x.Ingredient).WithMany().HasForeignKey(x => x.IngredientId);
        });

        modelBuilder.Entity<InventoryTransaction>(it => {
            it.HasOne(x => x.Ingredient).WithMany().HasForeignKey(x => x.IngredientId);
        });

        modelBuilder.Entity<Supplier>(s => {
            s.HasOne(x => x.Restaurant).WithMany().HasForeignKey(x => x.RestaurantId);
        });

        modelBuilder.Entity<PurchaseOrder>(po => {
            po.HasOne(x => x.Supplier).WithMany().HasForeignKey(x => x.SupplierId);
            po.HasOne(x => x.CreatedByUser).WithMany().HasForeignKey(x => x.CreatedByUserId).OnDelete(DeleteBehavior.Restrict);
            po.HasOne(x => x.Branch).WithMany().HasForeignKey(x => x.BranchId);
        });

        modelBuilder.Entity<PurchaseOrderItem>(poi => {
            poi.HasOne(x => x.PurchaseOrder).WithMany().HasForeignKey(x => x.PurchaseOrderId);
            poi.HasOne(x => x.Ingredient).WithMany().HasForeignKey(x => x.IngredientId);
        });

        // 7. FINANCE & SYSTEM
        modelBuilder.Entity<Expense>(e => {
            e.HasOne<Branch>().WithMany().HasForeignKey(x => x.BranchId);
            e.HasOne<User>().WithMany().HasForeignKey(x => x.CreatedByUserId).OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<UserShift>(us => {
            us.HasOne<User>().WithMany().HasForeignKey(x => x.UserId);
            us.HasOne<Branch>().WithMany().HasForeignKey(x => x.BranchId);
        });

        // SEED DATA
        var seedDate = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc);
        modelBuilder.Entity<Role>().HasData(
            new Role { Id = Guid.Parse("00000000-0000-0000-0000-000000000001"), Name = "Owner", Description = "Chủ nhà hàng", CreatedAtUtc = seedDate },
            new Role { Id = Guid.Parse("00000000-0000-0000-0000-000000000002"), Name = "Manager", Description = "Quản lý chi nhánh", CreatedAtUtc = seedDate },
            new Role { Id = Guid.Parse("00000000-0000-0000-0000-000000000003"), Name = "Cashier", Description = "Thu ngân", CreatedAtUtc = seedDate },
            new Role { Id = Guid.Parse("00000000-0000-0000-0000-000000000004"), Name = "Waiter", Description = "Nhân viên phục vụ", CreatedAtUtc = seedDate }
        );
    }
}