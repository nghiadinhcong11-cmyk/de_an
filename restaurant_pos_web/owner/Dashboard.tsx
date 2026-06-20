import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { DollarSign, ShoppingBag, Zap, Loader2, ArrowRight, Clock, TrendingUp, Users, Star, BarChart3, Calendar, MapPin, Package, Award, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, Legend } from "recharts";
import { Link } from "react-router-dom";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Button } from "../components/ui/button";
import api from "../services/api";

const COLORS = ['#f97316', '#2563eb', '#16a34a', '#7c3aed', '#db2777', '#ca8a04'];

export function OwnerDashboard() {
  const [timeRange, setTimeRange] = useState("month"); // today, week, month
  const [loading, setLoading] = useState(true);

  // Data States
  const [stats, setStats] = useState<any>(null);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [revenueChartData, setRevenueData] = useState<any[]>([]);
  const [topProducts, setTopProducts] = useState<any[]>([]);
  const [branchPerformance, setBranchPerformance] = useState<any[]>([]);
  const [hourlyOrders, setHourlyOrders] = useState<any[]>([]);
  const [selectedDay, setSelectedDay] = useState<number>(new Date().getDay()); // 0-6
  const [staffPerformance, setStaffPerformance] = useState<any[]>([]);

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

      const [statsRes, ordersRes, revRes, topRes, branchRes, hourRes, staffRes] = await Promise.all([
        api.get(current.summary),
        api.get("/orders"),
        api.get(current.revenue),
        api.get("/reports/top-products"),
        api.get("/reports/revenue-by-branch"),
        api.get(`/reports/orders-by-hour?dayOfWeek=${selectedDay}`),
        api.get("/reports/staff-performance")
      ]);

      setStats(statsRes.data);
      setRecentOrders(ordersRes.data.slice(0, 6));

      // Process revenue data to handle future months
      const rawRev = revRes.data;
      const currentMonth = new Date().getMonth(); // 0-11
      const processedRev = rawRev.map((item: any, idx: number) => {
          if (range === 'month' && idx > currentMonth) {
              return { ...item, revenue: 0 };
          }
          return item;
      });

      setRevenueData(processedRev);
      setTopProducts(topRes.data.slice(0, 5));
      setBranchPerformance(branchRes.data);
      setHourlyOrders(hourRes.data);
      setStaffPerformance(staffRes.data);
    } catch (err) {
      console.error("Lỗi tải dữ liệu báo cáo", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData(timeRange);
  }, [timeRange, selectedDay]);

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
              <BarChart data={revenueChartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis
                    dataKey={timeRange === 'month' ? 'month' : 'date'}
                    axisLine={false}
                    tickLine={false}
                    tick={{fontSize: 10, fontWeight: 'bold', fill: '#94a3b8'}}
                />
                <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{fontSize: 10, fill: '#94a3b8'}}
                    tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`}
                />
                <Tooltip
                    cursor={{fill: '#f8fafc'}}
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
                    formatter={(value: any) => [`${value.toLocaleString("vi-VN")}đ`, 'Doanh thu']}
                />
                <Bar dataKey="revenue" fill="#f97316" radius={[6, 6, 0, 0]} barSize={timeRange === 'today' ? 40 : 20} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Branch Ranking */}
        <Card className="border-none shadow-sm bg-white rounded-[40px] overflow-hidden">
            <CardHeader className="p-8 pb-4">
                <CardTitle className="text-xl font-black uppercase tracking-tight">Hiệu suất cơ sở</CardTitle>
                <CardDescription className="font-bold text-gray-400 uppercase text-[10px] tracking-widest mt-1">Revenue contribution</CardDescription>
            </CardHeader>
            <CardContent className="p-0 pb-8 h-80">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={branchPerformance}
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="revenue"
                            nameKey="name"
                            label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
                        >
                            {branchPerformance.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip
                            contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
                            formatter={(value: any, name: any) => {
                                const total = branchPerformance.reduce((acc, curr) => acc + curr.revenue, 0) || 1;
                                const percent = ((value / total) * 100).toFixed(1);
                                return [`${value.toLocaleString("vi-VN")}đ (${percent}%)`, name];
                            }}
                        />
                        <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase' }} />
                    </PieChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
        {/* Hourly Orders Chart */}
        <Card className="border-none shadow-sm bg-white rounded-[40px] overflow-hidden">
            <CardHeader className="p-8 pb-4 flex flex-row items-center justify-between">
                <div>
                    <CardTitle className="text-xl font-black uppercase tracking-tight flex items-center gap-2">
                        <Clock className="w-5 h-5 text-blue-600" />
                        Lượng đơn theo giờ
                    </CardTitle>
                    <CardDescription className="font-bold text-gray-400 uppercase text-[10px] tracking-widest mt-1">Phân tích mật độ đơn hàng trong ngày</CardDescription>
                </div>
                <Select value={selectedDay.toString()} onValueChange={(val) => setSelectedDay(parseInt(val))}>
                    <SelectTrigger className="w-[140px] h-9 border border-gray-100 rounded-xl text-[10px] font-black uppercase shadow-none focus:ring-0">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-none shadow-xl">
                        <SelectItem value="1">Thứ Hai</SelectItem>
                        <SelectItem value="2">Thứ Ba</SelectItem>
                        <SelectItem value="3">Thứ Tư</SelectItem>
                        <SelectItem value="4">Thứ Năm</SelectItem>
                        <SelectItem value="5">Thứ Sáu</SelectItem>
                        <SelectItem value="6">Thứ Bảy</SelectItem>
                        <SelectItem value="0">Chủ Nhật</SelectItem>
                    </SelectContent>
                </Select>
            </CardHeader>
            <CardContent className="p-8 pt-4 h-80">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={hourlyOrders}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="hour" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 'bold'}} />
                        <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10}} />
                        <Tooltip
                            cursor={{fill: '#f8fafc'}}
                            contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
                            formatter={(value: any) => [`${value} đơn`, 'Số lượng']}
                        />
                        <Bar dataKey="orderCount" fill="#2563eb" radius={[6, 6, 0, 0]} />
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
         {/* Staff Performance Ranking */}
         <Card className="lg:col-span-2 border-none shadow-sm bg-white rounded-[40px] overflow-hidden">
            <CardHeader className="p-8 border-b border-gray-50 flex flex-row items-center justify-between">
                <div>
                    <CardTitle className="text-xl font-black uppercase tracking-tight">Xếp hạng nhân viên</CardTitle>
                    <CardDescription className="font-bold text-gray-400 uppercase text-[10px] tracking-widest mt-1">Dựa trên đánh giá của khách hàng</CardDescription>
                </div>
                <div className="flex items-center gap-2 bg-green-50 text-green-600 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest">
                    <Award className="w-3 h-3" /> Bảng vinh danh
                </div>
            </CardHeader>
            <CardContent className="p-0">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50/50 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                            <tr>
                                <th className="px-8 py-4">Nhân viên</th>
                                <th className="px-6 py-4">Số lượt đánh giá</th>
                                <th className="px-6 py-4">Điểm trung bình</th>
                                <th className="px-6 py-4">Performance Score</th>
                                <th className="px-8 py-4 text-right">Trạng thái</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {staffPerformance.map((staff: any) => (
                                <tr key={staff.staffId} className="hover:bg-gray-50/50 transition-colors group">
                                    <td className="px-8 py-5">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center font-black text-xs">
                                                {staff.staffName.charAt(0)}
                                            </div>
                                            <div className="font-black text-gray-900 leading-none uppercase text-xs">{staff.staffName}</div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="text-xs font-bold text-gray-500">{staff.feedbackCount} lượt</div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="flex items-center gap-1.5">
                                            <Star className="w-3.5 h-3.5 fill-orange-400 text-orange-400" />
                                            <span className="text-sm font-black text-gray-900">{staff.averageRating.toFixed(1)}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="w-full max-w-[100px] h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full rounded-full ${
                                                    staff.performanceScore >= 80 ? 'bg-green-500' :
                                                    staff.performanceScore >= 60 ? 'bg-orange-500' : 'bg-red-500'
                                                }`}
                                                style={{ width: `${staff.performanceScore}%` }}
                                            ></div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5 text-right">
                                        <div className={`inline-flex px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-tighter ${
                                            staff.performanceScore >= 80 ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
                                        }`}>
                                            {staff.performanceScore >= 80 ? 'Thưởng' : staff.performanceScore < 40 ? 'Phạt' : 'Bình thường'}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </CardContent>
         </Card>

         {/* Review Summary Stats */}
         <Card className="border-none shadow-sm bg-white rounded-[40px] overflow-hidden">
            <CardHeader className="p-8">
                <CardTitle className="text-xl font-black uppercase tracking-tight">Thống kê sao</CardTitle>
                <CardDescription className="font-bold text-gray-400 uppercase text-[10px] tracking-widest mt-1">Chất lượng phục vụ tổng thể</CardDescription>
            </CardHeader>
            <CardContent className="px-8 pb-8 space-y-6">
                {[5, 4, 3, 2, 1].map(star => {
                    const count = staffPerformance.reduce((acc: number, curr: any) => {
                        if (star === 5) return acc + curr.fiveStarCount;
                        if (star === 1) return acc + curr.oneStarCount;
                        return acc;
                    }, 0);
                    const total = staffPerformance.reduce((acc: number, curr: any) => acc + curr.feedbackCount, 0) || 1;
                    const percent = (count / total) * 100;

                    return (
                        <div key={star} className="space-y-2">
                            <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                                <span className="flex items-center gap-1.5"><Star className="w-3 h-3 fill-orange-400 text-orange-400" /> {star} SAO</span>
                                <span className="text-gray-400">{Math.round(percent)}%</span>
                            </div>
                            <div className="h-1.5 bg-gray-50 rounded-full overflow-hidden">
                                <div className="h-full bg-orange-500 rounded-full" style={{ width: `${percent}%` }}></div>
                            </div>
                        </div>
                    );
                })}
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
