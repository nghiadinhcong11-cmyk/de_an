# Chi tiết các tính năng mới cập nhật

Dưới đây là danh sách các thay đổi quan trọng phân theo từng nền tảng.

## 1. Backend (.NET Core API)
- **Quản lý Đơn hàng nâng cao**:
    - Hỗ trợ thêm món vào đơn hàng đang hoạt động (`AddItemsToOrder`).
    - API thanh toán tích hợp đa năng: Kiểm tra Voucher, tính điểm tích lũy, sinh mã VietQR động.
    - Tự động hóa giải phóng bàn và cập nhật trạng thái kho ngay khi thanh toán.
- **Quản lý Tài khoản & Phân quyền**:
    - Cho phép cập nhật thông tin chi tiết nhân viên (Vai trò, Chi nhánh làm việc).
    - Tách biệt Voucher theo `RestaurantId` để bảo mật dữ liệu giữa các chủ quán.
- **Dữ liệu & Báo cáo**:
    - API thống kê nhanh theo ngày (`TodayShiftSummary`) dành riêng cho ứng dụng di động.

## 2. Mobile App (Flutter cho Nhân viên)
- **Giao diện & Trải nghiệm (UX)**:
    - Áp dụng ngôn ngữ thiết kế Modern Bold với font Plus Jakarta Sans.
    - Hệ thống chuyển động (Animation): Hiệu ứng chuyển tab lướt nhẹ, Hero animation cho sơ đồ bàn, hiệu ứng nảy (Bounce) khi thêm món.
- **Sơ đồ bàn thông minh**:
    - Phân cấp bàn theo Chi nhánh và Khu vực (Tầng 1, Tầng 2, VIP...).
    - Trạng thái màu sắc (Trống/Có khách) đồng bộ real-time qua SignalR.
- **Mobile POS**:
    - Cho phép đặt món trực tiếp tại bàn không cần quét QR.
    - Tìm kiếm và chọn món với bộ đếm số lượng mượt mà.
- **Thanh toán Di động**:
    - Hỗ trợ chọn Tiền mặt hoặc VietQR.
    - Tích hợp quét/nhập số điện thoại khách hàng để tích điểm ngay tại chỗ.
    - Hiển thị QR thanh toán chứa đúng số tiền cuối cùng (đã trừ Voucher).

## 3. Web Frontend (React cho Khách & Chủ quán)
- **Cải tiến QR Ordering**:
    - Mở cửa cho khách vãng lai (không cần đăng nhập vẫn đặt được món).
    - Đồng bộ giỏ hàng qua LocalStorage, tự động nhận diện thông tin bàn từ URL.
- **Profile cá nhân**:
    - Cho phép khách hàng và nhân viên cập nhật ảnh đại diện và họ tên.
- **Dashboard Chủ quán**:
    - Quản lý đội ngũ chuyên sâu: Điều chuyển nhân sự, phê duyệt tài khoản mới.
    - Thiết lập tài khoản ngân hàng nhận tiền riêng cho từng chi nhánh.
    - Báo cáo kinh doanh sử dụng dữ liệu thực tế với biểu đồ tăng trưởng trực quan.
