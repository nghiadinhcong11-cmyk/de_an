import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "../components/ui/dialog";
import { Label } from "../components/ui/label";
import { Input } from "../components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Plus, Loader2, Trash2, Wallet, Calendar, ShoppingCart, Truck, Package, Search, Receipt, Edit, BarChart3, TrendingUp, TrendingDown } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import api from "../services/api";

export function OwnerInventory() {
  const [ingredients, setIngredients] = useState<any[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [purchases, setPurchases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [branches, setBranches] = useState<any[]>([]);
  const [stats, setStats] = useState<any[]>([]);

  // Modals
  const [isPurchaseOpen, setIsPurchaseOpen] = useState(false);
  const [isIngredientOpen, setIsCategoryOpen] = useState(false);
  const [isSupplierOpen, setIsSupplierOpen] = useState(false);

  // Edit/New Purchase State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [purchaseForm, setPurchaseForm] = useState({
      purchaseDate: new Date().toISOString().split('T')[0],
      supplierId: '',
      branchId: '',
      notes: '',
      items: [] as any[]
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [ingRes, supRes, purRes, brRes, statRes] = await Promise.all([
        api.get("/ingredients"),
        api.get("/suppliers"),
        api.get("/purchases"),
        api.get("/branches"),
        api.get("/purchases/stats")
      ]);
      setIngredients(ingRes.data);
      setSuppliers(supRes.data);
      setPurchases(purRes.data);
      setBranches(brRes.data);
      setStats(statRes.data);

      if (brRes.data.length > 0 && !purchaseForm.branchId) {
          setPurchaseForm(p => ({ ...p, branchId: brRes.data[0].id }));
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleOpenPurchase = (p: any = null) => {
      if (p) {
          setEditingId(p.id);
          setPurchaseForm({
              purchaseDate: new Date(p.purchaseDate).toISOString().split('T')[0],
              supplierId: p.supplierId || '',
              branchId: p.branchId,
              notes: p.notes || '',
              items: p.items.map((i: any) => ({
                  ingredientId: i.ingredientId,
                  quantity: i.quantity,
                  unitPrice: i.unitPrice
              }))
          });
      } else {
          setEditingId(null);
          setPurchaseForm({
              purchaseDate: new Date().toISOString().split('T')[0],
              supplierId: '',
              branchId: branches[0]?.id || '',
              notes: '',
              items: []
          });
      }
      setIsPurchaseOpen(true);
  };

  const handleAddPurchaseItem = () => {
      if (ingredients.length === 0) return alert("Vui lòng thêm danh mục nguyên liệu trước");
      setPurchaseForm({
          ...purchaseForm,
          items: [...purchaseForm.items, { ingredientId: ingredients[0].id, quantity: 1, unitPrice: 0 }]
      });
  };

  const handleSavePurchase = async () => {
    if (purchaseForm.items.length === 0) return alert("Vui lòng chọn ít nhất 1 mặt hàng");
    if (!purchaseForm.branchId) return alert("Vui lòng chọn chi nhánh");

    try {
        const payload = {
            ...purchaseForm,
            supplierId: purchaseForm.supplierId === "" ? null : purchaseForm.supplierId,
            purchaseDate: new Date(purchaseForm.purchaseDate).toISOString()
        };

        if (editingId) {
            await api.put(`/purchases/${editingId}`, payload);
        } else {
            await api.post("/purchases", payload);
        }

        setIsPurchaseOpen(false);
        fetchData();
    } catch (err: any) {
        alert("Lỗi khi lưu phiếu mua hàng: " + (err.response?.data?.title || "Vui lòng kiểm tra lại dữ liệu"));
    }
  };

  const handleDeletePurchase = async (id: string) => {
      if (!confirm("Xóa phiếu nhập hàng này? Hành động này không thể hoàn tác.")) return;
      try {
          await api.delete(`/purchases/${id}`);
          fetchData();
      } catch { alert("Lỗi khi xóa phiếu"); }
  };

  if (loading) return <div className="flex justify-center p-10 md:p-20"><Loader2 className="animate-spin text-orange-600 w-10 h-10" /></div>;

  return (
    <div className="p-4 md:p-8 bg-gray-50 min-h-screen text-gray-900">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight uppercase">Chi phí & Kho hàng</h1>
          <p className="text-gray-500 font-medium">Theo dõi ngân sách nhập hàng và quản lý nhà cung cấp</p>
        </div>

        <div className="flex flex-wrap gap-2">
            <Button onClick={() => setIsCategoryOpen(true)} variant="outline" className="font-bold border-orange-100 text-orange-600 bg-white flex-1 sm:flex-none h-11 rounded-xl">
                <Package className="w-4 h-4 mr-2" /> Nguyên liệu
            </Button>
            <Button onClick={() => setIsSupplierOpen(true)} variant="outline" className="font-bold border-orange-100 text-orange-600 bg-white flex-1 sm:flex-none h-11 rounded-xl">
                <Truck className="w-4 h-4 mr-2" /> Nhà cung cấp
            </Button>
            <Button onClick={() => handleOpenPurchase()} className="bg-orange-600 hover:bg-orange-700 font-bold shadow-lg shadow-orange-100 w-full sm:w-auto h-11 rounded-xl">
                <Plus className="w-4 h-4 mr-2" /> Tạo phiếu nhập
            </Button>
        </div>
      </div>

      <Tabs defaultValue="history">
        <TabsList className="bg-white border border-gray-100 p-1 rounded-2xl shadow-sm mb-8 flex flex-wrap h-auto">
            <TabsTrigger value="history" className="flex-1 sm:flex-none px-8 py-2.5 font-black uppercase text-[10px] tracking-widest rounded-xl data-[state=active]:bg-orange-600 data-[state=active]:text-white">Lịch sử nhập hàng</TabsTrigger>
            <TabsTrigger value="stats" className="flex-1 sm:flex-none px-8 py-2.5 font-black uppercase text-[10px] tracking-widest rounded-xl data-[state=active]:bg-orange-600 data-[state=active]:text-white">Thống kê chi phí</TabsTrigger>
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
                            <TableHead className="font-bold text-right">Tổng tiền</TableHead>
                            <TableHead className="text-right px-8"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {purchases.map(p => (
                            <TableRow key={p.id} className="hover:bg-gray-50/50 transition-colors">
                                <TableCell className="px-8 py-5">
                                    <div className="font-black text-gray-900 uppercase text-xs">#{p.id.substring(0, 8)}</div>
                                    <div className="text-[10px] text-gray-400 font-bold mt-0.5">{new Date(p.purchaseDate).toLocaleDateString("vi-VN")}</div>
                                </TableCell>
                                <TableCell className="font-bold text-blue-600 text-sm">{p.supplier?.name || "Lẻ (Chợ/Siêu thị)"}</TableCell>
                                <TableCell>
                                    <div className="flex gap-1 flex-wrap min-w-[200px]">
                                        {p.items.map((item: any, idx: number) => (
                                            <Badge key={idx} variant="outline" className="text-[9px] border-gray-100 bg-gray-50 font-bold uppercase">{item.ingredient.name} x{item.quantity}</Badge>
                                        ))}
                                    </div>
                                </TableCell>
                                <TableCell className="text-right font-black text-orange-600 text-lg">
                                    {p.totalAmount.toLocaleString("vi-VN")}đ
                                </TableCell>
                                <TableCell className="text-right px-8">
                                    <div className="flex justify-end gap-1">
                                        <Button variant="ghost" size="icon" onClick={() => handleOpenPurchase(p)} className="h-8 w-8 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"><Edit className="w-4 h-4" /></Button>
                                        <Button variant="ghost" size="icon" onClick={() => handleDeletePurchase(p.id)} className="h-8 w-8 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4" /></Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                 </Table>
                 {purchases.length === 0 && (
                     <div className="py-32 text-center">
                        <Receipt className="mx-auto w-12 h-12 text-gray-100 mb-4" />
                        <p className="text-gray-400 font-bold text-xs uppercase tracking-widest">Chưa có phiếu nhập hàng nào</p>
                     </div>
                 )}
              </CardContent>
           </Card>
        </TabsContent>


        <TabsContent value="stats">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <Card className="lg:col-span-2 border-none shadow-sm bg-white rounded-[32px] overflow-hidden">
                    <CardHeader>
                        <CardTitle className="text-xl font-black flex items-center gap-2">
                            <BarChart3 className="w-5 h-5 text-orange-600" />
                            Biến động chi phí nhập hàng
                        </CardTitle>
                        <CardDescription>Dữ liệu 6 tháng gần nhất</CardDescription>
                    </CardHeader>
                    <CardContent className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={stats}>
                                <defs>
                                    <linearGradient id="colorPur" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#ea580c" stopOpacity={0.1}/>
                                        <stop offset="95%" stopColor="#ea580c" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 'bold'}} />
                                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10}} />
                                <Tooltip />
                                <Area type="monotone" dataKey="total" stroke="#ea580c" fill="url(#colorPur)" strokeWidth={3} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                <div className="space-y-6">
                    <Card className="border-none shadow-sm bg-white rounded-[24px]">
                        <CardContent className="pt-6">
                            <div className="flex justify-between items-start mb-4">
                                <div className="w-12 h-12 rounded-2xl bg-orange-50 flex items-center justify-center text-orange-600">
                                    <Wallet className="w-6 h-6" />
                                </div>
                                <div className="bg-green-50 text-green-600 px-2 py-1 rounded-lg text-[10px] font-black flex items-center gap-1">
                                    <TrendingUp className="w-3 h-3" /> +12%
                                </div>
                            </div>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Tổng chi phí tháng này</p>
                            <p className="text-3xl font-black text-gray-900">
                                {stats[stats.length - 1]?.total?.toLocaleString("vi-VN")}đ
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="border-none shadow-sm bg-white rounded-[24px]">
                        <CardContent className="pt-6">
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">Phân bổ theo chi nhánh</p>
                            <div className="space-y-4">
                                {branches.map(b => (
                                    <div key={b.id} className="flex items-center justify-between">
                                        <span className="text-sm font-bold text-gray-600">{b.name}</span>
                                        <span className="text-sm font-black text-gray-900">
                                            {purchases.filter(p => p.branchId === b.id).reduce((sum, p) => sum + p.totalAmount, 0).toLocaleString("vi-VN")}đ
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </TabsContent>
      </Tabs>

      {/* MODAL: TẠO/SỬA PHIẾU MUA HÀNG */}
      <Dialog open={isPurchaseOpen} onOpenChange={setIsPurchaseOpen}>
          <DialogContent className="max-w-3xl rounded-[40px] p-0 overflow-hidden border-none shadow-2xl">
              <div className="bg-gray-900 p-8 text-white">
                  <DialogTitle className="text-2xl font-black">{editingId ? "Chỉnh sửa phiếu chi" : "Phiếu mua nguyên liệu"}</DialogTitle>
                  <p className="text-gray-400 text-sm mt-1 font-medium">Ghi lại hóa đơn nhập hàng thực tế</p>
              </div>
              <div className="p-8 space-y-6 max-h-[70vh] overflow-y-auto">
                  <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                          <Label className="text-[10px] font-black uppercase text-gray-400">Ngày nhập hàng</Label>
                          <Input type="date" value={purchaseForm.purchaseDate} onChange={(e: any) => setPurchaseForm({...purchaseForm, purchaseDate: e.target.value})} className="h-12 rounded-xl" />
                      </div>
                      <div className="space-y-1.5">
                          <Label className="text-[10px] font-black uppercase text-gray-400">Nhà cung cấp</Label>
                          <Select
                            value={purchaseForm.supplierId}
                            onValueChange={(v) => setPurchaseForm({...purchaseForm, supplierId: v})}
                          >
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
                        <Button variant="ghost" onClick={handleAddPurchaseItem} className="text-orange-600 font-black text-xs h-8 uppercase">+ Thêm món</Button>
                      </div>

                      <div className="space-y-2">
                        {purchaseForm.items.map((item, idx) => (
                            <div key={idx} className="flex gap-3 items-end bg-gray-50 p-3 rounded-2xl border border-gray-100">
                                <div className="flex-1 space-y-1">
                                    <Select value={item.ingredientId} onValueChange={(v) => {
                                        const items = [...purchaseForm.items];
                                        items[idx].ingredientId = v;
                                        setPurchaseForm({...purchaseForm, items});
                                    }}>
                                        <SelectTrigger className="h-10 border-none bg-white font-bold rounded-xl"><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            {ingredients.map(i => <SelectItem key={i.id} value={i.id}>{i.name}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="w-24 space-y-1">
                                    <Input type="number" value={item.quantity} onChange={(e: any) => {
                                        const items = [...purchaseForm.items];
                                        items[idx].quantity = parseFloat(e.target.value);
                                        setPurchaseForm({...purchaseForm, items});
                                    }} className="h-10 text-center font-black rounded-xl" />
                                </div>
                                <div className="w-32 space-y-1">
                                    <Input type="number" placeholder="Đơn giá" value={item.unitPrice} onChange={(e: any) => {
                                        const items = [...purchaseForm.items];
                                        items[idx].unitPrice = parseFloat(e.target.value);
                                        setPurchaseForm({...purchaseForm, items});
                                    }} className="h-10 text-right font-black rounded-xl" />
                                </div>
                                <Button variant="ghost" size="icon" onClick={() => {
                                    const items = purchaseForm.items.filter((_, i) => i !== idx);
                                    setPurchaseForm({...purchaseForm, items});
                                }} className="text-red-300 hover:text-red-500 h-10 w-10"><Trash2 className="w-4 h-4" /></Button>
                            </div>
                        ))}
                      </div>
                  </div>

                  <div className="space-y-1.5">
                      <Label className="text-[10px] font-black uppercase text-gray-400">Ghi chú (Tùy chọn)</Label>
                      <Input value={purchaseForm.notes} onChange={(e: any) => setPurchaseForm({...purchaseForm, notes: e.target.value})} className="h-12 rounded-xl" placeholder="Vd: Nợ tiền, hàng khuyến mãi..." />
                  </div>
              </div>
              <div className="p-8 bg-gray-50 border-t flex justify-between items-center">
                  <div>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Tổng tiền phiếu</p>
                      <p className="text-3xl font-black text-orange-600">
                          {purchaseForm.items.reduce((sum, i) => sum + (i.quantity * i.unitPrice), 0).toLocaleString("vi-VN")}đ
                      </p>
                  </div>
                  <div className="flex gap-3">
                      <Button variant="ghost" onClick={() => setIsPurchaseOpen(false)} className="h-14 px-6 rounded-2xl font-black text-gray-400 uppercase text-xs">Hủy</Button>
                      <Button onClick={handleSavePurchase} className="bg-orange-600 hover:bg-orange-700 h-14 px-10 rounded-2xl font-black text-lg shadow-xl shadow-orange-100 uppercase">
                          {editingId ? "Cập nhật phiếu" : "Lưu phiếu chi"}
                      </Button>
                  </div>
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
                        <Input name="name" className="h-10 bg-white rounded-xl border-none shadow-sm" placeholder="Vd: Thịt heo" required />
                    </div>
                    <div className="w-20 space-y-1">
                        <Label className="text-[10px] font-bold">Đơn vị</Label>
                        <Input name="unit" className="h-10 bg-white rounded-xl border-none shadow-sm" placeholder="kg" required />
                    </div>
                    <Button type="submit" className="bg-gray-900 h-10 px-4 font-bold rounded-xl">THÊM</Button>
                 </form>
                 <div className="max-h-64 overflow-y-auto space-y-2 pr-2">
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
                    <Input name="name" placeholder="Tên nhà cung cấp" className="h-11 bg-white border-none shadow-sm rounded-xl" required />
                    <Input name="phone" placeholder="Số điện thoại" className="h-11 bg-white border-none shadow-sm rounded-xl" />
                    <Button type="submit" className="w-full bg-gray-900 font-bold h-11 rounded-xl">ĐĂNG KÝ NHÀ CUNG CẤP</Button>
                 </form>
                 <div className="max-h-64 overflow-y-auto space-y-2 pr-2">
                    {suppliers.map(s => (
                        <div key={s.id} className="p-3 bg-gray-50 rounded-xl border border-gray-100 flex justify-between items-center">
                            <div>
                                <p className="font-bold text-gray-900">{s.name}</p>
                                <p className="text-[10px] text-gray-400 font-bold uppercase">{s.phone || "N/A"}</p>
                            </div>
                            <Button variant="ghost" size="icon" onClick={async () => {
                                if(confirm("Xóa nhà cung cấp này?")) {
                                    await api.delete(`/suppliers/${s.id}`);
                                    fetchData();
                                }
                            }} className="text-gray-300 hover:text-red-500 h-8 w-8"><Trash2 className="w-4 h-4" /></Button>
                        </div>
                    ))}
                 </div>
              </div>
          </DialogContent>
      </Dialog>
    </div>
  );
}

