import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Loader2, Star, Award, TrendingUp, Trophy, Users, Search, Filter } from "lucide-react";
import api from "../services/api";

export function StaffPerformance() {
  const [performance, setPerformance] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await api.get("/reports/staff-performance");
      setPerformance(res.data);
    } catch (err) {
      console.error("Lỗi lấy dữ liệu hiệu suất nhân viên");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredPerformance = performance.filter(p =>
    p.staffName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div className="flex justify-center p-20"><Loader2 className="animate-spin text-orange-600 w-10 h-10" /></div>;

  return (
    <div className="p-4 md:p-8 bg-gray-50 min-h-screen text-gray-900 space-y-8">
      <div className="flex flex-col sm:flex-row justify-between sm:items-end gap-4">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-tight">Hiệu suất nhân sự</h1>
          <p className="text-gray-500 font-medium">Thống kê đánh giá và xếp hạng nhân viên ưu tú</p>
        </div>
        <div className="flex items-center gap-3">
            <div className="bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-100 flex items-center gap-2">
                <Users className="w-4 h-4 text-orange-600" />
                <span className="font-bold text-sm text-gray-900">{performance.length} Nhân viên</span>
            </div>
        </div>
      </div>

      {/* Top 3 Spotlight */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {performance.slice(0, 3).map((staff, idx) => (
          <Card key={staff.staffId} className={`border-none shadow-2xl rounded-[40px] overflow-hidden relative group transition-all hover:-translate-y-3 ${
            idx === 0 ? 'bg-gradient-to-br from-gray-900 to-black text-white ring-4 ring-orange-500/20' : 'bg-white'
          }`}>
            {idx === 0 && (
              <div className="absolute top-0 right-0 p-8">
                <Trophy className="w-16 h-16 text-orange-500 drop-shadow-[0_0_15px_rgba(249,115,22,0.5)] animate-pulse" />
              </div>
            )}
            <CardContent className="p-10">
              <div className="flex items-center gap-6 mb-8">
                <div className={`w-20 h-20 rounded-[30px] flex items-center justify-center font-black text-3xl shadow-inner ${
                  idx === 0 ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-900'
                }`}>
                  {staff.staffName.charAt(0)}
                </div>
                <div>
                  <h3 className={`font-black uppercase tracking-tight text-2xl ${idx === 0 ? 'text-white' : 'text-gray-900'}`}>
                    {staff.staffName}
                  </h3>
                  <Badge className={`mt-2 border-none font-black text-[10px] uppercase tracking-widest px-3 py-1 rounded-full ${
                    idx === 0 ? 'bg-orange-500/20 text-orange-500' : 'bg-gray-100 text-gray-500'
                  }`}>
                    Hạng {idx + 1} Tháng này
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6 mb-8">
                <div className={`p-5 rounded-[24px] ${idx === 0 ? 'bg-white/5 border border-white/10' : 'bg-gray-50'}`}>
                  <p className="text-[10px] font-black uppercase opacity-60 mb-2 flex items-center gap-1.5">
                    <Star className="w-3 h-3" /> Đánh giá
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-black">{staff.averageRating.toFixed(1)}</span>
                    <div className="flex gap-0.5">
                       {[...Array(5)].map((_, i) => (
                         <Star key={i} className={`w-3 h-3 ${i < Math.floor(staff.averageRating) ? 'fill-orange-400 text-orange-400' : 'text-gray-300'}`} />
                       ))}
                    </div>
                  </div>
                </div>
                <div className={`p-5 rounded-[24px] ${idx === 0 ? 'bg-white/5 border border-white/10' : 'bg-gray-50'}`}>
                  <p className="text-[10px] font-black uppercase opacity-60 mb-2 flex items-center gap-1.5">
                    <TrendingUp className="w-3 h-3" /> Tổng đơn
                  </p>
                  <div className="text-2xl font-black">{staff.feedbackCount} <span className="text-xs opacity-60">lượt</span></div>
                </div>
              </div>

              <div className="space-y-4">
                 <div className="flex justify-between items-end">
                    <span className={`text-[11px] font-black uppercase tracking-widest ${idx === 0 ? 'text-orange-500' : 'text-orange-600'}`}>
                        {staff.averageRating >= 4.7 ? "🎖️ Xuất sắc" : staff.averageRating >= 3.5 ? "✅ Ổn định" : "⚠️ Cần cải thiện"}
                    </span>
                    <span className="text-[10px] font-bold opacity-40">Điểm: {(staff.averageRating * 20).toFixed(0)}/100</span>
                 </div>
                 <div className={`w-full h-2.5 rounded-full overflow-hidden ${idx === 0 ? 'bg-white/10' : 'bg-gray-100'}`}>
                    <div
                        className={`h-full rounded-full transition-all duration-1000 ${
                            staff.averageRating >= 4.7 ? 'bg-green-500 shadow-[0_0_15px_rgba(34,197,94,0.5)]' :
                            staff.averageRating >= 3.5 ? 'bg-orange-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${(staff.averageRating / 5) * 100}%` }}
                    ></div>
                 </div>
              </div>

              {staff.averageRating >= 4.7 && (
                <div className="mt-8 pt-8 border-t border-white/10 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
                            <Award className="w-4 h-4 text-green-500" />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-green-500">Khen thưởng tháng</span>
                    </div>
                    <span className="text-sm font-black text-white">+500.000đ</span>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Full Ranking Table */}
      <Card className="border-none shadow-sm rounded-[40px] overflow-hidden bg-white">
        <CardHeader className="p-8 border-b border-gray-50 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
                <CardTitle className="text-2xl font-black uppercase tracking-tight flex items-center gap-3">
                    <Award className="w-7 h-7 text-orange-500" /> Bảng xếp hạng chi tiết
                </CardTitle>
                <p className="text-gray-400 font-bold uppercase text-[10px] tracking-widest mt-1">Dữ liệu tổng hợp từ phản hồi của khách hàng thực tế</p>
            </div>
            <div className="flex gap-4">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                        placeholder="Tìm nhân viên..."
                        className="pl-10 h-11 w-64 bg-gray-50 border-none rounded-xl font-bold text-sm"
                        value={searchTerm}
                        onChange={(e: any) => setSearchTerm(e.target.value)}
                    />
                </div>
                <Button variant="outline" className="h-11 rounded-xl border-gray-100 px-4">
                    <Filter className="w-4 h-4 mr-2" /> Lọc
                </Button>
            </div>
        </CardHeader>
        <CardContent className="p-0">
            <div className="overflow-x-auto">
                <Table>
                    <TableHeader className="bg-gray-50/50">
                        <TableRow>
                            <TableHead className="px-10 py-5 font-black text-[11px] uppercase tracking-widest text-gray-400">Thứ hạng</TableHead>
                            <TableHead className="font-black text-[11px] uppercase tracking-widest text-gray-400">Nhân viên</TableHead>
                            <TableHead className="font-black text-[11px] uppercase tracking-widest text-gray-400">Đánh giá trung bình</TableHead>
                            <TableHead className="font-black text-[11px] uppercase tracking-widest text-gray-400 text-center">Tổng lượt phục vụ</TableHead>
                            <TableHead className="font-black text-[11px] uppercase tracking-widest text-gray-400">Chỉ số hài lòng</TableHead>
                            <TableHead className="text-right px-10 font-black text-[11px] uppercase tracking-widest text-gray-400">Trạng thái nhân sự</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredPerformance.map((staff, idx) => (
                            <TableRow key={staff.staffId} className="hover:bg-gray-50/50 transition-all duration-300 group">
                                <TableCell className="px-10 py-6">
                                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black text-base shadow-sm ${
                                        idx === 0 ? 'bg-orange-500 text-white shadow-orange-200' :
                                        idx === 1 ? 'bg-gray-200 text-gray-700' :
                                        idx === 2 ? 'bg-orange-100 text-orange-800' : 'bg-gray-50 text-gray-400'
                                    }`}>
                                        {idx + 1}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-gray-100 rounded-[18px] flex items-center justify-center font-black text-gray-900 uppercase text-lg border-2 border-white shadow-sm">
                                            {staff.staffName.charAt(0)}
                                        </div>
                                        <div>
                                            <div className="font-black text-gray-900 uppercase text-sm tracking-tight">{staff.staffName}</div>
                                            <div className="text-[9px] font-bold text-gray-400 uppercase">Nhân viên phục vụ</div>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-2">
                                        <div className="flex items-center gap-1 bg-orange-50 text-orange-600 px-3 py-1.5 rounded-xl font-black text-sm">
                                            <Star className="w-4 h-4 fill-orange-500" />
                                            {staff.averageRating.toFixed(1)}
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell className="text-center">
                                    <span className="text-sm font-black text-gray-900">{staff.feedbackCount}</span>
                                    <p className="text-[9px] font-bold text-gray-400 uppercase">Đơn hàng</p>
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-3">
                                        <div className="w-32 h-2 bg-gray-100 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full rounded-full transition-all duration-500 ${
                                                    staff.averageRating >= 4.5 ? 'bg-green-500' :
                                                    staff.averageRating >= 3 ? 'bg-orange-500' : 'bg-red-500'
                                                }`}
                                                style={{ width: `${(staff.averageRating / 5) * 100}%` }}
                                            ></div>
                                        </div>
                                        <span className="text-[11px] font-black text-gray-400">{(staff.averageRating * 20).toFixed(0)}%</span>
                                    </div>
                                </TableCell>
                                <TableCell className="text-right px-10">
                                    {staff.averageRating >= 4.7 ? (
                                        <div className="inline-flex items-center gap-2 bg-green-50 text-green-600 px-4 py-2 rounded-xl border border-green-100 shadow-sm">
                                            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
                                            <span className="font-black text-[10px] uppercase tracking-widest">Khen thưởng</span>
                                        </div>
                                    ) : staff.averageRating < 3.0 ? (
                                        <div className="inline-flex items-center gap-2 bg-red-50 text-red-600 px-4 py-2 rounded-xl border border-red-100 shadow-sm">
                                            <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></div>
                                            <span className="font-black text-[10px] uppercase tracking-widest">Cảnh cáo</span>
                                        </div>
                                    ) : (
                                        <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Đạt yêu cầu</span>
                                    )}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
