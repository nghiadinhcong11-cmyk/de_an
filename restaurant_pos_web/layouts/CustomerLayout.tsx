import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { Home, UtensilsCrossed, ShoppingBag, User, LogOut } from "lucide-react";
import { authApi } from "../services/authApi";
import { Button } from "../components/ui/button";

const navItems = [
  { icon: Home, label: "Khám phá", path: "/customer" },
  { icon: UtensilsCrossed, label: "Thực đơn", path: "/customer/menu" },
  { icon: ShoppingBag, label: "Đơn hàng", path: "/customer/orders" },
  { icon: User, label: "Cá nhân", path: "/customer/profile" },
];

export default function CustomerLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const currentTableId = localStorage.getItem("current_table_id");

  const handleLogout = () => {
    if (confirm("Bạn muốn đăng xuất?")) {
      authApi.logout();
    }
  };

  // Chỉ hiển thị "Đơn hàng" nếu khách hàng đang ngồi tại một bàn cụ thể (có Table ID)
  const filteredNavItems = navItems.filter(item => {
    if (item.path === "/customer/orders" && !currentTableId) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Top Navbar chuyên nghiệp */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-6 h-20 flex items-center justify-between">
          <Link to="/customer" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-600 rounded-xl flex items-center justify-center text-white text-xl">🥗</div>
            <span className="font-black text-2xl tracking-tighter text-gray-900 hidden md:block uppercase">Restaurant<span className="text-orange-600">Pos</span></span>
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            {filteredNavItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-2 text-xs font-black uppercase tracking-widest transition-all ${
                    isActive ? "text-orange-600 border-b-2 border-orange-600 pb-1" : "text-gray-400 hover:text-gray-900"
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-4">
             <div className="hidden md:flex items-center gap-3 mr-2">
                {user.fullName && (
                  <div className="text-right">
                    <p className="text-xs font-black text-gray-900 leading-none">{user.fullName}</p>
                    <p className="text-[10px] text-orange-600 font-bold uppercase mt-1">{user.points || 0} Điểm</p>
                  </div>
                )}
             </div>

             <div className="h-8 w-px bg-gray-100 mx-2 hidden md:block"></div>

             <Button
                onClick={handleLogout}
                variant="ghost"
                className="text-red-500 font-black text-xs uppercase tracking-wider flex items-center gap-2 hover:bg-red-50"
             >
                <LogOut className="w-4 h-4" /> <span className="hidden md:inline">Thoát</span>
             </Button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 container mx-auto px-4 py-8 md:px-6 md:py-12 pb-24 md:pb-12">
        <Outlet />
      </main>

      {/* Footer chuyên nghiệp */}
      <footer className="bg-white border-t border-gray-100 pt-12 pb-28 md:pb-12">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            {/* Cột 1: Thông tin quán */}
            <div className="md:col-span-1 space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-orange-600 rounded-lg flex items-center justify-center text-white">🥗</div>
                <span className="font-black text-xl tracking-tighter uppercase">Restaurant<span className="text-orange-600">Pos</span></span>
              </div>
              <p className="text-gray-400 text-sm font-medium leading-relaxed">
                Hệ thống đặt món thông minh, mang lại trải nghiệm ẩm thực hiện đại và nhanh chóng nhất cho bạn.
              </p>
            </div>

            {/* Cột 2: Đường dẫn nhanh */}
            <div className="space-y-4">
              <h4 className="font-black text-xs uppercase tracking-widest text-gray-900">Khám phá</h4>
              <ul className="space-y-2">
                <li><Link to="/customer" className="text-sm text-gray-500 hover:text-orange-600 font-bold transition-colors">Trang chủ</Link></li>
                <li><Link to="/customer/menu" className="text-sm text-gray-500 hover:text-orange-600 font-bold transition-colors">Thực đơn</Link></li>
                <li><Link to="/customer/orders" className="text-sm text-gray-500 hover:text-orange-600 font-bold transition-colors">Lịch sử đơn hàng</Link></li>
              </ul>
            </div>

            <div className="space-y-4">
              <h4 className="font-black text-xs uppercase tracking-widest text-gray-900">Hỗ trợ khách hàng</h4>
              <ul className="space-y-2">
                <li className="text-sm text-gray-500 font-bold cursor-pointer hover:text-orange-600 transition-colors">Chính sách bảo mật</li>
                <li className="text-sm text-gray-500 font-bold cursor-pointer hover:text-orange-600 transition-colors">Điều khoản sử dụng</li>
                <li><Link to="/customer/contact" className="text-sm text-gray-500 hover:text-orange-600 font-bold transition-colors">Liên hệ phản hồi</Link></li>
              </ul>
            </div>

            {/* Cột 4: Liên hệ */}
            <div className="space-y-4">
              <h4 className="font-black text-xs uppercase tracking-widest text-gray-900">Kết nối với chúng tôi</h4>
              <div className="flex gap-4">
                <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400 hover:bg-orange-50 hover:text-orange-600 transition-all cursor-pointer">
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 3.656 10.995 9 11.83v-8.369H5.917v-3.461h3.083V9.43c0-3.046 1.815-4.735 4.597-4.735 1.333 0 2.723.238 2.723.238v2.993h-1.534c-1.509 0-1.978.936-1.978 1.897v2.275h3.373l-.539 3.461h-2.834v8.37c5.344-.835 9-5.84 9-11.83z"/></svg>
                </div>
                <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400 hover:bg-orange-50 hover:text-orange-600 transition-all cursor-pointer">
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.016 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.872.505 9.377.505 9.377.505s7.505 0 9.377-.505a3.015 3.016 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-50 py-8 text-center">
            <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">
              © 2026 Restaurant POS System. All Rights Reserved.
            </p>
          </div>
        </div>
      </footer>

      {/* Mobile Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 flex items-center justify-around h-20 px-6 z-50 rounded-t-3xl shadow-2xl">
        {filteredNavItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link key={item.path} to={item.path} className={`p-3 rounded-2xl ${isActive ? "bg-orange-50 text-orange-600" : "text-gray-300"}`}>
              <item.icon className="w-6 h-6" />
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
