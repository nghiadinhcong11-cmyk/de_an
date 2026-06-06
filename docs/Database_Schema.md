# Chi tiết Cơ sở dữ liệu (32 Bảng)

Hệ thống sử dụng **PostgreSQL** với cấu trúc được tối ưu hóa cho mô hình Quản lý chi phí và Phục vụ đa chi nhánh.

## Trạng thái hiện tại: 
- **Migration mới nhất**: `TransitionToIngredientCostManagement`
- **Mô hình Quản lý**: Chuyển từ Quản lý tồn kho tự động sang **Quản lý Chi phí Nguyên liệu & Lịch sử mua hàng**.

## 1. Nhóm Core & Phân quyền
1. `Restaurants`: Thông tin tổng của thương hiệu.
2. `Branches`: Danh sách các chi nhánh thuộc nhà hàng.
3. `BranchSettings`: Cấu hình riêng cho từng chi nhánh.
4. `Users`: Thông tin nhân viên và quản lý.
5. `Roles`: Danh sách các quyền (Owner, Manager, Cashier, Waiter).
6. `UserRoles`: Bảng trung gian liên kết User và Role.

## 2. Nhóm Menu & Bàn
7. `Categories`: Danh mục món ăn.
8. `Products`: Danh sách các món ăn.
9. `ProductVariants`: Các biến thể của món (Size, Topping).
10. `DiningTables`: Quản lý bàn ăn.
11. `Zones`: Khu vực/Tầng (Liên kết với DiningTables).

## 3. Nhóm Đặt món & Thanh toán
12. `CustomerSessions`: Quản lý lượt khách tại bàn.
13. `OrderRequests`: Yêu cầu gọi món từ khách (Chờ duyệt).
14. `OrderRequestItems`: Chi tiết món trong yêu cầu.
15. `Orders`: Hóa đơn chính thức.
16. `OrderItems`: Chi tiết món trong hóa đơn.
17. `Payments`: Thông tin thanh toán tổng quát.
18. `PaymentAccounts`: Tài khoản ngân hàng nhận tiền (VietQR).
19. `PaymentTransactions`: Lịch sử giao dịch chi tiết.
20. `Refunds`: Xử lý hoàn tiền.

## 4. Nhóm Quản lý Chi phí Nguyên liệu (Ingredient Cost Management)
21. `Ingredients`: Danh mục nguyên liệu nhập (Thịt, cá, rau...).
22. `Suppliers`: Nhà cung cấp nguyên vật liệu.
23. `PurchaseRecords`: Phiếu ghi nhận mua hàng/chi phí nguyên liệu.
24. `PurchaseItems`: Chi tiết các món hàng trong một lần nhập.

## 5. Nhóm CRM & Khuyến mãi
25. `Customers`: Thông tin khách hàng thân thiết.
26. `CustomerPointHistory`: Lịch sử tích/dùng điểm.
27. `Vouchers`: Mã giảm giá (Phần trăm hoặc Tiền mặt).
28. `VoucherUsages`: Lịch sử sử dụng voucher của khách.
29. `Feedbacks`: Hộp thư góp ý từ khách hàng.

## 6. Nhóm Hệ thống & Tài chính
30. `Expenses`: Chi phí vận hành (Điện, nước, mặt bằng...).
31. `UserShifts`: Quản lý ca làm việc (Check-in/Check-out).
32. `AuditLogs`: Nhật ký hệ thống.
