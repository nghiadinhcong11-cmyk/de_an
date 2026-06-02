import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Badge } from "../components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../components/ui/dialog";
import { Plus, MapPin, Phone, Loader2, Trash2, Edit } from "lucide-react";
import api from "../services/api";

export function OwnerBranches() {
  const [branches, setBranches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);

  const [currentBranch, setCurrentBranch] = useState<any>({ name: '', address: '', phone: '' });

  const fetchBranches = async () => {
    try {
      setLoading(true);
      const res = await api.get("/branches");
      setBranches(res.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchBranches(); }, []);

  const handleSave = async () => {
    try {
      if (isEditOpen) {
          await api.put(`/branches/${currentBranch.id}`, currentBranch);
      } else {
          await api.post("/branches", currentBranch);
      }
      setIsAddOpen(false);
      setIsEditOpen(false);
      setCurrentBranch({ name: '', address: '', phone: '' });
      fetchBranches();
    } catch { alert("Lỗi khi lưu chi nhánh"); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Xóa chi nhánh này?")) return;
    try {
      await api.delete(`/branches/${id}`);
      fetchBranches();
    } catch { alert("Lỗi khi xóa"); }
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen text-gray-900">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-black">Chi nhánh</h1>
          <p className="text-gray-500">Quản lý mạng lưới nhà hàng của bạn</p>
        </div>
        <Button onClick={() => { setIsAddOpen(true); setCurrentBranch({ name: '', address: '', phone: '' }); }} className="bg-orange-600 font-bold"><Plus className="w-4 h-4 mr-2" /> Thêm chi nhánh</Button>
      </div>

      {loading ? <div className="flex justify-center p-20"><Loader2 className="animate-spin text-orange-600" /></div> : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {branches.map((branch) => (
            <Card key={branch.id} className="border-none shadow-sm group">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg font-bold">{branch.name}</CardTitle>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="icon" onClick={() => { setCurrentBranch(branch); setIsEditOpen(true); }} className="h-8 w-8 text-blue-600"><Edit className="w-4 h-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(branch.id)} className="h-8 w-8 text-red-500"><Trash2 className="w-4 h-4" /></Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-500"><MapPin className="w-4 h-4" /> {branch.address}</div>
                <div className="flex items-center gap-2 text-sm text-gray-500"><Phone className="w-4 h-4" /> {branch.phone}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* MODAL THÊM/SỬA */}
      <Dialog open={isAddOpen || isEditOpen} onOpenChange={(val) => { if(!val) { setIsAddOpen(false); setIsEditOpen(false); } }}>
        <DialogContent>
           <DialogHeader><DialogTitle className="font-bold">{isEditOpen ? "Cập nhật chi nhánh" : "Tạo chi nhánh mới"}</DialogTitle></DialogHeader>
           <div className="space-y-4 py-4">
              <div className="space-y-1">
                 <Label className="font-bold">Tên chi nhánh</Label>
                 <Input value={currentBranch.name} onChange={(e: any) => setCurrentBranch({...currentBranch, name: e.target.value})} />
              </div>
              <div className="space-y-1">
                 <Label className="font-bold">Địa chỉ</Label>
                 <Input value={currentBranch.address} onChange={(e: any) => setCurrentBranch({...currentBranch, address: e.target.value})} />
              </div>
              <div className="space-y-1">
                 <Label className="font-bold">Số điện thoại</Label>
                 <Input value={currentBranch.phone} onChange={(e: any) => setCurrentBranch({...currentBranch, phone: e.target.value})} />
              </div>
              <Button onClick={handleSave} className="w-full bg-orange-600 font-bold h-12">LƯU CHI NHÁNH</Button>
           </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
