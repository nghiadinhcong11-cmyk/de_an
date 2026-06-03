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
import { Loader2, Plus, Trash2, Edit, ChefHat, Save } from "lucide-react";

export function OwnerMenu() {
  const [categories, setCategories] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [ingredients, setIngredients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isRecipeModalOpen, setIsRecipeModalOpen] = useState(false);

  const [currentProduct, setCurrentProduct] = useState<any>(null);
  const [recipeItems, setRecipeItems] = useState<any[]>([]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [catRes, prodRes, ingRes] = await Promise.all([
        api.get("/menu/categories"),
        api.get("/menu/products"),
        api.get("/inventory")
      ]);
      setCategories(catRes.data);
      setProducts(prodRes.data);
      setIngredients(ingRes.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  // Mở Modal định lượng món ăn
  const handleOpenRecipe = async (product: any) => {
      setCurrentProduct(product);
      try {
          const res = await api.get(`/menu/products/${product.id}/ingredients`);
          setRecipeItems(res.data || []);
          setIsRecipeModalOpen(true);
      } catch {
          setRecipeItems([]);
          setIsRecipeModalOpen(true);
      }
  };

  const handleAddIngredientToRecipe = () => {
      setRecipeItems([...recipeItems, { ingredientId: '', quantity: 0 }]);
  };

  const handleSaveRecipe = async () => {
      try {
          await api.post(`/menu/products/${currentProduct.id}/ingredients`, recipeItems);
          alert("Lưu định lượng thành công!");
          setIsRecipeModalOpen(false);
      } catch { alert("Lỗi khi lưu định lượng"); }
  };

  if (loading) return <div className="flex justify-center p-20"><Loader2 className="animate-spin text-orange-600 w-10 h-10" /></div>;

  return (
    <div className="p-8 bg-gray-50 min-h-screen text-gray-900">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-black">Thực đơn & Định lượng</h1>
        <Button className="bg-orange-600 font-bold"><Plus className="w-4 h-4 mr-2" /> Thêm món mới</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {products.map(p => (
          <Card key={p.id} className="border-none shadow-sm group bg-white overflow-hidden">
            <div className="h-32 bg-orange-50 flex items-center justify-center text-5xl">🍽️</div>
            <CardContent className="p-4">
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-bold text-gray-900">{p.name}</h4>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="icon" onClick={() => handleOpenRecipe(p)} className="h-8 w-8 text-orange-600 bg-orange-50"><ChefHat className="w-4 h-4" /></Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-600 bg-blue-50"><Edit className="w-4 h-4" /></Button>
                </div>
              </div>
              <p className="text-orange-600 font-black text-xl">${p.price.toFixed(2)}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* MODAL QUẢN LÝ ĐỊNH LƯỢNG (RECIPE) */}
      <Dialog open={isRecipeModalOpen} onOpenChange={setIsRecipeModalOpen}>
          <DialogContent className="max-w-2xl">
              <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                      <ChefHat className="text-orange-600" />
                      Công thức: {currentProduct?.name}
                  </DialogTitle>
              </DialogHeader>

              <div className="py-4 space-y-4">
                  <div className="bg-orange-50 p-4 rounded-xl text-xs text-orange-700 font-medium">
                      Thiết lập nguyên liệu tiêu tốn cho 1 đơn vị món ăn. Hệ thống sẽ tự động trừ kho khi món được phục vụ.
                  </div>

                  <div className="space-y-3">
                      {recipeItems.map((item, idx) => (
                          <div key={idx} className="flex gap-3 items-end bg-gray-50 p-3 rounded-xl">
                              <div className="flex-1 space-y-1">
                                  <Label className="text-[10px] font-black uppercase text-gray-400">Nguyên liệu</Label>
                                  <Select value={item.ingredientId} onValueChange={(v: any) => {
                                      const newItems = [...recipeItems];
                                      newItems[idx].ingredientId = v;
                                      setRecipeItems(newItems);
                                  }}>
                                      <SelectTrigger><SelectValue placeholder="Chọn..." /></SelectTrigger>
                                      <SelectContent>
                                          {ingredients.map(ing => <SelectItem key={ing.id} value={ing.id}>{ing.name} ({ing.unit})</SelectItem>)}
                                      </SelectContent>
                                  </Select>
                              </div>
                              <div className="w-32 space-y-1">
                                  <Label className="text-[10px] font-black uppercase text-gray-400">Số lượng dùng</Label>
                                  <Input type="number" value={item.quantity} onChange={(e: any) => {
                                      const newItems = [...recipeItems];
                                      newItems[idx].quantity = parseFloat(e.target.value);
                                      setRecipeItems(newItems);
                                  }} />
                              </div>
                              <Button variant="ghost" onClick={() => setRecipeItems(recipeItems.filter((_, i) => i !== idx))} className="text-red-500 h-11"><Trash2 className="w-4 h-4" /></Button>
                          </div>
                      ))}
                  </div>

                  <Button variant="outline" onClick={handleAddIngredientToRecipe} className="w-full border-dashed border-gray-300 font-bold gap-2">
                      <Plus className="w-4 h-4" /> Thêm nguyên liệu vào công thức
                  </Button>

                  <Button onClick={handleSaveRecipe} className="w-full bg-orange-600 h-12 font-bold gap-2 shadow-lg shadow-orange-100">
                      <Save className="w-4 h-4" /> LƯU CÔNG THỨC
                  </Button>
              </div>
          </DialogContent>
      </Dialog>
    </div>
  );
}
