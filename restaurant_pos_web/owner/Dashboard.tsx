import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { DollarSign, ShoppingBag, Users, TrendingUp, Loader2, Award } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import api from "../services/api";

export function OwnerDashboard() {
  const [overview, setOverview] = useState<any>(null);
  const [revenueData, setRevenueData] = useState<any[]>([]);
  const [topProducts, setTopProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [overRes, revRes, topRes] = await Promise.all([
          api.get("/Reports/overview"),
          api.get("/Reports/revenue-last-7-days"),
          api.get("/Reports/top-products")
        ]);
        setOverview(overRes.data);
        setRevenueData(revRes.data);
        setTopProducts(topRes.data);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  if (loading) return <div className="flex justify-center p-10 md:p-20"><Loader2 className="animate-spin text-orange-600" /></div>;

  return (
    <div className="p-4 md:p-8 bg-gray-50 min-h-screen text-gray-900">
      <div className="mb-8">
        <h1 className="text-2xl font-black">Bảng điều khiển</h1>
        <p className="text-gray-500">Tổng quan tình hình kinh doanh của chuỗi nhà hàng</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard label="TỔNG DOANH THU" val={`${overview?.totalRevenue?.toLocaleString("vi-VN")}đ`} icon={DollarSign} color="text-orange-600" />
        <StatCard label="TỔNG CHI PHÍ" val={`${overview?.totalExpenses?.toLocaleString("vi-VN")}đ`} icon={TrendingUp} color="text-red-500" />
        <StatCard label="LỢI NHUẬN RÒNG" val={`${overview?.netProfit?.toLocaleString("vi-VN")}đ`} icon={Award} color="text-green-600" />
        <StatCard label="TỔNG ĐƠN HÀNG" val={overview?.totalOrders} icon={ShoppingBag} color="text-blue-600" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Doanh thu 7 ngày */}
        <Card className="border-none shadow-sm bg-white">
          <CardHeader>
            <CardTitle className="text-lg">Doanh thu tuần này</CardTitle>
            <CardDescription>Biểu đồ biến động 7 ngày gần nhất</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fontSize: 10}} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10}} />
                <Tooltip />
                <Area type="monotone" dataKey="revenue" stroke="#ea580c" fill="#fff7ed" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Top Sản phẩm */}
        <Card className="border-none shadow-sm bg-white">
          <CardHeader>
            <CardTitle className="text-lg">Món ăn bán chạy</CardTitle>
            <CardDescription>Top 5 món theo số lượng</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topProducts} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 'bold'}} width={100} />
                <Tooltip />
                <Bar dataKey="quantity" fill="#ea580c" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatCard({ label, val, icon: Icon, color }: any) {
  return (
    <Card className="border-none shadow-sm bg-white">
      <CardContent className="pt-6 flex items-center gap-4">
        <div className={`w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center ${color}`}><Icon className="w-6 h-6" /></div>
        <div>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{label}</p>
          <p className="text-2xl font-black">{val}</p>
        </div>
      </CardContent>
    </Card>
  );
}
