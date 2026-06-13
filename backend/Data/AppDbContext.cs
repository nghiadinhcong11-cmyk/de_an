public class AppDbContext : DbContext
{
    // Core
    public DbSet<Restaurant> Restaurants { get; set; }
    public DbSet<Branch> Branches { get; set; }
    public DbSet<BranchSetting> BranchSettings { get; set; }
    public DbSet<User> Users { get; set; }
    public DbSet<Role> Roles { get; set; }
    public DbSet<UserRole> UserRoles { get; set; }

    // Menu
    public DbSet<Category> Categories { get; set; }
    public DbSet<Product> Products { get; set; }
    public DbSet<ProductVariant> ProductVariants { get; set; }

    // Tables
    public DbSet<DiningTable> Tables { get; set; }

    // Ordering
    public DbSet<OrderRequest> OrderRequests { get; set; }
    public DbSet<OrderRequestItem> OrderRequestItems { get; set; }
    public DbSet<Order> Orders { get; set; }
    public DbSet<OrderItem> OrderItems { get; set; }

    // Payment
    public DbSet<PaymentAccount> PaymentAccounts { get; set; }
    public DbSet<Payment> Payments { get; set; }
    public DbSet<PaymentTransaction> PaymentTransactions { get; set; }
    public DbSet<Refund> Refunds { get; set; }

    // CRM
    public DbSet<Customer> Customers { get; set; }
    public DbSet<CustomerPointHistory> CustomerPointHistories { get; set; }
    public DbSet<Voucher> Vouchers { get; set; }
    public DbSet<VoucherUsage> VoucherUsages { get; set; }

    // Inventory
    public DbSet<Ingredient> Ingredients { get; set; }
    public DbSet<ProductIngredient> ProductIngredients { get; set; }
    public DbSet<InventoryItem> InventoryItems { get; set; }
    public DbSet<InventoryTransaction> InventoryTransactions { get; set; }
    public DbSet<Supplier> Suppliers { get; set; }
    public DbSet<PurchaseOrder> PurchaseOrders { get; set; }
    public DbSet<PurchaseOrderItem> PurchaseOrderItems { get; set; }

    // Finance
    public DbSet<Expense> Expenses { get; set; }

    // System
    public DbSet<UserShift> UserShifts { get; set; }
    public DbSet<AuditLog> AuditLogs { get; set; }
}