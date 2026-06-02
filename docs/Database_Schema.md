# Chi tiết Cơ sở dữ liệu (33 Bảng)

Hệ thống sử dụng **PostgreSQL** với toàn bộ 33 bảng đã được định nghĩa qua EF Core Migration.

## Trạng thái hiện tại: 
- **Migration**: `InitialFullSchema` và `SeedRoles` đã được áp dụng thành công.
- **Tình trạng khai thác**: 100% các bảng đã được thiết kế giao diện quản lý (CRUD) tương ứng trên Dashboard.

## 1. Nhóm Core & Phân quyền
1. `Restaurants`: Thông tin tổng của thương hiệu.
2. `Branches`: Danh sách các chi nhánh thuộc nhà hàng.
3. `BranchSettings`: Cấu hình riêng cho từng chi nhánh.
4. `Users`: Thông tin nhân viên và quản lý.
5. `Roles`: Danh sách các quyền (Owner, Manager, Cashier, Waiter).
6. `UserRoles`: Bảng trung gian liên kết User và Role.

## 2. Nhóm Menu & Bàn
7. `Categories`: Danh mục món ăn.
8. `Products`: Danh sách các món ăn cơ bản.
9. `ProductVariants`: Các biến thể của món (Size, Topping).
10. `DiningTables`: Quản lý bàn ăn và trạng thái.

## 3. Nhóm Đặt món & Thanh toán
11. `CustomerSessions`: Quản lý một lượt khách ngồi tại bàn.
12. `OrderRequests`: Yêu cầu gọi món từ khách (Chờ duyệt).
13. `OrderRequestItems`: Chi tiết món trong yêu cầu.
14. `Orders`: Hóa đơn chính thức.
15. `OrderItems`: Chi tiết món trong hóa đơn.
16. `Payments`: Thông tin thanh toán.
17. `PaymentAccounts`: Tài khoản ngân hàng nhận tiền.
18. `PaymentTransactions`: Lịch sử giao dịch chi tiết.
19. `Refunds`: Xử lý hoàn tiền.

## 4. Nhóm Kho & Nhà cung cấp (Inventory)
20. `Ingredients`: Danh mục nguyên vật liệu.
21. `ProductIngredients`: Định lượng món ăn (Recipe).
22. `InventoryItems`: Tồn kho hiện tại.
23. `InventoryTransactions`: Lịch sử biến động kho.
24. `Suppliers`: Nhà cung cấp.
25. `PurchaseOrders`: Đơn mua hàng.
26. `PurchaseOrderItems`: Chi tiết đơn mua.

## 5. Nhóm CRM & Khuyến mãi
27. `Customers`: Thông tin khách hàng.
28. `CustomerPointHistory`: Tích điểm.
29. `Vouchers`: Mã giảm giá.
30. `VoucherUsages`: Lịch sử dùng voucher.

## 6. Nhóm Hệ thống & Tài chính
31. `Expenses`: Chi phí ngoài (điện, nước, mặt bằng...).
32. `UserShifts`: Quản lý ca làm việc (Check-in/Check-out).
33. `AuditLogs`: Nhật ký hệ thống.
