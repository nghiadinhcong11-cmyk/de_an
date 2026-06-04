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

  const handleLogout = () => {
    if (confirm("Bạn muốn đăng xuất?")) {
      authApi.logout();
    }
  };

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
            {navItems.map((item) => {
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
             <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate('/customer/cart')}
                className="relative h-11 w-11 rounded-full bg-orange-50 text-orange-600 hover:bg-orange-100 transition-colors"
             >
                <ShoppingBag className="w-5 h-5" />
             </Button>

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

      {/* Mobile Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 flex items-center justify-around h-20 px-6 z-50 rounded-t-3xl shadow-2xl">
        {navItems.map((item) => {
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
