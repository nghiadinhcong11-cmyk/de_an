import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Badge } from "../components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "../components/ui/dialog";
import { Plus, MapPin, Phone, Edit, Trash2, Loader2 } from "lucide-react";
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
    try {
      await api.post("/branches", newBranch);
      setIsDialogOpen(false);
      fetchBranches();
    } catch (err) {
      alert("Không thể tạo chi nhánh");
    }
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">Chi nhánh</h1>
          <p className="text-gray-600">Quản lý các cơ sở kinh doanh của bạn</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-orange-600"><Plus className="w-4 h-4 mr-2" /> Thêm chi nhánh</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Thêm chi nhánh mới</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Tên chi nhánh</Label>
                <Input value={newBranch.name} onChange={(e: any) => setNewBranch({...newBranch, name: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label>Địa chỉ</Label>
                <Input value={newBranch.address} onChange={(e: any) => setNewBranch({...newBranch, address: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label>Số điện thoại</Label>
                <Input value={newBranch.phone} onChange={(e: any) => setNewBranch({...newBranch, phone: e.target.value})} />
              </div>
              <Button onClick={handleCreate} className="w-full bg-orange-600">Xác nhận tạo</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="flex justify-center p-12"><Loader2 className="animate-spin text-orange-600" /></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {branches.map((branch) => (
            <Card key={branch.id}>
              <CardHeader>
                <div className="flex justify-between">
                  <CardTitle>{branch.name}</CardTitle>
                  <Badge>{branch.isActive ? "Hoạt động" : "Tắt"}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-gray-600"><MapPin className="w-4 h-4" /> {branch.address}</div>
                <div className="flex items-center gap-2 text-sm text-gray-600"><Phone className="w-4 h-4" /> {branch.phone}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
