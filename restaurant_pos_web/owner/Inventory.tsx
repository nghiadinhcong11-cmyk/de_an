import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../components/ui/dialog";
import { Label } from "../components/ui/label";
import { Input } from "../components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Plus, Loader2, Trash2 } from "lucide-react";
import api from "../services/api";

export function OwnerInventory() {
  const [items, setItems] = useState<any[]>([]);
  const [branches, setBranches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddOpen, setIsAddOpen] = useState(false);

  const [newIngredient, setNewIngredient] = useState({
      name: '',
      unit: 'kg',
      costPrice: 0,
      branchId: ''
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [invRes, branchRes] = await Promise.all([
        api.get("/inventory"),
        api.get("/branches")
      ]);
      setItems(invRes.data);
      setBranches(branchRes.data);
    } catch (err) {
        console.error("Lỗi lấy dữ liệu kho");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleCreate = async () => {
      if (!newIngredient.name || !newIngredient.branchId) {
          alert("Vui lòng nhập đầy đủ thông tin");
          return;
      }
      try {
          await api.post("/inventory", newIngredient);
          setIsAddOpen(false);
          setNewIngredient({ name: '', unit: 'kg', costPrice: 0, branchId: '' });
          fetchData();
      } catch { alert("Lỗi khi thêm nguyên liệu"); }
  };

  const handleDelete = async (id: string) => {
      if (!confirm("Xóa nguyên liệu này khỏi kho?")) return;
      try {
          await api.delete(`/inventory/${id}`);
          fetchData();
      } catch { alert("Lỗi khi xóa"); }
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen text-gray-900">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-black">Quản lý kho</h1>
          <p className="text-gray-600 mt-1">Danh mục nguyên liệu và định lượng</p>
        </div>

        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger onClick={() => setIsAddOpen(true)}>
                <Button className="bg-orange-600 font-bold"><Plus className="w-4 h-4 mr-2" /> Thêm nguyên liệu</Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader><DialogTitle className="font-bold">Thêm vào kho</DialogTitle></DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label className="font-bold uppercase text-[10px] text-gray-400">Tên nguyên liệu</Label>
                        <Input value={newIngredient.name} onChange={(e: any) => setNewIngredient({...newIngredient, name: e.target.value})} placeholder="Vd: Thịt bò, Trứng, Gạo..." />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label className="font-bold uppercase text-[10px] text-gray-400">Đơn vị (Vd: kg, lit, cái)</Label>
                            <Input value={newIngredient.unit} onChange={(e: any) => setNewIngredient({...newIngredient, unit: e.target.value})} />
                        </div>
                        <div className="space-y-2">
                            <Label className="font-bold uppercase text-[10px] text-gray-400">Chi nhánh</Label>
                            <Select onValueChange={(v: any) => setNewIngredient({...newIngredient, branchId: v})}>
                                <SelectTrigger><SelectValue placeholder="Chọn..." /></SelectTrigger>
                                <SelectContent>
                                    {branches.map(b => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label className="font-bold uppercase text-[10px] text-gray-400">Giá nhập dự kiến</Label>
                        <Input type="number" value={newIngredient.costPrice} onChange={(e: any) => setNewIngredient({...newIngredient, costPrice: parseFloat(e.target.value)})} />
                    </div>
                    <Button onClick={handleCreate} className="w-full bg-orange-600 font-bold h-12">LƯU KHO</Button>
                </div>
            </DialogContent>
        </Dialog>
      </div>

      <Card className="border-none shadow-sm overflow-hidden">
        <CardContent className="p-0">
          {loading ? <div className="p-20 flex justify-center"><Loader2 className="animate-spin text-orange-600 w-10 h-10" /></div> : (
            <Table>
              <TableHeader className="bg-gray-50/50">
                <TableRow>
                  <TableHead className="font-bold">Nguyên liệu</TableHead>
                  <TableHead className="font-bold text-center">Đơn vị</TableHead>
                  <TableHead className="font-bold text-center">Đơn giá nhập</TableHead>
                  <TableHead className="font-bold text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => (
                  <TableRow key={item.id} className="hover:bg-gray-50/50 transition-colors">
                    <TableCell className="font-bold text-gray-900">{item.name}</TableCell>
                    <TableCell className="text-center uppercase text-xs font-bold text-gray-400">{item.unit}</TableCell>
                    <TableCell className="text-center font-black text-orange-600">${item.costPrice.toFixed(2)}</TableCell>
                    <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(item.id)} className="text-gray-300 hover:text-red-500"><Trash2 className="w-4 h-4" /></Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
          {!loading && items.length === 0 && (
              <div className="text-center py-20 bg-white">
                  <div className="text-4xl mb-4">📦</div>
                  <p className="text-gray-400 font-bold">Kho hàng đang trống. Hãy nhập thêm nguyên liệu.</p>
              </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
