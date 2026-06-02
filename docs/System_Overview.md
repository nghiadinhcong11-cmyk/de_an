# Tổng quan Hệ thống Restaurant POS

Hệ thống được thiết kế theo kiến trúc **Modular Monolith**, giúp phân tách rõ ràng các nghiệp vụ nhưng vẫn đảm bảo sự đơn giản trong triển khai.

## 1. Cấu trúc Project
- **Infrastructure**: Chứa cấu hình dùng chung, BaseEntity và AppDbContext.
- **Modules**: Chứa các Entity phân theo từng module nghiệp vụ.
- **RestaurantPOS.API**: (Đã dồn vào thư mục gốc `backend`) Chứa Program.cs, appsettings.json và các Controller.

## 2. Các Module đã hoàn thành (Entity Level)

### Module Core (Cốt lõi)
Quản lý thông tin nhà hàng, chi nhánh, người dùng và phân quyền.
- **Entities**: Restaurant, Branch, BranchSetting, User, Role, UserRole.

### Module Menu (Thực đơn)
Quản lý danh mục món ăn, sản phẩm và các biến thể món ăn (Size, Topping).
- **Entities**: Category, Product, ProductVariant.

### Module Table Management (Quản lý bàn)
Quản lý thông tin bàn ăn, số lượng khách và mã QR.
- **Entities**: DiningTable.

### Module Ordering (Đặt món)
Xử lý luồng đặt món từ lúc khách vào (Session) cho đến khi tạo đơn hàng.
- **Entities**: CustomerSession, Order, OrderItem, OrderRequest, OrderRequestItem.

### Module Payment (Thanh toán)
Quản lý phương thức thanh toán, giao dịch ngân hàng và hoàn tiền.
- **Entities**: PaymentAccount, Payment, PaymentTransaction, Refund.

### Module CRM (Quản lý khách hàng)
Lưu trữ thông tin khách hàng, tích điểm và hệ thống Voucher giảm giá.
- **Entities**: Customer, CustomerPointHistory, Voucher, VoucherUsage.

### Module Inventory (Quản lý kho)
Định lượng nguyên liệu cho món ăn (Recipe), nhập kho từ nhà cung cấp và quản lý tồn kho.
- **Entities**: Ingredient, ProductIngredient, InventoryItem, InventoryTransaction, Supplier, PurchaseOrder, PurchaseOrderItem.

### Module Finance & System
Theo dõi chi phí ngoài và vận hành hệ thống.
- **Entities**: Expense, UserShift (Quản lý ca), AuditLog (Nhật ký hệ thống).
