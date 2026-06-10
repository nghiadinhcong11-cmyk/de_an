import { useState, useEffect } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { Home, UtensilsCrossed, ShoppingBag, User, LogOut, Facebook, Youtube } from "lucide-react";
import { authApi } from "../services/authApi";
import { Button } from "../components/ui/button";
import api from "../services/api";

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
  const [userProfile, setUserProfile] = useState<any>(null);
  const currentTableId = localStorage.getItem("current_table_id");

  useEffect(() => {
    const localProfile = localStorage.getItem("user_profile");
    if (localProfile) setUserProfile(JSON.parse(localProfile));

    const fetchProfile = async () => {
      try {
        const res = await api.get("/customers/me");
        setUserProfile(res.data);
        localStorage.setItem("user_profile", JSON.stringify(res.data));
      } catch (err) { console.error("Layout profile error"); }
    };
    fetchProfile();
  }, [location.pathname]);

  const handleLogout = () => {
    if (confirm("Bạn muốn đăng xuất?")) authApi.logout();
  };

  const filteredNavItems = navItems.filter(item => {
    if (item.path === "/customer/orders" && !currentTableId) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-[#FCFBF8] flex flex-col font-sans selection:bg-orange-100 selection:text-orange-600">
      {/* Premium Navbar */}
      <header className="bg-white/80 backdrop-blur-xl border-b border-gray-100 sticky top-0 z-50 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07)]">
        <div className="container mx-auto px-4 md:px-8 h-20 flex items-center justify-between">
          <Link to="/customer" className="flex items-center gap-2 group">
            <div className="w-12 h-12 bg-gray-900 rounded-2xl flex items-center justify-center text-white text-2xl transition-transform group-hover:rotate-12 duration-300 shadow-lg shadow-gray-200">🥗</div>
            <div className="flex flex-col">
                <span className="font-black text-xl tracking-tight text-gray-900 leading-none uppercase">RESTO<span className="text-orange-600">POS</span></span>
                <span className="text-[8px] font-bold text-gray-400 tracking-[0.3em] uppercase">Premium Dining</span>
            </div>
          </Link>

          <nav className="hidden lg:flex items-center gap-10">
            {filteredNavItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`relative flex items-center gap-2 text-xs font-black uppercase tracking-widest transition-all duration-300 ${
                    isActive ? "text-orange-600" : "text-gray-400 hover:text-gray-900"
                  }`}
                >
                  {item.label}
                  {isActive && <span className="absolute -bottom-1 left-0 w-full h-1 bg-orange-600 rounded-full"></span>}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-4">
             {user.fullName && (
               <Link to="/customer/profile" className="hidden md:flex items-center gap-3 bg-gray-50 hover:bg-gray-100 p-1.5 pr-4 rounded-2xl transition-all border border-gray-100">
                  <div className="w-9 h-9 bg-orange-600 rounded-xl flex items-center justify-center text-white font-black shadow-md shadow-orange-200">
                    {userProfile?.fullName?.charAt(0) || user.fullName.charAt(0)}
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-black text-gray-900 leading-none">{userProfile?.fullName || user.fullName}</p>
                    <p className="text-[9px] text-orange-600 font-bold uppercase mt-0.5 tracking-tighter">{userProfile?.points || 0} Điểm tích lũy</p>
                  </div>
               </Link>
             )}

             <div className="h-8 w-px bg-gray-100 mx-2 hidden md:block"></div>

             <Button
                onClick={handleLogout}
                variant="ghost"
                className="h-11 w-11 rounded-2xl text-red-400 hover:text-red-600 hover:bg-red-50 p-0"
             >
                <LogOut className="w-5 h-5" />
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
                <span className="font-black text-xl tracking-tighter uppercase">RESTO<span className="text-orange-600">POS</span></span>
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
                <li><Link to="/customer/profile" className="text-sm text-gray-500 hover:text-orange-600 font-bold transition-colors">Đánh giá góp ý</Link></li>
              </ul>
            </div>

            {/* Cột 4: Liên hệ */}
            <div className="space-y-4">
              <h4 className="font-black text-xs uppercase tracking-widest text-gray-900">Kết nối với chúng tôi</h4>
              <div className="flex gap-4">
                <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400 hover:bg-orange-50 hover:text-orange-600 transition-all cursor-pointer">
                  <Facebook className="w-5 h-5 fill-current" />
                </div>
                <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400 hover:bg-orange-50 hover:text-orange-600 transition-all cursor-pointer">
                  <Youtube className="w-5 h-5 fill-current" />
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-50 py-8 text-center">
            <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">
              © 2026 RESTO POS System. All Rights Reserved.
            </p>
          </div>
        </div>
      </footer>

      {/* Modern Bottom Nav for Mobile */}
      <nav className="md:hidden fixed bottom-6 left-6 right-6 h-18 bg-gray-900/95 backdrop-blur-lg rounded-[28px] flex items-center justify-around px-4 z-50 shadow-2xl shadow-gray-400 border border-white/10">
        {filteredNavItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link key={item.path} to={item.path} className={`p-4 transition-all duration-300 ${isActive ? "text-orange-500 scale-125" : "text-gray-500"}`}>
              <item.icon className="w-6 h-6" strokeWidth={isActive ? 3 : 2} />
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
