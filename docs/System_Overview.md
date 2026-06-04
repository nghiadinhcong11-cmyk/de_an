# Tổng quan Hệ thống Restaurant POS

Hệ thống được thiết kế theo kiến trúc **Modular Monolith**, giúp phân tách rõ ràng các nghiệp vụ nhưng vẫn đảm bảo sự đơn giản trong triển khai.

## 1. Cấu trúc Project
- **Infrastructure**: Chứa cấu hình dùng chung, BaseEntity và AppDbContext.
- **Modules**: Chứa các Entity phân theo từng module nghiệp vụ.
- **backend**: Thư mục gốc của Backend (.NET Core + PostgreSQL), chứa logic API, Services và cấu hình Deployment.
- **restaurant_pos_web**: Thư mục Frontend Web (React + Vite), dành cho Khách hàng và Chủ quán (Dashboard).
- **mobile_app**: Thư mục Ứng dụng Di động (Flutter), dành riêng cho Nhân viên (POS, Duyệt đơn, Thanh toán).

## 2. Các Module và API đã hoàn thành

### Module Mobile cho Nhân viên (Mới) ✅
- **Công nghệ**: Flutter + Provider + SignalR.
- **Tính năng**: Sơ đồ bàn theo tầng/khu vực, POS đặt món trực tiếp, tiếp nhận yêu cầu QR real-time, thanh toán đa phương thức (Cash/VietQR).
- **UX**: Hero animations, hiệu ứng chuyển trang mượt mà, thông báo đẩy tức thì.

### Module Authentication & Authorization ✅
- **Logic**: JWT Token, mã hóa BCrypt. Hỗ trợ Profile (Cập nhật Avatar/Họ tên).
- **Roles**: Owner, Manager, Waiter, Cashier, Customer.

### Module Core ✅
- **Branches**: Quản lý đa chi nhánh, hỗ trợ chỉnh sửa thông tin liên hệ.
- **Users**: Quản lý đội ngũ, điều chuyển nhân sự giữa các chi nhánh, phân quyền Role động.
- **Tables**: Sơ đồ bàn phân cấp theo **Chi nhánh > Khu vực (Zone/Tầng) > Bàn**.

### Module Menu & Ordering ✅
- **Ordering Flow**: Khách quét QR -> Đặt món (Guest/Member) -> Yêu cầu (Pending) -> Nhân viên duyệt -> Đơn chính thức (Confirmed).
- **Cộng dồn**: Cho phép thêm món vào đơn đang hoạt động ngay trên App/Web.

### Module Payment & Analytics ✅
- **Payment**: Tích hợp VietQR động cá nhân hóa theo từng chi nhánh. Hỗ trợ áp dụng Voucher và tích điểm CRM ngay khi thanh toán.
- **Reports**: Báo cáo doanh thu thời gian thực, thống kê nhanh theo ca (Shift Summary) cho nhân viên.
