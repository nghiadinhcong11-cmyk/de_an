import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Search, Star, Users, Award, TrendingUp, History, Loader2 } from "lucide-react";
import api from "../services/api";

const getLevel = (points: number) => {
  if (points >= 2000) return { label: "Gold", color: "bg-yellow-100 text-yellow-700" };
  if (points >= 500) return { label: "Silver", color: "bg-gray-200 text-gray-700" };
  return { label: "Bronze", color: "bg-orange-100 text-orange-700" };
};

export function OwnerLoyalty() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchData = async () => {
    try {
      const res = await api.get("/customers");
      setCustomers(res.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const filtered = customers.filter(c =>
    c.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.phoneNumber.includes(searchTerm)
  );

  if (loading) return <div className="p-20 flex justify-center"><Loader2 className="animate-spin text-orange-600" /></div>;

  return (
    <div className="p-4 md:p-8 space-y-8 bg-gray-50 min-h-screen">
      <div>
        <h1 className="text-2xl font-black text-gray-900">Quản lý Thành viên & Tích điểm</h1>
        <p className="text-gray-500 text-sm">Theo dõi lòng trung thành và hạng thẻ khách hàng</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard label="TỔNG THÀNH VIÊN" val={customers.length} icon={Users} color="text-blue-600" />
        <StatCard label="TỔNG ĐIỂM ĐÃ CẤP" val={customers.reduce((s, c) => s + c.points, 0).toLocaleString("vi-VN")} icon={Award} color="text-orange-600" />
        <StatCard label="KHÁCH VIP (GOLD)" val={customers.filter(c => c.points >= 2000).length} icon={Star} color="text-yellow-600" />
        <StatCard label="TỔNG CHI TIÊU NHÓM" val={`${customers.reduce((s, c) => s + (c.totalSpent || 0), 0).toLocaleString("vi-VN")}đ`} icon={TrendingUp} color="text-green-600" />
      </div>

      <Card className="border-none shadow-sm overflow-hidden">
        <CardHeader className="border-b border-gray-50 flex flex-col sm:flex-row items-center justify-between gap-4">
           <div className="relative w-full sm:w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input placeholder="Tìm tên hoặc số điện thoại..." className="pl-10 h-10 border-none bg-gray-100 w-full" value={searchTerm} onChange={(e: any) => setSearchTerm(e.target.value)} />
           </div>
           <Button variant="outline" className="w-full sm:w-auto font-bold border-orange-100 text-orange-600">Xuất báo cáo</Button>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          <Table>
            <TableHeader className="bg-gray-50/50">
              <TableRow>
                <TableHead className="font-bold">Khách hàng</TableHead>
                <TableHead className="font-bold text-center">Hạng thẻ</TableHead>
                <TableHead className="font-bold text-center">Điểm hiện tại</TableHead>
                <TableHead className="font-bold text-center">Tổng chi tiêu</TableHead>
                <TableHead className="font-bold text-right">Ghé thăm cuối</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((c) => {
                const level = getLevel(c.points);
                return (
                  <TableRow key={c.id}>
                    <TableCell>
                      <div className="font-bold text-gray-900">{c.fullName}</div>
                      <div className="text-xs text-gray-400 font-medium">{c.phoneNumber}</div>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className={`${level.color} px-2 py-0.5 rounded-full font-bold uppercase text-[10px] inline-block`}>
                        {level.label}
                      </div>
                    </TableCell>
                    <TableCell className="text-center font-black text-orange-600">{c.points.toLocaleString("vi-VN")} điểm</TableCell>
                    <TableCell className="text-center font-bold text-gray-600">{(c.totalSpent || 0).toLocaleString("vi-VN")}đ</TableCell>
                    <TableCell className="text-right text-xs text-gray-400 font-medium">
                      {c.lastVisitAtUtc ? new Date(c.lastVisitAtUtc).toLocaleDateString() : '—'}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({ label, val, icon: Icon, color }: any) {
  return (
    <Card className="border-none shadow-sm">
      <CardContent className="pt-6 flex items-center gap-4">
        <div className={`w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center ${color}`}><Icon className="w-6 h-6" /></div>
        <div>
          <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{label}</div>
          <div className="text-2xl font-black text-gray-900">{val}</div>
        </div>
      </CardContent>
    </Card>
  );
}
