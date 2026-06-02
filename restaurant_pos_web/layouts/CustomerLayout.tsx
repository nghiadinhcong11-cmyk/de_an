import { Link, Outlet, useLocation } from "react-router-dom";
import { Home, UtensilsCrossed, ShoppingBag, User } from "lucide-react";

const navItems = [
  { icon: Home, label: "Trang chủ", path: "/customer" },
  { icon: UtensilsCrossed, label: "Thực đơn", path: "/customer/menu" },
  { icon: ShoppingBag, label: "Đơn hàng", path: "/customer/orders" },
  { icon: User, label: "Cá nhân", path: "/customer/profile" },
];

export default function CustomerLayout() {
  const location = useLocation();

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 max-w-md mx-auto relative shadow-2xl">
      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white border-t border-gray-100 flex items-center justify-around h-20 px-6 z-50 rounded-t-[32px] shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center gap-1 transition-all ${
                isActive ? "text-orange-600 scale-110" : "text-gray-400 hover:text-gray-600"
              }`}
            >
              <div className={`p-2 rounded-xl ${isActive ? "bg-orange-50" : ""}`}>
                <item.icon className={`w-6 h-6 ${isActive ? "stroke-[2.5px]" : "stroke-[1.5px]"}`} />
              </div>
              <span className={`text-[10px] font-bold ${isActive ? "opacity-100" : "opacity-0 h-0"}`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
