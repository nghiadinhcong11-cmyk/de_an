import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { DollarSign, ShoppingBag, Users, TrendingUp, Loader2 } from "lucide-react";
import api from "../services/api";

export function OwnerReports() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get("/reports/dashboard-stats");
        setStats(res.data);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <div className="flex justify-center p-20"><Loader2 className="animate-spin text-orange-600 w-10 h-10" /></div>;

  return (
    <div className="p-8 bg-gray-50 min-h-screen text-gray-900">
      <div className="mb-8">
        <h1 className="text-2xl font-black">Báo cáo & Thống kê</h1>
        <p className="text-gray-600">Phân tích hiệu quả kinh doanh của hệ thống</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="border-none shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-orange-100 rounded-2xl flex items-center justify-center">
                <DollarSign className="text-orange-600 w-6 h-6" />
              </div>
              <div>
                <div className="text-sm font-bold text-gray-400">DOANH THU</div>
                <div className="text-2xl font-black">${stats?.todayRevenue?.toLocaleString()}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center">
                <ShoppingBag className="text-green-600 w-6 h-6" />
              </div>
              <div>
                <div className="text-sm font-bold text-gray-400">ĐƠN HÀNG</div>
                <div className="text-2xl font-black">{stats?.todayOrders}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center">
                <Users className="text-blue-600 w-6 h-6" />
              </div>
              <div>
                <div className="text-sm font-bold text-gray-400">KHÁCH HÀNG</div>
                <div className="text-2xl font-black">{stats?.totalCustomers}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-none shadow-sm">
        <CardHeader>
           <CardTitle className="text-lg font-bold">Biểu đồ tăng trưởng</CardTitle>
        </CardHeader>
        <CardContent className="h-64 flex items-center justify-center text-gray-400 border-t border-gray-50">
           Hệ thống đang tích lũy thêm dữ liệu để hiển thị biểu đồ chi tiết...
        </CardContent>
      </Card>
    </div>
  );
}
