import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar
} from "recharts";
import { DollarSign, ShoppingBag, TrendingUp, Loader2, Users, ArrowUpRight, ArrowDownRight, BarChart3 } from "lucide-react";
import api from "../services/api";

export function OwnerReports() {
  const [overview, setOverview] = useState<any>(null);
  const [topProducts, setTopProducts] = useState<any[]>([]);
  const [branchRevenue, setBranchRevenue] = useState<any[]>([]);
  const [monthlyRevenue, setMonthlyRevenue] = useState<any[]>([]);
  const [yearlyRevenue, setYearlyRevenue] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const [overRes, topRes, branchRes, monthRes, yearRes] = await Promise.all([
          api.get("/reports/overview"),
          api.get("/reports/top-products"),
          api.get("/reports/revenue-by-branch"),
          api.get("/reports/monthly-revenue"),
          api.get("/reports/yearly-revenue")
        ]);
        setOverview(overRes.data);
        setTopProducts(topRes.data);
        setBranchRevenue(branchRes.data);
        setMonthlyRevenue(monthRes.data);
        setYearlyRevenue(yearRes.data);
      } catch (err) {
        console.error("Lỗi tải báo cáo", err);
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, []);

  // Xử lý dữ liệu biểu đồ để tránh đường kẻ bị rơi xuống 0 ở các tháng tương lai
  const processedMonthlyRevenue = monthlyRevenue.map((item, index) => {
    const currentMonth = new Date().getMonth() + 1; // 1-12
    const itemMonth = index + 1;

    // Nếu là tháng tương lai và doanh thu bằng 0, chuyển thành null để biểu đồ không vẽ đoạn này
    if (itemMonth > currentMonth && item.revenue === 0) {
        return { ...item, revenue: null };
    }
    return item;
  });

  if (loading) return <div className="flex justify-center p-10 md:p-20"><Loader2 className="animate-spin text-orange-600" /></div>;

  return (
    <div className="p-4 md:p-8 bg-gray-50 min-h-screen text-gray-900 space-y-8">
      <div className="flex flex-col sm:flex-row justify-between sm:items-end gap-4">
        <div>
          <h1 className="text-3xl font-black">Phân tích & Tăng trưởng</h1>
          <p className="text-gray-500 font-medium">Báo cáo lịch sử và hiệu suất kinh doanh dài hạn</p>
        </div>
        <div className="bg-white p-1 rounded-xl shadow-sm border border-gray-100 flex w-fit h-fit">
            <button className="px-4 py-2 bg-orange-600 text-white rounded-lg font-bold text-xs uppercase">Báo cáo tổng hợp</button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
         <StatItem label="Tổng doanh thu" val={`${overview?.totalRevenue?.toLocaleString("vi-VN")}đ`} icon={DollarSign} color="text-orange-600" trend={overview?.revenueTrend} isUp={overview?.isRevenueUp} />
         <StatItem label="Lợi nhuận ròng" val={`${overview?.netProfit?.toLocaleString("vi-VN")}đ`} icon={TrendingUp} color="text-green-600" trend={overview?.profitTrend} isUp={overview?.isProfitUp} />
         <StatItem label="Tổng đơn hàng" val={overview?.totalOrders} icon={ShoppingBag} color="text-blue-600" trend={overview?.orderTrend} isUp={overview?.isOrderUp} />
         <StatItem label="Khách hàng" val={overview?.totalCustomers} icon={Users} color="text-purple-600" trend={overview?.customerTrend} isUp={overview?.isCustomerUp} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Monthly Trend */}
        <Card className="border-none shadow-sm bg-white rounded-[32px] overflow-hidden">
            <CardHeader>
                <CardTitle className="text-xl font-black flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-blue-600" />
                    Xu hướng doanh thu theo tháng
                </CardTitle>
                <CardDescription>Dữ liệu trong năm {new Date().getFullYear()}</CardDescription>
            </CardHeader>
            <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={processedMonthlyRevenue}>
                        <defs>
                            <linearGradient id="colorMonth" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#2563eb" stopOpacity={0.1}/>
                                <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 'bold'}} />
                        <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10}} />
                        <Tooltip />
                        <Area type="monotone" dataKey="revenue" stroke="#2563eb" fill="url(#colorMonth)" strokeWidth={3} connectNulls={false} />
                    </AreaChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>

        {/* Yearly Growth */}
        <Card className="border-none shadow-sm bg-white rounded-[32px] overflow-hidden">
            <CardHeader>
                <CardTitle className="text-xl font-black flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-green-600" />
                    Tăng trưởng qua các năm
                </CardTitle>
                <CardDescription>So sánh doanh thu 5 năm gần nhất</CardDescription>
            </CardHeader>
            <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={yearlyRevenue}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 'bold'}} />
                        <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10}} />
                        <Tooltip />
                        <Bar dataKey="revenue" fill="#16a34a" radius={[10, 10, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         {/* Branch Performance */}
        <Card className="lg:col-span-2 border-none shadow-sm bg-white rounded-[32px]">
          <CardHeader>
            <CardTitle className="text-xl font-black">Xếp hạng cơ sở</CardTitle>
            <CardDescription>Xếp hạng chi nhánh theo tổng doanh thu tích lũy</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={branchRevenue} layout="vertical">
                    <XAxis type="number" hide />
                    <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 'bold'}} width={120} />
                    <Tooltip />
                    <Bar dataKey="revenue" fill="#f97316" radius={[0, 10, 10, 0]} />
                </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Top Products Detailed */}
        <Card className="border-none shadow-sm bg-white rounded-[32px]">
           <CardHeader>
              <CardTitle className="text-xl font-black">Top 5 Món ăn</CardTitle>
              <CardDescription>Hiệu suất bán hàng</CardDescription>
           </CardHeader>
           <CardContent>
              <div className="space-y-6">
                 {topProducts.map((p, idx) => (
                    <div key={idx} className="flex items-center justify-between">
                       <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center font-black text-orange-600 text-xs">{idx + 1}</div>
                          <div>
                             <p className="font-bold text-gray-900 text-sm">{p.name}</p>
                             <p className="text-[10px] text-gray-400 font-bold uppercase">{p.quantity} lượt bán</p>
                          </div>
                       </div>
                       <p className="font-black text-gray-900 text-sm">{p.revenue?.toLocaleString("vi-VN")}đ</p>
                    </div>
                 ))}
              </div>
           </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatItem({ label, val, icon: Icon, color, trend, isUp }: any) {
    return (
        <Card className="border-none shadow-sm rounded-[24px]">
            <CardContent className="pt-6">
                <div className="flex justify-between items-start mb-4">
                    <div className={`w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center ${color}`}>
                        <Icon className="w-6 h-6" />
                    </div>
                    <div className={`flex items-center gap-1 text-[10px] font-black px-2 py-1 rounded-lg ${isUp ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                        {isUp ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                        {trend}
                    </div>
                </div>
                <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">{label}</p>
                    <p className="text-2xl font-black text-gray-900 leading-none">{val}</p>
                </div>
            </CardContent>
        </Card>
    )
}
