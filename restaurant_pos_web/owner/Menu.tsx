import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import api from "../services/api";
import { Loader2, Plus, Trash2 } from "lucide-react";

export function OwnerMenu() {
  const [categories, setCategories] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);

  const [newProduct, setNewProduct] = useState({ name: '', price: 0, categoryId: '', description: '' });
  const [newCategory, setNewCategory] = useState({ name: '', displayOrder: 0 });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [catRes, prodRes] = await Promise.all([
        api.get("/menu/categories"),
        api.get("/menu/products")
      ]);
      setCategories(catRes.data);
      setProducts(prodRes.data);
    } catch (err) {
        console.error("Lỗi lấy thực đơn");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleCreateCategory = async () => {
      if (!newCategory.name) return;
      try {
          await api.post("/menu/categories", newCategory);
          setIsCategoryModalOpen(false);
          setNewCategory({ name: '', displayOrder: 0 });
          fetchData();
      } catch { alert("Lỗi tạo danh mục"); }
  };

  const handleCreateProduct = async () => {
      if (!newProduct.name || !newProduct.categoryId) {
          alert("Vui lòng nhập tên và chọn danh mục");
          return;
      }
      try {
          await api.post("/menu/products", newProduct);
          setIsProductModalOpen(false);
          setNewProduct({ name: '', price: 0, categoryId: '', description: '' });
          fetchData();
      } catch { alert("Lỗi tạo món ăn"); }
  };

  const handleDeleteProduct = async (id: string) => {
      if (!confirm("Xóa món ăn này khỏi thực đơn?")) return;
      try {
          await api.delete(`/menu/products/${id}`);
          fetchData();
      } catch { alert("Lỗi khi xóa món"); }
  }

  if (loading) return <div className="flex justify-center p-20"><Loader2 className="animate-spin text-orange-600 w-10 h-10" /></div>;

  return (
    <div className="p-8 bg-gray-50 min-h-screen text-gray-900">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-black">Quản lý thực đơn</h1>
          <p className="text-gray-600">Xây dựng thực đơn và danh mục món ăn cho nhà hàng</p>
        </div>
        <div className="flex gap-2">
            <Dialog open={isCategoryModalOpen} onOpenChange={setIsCategoryModalOpen}>
                <DialogTrigger onClick={() => setIsCategoryModalOpen(true)}>
                    <Button variant="outline" className="border-orange-200 text-orange-600 font-bold">Thêm danh mục</Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader><DialogTitle className="font-bold">Thêm danh mục món ăn</DialogTitle></DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label className="font-bold uppercase text-[10px] text-gray-400">Tên danh mục</Label>
                            <Input value={newCategory.name} onChange={(e: any) => setNewCategory({...newCategory, name: e.target.value})} placeholder="Vd: Món chính, Đồ uống..." />
                        </div>
                        <Button onClick={handleCreateCategory} className="w-full bg-orange-600 font-bold h-12">LƯU DANH MỤC</Button>
                    </div>
                </DialogContent>
            </Dialog>

            <Dialog open={isProductModalOpen} onOpenChange={setIsProductModalOpen}>
                <DialogTrigger onClick={() => setIsProductModalOpen(true)}>
                    <Button className="bg-orange-600 font-bold shadow-lg shadow-orange-100"><Plus className="w-4 h-4 mr-2" /> Thêm món ăn</Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader><DialogTitle className="font-bold">Thêm món ăn mới</DialogTitle></DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label className="font-bold uppercase text-[10px] text-gray-400">Tên món</Label>
                            <Input value={newProduct.name} onChange={(e: any) => setNewProduct({...newProduct, name: e.target.value})} placeholder="Vd: Cơm chiên hải sản" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="font-bold uppercase text-[10px] text-gray-400">Giá bán ($)</Label>
                                <Input type="number" value={newProduct.price} onChange={(e: any) => setNewProduct({...newProduct, price: parseFloat(e.target.value)})} />
                            </div>
                            <div className="space-y-2">
                                <Label className="font-bold uppercase text-[10px] text-gray-400">Danh mục</Label>
                                <Select onValueChange={(v: any) => setNewProduct({...newProduct, categoryId: v})}>
                                    <SelectTrigger><SelectValue placeholder="Chọn..." /></SelectTrigger>
                                    <SelectContent>
                                        {categories.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <Button onClick={handleCreateProduct} className="w-full bg-orange-600 font-bold h-12">XÁC NHẬN THÊM</Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
      </div>

      <Tabs defaultValue="all">
        <TabsList className="mb-8 bg-white border border-gray-100 p-1 rounded-xl shadow-sm">
          <TabsTrigger value="all" className="px-8 font-bold">Tất cả</TabsTrigger>
          {categories.map(c => <TabsTrigger key={c.id} value={c.id} className="font-bold">{c.name}</TabsTrigger>)}
        </TabsList>

        <TabsContent value="all">
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map(p => (
              <Card key={p.id} className="border-none shadow-sm hover:shadow-xl transition-all overflow-hidden group">
                <div className="h-32 bg-orange-50 flex items-center justify-center text-5xl group-hover:scale-110 transition-transform">🍽️</div>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-bold text-gray-900 truncate">{p.name}</h4>
                    <button onClick={() => handleDeleteProduct(p.id)} className="text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 className="w-4 h-4" /></button>
                  </div>
                  <div className="flex justify-between items-center">
                    <p className="text-orange-600 font-black text-xl">${p.price.toFixed(2)}</p>
                    <Badge className="bg-green-50 text-green-700 border-none text-[10px] font-bold uppercase">Sẵn sàng</Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
            {products.length === 0 && <div className="col-span-full text-center py-20 bg-white rounded-3xl border-2 border-dashed border-gray-100"><p className="text-gray-400 font-bold">Chưa có món ăn nào trong thực đơn.</p></div>}
          </div>
        </TabsContent>

        {categories.map(cat => (
             <TabsContent key={cat.id} value={cat.id}>
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {products.filter(p => p.categoryId === cat.id).map(p => (
                        <Card key={p.id} className="border-none shadow-sm hover:shadow-xl transition-all overflow-hidden group">
                            <div className="h-32 bg-orange-50 flex items-center justify-center text-5xl">🍽️</div>
                            <CardContent className="p-4">
                                <div className="flex justify-between items-start mb-2">
                                    <h4 className="font-bold text-gray-900 truncate">{p.name}</h4>
                                    <button onClick={() => handleDeleteProduct(p.id)} className="text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 className="w-4 h-4" /></button>
                                </div>
                                <p className="text-orange-600 font-black text-xl">${p.price.toFixed(2)}</p>
                            </CardContent>
                        </Card>
                    ))}
                    {products.filter(p => p.categoryId === cat.id).length === 0 && <div className="col-span-full text-center py-20 text-gray-400 font-bold">Chưa có món ăn nào trong danh mục này.</div>}
                </div>
             </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
