import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../components/ui/dialog";
import { Plus, Ticket, Loader2, Trash2 } from "lucide-react";
import api from "../services/api";

export function OwnerVouchers() {
  const [vouchers, setVouchers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newVoucher, setNewVoucher] = useState({
      code: '',
      name: '',
      discountValue: 0,
      discountType: 'percentage',
      isActive: true
  });

  const fetchVouchers = async () => {
    try {
      setLoading(true);
      const res = await api.get("/vouchers");
      setVouchers(res.data);
    } catch (err) {
        console.error("Lỗi lấy voucher");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchVouchers(); }, []);

  const handleCreate = async () => {
      if (!newVoucher.code || newVoucher.discountValue <= 0) {
          alert("Vui lòng nhập đầy đủ thông tin");
          return;
      }
      try {
          await api.post("/vouchers", newVoucher);
          setIsAddOpen(false);
          setNewVoucher({ code: '', name: '', discountValue: 0, discountType: 'percentage', isActive: true });
          fetchVouchers();
      } catch { alert("Lỗi tạo voucher"); }
  }

  const handleDelete = async (id: string) => {
      if (!confirm("Xóa voucher này?")) return;
      try {
          await api.delete(`/vouchers/${id}`);
          fetchVouchers();
      } catch { alert("Lỗi khi xóa"); }
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen text-gray-900">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-black">Chương trình khuyến mãi</h1>
          <p className="text-gray-600 mt-1">Quản lý các mã giảm giá cho khách hàng</p>
        </div>

        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger onClick={() => setIsAddOpen(true)}>
                <Button className="bg-orange-600 font-bold"><Plus className="w-4 h-4 mr-2" /> Tạo mã mới</Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader><DialogTitle className="font-bold">Tạo mã giảm giá mới</DialogTitle></DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="space-y-1">
                        <Label className="font-bold uppercase text-[10px] text-gray-400">Mã Voucher</Label>
                        <Input value={newVoucher.code} onChange={(e: any) => setNewVoucher({...newVoucher, code: e.target.value.toUpperCase()})} placeholder="Vd: GIAM50K, TET2024" />
                    </div>
                    <div className="space-y-1">
                        <Label className="font-bold uppercase text-[10px] text-gray-400">Tên chương trình</Label>
                        <Input value={newVoucher.name} onChange={(e: any) => setNewVoucher({...newVoucher, name: e.target.value})} placeholder="Vd: Ưu đãi khai trương" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <Label className="font-bold uppercase text-[10px] text-gray-400">Giá trị giảm</Label>
                            <Input type="number" value={newVoucher.discountValue} onChange={(e: any) => setNewVoucher({...newVoucher, discountValue: parseFloat(e.target.value)})} />
                        </div>
                        <div className="space-y-1">
                            <Label className="font-bold uppercase text-[10px] text-gray-400">Loại</Label>
                            <select
                                className="w-full h-10 rounded-md border border-gray-100 bg-gray-50 px-3 text-sm font-bold"
                                value={newVoucher.discountType}
                                onChange={(e) => setNewVoucher({...newVoucher, discountType: e.target.value})}
                            >
                                <option value="percentage">Phần trăm (%)</option>
                                <option value="fixed">Tiền mặt ($)</option>
                            </select>
                        </div>
                    </div>
                    <Button onClick={handleCreate} className="w-full bg-orange-600 font-bold h-12 shadow-lg shadow-orange-100">LƯU VOUCHER</Button>
                </div>
            </DialogContent>
        </Dialog>
      </div>

      <Card className="border-none shadow-sm overflow-hidden">
        <CardContent className="p-0">
          {loading ? <div className="p-20 flex justify-center"><Loader2 className="animate-spin text-orange-600" /></div> : (
            <Table>
              <TableHeader className="bg-gray-50/50">
                <TableRow>
                  <TableHead className="font-bold">Mã Voucher</TableHead>
                  <TableHead className="font-bold text-center">Ưu đãi</TableHead>
                  <TableHead className="font-bold">Mô tả</TableHead>
                  <TableHead className="font-bold text-right">Trạng thái</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {vouchers.map((v) => (
                  <TableRow key={v.id} className="hover:bg-gray-50/50 transition-colors">
                    <TableCell><code className="bg-orange-50 text-orange-600 px-3 py-1 rounded-lg font-black text-xs">{v.code}</code></TableCell>
                    <TableCell className="font-black text-gray-900 text-center text-lg">{v.discountValue}{v.discountType === 'percentage' ? '%' : '$'}</TableCell>
                    <TableCell className="text-gray-500 font-medium">{v.name}</TableCell>
                    <TableCell className="text-right"><Badge className="bg-green-100 text-green-700 border-none font-bold">Đang chạy</Badge></TableCell>
                    <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(v.id)} className="text-gray-300 hover:text-red-500"><Trash2 className="w-4 h-4" /></Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
          {!loading && vouchers.length === 0 && (
              <div className="text-center py-20 bg-white">
                  <div className="text-4xl mb-4">🎫</div>
                  <p className="text-gray-400 font-bold">Chưa có mã giảm giá nào. Hãy tạo mã đầu tiên.</p>
              </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
