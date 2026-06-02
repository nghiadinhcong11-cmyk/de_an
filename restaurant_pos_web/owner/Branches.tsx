import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Badge } from "../components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../components/ui/dialog";
import { Plus, MapPin, Phone, Loader2, Trash2 } from "lucide-react";
import api from "../services/api";

export function OwnerBranches() {
  const [branches, setBranches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newBranch, setNewBranch] = useState({ name: '', address: '', phone: '' });

  const fetchBranches = async () => {
    try {
      setLoading(true);
      const res = await api.get("/branches");
      setBranches(res.data);
    } catch (err) {
      console.error("Lỗi lấy chi nhánh:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchBranches(); }, []);

  const handleCreate = async () => {
    if (!newBranch.name) return;
    try {
      await api.post("/branches", newBranch);
      setIsDialogOpen(false);
      setNewBranch({ name: '', address: '', phone: '' });
      fetchBranches();
    } catch (err) {
      alert("Không thể tạo chi nhánh");
    }
  };

  const handleDelete = async (id: string) => {
      if (!confirm("Bạn có chắc muốn xóa chi nhánh này?")) return;
      try {
          await api.delete(`/branches/${id}`); // Cần API xóa ở backend
          fetchBranches();
      } catch {
          alert("Lỗi khi xóa");
      }
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Chi nhánh</h1>
          <p className="text-gray-600">Quản lý các điểm kinh doanh của bạn</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-orange-600 hover:bg-orange-700 font-bold">
              <Plus className="w-4 h-4 mr-2" /> Thêm chi nhánh
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="font-bold">Tạo chi nhánh mới</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label className="font-bold">Tên chi nhánh</Label>
                <Input value={newBranch.name} onChange={(e: any) => setNewBranch({...newBranch, name: e.target.value})} placeholder="Vd: Chi nhánh Quận 1" />
              </div>
              <div className="space-y-2">
                <Label className="font-bold">Địa chỉ</Label>
                <Input value={newBranch.address} onChange={(e: any) => setNewBranch({...newBranch, address: e.target.value})} placeholder="Số 123 Lê Lợi..." />
              </div>
              <div className="space-y-2">
                <Label className="font-bold">Số điện thoại</Label>
                <Input value={newBranch.phone} onChange={(e: any) => setNewBranch({...newBranch, phone: e.target.value})} placeholder="090..." />
              </div>
              <Button onClick={handleCreate} className="w-full bg-orange-600 h-12 font-bold">XÁC NHẬN TẠO</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="flex justify-center p-20"><Loader2 className="animate-spin text-orange-600 w-10 h-10" /></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {branches.map((branch) => (
            <Card key={branch.id} className="border-none shadow-sm hover:shadow-md transition-shadow relative group">
              <button onClick={() => handleDelete(branch.id)} className="absolute top-4 right-4 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Trash2 className="w-4 h-4" />
              </button>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center text-orange-600 font-bold">
                    {branch.name.charAt(0)}
                  </div>
                  <CardTitle className="text-lg font-bold">{branch.name}</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-gray-600"><MapPin className="w-4 h-4 text-orange-500" /> {branch.address}</div>
                <div className="flex items-center gap-2 text-sm text-gray-600"><Phone className="w-4 h-4 text-orange-500" /> {branch.phone}</div>
                <div className="pt-4 border-t border-gray-50">
                    <Badge className="bg-green-100 text-green-700 border-none px-3">Đang hoạt động</Badge>
                </div>
              </CardContent>
            </Card>
          ))}
          {branches.length === 0 && <div className="col-span-full text-center py-20 text-gray-400">Bạn chưa có chi nhánh nào.</div>}
        </div>
      )}
    </div>
  );
}
