# Chi tiết Cơ sở dữ liệu (33 Bảng)

Hệ thống sử dụng **PostgreSQL** với toàn bộ 33 bảng đã được định nghĩa qua EF Core Migration.

## 1. Nhóm Core & Phân quyền
1. `Restaurants`: Thông tin tổng của thương hiệu.
2. `Branches`: Danh sách các chi nhánh thuộc nhà hàng.
3. `BranchSettings`: Cấu hình riêng (Giờ mở cửa, tiền tệ, phí dịch vụ) cho từng chi nhánh.
4. `Users`: Thông tin nhân viên và quản lý.
5. `Roles`: Danh sách các quyền (Owner, Manager, Cashier, Waiter).
6. `UserRoles`: Bảng trung gian liên kết User và Role.

## 2. Nhóm Menu & Bàn
7. `Categories`: Danh mục món ăn (Khai vị, Món chính, Đồ uống...).
8. `Products`: Danh sách các món ăn cơ bản.
9. `ProductVariants`: Các biến thể của món (Ví dụ: Size M, Size L).
10. `DiningTables`: Quản lý bàn ăn và trạng thái (Available, Occupied...).

## 3. Nhóm Đặt món & Thanh toán
11. `CustomerSessions`: Quản lý một lượt khách ngồi tại bàn.
12. `OrderRequests`: Yêu cầu gọi món từ khách/nhân viên (chưa vào hóa đơn chính).
13. `OrderRequestItems`: Chi tiết món trong yêu cầu gọi món.
14. `Orders`: Hóa đơn chính của bàn.
15. `OrderItems`: Chi tiết món trong hóa đơn chính.
16. `Payments`: Thông tin tổng quát về việc thanh toán cho Order.
17. `PaymentAccounts`: Tài khoản ngân hàng nhận tiền của chi nhánh.
18. `PaymentTransactions`: Chi tiết các giao dịch (Tiền mặt, Chuyển khoản...).
19. `Refunds`: Thông tin các đơn hàng bị hoàn tiền.

## 4. Nhóm Kho & Nhà cung cấp (Inventory)
20. `Ingredients`: Danh sách nguyên liệu (Thịt, cá, rau, củ...).
21. `ProductIngredients`: Bảng định lượng (1 món ăn tốn bao nhiêu nguyên liệu).
22. `InventoryItems`: Quản lý số lượng tồn kho hiện tại của từng nguyên liệu.
23. `InventoryTransactions`: Lịch sử biến động kho (Nhập, xuất, hủy).
24. `Suppliers`: Thông tin nhà cung cấp nguyên liệu.
25. `PurchaseOrders`: Đơn đặt hàng nguyên liệu từ nhà cung cấp.
26. `PurchaseOrderItems`: Chi tiết các món hàng trong đơn nhập kho.

## 5. Nhóm CRM & Khuyến mãi
27. `Customers`: Thông tin khách hàng thân thiết.
28. `CustomerPointHistory`: Lịch sử tích điểm và đổi điểm của khách.
29. `Vouchers`: Danh sách mã giảm giá.
30. `VoucherUsages`: Lịch sử sử dụng voucher.

## 6. Nhóm Hệ thống & Tài chính
31. `Expenses`: Các chi phí phát sinh ngoài (Tiền điện, nước, sửa chữa...).
32. `UserShifts`: Quản lý ca làm việc của nhân viên (Check-in/Check-out).
33. `AuditLogs`: Nhật ký ghi lại các thay đổi quan trọng trên hệ thống.
