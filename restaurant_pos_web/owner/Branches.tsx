import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Badge } from "../components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../components/ui/dialog";
import { Plus, MapPin, Phone, Loader2, Trash2, Edit, Copy } from "lucide-react";
import api from "../services/api";

export function OwnerBranches() {
  const [branches, setBranches] = useState<any[]>([]);
  const [restaurant, setRestaurant] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isAddOpen, setIsAddOpen] = useState(false);

  const [form, setForm] = useState({ name: '', address: '', phone: '' });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [bRes, rRes] = await Promise.all([
        api.get("/branches"),
        api.get("/restaurants/my-restaurant")
      ]);
      setBranches(bRes.data);
      setRestaurant(rRes.data);
    } catch (err) {
      console.error("Lỗi lấy dữ liệu:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  // Tính năng GỢI Ý: Lấy thông tin từ nhà hàng HQ
  const handleCopyFromHQ = () => {
    if (restaurant) {
      setForm({
        name: restaurant.name,
        address: restaurant.address || '',
        phone: restaurant.contactPhone || ''
      });
    }
  };

  const handleCreate = async () => {
    if (!form.name) return alert("Vui lòng nhập tên chi nhánh");
    try {
      // Gửi đúng định dạng DTO cho Backend
      await api.post("/branches", {
          name: form.name,
          address: form.address,
          phone: form.phone
      });
      setIsAddOpen(false);
      setForm({ name: '', address: '', phone: '' });
      fetchData();
    } catch (err) {
      alert("Không thể lưu chi nhánh. Vui lòng kiểm tra lại kết nối.");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Xóa chi nhánh này?")) return;
    try {
      await api.delete(`/branches/${id}`);
      fetchData();
    } catch { alert("Lỗi khi xóa"); }
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen text-gray-900">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-black">Chi nhánh</h1>
          <p className="text-gray-500">Quản lý mạng lưới nhà hàng của bạn</p>
        </div>

        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger onClick={() => setIsAddOpen(true)}>
            <Button className="bg-orange-600 font-bold shadow-lg shadow-orange-100">
              <Plus className="w-4 h-4 mr-2" /> Thêm chi nhánh
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="font-bold text-xl">Thêm chi nhánh mới</DialogTitle>
            </DialogHeader>
            <div className="space-y-5 py-4">
              <Button
                variant="outline"
                onClick={handleCopyFromHQ}
                className="w-full border-orange-200 text-orange-600 font-bold gap-2 h-11"
              >
                <Copy className="w-4 h-4" /> Lấy thông tin từ nhà hàng HQ
              </Button>

              <div className="space-y-1.5">
                <Label className="font-bold text-xs uppercase text-gray-400">Tên chi nhánh</Label>
                <Input value={form.name} onChange={(e: any) => setForm({...form, name: e.target.value})} placeholder="Vd: Chi nhánh Quận 1" />
              </div>
              <div className="space-y-1.5">
                <Label className="font-bold text-xs uppercase text-gray-400">Địa chỉ</Label>
                <Input value={form.address} onChange={(e: any) => setForm({...form, address: e.target.value})} placeholder="Số 123 Lê Lợi..." />
              </div>
              <div className="space-y-1.5">
                <Label className="font-bold text-xs uppercase text-gray-400">Số điện thoại</Label>
                <Input value={form.phone} onChange={(e: any) => setForm({...form, phone: e.target.value})} placeholder="090..." />
              </div>
              <Button onClick={handleCreate} className="w-full bg-orange-600 h-12 font-bold shadow-lg shadow-orange-100 uppercase">Xác nhận tạo</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? <div className="flex justify-center py-20"><Loader2 className="animate-spin text-orange-600 w-10 h-10" /></div> : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {branches.map((branch) => (
            <Card key={branch.id} className="border-none shadow-sm hover:shadow-xl transition-all group relative overflow-hidden">
               <div className="h-1.5 bg-orange-600 w-full"></div>
               <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="font-black text-xl text-gray-900">{branch.name}</div>
                    <button onClick={() => handleDelete(branch.id)} className="text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm text-gray-500 font-medium"><MapPin className="w-4 h-4 text-orange-500" /> {branch.address || 'Chưa cập nhật'}</div>
                    <div className="flex items-center gap-2 text-sm text-gray-500 font-medium"><Phone className="w-4 h-4 text-orange-500" /> {branch.phone || 'Chưa cập nhật'}</div>
                  </div>
                  <div className="mt-6 pt-4 border-t border-gray-50">
                     <Badge className="bg-green-100 text-green-700 border-none font-bold">Hoạt động</Badge>
                  </div>
               </CardContent>
            </Card>
          ))}
          {branches.length === 0 && <div className="col-span-full text-center py-20 bg-white rounded-3xl border-2 border-dashed border-gray-100 text-gray-400 font-bold uppercase tracking-widest">Chưa có chi nhánh nào</div>}
        </div>
      )}
    </div>
  );
}
