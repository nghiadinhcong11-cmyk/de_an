# Hướng dẫn Phát triển & Vận hành

## 1. Lệnh Quan trọng
### Backend (.NET Core)
- `dotnet ef migrations add <Ten>`: Tạo bản vẽ database mới.
- `dotnet ef database update`: Cập nhật database thực tế.
- `dotnet run`: Chạy server API.

### Frontend (React)
- `npm install --legacy-peer-deps`: Cài đặt thư viện mới.
- `npm run dev`: Chạy giao diện phát triển.

## 2. Tiến độ dự án (Roadmap)

### Giai đoạn 1: Xây dựng Cột sống (Backbone) ✅
- Hoàn thành Schema 33 bảng.
- Hệ thống xác thực JWT & Phân quyền Roles.
- Core API (Nhà hàng, Chi nhánh, Nhân viên).

### Giai đoạn 2: Nghiệp vụ & Dữ liệu thật ✅
- Hệ thống Menu & Quản lý bàn QR.
- Luồng Đặt món QR cho khách hàng.
- Kết nối 100% Frontend với API thật, loại bỏ dữ liệu mẫu.

### Giai đoạn 3: Vận hành & Real-time ✅
- Tích hợp SignalR: Thông báo gọi món thời gian thực (có âm thanh).
- Luồng duyệt món (Order Request Approval) cho nhân viên.
- Tích hợp thanh toán VietQR tự động sinh mã theo đơn hàng.
- Triển khai đầy đủ các module: Kho (Inventory), Nhà cung cấp, Chi phí, Ca làm việc.

### Giai đoạn 4: Mở rộng & Tối ưu (Next) 🏗️
1. **Cloud Printing**: Tự động in bếp khi nhân viên duyệt món.
2. **Auto Inventory Deduction**: Tự động trừ kho dựa trên định lượng (Recipe) khi hoàn thành đơn.
3. **Advanced Reports**: Biểu đồ phân tích doanh thu theo giờ, món ăn bán chạy nhất.
4. **Mobile App**: Ứng dụng cho nhân viên phục vụ và khách hàng trung thành.

## 3. Cấu hình Môi trường
- **Backend URL**: `https://restaurant-pos-api-uvcz.onrender.com`
- **Frontend URL**: `https://restaurant-pos-web.onrender.com`
- **Database**: PostgreSQL (Render Cloud).
