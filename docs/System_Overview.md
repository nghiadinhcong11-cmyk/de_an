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
- **APIs**: Login, Register Owner, Register Employee, Register Customer.
- **Frontend**: Toàn bộ luồng Đăng nhập/Đăng ký cho 3 đối tượng đã kết nối API thật.

### Module Core (Cốt lõi) ✅
- **Logic**: Quản lý thông tin nhà hàng, chi nhánh, nhân viên, phân quyền.
- **APIs**: `Restaurants`, `Branches`, `Users` (Quản lý nhân viên & Duyệt nhân viên), `Tables`.
- **Frontend**: Quản lý chi nhánh, nhân viên (có duyệt đơn xin việc), sơ đồ bàn ăn (có sinh mã QR thật).

### Module Menu & Ordering ✅
- **Logic**: Quản lý thực đơn, luồng đặt món từ khách hàng và duyệt món từ nhân viên.
- **APIs**: `Categories`, `Products`, `OrderRequests` (Duyệt món), `Orders`.
- **Frontend**: 
    - **Chủ quán**: Quản lý thực đơn linh hoạt.
    - **Nhân viên**: Màn hình POS, duyệt yêu cầu gọi món thời gian thực (SignalR).
    - **Khách hàng**: Trang gọi món QR chuyên nghiệp, giỏ hàng, theo dõi đơn hàng.

### Module Inventory & Suppliers ✅
- **Logic**: Quản lý kho nguyên liệu và nhà cung cấp.
- **Frontend**: 
    - `Inventory`: Theo dõi tồn kho, cảnh báo hàng sắp hết, lịch sử biến động.
    - `Suppliers`: Quản lý thông tin nhà cung cấp.
    - `Purchase Orders`: Lập và theo dõi đơn nhập hàng từ nhà cung cấp.

### Module Finance & System ✅
- **Logic**: Quản lý chi phí ngoài và vận hành nhân sự.
- **Frontend**:
    - `Expenses`: Ghi chép chi phí (điện, nước, lương...) theo danh mục.
    - `Employee Shifts`: Theo dõi ca làm việc, thời gian check-in/out của nhân viên.
    - `Payment Accounts`: Quản lý danh sách tài khoản ngân hàng nhận tiền VietQR.

### Module CRM & Reports ✅
- **Logic**: Chăm sóc khách hàng và báo cáo doanh thu.
- **APIs**: `Customers`, `Vouchers`, `Dashboard Stats`.
- **Frontend**: Danh sách khách hàng thân thiết, quản lý mã giảm giá, biểu đồ thống kê doanh thu.
