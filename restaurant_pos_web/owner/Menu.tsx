import { useState, useEffect } from "react";
import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import api from "../services/api";
import { Loader2, Plus, Trash2, Edit } from "lucide-react";

export function OwnerMenu() {
  const [categories, setCategories] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);

  const [editMode, setEditMode] = useState(false);
  const [currentProduct, setCurrentProduct] = useState<any>({ name: '', price: 0, categoryId: '' });
  const [newCategory, setNewCategory] = useState({ name: '' });

  const fetchData = async () => {
    try {
      setLoading(true);
      // Sửa thành Menu (viết hoa)
      const [catRes, prodRes] = await Promise.all([
        api.get("/Menu/categories"),
        api.get("/Menu/products")
      ]);
      setCategories(catRes.data);
      setProducts(prodRes.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleSaveProduct = async () => {
      try {
          if (editMode) {
              await api.put(`/Menu/products/${currentProduct.id}`, currentProduct);
          } else {
              await api.post("/Menu/products", currentProduct);
          }
          setIsProductModalOpen(false);
          fetchData();
      } catch { alert("Lỗi khi lưu món ăn"); }
  };

  const handleCreateCategory = async () => {
    try {
        await api.post("/Menu/categories", newCategory);
        setIsCategoryModalOpen(false);
        fetchData();
    } catch { alert("Lỗi tạo danh mục"); }
  };

  if (loading) return <div className="flex justify-center p-20"><Loader2 className="animate-spin text-orange-600 w-10 h-10" /></div>;

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-black">Thực đơn</h1>
        <div className="flex gap-2">
            <Button variant="outline" onClick={() => setIsCategoryModalOpen(true)}>Thêm danh mục</Button>
            <Button onClick={() => { setEditMode(false); setCurrentProduct({name:'', price:0, categoryId:''}); setIsProductModalOpen(true); }} className="bg-orange-600"><Plus className="w-4 h-4 mr-2" /> Thêm món</Button>
        </div>
      </div>

      <Tabs defaultValue="all">
        <TabsList className="mb-8">
          <TabsTrigger value="all">Tất cả</TabsTrigger>
          {categories.map(c => <TabsTrigger key={c.id} value={c.id}>{c.name}</TabsTrigger>)}
        </TabsList>
        <TabsContent value="all">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {products.map(p => (
              <Card key={p.id} className="group relative">
                <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                    <Button variant="ghost" size="icon" onClick={() => { setEditMode(true); setCurrentProduct(p); setIsProductModalOpen(true); }} className="bg-white/80 h-8 w-8 text-blue-600"><Edit className="w-4 h-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={async () => { if(confirm("Xóa?")) { await api.delete(`/Menu/products/${p.id}`); fetchData(); } }} className="bg-white/80 h-8 w-8 text-red-500"><Trash2 className="w-4 h-4" /></Button>
                </div>
                <CardContent className="p-4">
                  <div className="text-4xl mb-2">🍽️</div>
                  <div className="font-bold">{p.name}</div>
                  <div className="text-orange-600 font-black">${p.price}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={isProductModalOpen} onOpenChange={setIsProductModalOpen}>
        <DialogContent>
            <DialogHeader><DialogTitle className="font-bold">{editMode ? "Sửa món" : "Thêm món"}</DialogTitle></DialogHeader>
            <div className="space-y-4 py-4">
                <Input placeholder="Tên món" value={currentProduct.name} onChange={(e:any)=>setCurrentProduct({...currentProduct, name: e.target.value})} />
                <Input type="number" placeholder="Giá" value={currentProduct.price} onChange={(e:any)=>setCurrentProduct({...currentProduct, price: e.target.value})} />
                <Select value={currentProduct.categoryId} onValueChange={(v:any)=>setCurrentProduct({...currentProduct, categoryId: v})}>
                    <SelectTrigger><SelectValue placeholder="Chọn danh mục" /></SelectTrigger>
                    <SelectContent>
                        {categories.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                    </SelectContent>
                </Select>
                <Button onClick={handleSaveProduct} className="w-full bg-orange-600">LƯU MÓN ĂN</Button>
            </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isCategoryModalOpen} onOpenChange={setIsCategoryModalOpen}>
        <DialogContent>
            <DialogHeader><DialogTitle className="font-bold">Thêm danh mục</DialogTitle></DialogHeader>
            <div className="space-y-4 py-4">
                <Input placeholder="Tên danh mục" value={newCategory.name} onChange={(e:any)=>setNewCategory({name: e.target.value})} />
                <Button onClick={handleCreateCategory} className="w-full bg-orange-600">LƯU DANH MỤC</Button>
            </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
