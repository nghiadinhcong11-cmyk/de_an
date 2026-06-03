import { useState, useEffect } from "react";
import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../components/ui/dialog";
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
  const [currentProduct, setCurrentProduct] = useState<any>({ name: '', price: 0, categoryId: '', description: '', isAvailable: true });
  const [newCategory, setNewCategory] = useState({ name: '' });

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
        console.error("Lỗi lấy thực đơn", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleSaveProduct = async () => {
      if (!currentProduct.name || !currentProduct.categoryId) {
          alert("Vui lòng nhập tên và chọn danh mục");
          return;
      }
      try {
          const payload = {
              name: currentProduct.name,
              price: parseFloat(currentProduct.price.toString()),
              categoryId: currentProduct.categoryId,
              description: currentProduct.description || "",
              isAvailable: currentProduct.isAvailable ?? true
          };

          if (editMode) {
              await api.put(`/menu/products/${currentProduct.id}`, payload);
          } else {
              await api.post("/menu/products", payload);
          }
          setIsProductModalOpen(false);
          fetchData();
      } catch (err) {
          console.error("Lỗi khi lưu món ăn", err);
          alert("Lỗi khi lưu món ăn");
      }
  };

  const handleCreateCategory = async () => {
    if (!newCategory.name) return;
    try {
        await api.post("/menu/categories", newCategory);
        setIsCategoryModalOpen(false);
        setNewCategory({ name: '' });
        fetchData();
    } catch { alert("Lỗi tạo danh mục"); }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm("Xóa món ăn này khỏi thực đơn?")) return;
    try {
        await api.delete(`/menu/products/${id}`);
        fetchData();
    } catch { alert("Lỗi khi xóa món"); }
  };

  const handleOpenEdit = (product: any) => {
      setEditMode(true);
      setCurrentProduct(product);
      setIsProductModalOpen(true);
  };

  if (loading) return <div className="flex justify-center p-20"><Loader2 className="animate-spin text-orange-600 w-10 h-10" /></div>;

  return (
    <div className="p-8 bg-gray-50 min-h-screen text-gray-900">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-black">Thực đơn</h1>
          <p className="text-gray-600">Quản lý danh sách món ăn của nhà hàng</p>
        </div>
        <div className="flex gap-2">
            <Button variant="outline" onClick={() => setIsCategoryModalOpen(true)} className="border-orange-200 text-orange-600 font-bold">Thêm danh mục</Button>
            <Button onClick={() => { setEditMode(false); setCurrentProduct({name:'', price:0, categoryId:'', description: '', isAvailable: true}); setIsProductModalOpen(true); }} className="bg-orange-600 font-bold shadow-lg shadow-orange-100">
              <Plus className="w-4 h-4 mr-2" /> Thêm món ăn
            </Button>
        </div>
      </div>

      <Tabs defaultValue="all">
        <TabsList className="mb-8 bg-white border border-gray-100 p-1 rounded-xl shadow-sm">
          <TabsTrigger value="all" className="px-8 font-bold text-sm uppercase tracking-widest">Tất cả</TabsTrigger>
          {categories.map(c => <TabsTrigger key={c.id} value={c.id} className="font-bold text-sm uppercase tracking-widest">{c.name}</TabsTrigger>)}
        </TabsList>

        <TabsContent value="all">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {products.map(p => (
              <ProductCard key={p.id} product={p} onEdit={() => handleOpenEdit(p)} onDelete={() => handleDeleteProduct(p.id)} />
            ))}
          </div>
        </TabsContent>

        {categories.map(cat => (
             <TabsContent key={cat.id} value={cat.id}>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    {products.filter(p => p.categoryId === cat.id).map(p => (
                        <ProductCard key={p.id} product={p} onEdit={() => handleOpenEdit(p)} onDelete={() => handleDeleteProduct(p.id)} />
                    ))}
                </div>
             </TabsContent>
        ))}
      </Tabs>

      <Dialog open={isProductModalOpen} onOpenChange={setIsProductModalOpen}>
        <DialogContent>
            <DialogHeader><DialogTitle className="font-bold">{editMode ? "Sửa món ăn" : "Thêm món ăn"}</DialogTitle></DialogHeader>
            <div className="space-y-4 py-4">
                <div className="space-y-1">
                    <Label className="font-bold uppercase text-[10px] text-gray-400">Tên món</Label>
                    <Input placeholder="Tên món" value={currentProduct.name} onChange={(e:any)=>setCurrentProduct({...currentProduct, name: e.target.value})} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <Label className="font-bold uppercase text-[10px] text-gray-400">Giá bán ($)</Label>
                        <Input type="number" placeholder="Giá" value={currentProduct.price} onChange={(e:any)=>setCurrentProduct({...currentProduct, price: e.target.value})} />
                    </div>
                    <div className="space-y-1">
                        <Label className="font-bold uppercase text-[10px] text-gray-400">Danh mục</Label>
                        <Select value={currentProduct.categoryId} onValueChange={(v:any)=>setCurrentProduct({...currentProduct, categoryId: v})}>
                            <SelectTrigger><SelectValue placeholder="Chọn danh mục" /></SelectTrigger>
                            <SelectContent>
                                {categories.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <div className="space-y-1">
                    <Label className="font-bold uppercase text-[10px] text-gray-400">Mô tả (Không bắt buộc)</Label>
                    <Input placeholder="Mô tả ngắn gọn..." value={currentProduct.description} onChange={(e:any)=>setCurrentProduct({...currentProduct, description: e.target.value})} />
                </div>
                <Button onClick={handleSaveProduct} className="w-full bg-orange-600 font-bold h-12">LƯU THAY ĐỔI</Button>
            </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isCategoryModalOpen} onOpenChange={setIsCategoryModalOpen}>
        <DialogContent>
            <DialogHeader><DialogTitle className="font-bold">Thêm danh mục</DialogTitle></DialogHeader>
            <div className="space-y-4 py-4">
                <Input placeholder="Tên danh mục" value={newCategory.name} onChange={(e:any)=>setNewCategory({name: e.target.value})} />
                <Button onClick={handleCreateCategory} className="w-full bg-orange-600 font-bold h-12">LƯU DANH MỤC</Button>
            </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ProductCard({ product, onEdit, onDelete }: any) {
    return (
        <Card className="border-none shadow-sm hover:shadow-xl transition-all overflow-hidden group relative bg-white">
            <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                <Button variant="ghost" size="icon" onClick={onEdit} className="h-8 w-8 bg-white shadow-sm text-blue-600"><Edit className="w-4 h-4" /></Button>
                <Button variant="ghost" size="icon" onClick={onDelete} className="h-8 w-8 bg-white shadow-sm text-red-500"><Trash2 className="w-4 h-4" /></Button>
            </div>
            <div className="h-32 bg-orange-50 flex items-center justify-center text-5xl">🍽️</div>
            <CardContent className="p-4">
                <h4 className="font-bold text-gray-900 truncate">{product.name}</h4>
                <div className="flex justify-between items-center mt-1">
                    <p className="text-orange-600 font-black text-xl">${product.price.toFixed(2)}</p>
                    <Badge className="bg-green-50 text-green-700 border-none text-[10px] font-bold">ACTIVE</Badge>
                </div>
            </CardContent>
        </Card>
    );
}
