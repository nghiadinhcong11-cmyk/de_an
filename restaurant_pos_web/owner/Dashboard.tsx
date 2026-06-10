import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { DollarSign, ShoppingBag, Zap, Loader2, ArrowRight, Clock } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Link } from "react-router-dom";
import api from "../services/api";

export function OwnerDashboard() {
  const [todayStats, setTodayStats] = useState<any>(null);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [revenueData, setRevenueData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [statsRes, ordersRes, revRes] = await Promise.all([
          api.get("/Reports/today-shift-summary"),
          api.get("/orders"), // Lấy đơn hàng để lọc đơn gần đây
          api.get("/Reports/revenue-last-7-days")
        ]);
        setTodayStats(statsRes.data);
        setRecentOrders(ordersRes.data.slice(0, 5));
        setRevenueData(revRes.data);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  if (loading) return <div className="flex justify-center p-10 md:p-20"><Loader2 className="animate-spin text-orange-600" /></div>;

  return (
    <div className="p-4 md:p-8 bg-gray-50 min-h-screen text-gray-900 pb-20">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black">Chào buổi sáng, Chủ quán!</h1>
          <p className="text-gray-500">Dưới đây là tình hình hoạt động của hệ thống trong hôm nay.</p>
        </div>
        <div className="bg-orange-600 text-white px-4 py-2 rounded-xl text-xs font-black uppercase flex items-center gap-2 shadow-lg shadow-orange-200">
           <Zap className="w-3 h-3 fill-current" /> Trực tiếp
        </div>
      </div>

      {/* Today's Operational KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard label="DOANH THU HÔM NAY" val={`${todayStats?.totalRevenue?.toLocaleString("vi-VN")}đ`} icon={DollarSign} color="text-orange-600" bg="bg-orange-50" />
        <StatCard label="ĐƠN HÀNG MỚI" val={todayStats?.totalOrders} icon={ShoppingBag} color="text-blue-600" bg="bg-blue-50" />
        <StatCard label="TIỀN MẶT" val={`${todayStats?.cashRevenue?.toLocaleString("vi-VN")}đ`} icon={DollarSign} color="text-green-600" bg="bg-green-50" />
        <StatCard label="CHUYỂN KHOẢN (QR)" val={`${todayStats?.qrRevenue?.toLocaleString("vi-VN")}đ`} icon={Zap} color="text-purple-600" bg="bg-purple-50" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Recent Activity */}
        <Card className="lg:col-span-1 border-none shadow-sm bg-white rounded-[32px] overflow-hidden">
          <CardHeader className="border-b border-gray-50">
            <div className="flex justify-between items-center">
                <CardTitle className="text-lg font-black uppercase tracking-tighter">Giao dịch gần đây</CardTitle>
                <Link to="/owner/orders" className="text-orange-600 text-xs font-bold flex items-center gap-1 hover:underline">
                    Xem tất cả <ArrowRight className="w-3 h-3" />
                </Link>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-gray-50">
                {recentOrders.map((order) => (
                    <div key={order.id} className="p-5 flex items-center justify-between hover:bg-gray-50 transition-colors">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-gray-400">
                                <Clock className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="font-bold text-sm text-gray-900">Bàn {order.tableNumber}</p>
                                <p className="text-[10px] text-gray-400 font-bold uppercase">{order.branchName}</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="font-black text-sm text-gray-900">{order.totalAmount.toLocaleString("vi-VN")}đ</p>
                            <p className={`text-[8px] font-black uppercase ${order.status === 'Completed' ? 'text-green-500' : 'text-orange-500'}`}>{order.status}</p>
                        </div>
                    </div>
                ))}
            </div>
          </CardContent>
        </Card>

        {/* Right: Today's Revenue Chart */}
        <Card className="lg:col-span-2 border-none shadow-sm bg-white rounded-[32px]">
          <CardHeader>
            <CardTitle className="text-lg font-black uppercase tracking-tighter">Biến động 7 ngày</CardTitle>
            <CardDescription>So sánh hiệu suất doanh thu hàng ngày</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 'bold'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 'bold'}} />
                <Tooltip />
                <Area type="monotone" dataKey="revenue" stroke="#ea580c" fill="#fff7ed" strokeWidth={4} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatCard({ label, val, icon: Icon, color, bg }: any) {
  return (
    <Card className="border-none shadow-sm bg-white rounded-[24px]">
      <CardContent className="pt-6 flex items-center gap-4">
        <div className={`w-12 h-12 rounded-2xl ${bg} flex items-center justify-center ${color}`}><Icon className="w-6 h-6" /></div>
        <div>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-1">{label}</p>
          <p className="text-2xl font-black">{val}</p>
        </div>
      </CardContent>
    </Card>
  );
}
