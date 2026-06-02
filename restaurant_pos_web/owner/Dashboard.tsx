import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { DollarSign, ShoppingBag, Users, Table2, Loader2 } from "lucide-react";
import api from "../services/api";

export function OwnerDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get("/reports/dashboard-stats");
        setStats(res.data);
      } catch (err) {
        console.error("Lỗi tải thống kê");
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <div className="flex justify-center p-20"><Loader2 className="animate-spin text-orange-600 w-10 h-10" /></div>;

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="mb-8">
        <h1 className="text-2xl font-black text-gray-900">Tổng quan hệ thống</h1>
        <p className="text-gray-600 mt-1">Chào mừng bạn quay trở lại!</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="border-none shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-bold text-gray-500">Doanh thu hôm nay</CardTitle>
            <DollarSign className="w-4 h-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-gray-900">${stats?.todayRevenue?.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-bold text-gray-500">Đơn hàng mới</CardTitle>
            <ShoppingBag className="w-4 h-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-gray-900">{stats?.todayOrders}</div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-bold text-gray-500">Bàn đang dùng</CardTitle>
            <Table2 className="w-4 h-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-gray-900">{stats?.activeTables}</div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-bold text-gray-500">Tổng khách hàng</CardTitle>
            <Users className="w-4 h-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-gray-900">{stats?.totalCustomers}</div>
          </CardContent>
        </Card>
      </div>

      <div className="bg-white p-10 rounded-3xl border-2 border-dashed border-gray-100 text-center">
          <p className="text-gray-400">Các biểu đồ phân tích chi tiết đang được phát triển...</p>
      </div>
    </div>
  );
}
