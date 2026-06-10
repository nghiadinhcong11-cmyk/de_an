import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Avatar, AvatarFallback } from "../components/ui/avatar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Search, Loader2, Award, Users, TrendingUp, Star, Filter, ArrowUpRight } from "lucide-react";
import api from "../services/api";

const getRank = (points: number) => {
    if (points >= 2000) return { label: "Hạng Vàng (VIP)", color: "bg-yellow-50 text-yellow-600 border-yellow-100", icon: <Star className="w-3 h-3 fill-current" /> };
    if (points >= 500) return { label: "Hạng Bạc", color: "bg-gray-100 text-gray-600 border-gray-200", icon: <Award className="w-3 h-3" /> };
    return { label: "Hạng Đồng", color: "bg-orange-50 text-orange-600 border-orange-100", icon: <Award className="w-3 h-3" /> };
};

export function OwnerCustomers() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [rankFilter, setRankFilter] = useState("all");

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const res = await api.get("/customers");
        setCustomers(res.data);
      } catch (err) {
        console.error("Lỗi tải khách hàng");
      } finally {
        setLoading(false);
      }
    };
    fetchCustomers();
  }, []);

  const filteredCustomers = customers.filter((c) => {
    const matchesSearch = c.fullName.toLowerCase().includes(searchTerm.toLowerCase()) || c.phoneNumber.includes(searchTerm);
    const rank = getRank(c.points).label;
    const matchesRank = rankFilter === "all" ||
                       (rankFilter === "gold" && c.points >= 2000) ||
                       (rankFilter === "silver" && c.points >= 500 && c.points < 2000) ||
                       (rankFilter === "bronze" && c.points < 500);
    return matchesSearch && matchesRank;
  });

  // Thống kê nhanh
  const stats = {
      total: customers.length,
      vips: customers.filter(c => c.points >= 2000).length,
      totalRevenue: customers.reduce((sum, c) => sum + (c.totalSpent || 0), 0),
      totalPoints: customers.reduce((sum, c) => sum + (c.points || 0), 0)
  };

  return (
    <div className="p-4 md:p-8 bg-gray-50 min-h-screen text-gray-900">
      <div className="mb-8">
        <h1 className="text-2xl font-black text-gray-900 uppercase tracking-tight">Trung tâm khách hàng</h1>
        <p className="text-gray-500 mt-1">Phân tích hành vi và chăm sóc khách hàng thân thiết</p>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard label="TỔNG KHÁCH HÀNG" val={stats.total} icon={Users} color="text-blue-600" />
          <StatCard label="KHÁCH VIP (GOLD)" val={stats.vips} icon={Star} color="text-yellow-500" />
          <StatCard label="DOANH THU TỪ KHÁCH" val={`${stats.totalRevenue.toLocaleString("vi-VN")}đ`} icon={TrendingUp} color="text-green-600" />
          <StatCard label="ĐIỂM ĐANG LƯU HÀNH" val={stats.totalPoints.toLocaleString("vi-VN")} icon={Award} color="text-orange-600" />
      </div>

      <Card className="border-none shadow-sm overflow-hidden bg-white rounded-[32px]">
        <CardHeader className="bg-white border-b border-gray-50 p-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="relative max-w-md w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Tìm tên hoặc số điện thoại..."
              value={searchTerm}
              onChange={(e: any) => setSearchTerm(e.target.value)}
              className="pl-10 h-12 bg-gray-50 border-none rounded-xl font-medium"
            />
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
              <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-widest mr-2">
                  <Filter className="w-3 h-3" /> Lọc theo
              </div>
              <Select value={rankFilter} onValueChange={setRankFilter}>
                  <SelectTrigger className="w-48 h-12 rounded-xl bg-gray-50 border-none font-bold">
                      <SelectValue placeholder="Tất cả hạng" />
                  </SelectTrigger>
                  <SelectContent>
                      <SelectItem value="all">Tất cả hạng</SelectItem>
                      <SelectItem value="gold" className="text-yellow-600 font-bold">Hạng Vàng (VIP)</SelectItem>
                      <SelectItem value="silver" className="text-gray-600 font-bold">Hạng Bạc</SelectItem>
                      <SelectItem value="bronze" className="text-orange-600 font-bold">Hạng Đồng</SelectItem>
                  </SelectContent>
              </Select>
          </div>
        </CardHeader>

        <CardContent className="p-0 overflow-x-auto">
          {loading ? (
            <div className="py-20 flex justify-center"><Loader2 className="animate-spin text-orange-600" /></div>
          ) : (
            <Table>
              <TableHeader className="bg-gray-50/50">
                <TableRow>
                  <TableHead className="font-bold px-6">Khách hàng</TableHead>
                  <TableHead className="font-bold text-center">Phân loại</TableHead>
                  <TableHead className="font-bold">Liên hệ</TableHead>
                  <TableHead className="font-bold text-right">Điểm tích lũy</TableHead>
                  <TableHead className="font-bold text-right px-6">Tổng chi tiêu</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCustomers.map((customer) => {
                  const rank = getRank(customer.points);
                  return (
                    <TableRow key={customer.id} className="hover:bg-gray-50/50 transition-colors">
                      <TableCell className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <Avatar className="w-10 h-10 border-2 border-white shadow-sm">
                            {customer.avatarUrl ? (
                              <img src={customer.avatarUrl} alt={customer.fullName} className="aspect-square h-full w-full object-cover" />
                            ) : (
                              <AvatarFallback className="bg-orange-100 text-orange-600 font-black">
                                {customer.fullName.charAt(0)}
                              </AvatarFallback>
                            )}
                          </Avatar>
                          <div>
                            <div className="font-black text-gray-900 leading-none">{customer.fullName}</div>
                            <div className="text-[10px] text-gray-400 font-bold uppercase mt-1">ID: #{customer.id.substring(0, 6)}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                          <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-[10px] font-black uppercase ${rank.color}`}>
                              {rank.icon}
                              {rank.label}
                          </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div className="font-bold text-gray-700">{customer.phoneNumber}</div>
                          <div className="text-gray-400 text-xs">{customer.email || "Chưa cập nhật email"}</div>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                          <span className="font-black text-orange-600 text-lg">{customer.points.toLocaleString("vi-VN")}</span>
                          <span className="text-[10px] font-bold text-gray-400 ml-1 uppercase">điểm</span>
                      </TableCell>
                      <TableCell className="text-right px-6">
                        <div className="font-black text-gray-900 text-lg">{(customer.totalSpent || 0).toLocaleString("vi-VN")}đ</div>
                        {customer.totalSpent > 5000000 && (
                            <div className="flex items-center justify-end gap-1 text-green-500 text-[9px] font-bold">
                                <ArrowUpRight className="w-3 h-3" /> CHI TIÊU CAO
                            </div>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
          {!loading && filteredCustomers.length === 0 && (
              <div className="text-center py-20 text-gray-300">
                  <Users className="w-16 h-16 mx-auto mb-4 opacity-20" />
                  <p className="font-black uppercase tracking-widest text-xs">Không tìm thấy khách hàng nào</p>
              </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({ label, val, icon: Icon, color }: any) {
  return (
    <Card className="border-none shadow-sm bg-white rounded-[24px] overflow-hidden group hover:shadow-md transition-all">
      <CardContent className="p-6 flex items-center gap-5">
        <div className={`w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center transition-transform group-hover:scale-110 ${color}`}>
            <Icon className="w-7 h-7" />
        </div>
        <div>
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{label}</p>
          <p className="text-2xl font-black text-gray-900">{val}</p>
        </div>
      </CardContent>
    </Card>
  );
}
