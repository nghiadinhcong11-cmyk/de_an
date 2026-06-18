import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { DollarSign, ShoppingBag, Zap, Loader2, ArrowRight, Clock, TrendingUp, Users, Star, BarChart3, Calendar, MapPin, Package, Award, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import { Link } from "react-router-dom";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Button } from "../components/ui/button";
import api from "../services/api";

export function OwnerDashboard() {
  const [timeRange, setTimeRange] = useState("month"); // today, week, month
  const [loading, setLoading] = useState(true);

  // Data States
  const [stats, setStats] = useState<any>(null);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [revenueChartData, setRevenueData] = useState<any[]>([]);
  const [topProducts, setTopProducts] = useState<any[]>([]);
  const [branchPerformance, setBranchPerformance] = useState<any[]>([]);
  const [yearlyRevenue, setYearlyRevenue] = useState<any[]>([]);

  const fetchDashboardData = async (range: string) => {
    try {
      setLoading(true);

      // Dynamic endpoints based on range
      const endpoints = {
        today: {
            summary: "/Reports/today-shift-summary",
            revenue: "/Reports/revenue-last-7-days",
        },
        week: {
            summary: "/reports/overview",
            revenue: "/Reports/revenue-last-7-days",
        },
        month: {
            summary: "/reports/overview",
            revenue: "/reports/monthly-revenue",
        }
      };

      const current = (endpoints as any)[range] || endpoints.today;

      const [statsRes, ordersRes, revRes, topRes, branchRes, yearRes] = await Promise.all([
        api.get(current.summary),
        api.get("/orders"),
        api.get(current.revenue),
        api.get("/reports/top-products"),
        api.get("/reports/revenue-by-branch"),
        api.get("/reports/yearly-revenue")
      ]);

      setStats(statsRes.data);
      setRecentOrders(ordersRes.data.slice(0, 6));
      setRevenueData(revRes.data);
      setTopProducts(topRes.data.slice(0, 5));
      setBranchPerformance(branchRes.data);
      setYearlyRevenue(yearRes.data);
    } catch (err) {
      console.error("Lỗi tải dữ liệu báo cáo", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData(timeRange);
  }, [timeRange]);

  if (loading && !stats) return <div className="flex justify-center p-20"><Loader2 className="animate-spin text-orange-600 w-12 h-12" /></div>;

  return (
    <div className="p-4 md:p-8 bg-gray-50 min-h-screen text-gray-900 pb-24">
      {/* Header with Filter */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-10 gap-6">
        <div>
          <h1 className="text-3xl font-black tracking-tight uppercase">Báo cáo & Phân tích</h1>
          <p className="text-gray-500 font-medium mt-1">Theo dõi hiệu suất kinh doanh thời gian thực</p>
        </div>

        <div className="flex items-center gap-3">
            <div className="flex items-center gap-3 bg-white p-2 rounded-2xl shadow-sm border border-gray-100">
                <div className="flex items-center gap-2 px-3 text-xs font-black text-gray-400 uppercase tracking-widest border-r border-gray-100 mr-2">
                    <Calendar className="w-4 h-4" /> Thời gian
                </div>
                <Select value={timeRange} onValueChange={setTimeRange}>
                    <SelectTrigger className="w-[180px] h-10 border-none bg-transparent font-black uppercase text-xs shadow-none focus:ring-0">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-none shadow-xl">
                        <SelectItem value="today">Hôm nay (Ca làm)</SelectItem>
                        <SelectItem value="week">7 ngày gần nhất</SelectItem>
                        <SelectItem value="month">Trong tháng này</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            <Button className="h-14 px-6 bg-orange-600 hover:bg-orange-700 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-orange-200 transition-all hidden sm:flex">
                <BarChart3 className="w-4 h-4 mr-2" /> Xuất báo cáo
            </Button>
        </div>
      </div>

      {/* KPI Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <KpiCard
            label="TỔNG DOANH THU"
            val={`${(stats?.totalRevenue || 0).toLocaleString("vi-VN")}đ`}
            icon={DollarSign}
            color="text-orange-600"
            trend={stats?.revenueTrend || "+12.5%"}
            isUp={stats?.isRevenueUp !== false}
        />
        <KpiCard
            label="LỢI NHUẬN RÒNG"
            val={`${(stats?.netProfit || (stats?.totalRevenue * 0.4) || 0).toLocaleString("vi-VN")}đ`}
            icon={TrendingUp}
            color="text-green-600"
            trend={stats?.profitTrend || "+8.2%"}
            isUp={stats?.isProfitUp !== false}
        />
        <KpiCard
            label="LƯỢNG ĐƠN HÀNG"
            val={stats?.totalOrders || 0}
            icon={ShoppingBag}
            color="text-blue-600"
            trend={stats?.orderTrend || "+3.2%"}
            isUp={stats?.isOrderUp !== false}
        />
        <KpiCard
            label="KHÁCH HÀNG"
            val={stats?.totalCustomers || "42"}
            icon={Users}
            color="text-purple-600"
            trend={stats?.customerTrend || "+18%"}
            isUp={stats?.isCustomerUp !== false}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
        {/* Main Revenue Chart */}
        <Card className="lg:col-span-2 border-none shadow-sm bg-white rounded-[40px] overflow-hidden">
          <CardHeader className="p-8 pb-0">
            <div className="flex justify-between items-start">
                <div>
                    <CardTitle className="text-xl font-black uppercase tracking-tight">Biểu đồ doanh thu</CardTitle>
                    <CardDescription className="font-bold text-gray-400 uppercase text-[10px] tracking-widest mt-1">Revenue Performance Analytics</CardDescription>
                </div>
                <div className="bg-orange-50 text-orange-600 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest">
                    Live Updates
                </div>
            </div>
          </CardHeader>
          <CardContent className="p-8 h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueChartData}>
                <defs>
                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f97316" stopOpacity={0.15}/>
                        <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                    </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis
                    dataKey={timeRange === 'month' ? 'month' : 'date'}
                    axisLine={false}
                    tickLine={false}
                    tick={{fontSize: 10, fontWeight: 'bold', fill: '#94a3b8'}}
                    tickFormatter={(value) => {
                        if (timeRange === 'month') return value;
                        return value; // value is already formatted like "12/06" from backend
                    }}
                />
                <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{fontSize: 10, fill: '#94a3b8'}}
                    tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`}
                />
                <Tooltip
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#ea580c" fill="url(#colorRev)" strokeWidth={4} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Branch Ranking */}
        <Card className="border-none shadow-sm bg-white rounded-[40px] overflow-hidden">
            <CardHeader className="p-8 pb-4">
                <CardTitle className="text-xl font-black uppercase tracking-tight">Hiệu suất cơ sở</CardTitle>
                <CardDescription className="font-bold text-gray-400 uppercase text-[10px] tracking-widest mt-1">Ranking by revenue</CardDescription>
            </CardHeader>
            <CardContent className="px-8 pb-8">
                <div className="space-y-6">
                    {branchPerformance.slice(0, 5).map((b, idx) => (
                        <div key={b.id || idx} className="space-y-2">
                            <div className="flex justify-between items-end">
                                <span className="text-sm font-black text-gray-900 uppercase">{b.name}</span>
                                <span className="text-xs font-bold text-orange-600">{b.revenue?.toLocaleString("vi-VN")}đ</span>
                            </div>
                            <div className="h-2 bg-gray-50 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-orange-500 rounded-full transition-all duration-1000"
                                    style={{ width: `${Math.min(100, (b.revenue / (branchPerformance[0]?.revenue || 1)) * 100)}%` }}
                                ></div>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
        {/* Yearly Growth */}
        <Card className="border-none shadow-sm bg-white rounded-[40px] overflow-hidden">
            <CardHeader className="p-8">
                <CardTitle className="text-xl font-black uppercase tracking-tight flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-green-600" />
                    Tăng trưởng qua các năm
                </CardTitle>
                <CardDescription className="font-bold text-gray-400 uppercase text-[10px] tracking-widest mt-1">So sánh doanh thu 5 năm gần nhất</CardDescription>
            </CardHeader>
            <CardContent className="p-8 h-80">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={yearlyRevenue}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 'bold'}} />
                        <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10}} />
                        <Tooltip
                            contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
                        />
                        <Bar dataKey="revenue" fill="#16a34a" radius={[10, 10, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>

        {/* Top Products */}
        <Card className="border-none shadow-sm bg-white rounded-[40px] overflow-hidden">
            <CardHeader className="p-8">
                <CardTitle className="text-xl font-black uppercase tracking-tight">Best Sellers</CardTitle>
                <CardDescription className="font-bold text-gray-400 uppercase text-[10px] tracking-widest mt-1">Top performing products</CardDescription>
            </CardHeader>
            <CardContent className="px-8 pb-8">
                <div className="space-y-6">
                    {topProducts.map((p, idx) => (
                        <div key={idx} className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-orange-50 rounded-2xl flex items-center justify-center font-black text-orange-600 text-xs">
                                    {idx + 1}
                                </div>
                                <div>
                                    <p className="font-black text-gray-900 text-sm leading-none uppercase">{p.name}</p>
                                    <p className="text-[10px] text-gray-400 font-bold uppercase mt-1.5">{p.quantity} lượt bán</p>
                                </div>
                            </div>
                            <p className="font-black text-gray-900 text-xs">{p.revenue?.toLocaleString("vi-VN")}đ</p>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
      </div>

      {/* Recent Orders Table */}
      <Card className="border-none shadow-sm bg-white rounded-[40px] overflow-hidden">
        <CardHeader className="p-8 border-b border-gray-50 flex flex-row items-center justify-between">
          <div>
              <CardTitle className="text-xl font-black uppercase tracking-tight">Hoạt động tại bàn</CardTitle>
              <CardDescription className="font-bold text-gray-400 uppercase text-[10px] tracking-widest mt-1">Real-time status</CardDescription>
          </div>
          <Link to="/owner/orders">
              <Button variant="ghost" className="text-orange-600 font-black text-xs uppercase tracking-widest hover:bg-orange-50 rounded-xl">Chi tiết <ArrowRight className="ml-2 w-4 h-4" /></Button>
          </Link>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
              <table className="w-full text-left">
                  <thead className="bg-gray-50/50 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                      <tr>
                          <th className="px-8 py-4">Bàn & Cơ sở</th>
                          <th className="px-6 py-4">Trạng thái</th>
                          <th className="px-6 py-4">Thời gian</th>
                          <th className="px-8 py-4 text-right">Tổng tiền</th>
                      </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                      {recentOrders.map((order) => (
                          <tr key={order.id} className="hover:bg-gray-50/50 transition-colors group">
                              <td className="px-8 py-5">
                                  <div className="font-black text-gray-900 leading-none">Bàn {order.tableNumber}</div>
                                  <div className="text-[10px] text-gray-400 font-bold uppercase mt-1.5 flex items-center gap-1.5">
                                      <MapPin className="w-3 h-3 text-orange-500" /> {order.branchName}
                                  </div>
                              </td>
                              <td className="px-6 py-5">
                                  <div className={`inline-flex px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-tighter ${
                                      order.status === 'Completed' ? 'bg-green-50 text-green-600' : 'bg-orange-50 text-orange-600'
                                  }`}>
                                      {order.status}
                                  </div>
                              </td>
                              <td className="px-6 py-5">
                                  <div className="flex items-center gap-2 text-xs font-bold text-gray-500">
                                      <Clock className="w-3.5 h-3.5" />
                                      {new Date(order.createdAtUtc).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                  </div>
                              </td>
                              <td className="px-8 py-5 text-right font-black text-gray-900 group-hover:text-orange-600 transition-colors">
                                  {order.totalAmount.toLocaleString("vi-VN")}đ
                              </td>
                          </tr>
                      ))}
                  </tbody>
              </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function KpiCard({ label, val, icon: Icon, color, trend, isUp }: any) {
    return (
        <Card className="border-none shadow-sm rounded-[32px] bg-white group hover:shadow-md transition-all duration-500 border border-transparent hover:border-orange-100">
            <CardContent className="p-6">
                <div className="flex justify-between items-start mb-6">
                    <div className={`w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center transition-transform group-hover:scale-110 duration-500 ${color}`}>
                        <Icon className="w-7 h-7" />
                    </div>
                    <div className={`flex items-center gap-1 text-[10px] font-black px-2.5 py-1.5 rounded-xl ${isUp ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                        {isUp ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                        {trend}
                    </div>
                </div>
                <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">{label}</p>
                    <p className="text-3xl font-black text-gray-900 tracking-tighter leading-none">{val}</p>
                </div>
            </CardContent>
        </Card>
    );
}
