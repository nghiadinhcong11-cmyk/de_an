# Tổng quan Hệ thống Restaurant POS

Hệ thống được thiết kế theo kiến trúc **Modular Monolith**, giúp phân tách rõ ràng các nghiệp vụ nhưng vẫn đảm bảo sự đơn giản trong triển khai.

## 1. Cấu trúc Project
- **Infrastructure**: Chứa cấu hình dùng chung, BaseEntity và AppDbContext.
- **Modules**: Chứa các Entity phân theo từng module nghiệp vụ.
- **backend**: Thư mục gốc của Backend, chứa logic API, Services và cấu hình Deployment (Dockerfile).
- **restaurant_pos_web**: Thư mục Frontend (React + TypeScript + Tailwind CSS).

## 2. Các Module và API đã hoàn thành

### Module Authentication & Authorization (Xác thực & Phân quyền) ✅
- **Logic**: JWT Token bảo mật, mã hóa BCrypt. Tự động khởi tạo Roles (Owner, Manager, Waiter, Cashier).
- **APIs**: Login, Register (Owner/Employee/Customer).
- **Security**: Tích hợp **Protected Routes** ở Frontend, chặn truy cập trái phép dựa trên vai trò người dùng.

### Module Core (Cốt lõi) ✅
- **Logic**: Quản lý đa nhà hàng, chi nhánh, nhân sự.
- **APIs**: `Restaurants`, `Branches` (hỗ trợ Auto-fill thông tin từ trụ sở), `Users` (Duyệt nhân viên mới), `Tables`.
- **Frontend**: Dashboard chủ quán hiện đại, Quản lý chi nhánh, Sơ đồ bàn (sinh mã QR động link trực tiếp tới bàn).

### Module Menu & Ordering ✅
- **Logic**: Quản lý thực đơn, công thức món ăn (Recipe) và luồng đặt món.
- **Recipe Management**: Thiết lập định lượng nguyên liệu cho từng món ăn.
- **Ordering Flow**: Khách quét QR -> Đặt món -> Nhân viên duyệt -> Order chính thức.
- **Real-time**: Tích hợp **SignalR** cho cả Nhân viên và Khách hàng (Thông báo đơn mới, Cập nhật trạng thái món ăn tức thì).

### Module Inventory (Quản lý Kho) ✅
- **Logic**: Tự động trừ kho nguyên liệu dựa trên định lượng (Recipe) ngay khi nhân viên nhấn "Phục vụ" (Served).
- **Frontend**: Quản lý nguyên liệu, tồn kho, lịch sử biến động nhập/xuất.

### Module Customer Loyalty & Rewards (Khách hàng thân thiết) ✅
- **Logic**: Tự động tích điểm dựa trên doanh thu (10,000đ = 1 điểm). Phân hạng thành viên (Bronze, Silver, Gold).
- **Redeem Points**: Khách hàng có thể dùng điểm tích lũy để đổi mã giảm giá (Vouchers) trực tiếp trên Web.
- **History**: Lưu lịch sử cộng/trừ điểm minh bạch cho khách hàng.

### Module Payment & Analytics ✅
- **Payment**: Tích hợp sinh mã **VietQR** động theo số tiền đơn hàng và nội dung chuyển khoản tự động.
- **Reports**: API báo cáo doanh thu 7 ngày, Top món bán chạy, Lợi nhuận ròng (Doanh thu - Chi phí).
- **Frontend**: Dashboard Web khách hàng đã chuyển từ giao diện mobile sang giao diện Web đa cột chuyên nghiệp.
