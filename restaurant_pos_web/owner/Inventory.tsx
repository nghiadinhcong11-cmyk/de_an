import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../components/ui/dialog";
import { Label } from "../components/ui/label";
import { Input } from "../components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Plus, Loader2, Trash2, Wallet, Calendar, ShoppingCart, Truck, Package, Search, Receipt } from "lucide-react";
import api from "../services/api";

export function OwnerInventory() {
  const [ingredients, setIngredients] = useState<any[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [purchases, setPurchases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [branches, setBranches] = useState<any[]>([]);

  // Modals
  const [isPurchaseOpen, setIsPurchaseOpen] = useState(false);
  const [isIngredientOpen, setIsCategoryOpen] = useState(false);
  const [isSupplierOpen, setIsSupplierOpen] = useState(false);

  // New Purchase State
  const [newPurchase, setNewPurchase] = useState({
      purchaseDate: new Date().toISOString().split('T')[0],
      supplierId: '',
      branchId: '',
      notes: '',
      items: [] as any[]
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [ingRes, supRes, purRes, brRes] = await Promise.all([
        api.get("/ingredients"),
        api.get("/suppliers"),
        api.get("/purchases"),
        api.get("/branches")
      ]);
      setIngredients(ingRes.data);
      setSuppliers(supRes.data);
      setPurchases(purRes.data);
      setBranches(brRes.data);

      if (brRes.data.length > 0 && !newPurchase.branchId) {
          setNewPurchase(p => ({ ...p, branchId: brRes.data[0].id }));
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleAddPurchaseItem = () => {
      if (ingredients.length === 0) return alert("Vui lòng thêm danh mục nguyên liệu trước");
      setNewPurchase({
          ...newPurchase,
          items: [...newPurchase.items, { ingredientId: ingredients[0].id, quantity: 1, unitPrice: 0 }]
      });
  };

  const handleSavePurchase = async () => {
    if (newPurchase.items.length === 0) return alert("Vui lòng chọn ít nhất 1 mặt hàng");
    if (!newPurchase.branchId) return alert("Vui lòng chọn chi nhánh");

    try {
        const payload = {
            ...newPurchase,
            supplierId: newPurchase.supplierId === "" ? null : newPurchase.supplierId,
            purchaseDate: new Date(newPurchase.purchaseDate).toISOString()
        };

        await api.post("/purchases", payload);
        setIsPurchaseOpen(false);
        setNewPurchase({
            purchaseDate: new Date().toISOString().split('T')[0],
            supplierId: '',
            branchId: branches[0]?.id || '',
            notes: '',
            items: []
        });
        fetchData();
    } catch (err: any) {
        console.error(err.response?.data);
        alert("Lỗi khi lưu phiếu mua hàng: " + (err.response?.data?.title || "Vui lòng kiểm tra lại dữ liệu"));
    }
  };

  if (loading) return <div className="flex justify-center p-10 md:p-20"><Loader2 className="animate-spin text-orange-600 w-10 h-10" /></div>;

  return (
    <div className="p-4 md:p-8 bg-gray-50 min-h-screen text-gray-900">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight">Chi phí & Nhập hàng</h1>
          <p className="text-gray-500 font-medium">Theo dõi ngân sách nhập hàng và quản lý nhà cung cấp</p>
        </div>

        <div className="flex flex-wrap gap-2">
            <Button onClick={() => setIsCategoryOpen(true)} variant="outline" className="font-bold border-orange-100 text-orange-600 bg-white flex-1 sm:flex-none">
                <Package className="w-4 h-4 mr-2" /> Nguyên liệu
            </Button>
            <Button onClick={() => setIsSupplierOpen(true)} variant="outline" className="font-bold border-orange-100 text-orange-600 bg-white flex-1 sm:flex-none">
                <Truck className="w-4 h-4 mr-2" /> Nhà cung cấp
            </Button>
            <Button onClick={() => setIsPurchaseOpen(true)} className="bg-orange-600 font-bold shadow-lg shadow-orange-100 w-full sm:w-auto">
                <Plus className="w-4 h-4 mr-2" /> Tạo phiếu mua hàng
            </Button>
        </div>
      </div>

      <Tabs defaultValue="history">
        <TabsList className="bg-white border p-1 rounded-2xl shadow-sm mb-8 flex flex-wrap h-auto">
            <TabsTrigger value="history" className="flex-1 sm:flex-none px-8 font-black uppercase text-[10px] tracking-widest rounded-xl">Lịch sử nhập hàng</TabsTrigger>
            <TabsTrigger value="stats" className="flex-1 sm:flex-none px-8 font-black uppercase text-[10px] tracking-widest rounded-xl">Thống kê chi phí</TabsTrigger>
        </TabsList>

        <TabsContent value="history">
           <Card className="border-none shadow-sm overflow-hidden bg-white rounded-[32px]">
              <CardContent className="p-0 overflow-x-auto">
                 <Table>
                    <TableHeader className="bg-gray-50/50">
                        <TableRow>
                            <TableHead className="font-bold px-8">Mã phiếu & Ngày</TableHead>
                            <TableHead className="font-bold">Nhà cung cấp</TableHead>
                            <TableHead className="font-bold">Nội dung</TableHead>
                            <TableHead className="font-bold text-right px-8">Tổng tiền</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {purchases.map(p => (
                            <TableRow key={p.id} className="hover:bg-gray-50/50">
                                <TableCell className="px-8 py-5">
                                    <div className="font-black text-gray-900 uppercase">#{p.id.substring(0, 8)}</div>
                                    <div className="text-[10px] text-gray-400 font-bold">{new Date(p.purchaseDate).toLocaleDateString("vi-VN")}</div>
                                </TableCell>
                                <TableCell className="font-bold text-blue-600">{p.supplier?.name || "Lẻ (Chợ/Siêu thị)"}</TableCell>
                                <TableCell>
                                    <div className="flex gap-1 flex-wrap min-w-[200px]">
                                        {p.items.map((item: any, idx: number) => (
                                            <Badge key={idx} variant="outline" className="text-[10px] border-gray-100 bg-gray-50">{item.ingredient.name} x{item.quantity}</Badge>
                                        ))}
                                    </div>
                                </TableCell>
                                <TableCell className="text-right px-8 font-black text-orange-600 text-lg">
                                    {p.totalAmount.toLocaleString("vi-VN")}đ
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                 </Table>
                 {purchases.length === 0 && (
                     <div className="py-32 text-center">
                        <Receipt className="mx-auto w-12 h-12 text-gray-200 mb-4" />
                        <p className="text-gray-400 font-bold text-xs uppercase tracking-widest">Chưa có phiếu mua hàng nào</p>
                     </div>
                 )}
              </CardContent>
           </Card>
        </TabsContent>


        <TabsContent value="stats">
            <div className="bg-white rounded-[40px] p-20 text-center border-2 border-dashed border-gray-100">
                <p className="text-gray-400 font-black uppercase tracking-widest">Biểu đồ thống kê đang được chuẩn bị...</p>
            </div>
        </TabsContent>
      </Tabs>

      {/* MODAL: TẠO PHIẾU MUA HÀNG */}
      <Dialog open={isPurchaseOpen} onOpenChange={setIsPurchaseOpen}>
          <DialogContent className="max-w-3xl rounded-[40px] p-0 overflow-hidden border-none shadow-2xl">
              <div className="bg-gray-900 p-8 text-white">
                  <DialogTitle className="text-2xl font-black">Phiếu mua nguyên liệu</DialogTitle>
                  <p className="text-gray-400 text-sm mt-1 font-medium">Ghi lại hóa đơn nhập hàng thực tế</p>
              </div>
              <div className="p-8 space-y-6 max-h-[70vh] overflow-y-auto">
                  <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                          <Label className="text-[10px] font-black uppercase text-gray-400">Ngày nhập hàng</Label>
                          <Input type="date" value={newPurchase.purchaseDate} onChange={(e: any) => setNewPurchase({...newPurchase, purchaseDate: e.target.value})} className="h-12 rounded-xl" />
                      </div>
                      <div className="space-y-1.5">
                          <Label className="text-[10px] font-black uppercase text-gray-400">Nhà cung cấp</Label>
                          <Select onValueChange={(v) => setNewPurchase({...newPurchase, supplierId: v})}>
                              <SelectTrigger className="h-12 rounded-xl"><SelectValue placeholder="Chọn..." /></SelectTrigger>
                              <SelectContent>
                                  <SelectItem value="">Mua lẻ / Không có sẵn</SelectItem>
                                  {suppliers.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                              </SelectContent>
                          </Select>
                      </div>
                  </div>

                  <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <Label className="text-[10px] font-black uppercase text-gray-400">Danh sách nguyên liệu mua</Label>
                        <Button variant="ghost" onClick={handleAddPurchaseItem} className="text-orange-600 font-bold text-xs h-8">+ Thêm món</Button>
                      </div>

                      <div className="space-y-2">
                        {newPurchase.items.map((item, idx) => (
                            <div key={idx} className="flex gap-3 items-end bg-gray-50 p-3 rounded-2xl border border-gray-100">
                                <div className="flex-1 space-y-1">
                                    <Select value={item.ingredientId} onValueChange={(v) => {
                                        const items = [...newPurchase.items];
                                        items[idx].ingredientId = v;
                                        setNewPurchase({...newPurchase, items});
                                    }}>
                                        <SelectTrigger className="h-10 border-none bg-white"><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            {ingredients.map(i => <SelectItem key={i.id} value={i.id}>{i.name}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="w-20 space-y-1">
                                    <Input type="number" value={item.quantity} onChange={(e: any) => {
                                        const items = [...newPurchase.items];
                                        items[idx].quantity = parseFloat(e.target.value);
                                        setNewPurchase({...newPurchase, items});
                                    }} className="h-10 text-center font-bold" />
                                </div>
                                <div className="w-32 space-y-1">
                                    <Input type="number" placeholder="Đơn giá" value={item.unitPrice} onChange={(e: any) => {
                                        const items = [...newPurchase.items];
                                        items[idx].unitPrice = parseFloat(e.target.value);
                                        setNewPurchase({...newPurchase, items});
                                    }} className="h-10 text-right font-bold" />
                                </div>
                                <Button variant="ghost" size="icon" onClick={() => {
                                    const items = newPurchase.items.filter((_, i) => i !== idx);
                                    setNewPurchase({...newPurchase, items});
                                }} className="text-red-300 hover:text-red-500"><Trash2 className="w-4 h-4" /></Button>
                            </div>
                        ))}
                      </div>
                  </div>

                  <div className="space-y-1.5">
                      <Label className="text-[10px] font-black uppercase text-gray-400">Ghi chú (Tùy chọn)</Label>
                      <Input value={newPurchase.notes} onChange={(e: any) => setNewPurchase({...newPurchase, notes: e.target.value})} className="h-12 rounded-xl" placeholder="Vd: Nợ tiền, hàng khuyến mãi..." />
                  </div>
              </div>
              <div className="p-8 bg-gray-50 border-t flex justify-between items-center">
                  <div>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Tổng tiền phiếu</p>
                      <p className="text-2xl font-black text-gray-900">
                          {newPurchase.items.reduce((sum, i) => sum + (i.quantity * i.unitPrice), 0).toLocaleString("vi-VN")}đ
                      </p>
                  </div>
                  <Button onClick={handleSavePurchase} className="bg-orange-600 h-14 px-10 rounded-2xl font-black text-lg shadow-xl shadow-orange-100">
                      LƯU PHIẾU CHI
                  </Button>
              </div>
          </DialogContent>
      </Dialog>

      {/* MODAL: QUẢN LÝ DANH MỤC NGUYÊN LIỆU */}
      <Dialog open={isIngredientOpen} onOpenChange={setIsCategoryOpen}>
          <DialogContent className="max-w-md rounded-[32px]">
              <DialogHeader><DialogTitle className="text-2xl font-black">Danh mục Nguyên liệu</DialogTitle></DialogHeader>
              <div className="py-4 space-y-6">
                 <form onSubmit={async (e) => {
                     e.preventDefault();
                     const formData = new FormData(e.currentTarget);
                     const name = formData.get('name') as string;
                     const unit = formData.get('unit') as string;
                     if (!name) return;
                     await api.post("/ingredients", { name, unit });
                     fetchData();
                     e.currentTarget.reset();
                 }} className="bg-orange-50 p-4 rounded-2xl flex gap-2 items-end">
                    <div className="flex-1 space-y-1">
                        <Label className="text-[10px] font-bold">Tên nguyên liệu</Label>
                        <Input name="name" className="h-10 bg-white" placeholder="Vd: Thịt heo" required />
                    </div>
                    <div className="w-20 space-y-1">
                        <Label className="text-[10px] font-bold">Đơn vị</Label>
                        <Input name="unit" className="h-10 bg-white" placeholder="kg" required />
                    </div>
                    <Button type="submit" className="bg-gray-900 h-10 px-4 font-bold">THÊM</Button>
                 </form>
                 <div className="max-h-64 overflow-y-auto space-y-2">
                    {ingredients.map(i => (
                        <div key={i.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-xl border border-gray-100">
                            <span className="font-bold text-gray-700">{i.name} ({i.unit})</span>
                            <Button variant="ghost" size="icon" onClick={async () => {
                                if(confirm("Xóa nguyên liệu này?")) {
                                    await api.delete(`/ingredients/${i.id}`);
                                    fetchData();
                                }
                            }} className="text-gray-300 hover:text-red-500 h-8 w-8"><Trash2 className="w-4 h-4" /></Button>
                        </div>
                    ))}
                 </div>
              </div>
          </DialogContent>
      </Dialog>

      {/* MODAL: QUẢN LÝ NHÀ CUNG CẤP */}
      <Dialog open={isSupplierOpen} onOpenChange={setIsSupplierOpen}>
          <DialogContent className="max-w-md rounded-[32px]">
              <DialogHeader><DialogTitle className="text-2xl font-black">Nhà cung cấp</DialogTitle></DialogHeader>
              <div className="py-4 space-y-6">
                 <form onSubmit={async (e) => {
                     e.preventDefault();
                     const formData = new FormData(e.currentTarget);
                     const name = formData.get('name') as string;
                     const phone = formData.get('phone') as string;
                     if (!name) return;
                     await api.post("/suppliers", { name, phone });
                     fetchData();
                     e.currentTarget.reset();
                 }} className="bg-blue-50 p-4 rounded-2xl space-y-3">
                    <Input name="name" placeholder="Tên nhà cung cấp" className="h-10 bg-white border-none shadow-sm" required />
                    <Input name="phone" placeholder="Số điện thoại" className="h-10 bg-white border-none shadow-sm" />
                    <Button type="submit" className="w-full bg-gray-900 font-bold h-10">ĐĂNG KÝ NHÀ CUNG CẤP</Button>
                 </form>
                 <div className="max-h-64 overflow-y-auto space-y-2">
                    {suppliers.map(s => (
                        <div key={s.id} className="p-3 bg-gray-50 rounded-xl border border-gray-100 flex justify-between items-center">
                            <div>
                                <p className="font-bold text-gray-900">{s.name}</p>
                                <p className="text-[10px] text-gray-400 font-bold uppercase">{s.phone || "N/A"}</p>
                            </div>
                            <Button variant="ghost" size="icon" className="text-gray-300 h-8 w-8"><Trash2 className="w-4 h-4" /></Button>
                        </div>
                    ))}
                 </div>
              </div>
          </DialogContent>
      </Dialog>
    </div>
  );
}
