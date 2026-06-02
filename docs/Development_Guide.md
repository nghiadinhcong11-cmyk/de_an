# Hướng dẫn Phát triển & Vận hành

## 1. Lệnh EF Core quan trọng
Sử dụng tại thư mục `backend/`:

- **Tạo Migration mới (khi sửa Entity):**
  `dotnet ef migrations add <Ten_Migration>`
- **Cập nhật Database:**
  `dotnet ef database update`
- **Xóa Migration cuối cùng (nếu chưa update DB):**
  `dotnet ef migrations remove`

## 2. Các bước tiếp theo (Lộ trình)
1. **Authentication:** Cài đặt JWT và xử lý Đăng nhập/Đăng ký.
2. **Seed Data:** Tạo sẵn các Role và một tài khoản Admin mặc định.
3. **API Core:** Viết các API CRUD cho Restaurant và Branch.
4. **API Menu:** Viết API quản lý thực đơn.
5. **Logic Đặt món:** Xử lý luồng tạo Order và trừ tồn kho tự động.

## 3. Lưu ý bảo mật
- Luôn giữ file `appsettings.json` an toàn, không commit các mật khẩu thật lên GitHub public.
- Sử dụng Environment Variables cho các thông tin nhạy cảm khi triển khai lên server (Production).
