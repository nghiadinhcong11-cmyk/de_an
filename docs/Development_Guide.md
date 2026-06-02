# Hướng dẫn Phát triển & Vận hành

## 1. Lệnh EF Core quan trọng
Sử dụng tại thư mục `backend/`:
- `dotnet ef migrations add <Ten_Migration>`
- `dotnet ef database update`

## 2. Tiến độ dự án (Roadmap)

### Giai đoạn 1: Xây dựng Cột sống (Backbone) ✅
1. **Database Schema**: Hoàn thành 33 bảng. ✅
2. **Authentication**: JWT, BCrypt, Login/Register Owner. ✅
3. **Core API**: Quản lý Restaurant, Branch, User. ✅
4. **Roles Seeding**: Tự động tạo Owner, Manager, Cashier, Waiter. ✅

### Giai đoạn 2: Nghiệp vụ chính (Core Business) ✅
1. **Menu API**: Quản lý thực đơn (Category & Product). ✅
2. **QR Ordering API**: Luồng gọi món tại bàn cho khách. ✅
3. **Frontend Framework**: Setup React + Vite + Tailwind + Axios. ✅
4. **Authentication UI**: Trang Login kết nối API thật. ✅
5. **Real Data Integration**: Loại bỏ toàn bộ Mock Data, kết nối Frontend với Backend. ✅

### Giai đoạn 3: Vận hành & Real-time (Next) 🏗️
1. **Order Approval Flow**: Nhân viên duyệt yêu cầu gọi món từ khách.
2. **SignalR Integration**: Thông báo món mới vào bếp ngay lập tức.
3. **Payment Integration**: Tích hợp thanh toán tự động qua VietQR.
4. **Inventory Tracking**: Tự động trừ kho khi hoàn thành đơn hàng.

## 3. Lưu ý bảo mật
- Tuyệt đối không lưu mật khẩu Database trong code khi Push lên GitHub.
- Sử dụng Environment Variables (`VITE_API_URL`, `ConnectionStrings`) trên Render/Vercel.
- Chỉ các API `Auth` và `QROrdering` là Public, các API khác phải có Token hợp lệ.
