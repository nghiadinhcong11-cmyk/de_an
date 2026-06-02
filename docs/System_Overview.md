# Tổng quan Hệ thống Restaurant POS

Hệ thống được thiết kế theo kiến trúc **Modular Monolith**, giúp phân tách rõ ràng các nghiệp vụ nhưng vẫn đảm bảo sự đơn giản trong triển khai.

## 1. Cấu trúc Project
- **Infrastructure**: Chứa cấu hình dùng chung, BaseEntity và AppDbContext.
- **Modules**: Chứa các Entity phân theo từng module nghiệp vụ.
- **backend**: Thư mục gốc của Backend, chứa logic API, Services và cấu hình Deployment (Dockerfile).
- **restaurant_pos_web**: Thư mục Frontend (React + TypeScript + Tailwind CSS).

## 2. Các Module và API đã hoàn thành

### Module Authentication (Xác thực) ✅
- **Logic**: Sử dụng JWT Token, mã hóa mật khẩu bằng BCrypt.
- **APIs**: Login, Register Owner (Tạo nhà hàng + Tài khoản chủ).

### Module Core (Cốt lõi) ✅
- **Logic**: Quản lý thông tin nhà hàng, chi nhánh, nhân viên.
- **APIs**: 
    - `Restaurants`: Xem và cập nhật thông tin nhà hàng.
    - `Branches`: Quản lý danh sách chi nhánh.
    - `Users`: Quản lý danh sách nhân viên và phân quyền (Role).

### Module Menu (Thực đơn) ✅
- **Logic**: Quản lý danh mục và món ăn.
- **APIs**: 
    - `Categories`: CRUD danh mục món ăn.
    - `Products`: CRUD món ăn, lọc theo danh mục.

### Module QR Ordering (Đặt món tại bàn) ✅
- **Logic**: Khách hàng quét mã QR để xem menu và gửi yêu cầu gọi món không cần đăng nhập.
- **APIs**: 
    - `Get Menu`: Lấy thực đơn dựa trên ID bàn.
    - `Submit Request`: Gửi yêu cầu gọi món vào hệ thống chờ nhân viên duyệt.

### Các Module Entity khác (Đã có Schema) 
- **Payment, CRM, Inventory, Finance, System**: Toàn bộ Entity đã được định nghĩa và đồng bộ hóa với Database.
