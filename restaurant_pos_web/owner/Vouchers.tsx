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
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchVouchers(); }, []);

  const handleCreate = async () => {
      try {
          await api.post("/vouchers", newVoucher);
          setIsAddOpen(false);
          setNewVoucher({ code: '', name: '', discountValue: 0, discountType: 'percentage', isActive: true });
          fetchVouchers();
      } catch { alert("Lỗi tạo voucher"); }
  }

  return (
    <div className="p-8 bg-gray-50 min-h-screen text-gray-900">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-black">Chương trình khuyến mãi</h1>
          <p className="text-gray-600 mt-1">Quản lý các mã giảm giá cho khách hàng</p>
        </div>

        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger asChild><Button className="bg-orange-600 font-bold"><Plus className="w-4 h-4 mr-2" /> Tạo mã mới</Button></DialogTrigger>
            <DialogContent>
                <DialogHeader><DialogTitle className="font-bold">Tạo mã giảm giá mới</DialogTitle></DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label className="font-bold">Mã Voucher</Label>
                        <Input value={newVoucher.code} onChange={(e: any) => setNewVoucher({...newVoucher, code: e.target.value.toUpperCase()})} placeholder="Vd: GIAM50K, TET2024" />
                    </div>
                    <div className="space-y-2">
                        <Label className="font-bold">Tên chương trình</Label>
                        <Input value={newVoucher.name} onChange={(e: any) => setNewVoucher({...newVoucher, name: e.target.value})} placeholder="Vd: Ưu đãi khai trương" />
                    </div>
                    <div className="space-y-2">
                        <Label className="font-bold">Giá trị giảm</Label>
                        <Input type="number" value={newVoucher.discountValue} onChange={(e: any) => setNewVoucher({...newVoucher, discountValue: parseFloat(e.target.value)})} />
                    </div>
                    <Button onClick={handleCreate} className="w-full bg-orange-600 font-bold">LƯU VOUCHER</Button>
                </div>
            </DialogContent>
        </Dialog>
      </div>

      <Card className="border-none shadow-sm">
        <CardContent className="p-0 overflow-hidden">
          {loading ? <div className="p-20 flex justify-center"><Loader2 className="animate-spin text-orange-600" /></div> : (
            <Table>
              <TableHeader className="bg-gray-50">
                <TableRow>
                  <TableHead className="font-bold">Mã</TableHead>
                  <TableHead className="font-bold">Ưu đãi</TableHead>
                  <TableHead className="font-bold">Chương trình</TableHead>
                  <TableHead className="font-bold text-right">Trạng thái</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {vouchers.map((v) => (
                  <TableRow key={v.id}>
                    <TableCell><code className="bg-orange-50 text-orange-600 px-3 py-1 rounded-lg font-black">{v.code}</code></TableCell>
                    <TableCell className="font-black text-gray-900">{v.discountValue}{v.discountType === 'percentage' ? '%' : '$'}</TableCell>
                    <TableCell className="text-gray-500">{v.name}</TableCell>
                    <TableCell className="text-right"><Badge className="bg-green-100 text-green-700 border-none">Đang chạy</Badge></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
          {!loading && vouchers.length === 0 && <div className="text-center py-20 text-gray-400">Chưa có mã giảm giá nào.</div>}
        </CardContent>
      </Card>
    </div>
  );
}
