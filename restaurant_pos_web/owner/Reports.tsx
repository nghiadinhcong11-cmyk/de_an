import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area
} from "recharts";
import { DollarSign, ShoppingBag, TrendingUp, Loader2 } from "lucide-react";
import api from "../services/api";

export function OwnerReports() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Giả lập dữ liệu 7 ngày gần nhất (Trong thực tế bạn sẽ viết API SQL Group By Date)
    const mockChartData = [
      { date: "20/03", revenue: 450 },
      { date: "21/03", revenue: 520 },
      { date: "22/03", revenue: 380 },
      { date: "23/03", revenue: 610 },
      { date: "24/03", revenue: 550 },
      { date: "25/03", revenue: 700 },
      { date: "26/03", revenue: 850 },
    ];
    setTimeout(() => {
        setData(mockChartData);
        setLoading(false);
    }, 1000);
  }, []);

  if (loading) return <div className="flex justify-center p-20"><Loader2 className="animate-spin text-orange-600" /></div>;

  return (
    <div className="p-8 bg-gray-50 min-h-screen text-gray-900">
      <div className="mb-8">
        <h1 className="text-2xl font-black">Phân tích kinh doanh</h1>
        <p className="text-gray-600">Theo dõi doanh thu và mức độ tăng trưởng</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
         <StatItem label="Doanh thu 7 ngày" val="$4,060" icon={DollarSign} color="text-orange-600" />
         <StatItem label="Tổng đơn hàng" val="142" icon={ShoppingBag} color="text-blue-600" />
         <StatItem label="Tăng trưởng" val="+12.5%" icon={TrendingUp} color="text-green-600" />
      </div>

      <Card className="border-none shadow-sm overflow-hidden bg-white">
        <CardHeader className="pb-0">
          <CardTitle className="text-lg font-bold">Biểu đồ doanh thu tuần này</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ea580c" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#ea580c" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 'bold'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 'bold'}} />
                <Tooltip
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#ea580c" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function StatItem({ label, val, icon: Icon, color }: any) {
    return (
        <Card className="border-none shadow-sm">
            <CardContent className="pt-6 flex items-center gap-4">
                <div className={`w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center ${color}`}>
                    <Icon className="w-6 h-6" />
                </div>
                <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{label}</p>
                    <p className="text-2xl font-black text-gray-900">{val}</p>
                </div>
            </CardContent>
        </Card>
    )
}
