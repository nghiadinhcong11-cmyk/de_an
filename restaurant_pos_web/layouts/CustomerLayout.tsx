import { useState, useEffect } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { Home, UtensilsCrossed, ShoppingBag, User, LogOut, Facebook, Youtube, CalendarCheck, Search } from "lucide-react";
import { authApi } from "../services/authApi";
import { Button } from "../components/ui/button";
import api from "../services/api";

const navItems = [
  { icon: Home, label: "Trang chủ", path: "/customer" },
  { icon: UtensilsCrossed, label: "Thực đơn", path: "/customer/menu" },
  { icon: CalendarCheck, label: "Đặt bàn", path: "/customer/booking" },
  { icon: CalendarCheck, label: "Lịch hẹn", path: "/customer/my-bookings" },
  { icon: ShoppingBag, label: "Đơn hàng", path: "/customer/orders" },
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
    if (user.token || localStorage.getItem("token")) {
      fetchProfile();
    }
  }, [location.pathname]);

  const handleLogout = () => {
    if (confirm("Bạn muốn đăng xuất?")) authApi.logout();
  };

  const filteredNavItems = navItems.filter(item => {
    if (item.path === "/customer/orders" && !currentTableId) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-brand-dark flex flex-col font-['Montserrat'] selection:bg-brand-accent selection:text-white">
      {/* Cinematic Navbar */}
      <header className="bg-brand-dark/80 backdrop-blur-2xl border-b border-white/5 sticky top-0 z-50 transition-all duration-300">
        <div className="container mx-auto px-6 md:px-12 h-24 flex items-center justify-between">
          <Link to="/customer" className="flex items-center gap-4 group">
            <div className="relative w-12 h-12 rounded-xl bg-gradient-to-br from-brand-accent to-orange-700 flex items-center justify-center shadow-xl shadow-brand-accent/20 group-hover:rotate-12 transition-all duration-500 overflow-hidden">
                <span className="text-2xl relative z-10">🥗</span>
                <div className="absolute inset-0 bg-white/20 -translate-x-full group-hover:animate-shine"></div>
            </div>
            <div className="flex flex-col">
                <span className="font-black text-2xl tracking-tighter text-white leading-none uppercase">RESTO<span className="text-brand-accent italic">POS</span></span>
                <span className="text-xs font-black text-brand-accent tracking-[0.15em] uppercase mt-1">Culinary Excellence</span>
            </div>
          </Link>

          <nav className="hidden lg:flex items-center gap-12">
            {filteredNavItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`relative text-[13px] font-black uppercase tracking-[0.1em] transition-all duration-300 ${
                    isActive ? "text-brand-accent scale-110" : "text-gray-300 hover:text-white"
                  }`}
                >
                  {item.label}
                  {isActive && (
                    <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-brand-accent rounded-full shadow-[0_0_10px_#F97316]"></span>
                  )}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-6">
             {user.fullName ? (
               <Link to="/customer/profile" className="hidden md:flex items-center gap-4 bg-white/10 hover:bg-white/15 p-1.5 pr-6 rounded-2xl transition-all border border-white/20 group">
                  <div className="w-10 h-10 bg-brand-accent rounded-xl flex items-center justify-center text-white font-black shadow-lg group-hover:scale-110 transition-transform text-lg">
                    {userProfile?.fullName?.charAt(0) || user.fullName.charAt(0)}
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-black text-white leading-none">{userProfile?.fullName || user.fullName}</p>
                    <p className="text-[11px] text-brand-accent font-black uppercase mt-1.5 tracking-wider">
                        {userProfile?.points?.toLocaleString() || 0} pts
                    </p>
                  </div>
               </Link>
             ) : (
                <Link to="/login">
                    <Button className="bg-white text-brand-dark rounded-xl px-8 font-black text-xs uppercase tracking-widest hover:bg-brand-accent hover:text-white transition-all shadow-xl">
                        Đăng nhập
                    </Button>
                </Link>
             )}

             <div className="h-8 w-px bg-white/10 mx-2 hidden md:block"></div>

             {user.fullName && (
                <Button
                    onClick={handleLogout}
                    variant="ghost"
                    className="h-12 w-12 rounded-xl text-gray-500 hover:text-red-500 hover:bg-red-500/10 p-0"
                >
                    <LogOut className="w-5 h-5" />
                </Button>
             )}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 pb-24 lg:pb-0">
        <Outlet />
      </main>

      {/* Premium Footer */}
      <footer className="bg-black/40 backdrop-blur-md border-t border-white/5 pt-20 pb-32 md:pb-20">
        <div className="container mx-auto px-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-20 mb-20 text-center md:text-left">
            <div className="md:col-span-1 space-y-6">
              <Link to="/customer" className="flex items-center gap-3 justify-center md:justify-start">
                <div className="w-8 h-8 bg-brand-accent rounded-lg flex items-center justify-center text-white text-sm shadow-lg">🥗</div>
                <span className="font-black text-2xl tracking-tighter text-white uppercase leading-none">RESTO<span className="text-brand-accent">POS</span></span>
              </Link>
              <p className="text-gray-500 text-sm font-medium leading-relaxed">
                Định nghĩa lại trải nghiệm ẩm thực 4.0. <br /> Tinh hoa vị giác, công nghệ tiên phong.
              </p>
            </div>

            <div className="space-y-6">
              <h4 className="font-black text-xs uppercase tracking-[0.15em] text-white">Khám phá</h4>
              <ul className="space-y-4">
                <li><Link to="/customer" className="text-[13px] text-gray-300 hover:text-brand-accent font-bold transition-colors">Về chúng tôi</Link></li>
                <li><Link to="/customer/menu" className="text-[13px] text-gray-300 hover:text-brand-accent font-bold transition-colors">Thực đơn đặc sắc</Link></li>
                <li><Link to="/customer/booking" className="text-[13px] text-gray-300 hover:text-brand-accent font-bold transition-colors">Hệ thống cơ sở</Link></li>
              </ul>
            </div>

            <div className="space-y-6">
              <h4 className="font-black text-xs uppercase tracking-[0.15em] text-white">Dịch vụ</h4>
              <ul className="space-y-4">
                <li className="text-[13px] text-gray-300 font-bold cursor-pointer hover:text-brand-accent transition-colors">Chính sách bảo mật</li>
                <li className="text-[13px] text-gray-300 font-bold cursor-pointer hover:text-brand-accent transition-colors">Điều khoản & Điều kiện</li>
                <li className="text-[13px] text-gray-300 font-bold cursor-pointer hover:text-brand-accent transition-colors">Tuyển dụng</li>
              </ul>
            </div>

            <div className="space-y-6">
              <h4 className="font-black text-xs uppercase tracking-[0.15em] text-white">Theo dõi</h4>
              <div className="flex gap-4 justify-center md:justify-start">
                <SocialIcon icon={<Facebook className="w-5 h-5 fill-current" />} />
                <SocialIcon icon={<Youtube className="w-5 h-5 fill-current" />} />
              </div>
            </div>
          </div>

          <div className="border-t border-white/10 py-12 flex flex-col md:flex-row justify-between items-center gap-6">
            <p className="text-gray-400 text-xs font-black uppercase tracking-[0.2em]">
              © 2026 RESTO POS System • Made with Passion
            </p>
            <div className="flex gap-8 text-xs font-black text-gray-400 uppercase tracking-widest">
                <span className="hover:text-white cursor-pointer transition-colors">English</span>
                <span className="text-brand-accent">Tiếng Việt</span>
            </div>
          </div>
        </div>
      </footer>

      {/* Floating Modern Bottom Nav for Mobile */}
      <nav className="md:hidden fixed bottom-8 left-8 right-8 h-20 bg-brand-dark/95 backdrop-blur-2xl rounded-[32px] flex items-center justify-around px-4 z-50 shadow-[0_20px_50px_rgba(0,0,0,0.6)] border border-white/10">
        {filteredNavItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
                key={item.path}
                to={item.path}
                className={`relative flex flex-col items-center gap-1 transition-all duration-500 ${isActive ? "text-brand-accent scale-125" : "text-gray-400"}`}
            >
              <item.icon className="w-7 h-7" strokeWidth={isActive ? 2.5 : 2} />
              {isActive && (
                <div className="absolute -top-3 w-1.5 h-1.5 bg-brand-accent rounded-full shadow-[0_0_10px_#F97316]"></div>
              )}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

function SocialIcon({ icon }: { icon: any }) {
    return (
        <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-gray-400 hover:bg-brand-accent hover:text-white transition-all cursor-pointer border border-white/5">
            {icon}
        </div>
    )
}
