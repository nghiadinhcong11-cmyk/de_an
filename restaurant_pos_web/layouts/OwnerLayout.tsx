import { useState } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Store,
  Users,
  Utensils,
  Table2,
  CreditCard,
  Ticket,
  BarChart3,
  Settings,
  LogOut,
  Package,
  KeyRound,
  ShoppingBag,
  Bell,
  UserCircle,
  MessageSquare,
  Menu,
  X
} from "lucide-react";
import { authApi } from "../services/authApi";
import { Avatar, AvatarFallback } from "../components/ui/avatar";

const navItems = [
  { icon: LayoutDashboard, label: "Báo cáo tổng quan", path: "/owner" },
  { icon: ShoppingBag, label: "Lịch sử đơn hàng", path: "/owner/orders" },
  { icon: Bell, label: "Lịch đặt bàn", path: "/owner/bookings" },
  { icon: Store, label: "Chi nhánh", path: "/owner/branches" },
  { icon: Users, label: "Nhân viên", path: "/owner/employees" },
  { icon: Package, label: "Chi tiêu & Kho", path: "/owner/inventory" },
  { icon: Utensils, label: "Thực đơn", path: "/owner/menu" },
  { icon: Table2, label: "Sơ đồ bàn", path: "/owner/tables" },
  { icon: Users, label: "Khách hàng", path: "/owner/customers" },
  { icon: CreditCard, label: "Thanh toán", path: "/owner/payments" },
  { icon: Ticket, label: "Vouchers", path: "/owner/vouchers" },
  { icon: MessageSquare, label: "Góp ý", path: "/owner/feedbacks" },
  { icon: Settings, label: "Nhà hàng", path: "/owner/restaurant" },
  { icon: KeyRound, label: "Mật khẩu", path: "/owner/change-password" },
];

export default function OwnerLayout() {
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const closeSidebar = () => setIsSidebarOpen(false);

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar Mobile Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm transition-opacity"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 flex flex-col transition-transform duration-300 ease-in-out
        ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0 lg:static lg:inset-0
      `}>
        <div className="p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-600 rounded-xl flex items-center justify-center text-white text-xl">
              🥗
            </div>
            <span className="font-bold text-xl text-gray-900 truncate">POS Admin</span>
          </div>
          <button onClick={closeSidebar} className="lg:hidden p-2 text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 px-4 py-2 space-y-1 overflow-y-auto custom-scrollbar">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={closeSidebar}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                location.pathname === item.path
                  ? "bg-orange-50 text-orange-600"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-200">
          <button
            onClick={() => { if(confirm("Bạn muốn đăng xuất?")) authApi.logout(); }}
            className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-16 bg-white border-b border-gray-200 px-4 lg:px-8 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Menu className="w-6 h-6" />
            </button>
            <div className="text-sm text-gray-500 hidden sm:block">
              Xin chào, <span className="font-bold text-gray-900 text-base ml-1">{user.fullName || "Admin"}</span>
            </div>
          </div>

          <Link to="/owner/profile" className="flex items-center gap-3 group">
             <div className="text-right hidden sm:block">
                <p className="text-xs font-black text-gray-900 leading-none">{user.fullName}</p>
                <p className="text-[10px] text-gray-400 font-bold uppercase mt-1">Chủ nhà hàng</p>
             </div>
             <Avatar className="w-9 h-9 border-2 border-white shadow-sm group-hover:border-orange-200 transition-all">
                {user.avatarUrl ? (
                    <img src={user.avatarUrl} alt={user.fullName} className="aspect-square h-full w-full object-cover" />
                ) : (
                    <AvatarFallback className="bg-orange-100 text-orange-600 font-bold text-xs uppercase">
                        {user.fullName?.charAt(0) || "A"}
                    </AvatarFallback>
                )}
             </Avatar>
          </Link>
        </header>

        <div className="flex-1 overflow-y-auto p-4 lg:p-0">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

