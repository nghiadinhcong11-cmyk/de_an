import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { Plus, Loader2, Trash2, Calendar, User, Wallet } from "lucide-react";
import api from "../services/api";

export function OwnerExpenses() {
  const [expenses, setExpenses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await api.get("/expenses");
      setExpenses(res.data);
    } catch (err) {
      console.error("Lỗi tải chi phí");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Xóa bản ghi này?")) return;
    try {
      await api.delete(`/expenses/${id}`);
      fetchData();
    } catch { alert("Lỗi khi xóa"); }
  };

  return (
    <div className="p-8 space-y-8 bg-gray-50 min-h-screen text-gray-900">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black">Lịch sử chi phí</h1>
          <p className="text-gray-500">Xem lại tất cả các khoản chi vận hành hệ thống</p>
        </div>
      </div>

      <Card className="border-none shadow-sm overflow-hidden bg-white rounded-[32px]">
        <CardContent className="p-0">
          {loading ? <div className="p-20 flex justify-center"><Loader2 className="animate-spin text-orange-600" /></div> : (
            <Table>
              <TableHeader className="bg-gray-50/50">
                <TableRow>
                  <TableHead className="font-bold text-xs uppercase tracking-wider px-8">Nội dung</TableHead>
                  <TableHead className="font-bold text-xs uppercase tracking-wider">Số tiền</TableHead>
                  <TableHead className="font-bold text-xs uppercase tracking-wider text-center">Ngày chi</TableHead>
                  <TableHead className="text-right px-8"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {expenses.map((e) => (
                  <TableRow key={e.id} className="hover:bg-gray-50/50 transition-colors">
                    <TableCell className="px-8 py-5">
                      <div className="font-bold text-gray-900">{e.title}</div>
                      <p className="text-[10px] text-gray-400 font-medium mt-1">{e.description || "Không có ghi chú"}</p>
                    </TableCell>
                    <TableCell className="font-black text-orange-600 text-lg">{e.amount.toLocaleString("vi-VN")}đ</TableCell>
                    <TableCell className="text-sm text-gray-500 font-medium text-center">{new Date(e.expenseDate).toLocaleDateString("vi-VN")}</TableCell>
                    <TableCell className="text-right px-8">
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(e.id)} className="text-gray-300 hover:text-red-500"><Trash2 className="w-4 h-4" /></Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
          {!loading && expenses.length === 0 && (
              <div className="text-center py-20 text-gray-400 font-bold uppercase tracking-widest text-xs">Chưa có dữ liệu</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
