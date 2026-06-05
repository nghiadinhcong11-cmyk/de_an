    import { useState, useEffect } from "react";
    import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
    import {
      XAxis,
      YAxis,
      CartesianGrid,
      Tooltip,
      ResponsiveContainer,
      AreaChart,
      Area,
      BarChart,
      Bar,
      Cell
    } from "recharts";
    import { DollarSign, ShoppingBag, TrendingUp, Loader2, Users, ArrowUpRight, ArrowDownRight, Package } from "lucide-react";
    import api from "../services/api";

    export function OwnerReports() {
      const [revenueData, setRevenueData] = useState<any[]>([]);
      const [overview, setOverview] = useState<any>(null);
      const [topProducts, setTopProducts] = useState<any[]>([]);
      const [loading, setLoading] = useState(true);

      useEffect(() => {
        const fetchReports = async () => {
          try {
            const [revRes, overRes, topRes] = await Promise.all([
              api.get("/reports/revenue-last-7-days"),
              api.get("/reports/overview"),
              api.get("/reports/top-products")
            ]);
            setRevenueData(revRes.data);
            setOverview(overRes.data);
            setTopProducts(topRes.data);
          } catch (err) {
            console.error("Lỗi tải báo cáo", err);
          } finally {
            setLoading(false);
          }
        };
        fetchReports();
      }, []);

      if (loading) return <div className="flex justify-center p-20"><Loader2 className="animate-spin text-orange-600" /></div>;

      return (
        <div className="p-8 bg-gray-50 min-h-screen text-gray-900">
          <div className="mb-8 flex justify-between items-end">
            <div>
              <h1 className="text-3xl font-black">Phân tích kinh doanh</h1>
              <p className="text-gray-500 font-medium">Dữ liệu kinh doanh thời gian thực từ các chi nhánh</p>
            </div>
            <div className="bg-white p-1 rounded-xl shadow-sm border border-gray-100 hidden md:flex">
                <button className="px-4 py-2 bg-orange-600 text-white rounded-lg font-bold text-xs">7 NGÀY</button>
                <button className="px-4 py-2 text-gray-400 font-bold text-xs hover:text-gray-900">30 NGÀY</button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
             <StatItem
                label="Tổng doanh thu"
                val={`$${overview?.totalRevenue?.toLocaleString()}`}
                icon={DollarSign}
                color="text-orange-600"
                trend="+12%"
                isUp={true}
             />
             <StatItem
                label="Tổng đơn hàng"
                val={overview?.totalOrders}
                icon={ShoppingBag}
                color="text-blue-600"
                trend="+5.4%"
                isUp={true}
             />
             <StatItem
                label="Lợi nhuận ròng"
                val={`$${overview?.netProfit?.toLocaleString()}`}
                icon={TrendingUp}
                color="text-green-600"
                trend="+8.2%"
                isUp={true}
             />
             <StatItem
                label="Khách hàng"
                val={overview?.totalCustomers}
                icon={Users}
                color="text-purple-600"
                trend="-2%"
                isUp={false}
             />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Doanh thu biểu đồ */}
            <Card className="lg:col-span-2 border-none shadow-sm overflow-hidden bg-white rounded-[32px]">
              <CardHeader className="pb-0 pt-8 px-8">
                <CardTitle className="text-xl font-black flex items-center gap-2">
                    Biểu đồ doanh thu tuần này
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8 pt-4">
                <div className="h-80 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={revenueData}>
                      <defs>
                        <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#ea580c" stopOpacity={0.2}/>
                          <stop offset="95%"    stopColor="#ea580c" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis
                        dataKey="date"
                        axisLine={false}
                        tickLine={false}
                        tick={{fontSize: 10, fontWeight: 'bold', fill: '#94a3b8'}}
                        dy={10}
                      />
                      <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{fontSize: 10, fontWeight: 'bold', fill: '#94a3b8'}}
                      />
                      <Tooltip
                          contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', padding: '12px' }}
                          itemStyle={{ fontWeight: 'black', color: '#ea580c' }}
                      />
                      <Area
                        type="monotone"
                        dataKey="revenue"
                        stroke="#ea580c"
                        strokeWidth={4}
                        fillOpacity={1}
                        fill="url(#colorRev)"
                        animationDuration={1500}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Top Products */}
            <Card className="border-none shadow-sm bg-white rounded-[32px]">
               <CardHeader className="pt-8 px-8">
                  <CardTitle className="text-xl font-black">Món bán chạy</CardTitle>
               </CardHeader>
               <CardContent className="px-8 pb-8">
                  <div className="space-y-6">
                     {topProducts.map((p, idx) => (
                        <div key={idx} className="flex items-center justify-between">
                           <div className="flex items-center gap-4">
                              <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center font-black text-gray-400 text-xs">
                                 {idx + 1}
                              </div>
                              <div>
                                 <p className="font-bold text-gray-900 text-sm">{p.name}</p>
                                 <p className="text-[10px] text-gray-400 font-bold uppercase">{p.quantity} lượt bán</p>
                              </div>
                           </div>
                           <p className="font-black text-orange-600 text-sm">${p.revenue?.toLocaleString()}</p>
                        </div>
                     ))}
                     {topProducts.length === 0 && (
                         <div className="text-center py-10">
                            <Package className="mx-auto text-gray-200 w-12 h-12 mb-2" />
                            <p className="text-gray-400 font-bold text-xs">Chưa có dữ liệu bán hàng</p>
                         </div>
                     )}
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

