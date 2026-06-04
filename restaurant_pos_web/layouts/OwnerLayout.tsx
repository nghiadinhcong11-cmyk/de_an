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
  KeyRound
} from "lucide-react";
import { authApi } from "../services/authApi";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/owner" },
  { icon: ShoppingBag, label: "Orders History", path: "/owner/orders" },
  { icon: Store, label: "Branches", path: "/owner/branches" },
  { icon: Users, label: "Employees", path: "/owner/employees" },
  { icon: Package, label: "Inventory", path: "/owner/inventory" },
  { icon: Utensils, label: "Menu", path: "/owner/menu" },
  { icon: Table2, label: "Tables", path: "/owner/tables" },
  { icon: Users, label: "Customers", path: "/owner/customers" },
  { icon: CreditCard, label: "Payments", path: "/owner/payments" },
  { icon: Ticket, label: "Vouchers", path: "/owner/vouchers" },
  { icon: BarChart3, label: "Reports", path: "/owner/reports" },
  { icon: Settings, label: "Restaurant", path: "/owner/restaurant" },
  { icon: KeyRound, label: "Password", path: "/owner/change-password" },
];

export default function OwnerLayout() {
  const location = useLocation();

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-6 flex items-center gap-3">
          <div className="w-10 h-10 bg-orange-600 rounded-xl flex items-center justify-center text-white text-xl">
            🥗
          </div>
          <span className="font-bold text-xl text-gray-900 truncate">POS Admin</span>
        </div>

        <nav className="flex-1 px-4 py-2 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
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
            onClick={() => authApi.logout()}
            className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <header className="h-16 bg-white border-b border-gray-200 px-8 flex items-center justify-between sticky top-0 z-10">
          <div className="text-sm text-gray-500">
            Welcome back, <span className="font-bold text-gray-900 text-base ml-1">Admin</span>
          </div>
          <div className="flex items-center gap-4">
             <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold">
               A
             </div>
          </div>
        </header>
        <Outlet />
      </main>
    </div>
  );
}
