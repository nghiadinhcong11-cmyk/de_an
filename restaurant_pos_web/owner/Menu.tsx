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
  const [isProductModalOpen, setIsProductProductModalOpen] = useState(false);
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
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleCreateCategory = async () => {
      try {
          await api.post("/menu/categories", newCategory);
          setIsCategoryModalOpen(false);
          setNewCategory({ name: '', displayOrder: 0 });
          fetchData();
      } catch { alert("Lỗi tạo danh mục"); }
  };

  const handleCreateProduct = async () => {
      try {
          await api.post("/menu/products", newProduct);
          setIsProductProductModalOpen(false);
          setNewProduct({ name: '', price: 0, categoryId: '', description: '' });
          fetchData();
      } catch { alert("Lỗi tạo món ăn"); }
  };

  if (loading) return <div className="flex justify-center p-20"><Loader2 className="animate-spin text-orange-600 w-10 h-10" /></div>;

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Quản lý thực đơn</h1>
          <p className="text-gray-600">Xây dựng thực đơn và danh mục món ăn</p>
        </div>
        <div className="flex gap-2">
            <Dialog open={isCategoryModalOpen} onOpenChange={setIsCategoryModalOpen}>
                <DialogTrigger asChild><Button variant="outline" className="border-orange-200 text-orange-600">Thêm danh mục</Button></DialogTrigger>
                <DialogContent>
                    <DialogHeader><DialogTitle className="font-bold">Thêm danh mục món ăn</DialogTitle></DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label className="font-bold">Tên danh mục</Label>
                            <Input value={newCategory.name} onChange={(e: any) => setNewCategory({...newCategory, name: e.target.value})} placeholder="Vd: Món chính, Đồ uống..." />
                        </div>
                        <Button onClick={handleCreateCategory} className="w-full bg-orange-600 font-bold">LƯU DANH MỤC</Button>
                    </div>
                </DialogContent>
            </Dialog>

            <Dialog open={isProductModalOpen} onOpenChange={setIsProductProductModalOpen}>
                <DialogTrigger asChild><Button className="bg-orange-600 font-bold"><Plus className="w-4 h-4 mr-2" /> Thêm món ăn</Button></DialogTrigger>
                <DialogContent>
                    <DialogHeader><DialogTitle className="font-bold">Thêm món ăn mới</DialogTitle></DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label className="font-bold">Tên món</Label>
                            <Input value={newProduct.name} onChange={(e: any) => setNewProduct({...newProduct, name: e.target.value})} placeholder="Vd: Cơm chiên hải sản" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="font-bold">Giá bán ($)</Label>
                                <Input type="number" value={newProduct.price} onChange={(e: any) => setNewProduct({...newProduct, price: parseFloat(e.target.value)})} />
                            </div>
                            <div className="space-y-2">
                                <Label className="font-bold">Danh mục</Label>
                                <Select onValueChange={(v: any) => setNewProduct({...newProduct, categoryId: v})}>
                                    <SelectTrigger><SelectValue placeholder="Chọn..." /></SelectTrigger>
                                    <SelectContent onValueChange={() => {}}>
                                        {categories.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <Button onClick={handleCreateProduct} className="w-full bg-orange-600 font-bold">XÁC NHẬN THÊM</Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
      </div>

      <Tabs defaultValue="all">
        <TabsList className="mb-8 bg-white border border-gray-100 p-1 rounded-xl">
          <TabsTrigger value="all" className="px-8">Tất cả</TabsTrigger>
          {categories.map(c => <TabsTrigger key={c.id} value={c.id}>{c.name}</TabsTrigger>)}
        </TabsList>

        <TabsContent value="all">
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map(p => (
              <Card key={p.id} className="border-none shadow-sm hover:shadow-md transition-all overflow-hidden group">
                <div className="h-32 bg-orange-50 flex items-center justify-center text-5xl">🍽️</div>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-bold text-gray-900">{p.name}</h4>
                    <button className="text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 className="w-4 h-4" /></button>
                  </div>
                  <div className="flex justify-between items-center">
                    <p className="text-orange-600 font-black text-xl">${p.price.toFixed(2)}</p>
                    <Badge className="bg-orange-50 text-orange-600 border-none text-[10px]">Còn món</Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
            {products.length === 0 && <div className="col-span-full text-center py-20 text-gray-400">Chưa có món ăn nào trong thực đơn.</div>}
          </div>
        </TabsContent>

        {categories.map(cat => (
             <TabsContent key={cat.id} value={cat.id}>
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {products.filter(p => p.categoryId === cat.id).map(p => (
                        <Card key={p.id} className="border-none shadow-sm hover:shadow-md transition-all overflow-hidden">
                            <div className="h-32 bg-orange-50 flex items-center justify-center text-5xl">🍽️</div>
                            <CardContent className="p-4">
                                <h4 className="font-bold text-gray-900 mb-2">{p.name}</h4>
                                <p className="text-orange-600 font-black text-xl">${p.price.toFixed(2)}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
             </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
