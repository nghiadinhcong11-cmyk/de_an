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
- Hoàn thành Schema 33 bảng với đầy đủ Foreign Key ràng buộc.
- Hệ thống xác thực JWT & Phân quyền Roles tự động khởi tạo.
- Cấu hình bảo mật **Protected Routes** phân tách Owner/Employee/Customer.

### Giai đoạn 2: Nghiệp vụ & Dữ liệu thật ✅
- Hệ thống Menu & Quản lý bàn QR động.
- Luồng Đặt món QR toàn diện.
- Kết nối 100% Frontend với API thật, loại bỏ dữ liệu mẫu.

### Giai đoạn 3: Vận hành & Real-time ✅
- Tích hợp SignalR đa chiều: Thông báo cho nhân viên & Cập nhật trạng thái cho khách hàng.
- Logic **Tự động trừ kho** dựa trên định lượng công thức món ăn (Recipe).
- Hệ sinh thái khách hàng thân thiết: Tích điểm, Phân hạng thẻ, Đổi điểm lấy Voucher.
- Chuyển đổi toàn bộ Web Khách hàng sang giao diện Modern Web (Responsive).

### Giai đoạn 4: Mở rộng & Tối ưu (Next) 🏗️
1. **Cloud Printing**: Tự động in bếp/hóa đơn từ xa.
2. **AI Analytics**: Dự báo doanh thu và cảnh báo nhập hàng dựa trên lịch sử kho.
3. **VietQR Payment Hook**: Tự động nhận diện tiền vào tài khoản để hoàn tất đơn hàng không cần nhân viên nhấn nút.
4. **Mobile App**: Ứng dụng Hybrid cho nhân viên phục vụ cầm tay.

## 3. Cấu hình Môi trường
- **Backend URL**: `https://restaurant-pos-api-uvcz.onrender.com`
- **Frontend URL**: `https://restaurant-pos-web.onrender.com`
- **Database**: PostgreSQL (Render Cloud).
