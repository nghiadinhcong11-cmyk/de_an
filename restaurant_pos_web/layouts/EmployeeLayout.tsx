import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  ShoppingBag,
  PlusCircle,
  Bell,
  LogOut,
  UserCircle,
  KeyRound
} from "lucide-react";
import { authApi } from "../services/authApi";
import { Button } from "../components/ui/button";

const navItems = [
  { icon: ShoppingBag, label: "Đơn hàng", path: "/employee/orders" },
  { icon: PlusCircle, label: "POS", path: "/employee/pos" },
  { icon: Bell, label: "Yêu cầu", path: "/employee/requests" },
];

export default function EmployeeLayout() {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    if (confirm("Bạn muốn đăng xuất?")) {
      authApi.logout();
    }
  };

  const user = JSON.parse(localStorage.getItem("user") || "{}");

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-gray-900 rounded-xl flex items-center justify-center text-white text-xl">💼</div>
            <div>
              <span className="font-black text-xl text-gray-900 leading-none block">Employee Portal</span>
              <span className="text-[10px] font-bold text-orange-600 uppercase tracking-widest">{user.role || 'Nhân viên'}</span>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-6">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                    isActive ? "bg-gray-900 text-white shadow-lg" : "text-gray-500 hover:bg-gray-50"
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-3">
             <Link to="/employee/change-password">
                <Button variant="ghost" size="icon" className="text-gray-400 hover:text-orange-600">
                    <KeyRound className="w-5 h-5" />
                </Button>
             </Link>

             <div className="h-8 w-px bg-gray-100 mx-2 hidden md:block"></div>

             <div className="hidden md:flex items-center gap-3 mr-4">
                <div className="text-right">
                    <p className="text-sm font-black text-gray-900 leading-none">{user.fullName}</p>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">@{user.username}</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold border-2 border-white shadow-sm">
                  {user.fullName?.charAt(0) || 'E'}
                </div>
             </div>

             <Button
                onClick={handleLogout}
                variant="ghost"
                className="text-red-500 font-black text-xs uppercase tracking-wider flex items-center gap-2 hover:bg-red-50"
             >
                <LogOut className="w-4 h-4" /> <span className="hidden lg:inline">Đăng xuất</span>
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
            <Link key={item.path} to={item.path} className={`p-3 rounded-2xl ${isActive ? "bg-gray-900 text-white shadow-lg" : "text-gray-300"}`}>
              <item.icon className="w-6 h-6" />
            </Link>
          );
        })}
        <button onClick={handleLogout} className="p-3 text-red-300">
          <LogOut className="w-6 h-6" />
        </button>
      </nav>
    </div>
  );
}
