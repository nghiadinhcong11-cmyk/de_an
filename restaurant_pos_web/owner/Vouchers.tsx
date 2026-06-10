import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Switch } from "../components/ui/switch";
import { Plus, Ticket, Loader2, Trash2, Edit, Search, Calendar, Ban, CheckCircle } from "lucide-react";
import api from "../services/api";

export function OwnerVouchers() {
  const [vouchers, setVouchers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVoucher, setEditingVoucher] = useState<any>(null);

  const [form, setForm] = useState({
      code: '',
      name: '',
      discountValue: 0,
      discountType: 'percentage',
      minOrderAmount: 0,
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
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

  const handleOpenModal = (voucher: any = null) => {
    if (voucher) {
        setEditingVoucher(voucher);
        setForm({
            code: voucher.code,
            name: voucher.name,
            discountValue: voucher.discountValue,
            discountType: voucher.discountType,
            minOrderAmount: voucher.minOrderAmount || 0,
            startDate: new Date(voucher.startDate).toISOString().split('T')[0],
            endDate: new Date(voucher.endDate).toISOString().split('T')[0],
            isActive: voucher.isActive
        });
    } else {
        setEditingVoucher(null);
        setForm({
            code: '',
            name: '',
            discountValue: 0,
            discountType: 'percentage',
            minOrderAmount: 0,
            startDate: new Date().toISOString().split('T')[0],
            endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            isActive: true
        });
    }
    setIsModalOpen(true);
  };

  const handleSave = async () => {
      if (!form.code || form.discountValue <= 0) return alert("Vui lòng nhập đủ thông tin");
      try {
          if (editingVoucher) {
              await api.put(`/vouchers/${editingVoucher.id}`, form);
          } else {
              await api.post("/vouchers", form);
          }
          setIsModalOpen(false);
          fetchVouchers();
      } catch { alert("Lỗi khi lưu voucher"); }
  };

  const handleDelete = async (id: string) => {
      if (!confirm("Xóa voucher này?")) return;
      await api.delete(`/vouchers/${id}`);
      fetchVouchers();
  };

  const handleToggle = async (id: string) => {
      try {
          await api.post(`/vouchers/${id}/toggle`);
          setVouchers(vouchers.map(v => v.id === id ? { ...v, isActive: !v.isActive } : v));
      } catch { alert("Lỗi khi cập nhật trạng thái"); }
  };

  const filteredVouchers = vouchers.filter(v =>
    v.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-4 md:p-8 bg-gray-50 min-h-screen text-gray-900">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
            <h1 className="text-2xl font-black uppercase tracking-tight">Chiến dịch Khuyến mãi</h1>
            <p className="text-gray-500 text-sm">Quản lý mã giảm giá và chương trình tri ân khách hàng</p>
        </div>

        <Button onClick={() => handleOpenModal()} className="bg-orange-600 font-bold shadow-lg shadow-orange-100">
            <Plus className="w-4 h-4 mr-2" /> Tạo mã mới
        </Button>
      </div>

      <div className="mb-6 flex gap-4">
          <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Tìm mã hoặc tên khuyến mãi..."
                className="pl-10 h-11 bg-white border-none shadow-sm rounded-xl"
                value={searchTerm}
                onChange={(e: any) => setSearchTerm(e.target.value)}
              />
          </div>
      </div>

      <Card className="border-none shadow-sm overflow-hidden bg-white rounded-[32px]">
        {loading ? <div className="p-20 flex justify-center"><Loader2 className="animate-spin text-orange-600 w-10 h-10" /></div> : (
          <Table>
            <TableHeader className="bg-gray-50/50">
              <TableRow>
                <TableHead className="font-bold px-8">Mã & Thông tin</TableHead>
                <TableHead className="font-bold text-center">Ưu đãi</TableHead>
                <TableHead className="font-bold text-center">Điều kiện</TableHead>
                <TableHead className="font-bold text-center">Thời hạn</TableHead>
                <TableHead className="font-bold text-center">Trạng thái</TableHead>
                <TableHead className="text-right px-8">Hành động</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredVouchers.map((v) => (
                <TableRow key={v.id} className="hover:bg-gray-50/50 transition-colors">
                  <TableCell className="px-8 py-5">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center text-orange-600 font-black text-xs shrink-0">
                            <Ticket className="w-5 h-5" />
                        </div>
                        <div>
                            <code className="bg-orange-50 text-orange-600 px-2 py-0.5 rounded font-black text-sm">{v.code}</code>
                            <p className="text-xs font-bold text-gray-900 mt-1">{v.name}</p>
                        </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <span className="font-black text-lg text-gray-900">
                        {v.discountType === 'fixed' ? v.discountValue.toLocaleString("vi-VN") : v.discountValue}
                        {v.discountType === 'percentage' ? '%' : 'đ'}
                    </span>
                  </TableCell>
                  <TableCell className="text-center">
                    <p className="text-[10px] font-bold text-gray-400 uppercase">Đơn tối thiểu</p>
                    <p className="font-bold text-sm">{(v.minOrderAmount || 0).toLocaleString("vi-VN")}đ</p>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="text-[10px] font-bold text-gray-400 space-y-0.5">
                        <div className="flex items-center justify-center gap-1"><Calendar className="w-3 h-3" /> {new Date(v.startDate).toLocaleDateString("vi-VN")}</div>
                        <div className="flex items-center justify-center gap-1"><Ban className="w-3 h-3 text-red-300" /> {new Date(v.endDate).toLocaleDateString("vi-VN")}</div>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                     <Switch
                        checked={v.isActive}
                        onCheckedChange={() => handleToggle(v.id)}
                        className="data-[state=checked]:bg-orange-600"
                     />
                  </TableCell>
                  <TableCell className="text-right px-8">
                    <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" onClick={() => handleOpenModal(v)} className="text-gray-300 hover:text-blue-600"><Edit className="w-4 h-4" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(v.id)} className="text-gray-300 hover:text-red-500"><Trash2 className="w-4 h-4" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
        {!loading && filteredVouchers.length === 0 && (
            <div className="py-32 text-center">
                <Ticket className="mx-auto w-12 h-12 text-gray-100 mb-4" />
                <p className="text-gray-400 font-bold text-xs uppercase tracking-widest">Không tìm thấy voucher nào</p>
            </div>
        )}
      </Card>

      {/* MODAL: THÊM / SỬA VOUCHER */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="max-w-md rounded-[32px]">
              <DialogHeader>
                  <DialogTitle className="text-2xl font-black">{editingVoucher ? "Chỉnh sửa mã" : "Tạo mã khuyến mãi"}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                  <div className="space-y-1.5">
                      <Label className="text-[10px] font-black uppercase text-gray-400">Mã Voucher (Viết liền)</Label>
                      <Input
                        value={form.code}
                        onChange={(e: any) => setForm({...form, code: e.target.value.toUpperCase().replace(/\s/g, '')})}
                        placeholder="Vd: GIAM10, WELCOME..."
                        className="h-12 rounded-xl font-black text-lg text-orange-600"
                      />
                  </div>
                  <div className="space-y-1.5">
                      <Label className="text-[10px] font-black uppercase text-gray-400">Tên chương trình / Mô tả</Label>
                      <Input value={form.name} onChange={(e: any) => setForm({...form, name: e.target.value})} placeholder="Vd: Giảm 10% cho khách mới" className="h-12 rounded-xl" />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                          <Label className="text-[10px] font-black uppercase text-gray-400">Giá trị giảm</Label>
                          <Input type="number" value={form.discountValue} onChange={(e: any) => setForm({...form, discountValue: parseFloat(e.target.value)})} className="h-12 rounded-xl font-bold" />
                      </div>
                      <div className="space-y-1.5">
                          <Label className="text-[10px] font-black uppercase text-gray-400">Loại giảm giá</Label>
                          <Select value={form.discountType} onValueChange={(v) => setForm({...form, discountType: v})}>
                              <SelectTrigger className="h-12 rounded-xl font-bold border-none bg-gray-50"><SelectValue /></SelectTrigger>
                              <SelectContent>
                                  <SelectItem value="percentage">Phần trăm (%)</SelectItem>
                                  <SelectItem value="fixed">Tiền mặt (đ)</SelectItem>
                              </SelectContent>
                          </Select>
                      </div>
                  </div>

                  <div className="space-y-1.5">
                      <Label className="text-[10px] font-black uppercase text-gray-400">Giá trị đơn tối thiểu</Label>
                      <Input type="number" value={form.minOrderAmount} onChange={(e: any) => setForm({...form, minOrderAmount: parseFloat(e.target.value)})} className="h-12 rounded-xl" />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                          <Label className="text-[10px] font-black uppercase text-gray-400">Ngày bắt đầu</Label>
                          <Input type="date" value={form.startDate} onChange={(e: any) => setForm({...form, startDate: e.target.value})} className="h-12 rounded-xl" />
                      </div>
                      <div className="space-y-1.5">
                          <Label className="text-[10px] font-black uppercase text-gray-400">Ngày kết thúc</Label>
                          <Input type="date" value={form.endDate} onChange={(e: any) => setForm({...form, endDate: e.target.value})} className="h-12 rounded-xl" />
                      </div>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-orange-50 rounded-2xl">
                      <Label className="font-bold">Kích hoạt ngay</Label>
                      <Switch
                        checked={form.isActive}
                        onCheckedChange={(v) => setForm({...form, isActive: v})}
                        className="data-[state=checked]:bg-orange-600"
                      />
                  </div>

                  <Button onClick={handleSave} className="w-full h-14 bg-orange-600 hover:bg-orange-700 font-black text-lg shadow-xl shadow-orange-100 rounded-2xl mt-4 uppercase">
                      {editingVoucher ? "Cập nhật chiến dịch" : "Phát hành Voucher"}
                  </Button>
              </div>
          </DialogContent>
      </Dialog>
    </div>
  );
}

