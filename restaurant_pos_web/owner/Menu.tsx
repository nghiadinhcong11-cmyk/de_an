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
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);

  const [currentProduct, setCurrentProduct] = useState<any>(null);
  const [currentCategory, setCurrentCategory] = useState<any>(null);
  const [recipeItems, setRecipeItems] = useState<any[]>([]);
  const [activeCategoryId, setActiveCategoryId] = useState("all");

  // Product Form State
  const [productForm, setEditForm] = useState({
    name: "",
    price: 0,
    categoryId: "",
    imageUrl: ""
  });

  // Category Form State
  const [categoryForm, setCategoryForm] = useState({
    name: "",
    description: "",
    displayOrder: 0
  });

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

      // Set default category for product form if any
      if (catRes.data.length > 0 && !productForm.categoryId) {
        setEditForm(prev => ({ ...prev, categoryId: catRes.data[0].id }));
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleOpenCategory = (cat: any = null) => {
    if (cat) {
      setCurrentCategory(cat);
      setCategoryForm({
        name: cat.name,
        description: cat.description || "",
        displayOrder: cat.displayOrder || 0
      });
    } else {
      setCurrentCategory(null);
      setCategoryForm({ name: "", description: "", displayOrder: 0 });
    }
    setIsCategoryModalOpen(true);
  };

  const handleSaveCategory = async () => {
    if (!categoryForm.name) return alert("Vui lòng nhập tên danh mục");
    try {
      if (currentCategory) {
        await api.put(`/menu/categories/${currentCategory.id}`, categoryForm);
      } else {
        await api.post("/menu/categories", categoryForm);
      }
      setIsCategoryModalOpen(false);
      fetchData();
    } catch { alert("Lỗi khi lưu danh mục"); }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!confirm("Xóa danh mục này? Các món thuộc danh mục phải được chuyển đi trước.")) return;
    try {
      await api.delete(`/menu/categories/${id}`);
      if (activeCategoryId === id) setActiveCategoryId("all");
      fetchData();
    } catch (err: any) {
      alert(err.response?.data || "Lỗi khi xóa danh mục");
    }
  };

  const filteredProducts = products.filter(p =>
    activeCategoryId === "all" || p.categoryId === activeCategoryId
  );

  // Mở Modal Thêm/Sửa sản phẩm
  const handleOpenProduct = (product: any = null) => {
    if (product) {
      setCurrentProduct(product);
      setEditForm({
        name: product.name,
        price: product.price,
        categoryId: product.categoryId,
        imageUrl: product.imageUrl || ""
      });
    } else {
      setCurrentProduct(null);
      setEditForm({
        name: "",
        price: 0,
        categoryId: categories.length > 0 ? categories[0].id : "",
        imageUrl: ""
      });
    }
    setIsProductModalOpen(true);
  };

  const handleSaveProduct = async () => {
    if (!productForm.name || !productForm.categoryId) return alert("Vui lòng điền đủ tên và danh mục");
    try {
      if (currentProduct) {
        await api.put(`/menu/products/${currentProduct.id}`, productForm);
      } else {
        await api.post("/menu/products", productForm);
      }
      setIsProductModalOpen(false);
      fetchData();
    } catch { alert("Lỗi khi lưu sản phẩm"); }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm("Xóa món này khỏi thực đơn?")) return;
    try {
      await api.delete(`/menu/products/${id}`);
      fetchData();
    } catch { alert("Lỗi khi xóa"); }
  };

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
        <div>
            <h1 className="text-2xl font-black">Thực đơn & Định lượng</h1>
            <p className="text-gray-500 text-sm">Quản lý danh sách món ăn và cấu phần nguyên liệu</p>
        </div>
        <div className="flex gap-3">
            <Button onClick={() => handleOpenCategory()} variant="outline" className="font-bold border-orange-200 text-orange-600">
                <Plus className="w-4 h-4 mr-2" /> Thêm danh mục
            </Button>
            <Button onClick={() => handleOpenProduct()} className="bg-orange-600 font-bold shadow-lg shadow-orange-100">
                <Plus className="w-4 h-4 mr-2" /> Thêm món mới
            </Button>
        </div>
      </div>

      {/* Category Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-6 scrollbar-hide">
        <button
          onClick={() => setActiveCategoryId("all")}
          className={`px-6 h-10 rounded-xl text-xs font-black uppercase transition-all whitespace-nowrap ${
            activeCategoryId === "all" ? "bg-gray-900 text-white shadow-lg" : "bg-white text-gray-400 shadow-sm hover:bg-gray-50"
          }`}
        >
          Tất cả món
        </button>
        {categories.map((cat) => (
          <div key={cat.id} className="relative group">
            <button
                onClick={() => setActiveCategoryId(cat.id)}
                className={`px-6 h-10 rounded-xl text-xs font-black uppercase transition-all whitespace-nowrap pr-10 ${
                activeCategoryId === cat.id ? "bg-orange-600 text-white shadow-lg" : "bg-white text-gray-400 shadow-sm hover:bg-gray-50"
                }`}
            >
                {cat.name}
            </button>
            <div className={`absolute right-2 top-1/2 -translate-y-1/2 flex gap-1 transition-opacity ${activeCategoryId === cat.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                <button onClick={(e) => { e.stopPropagation(); handleOpenCategory(cat); }} className="p-1 hover:text-white rounded text-white/50">
                    <Edit className="w-3 h-3" />
                </button>
                <button onClick={(e) => { e.stopPropagation(); handleDeleteCategory(cat.id); }} className="p-1 hover:text-red-200 rounded text-white/50">
                    <Trash2 className="w-3 h-3" />
                </button>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {filteredProducts.map(p => (
          <Card key={p.id} className="border-none shadow-sm group bg-white overflow-hidden rounded-[24px]">
            <div className="h-40 bg-orange-50 flex items-center justify-center text-6xl relative">
                {p.imageUrl ? (
                    <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover" />
                ) : "🍽️"}
            </div>
            <CardContent className="p-5">
              <div className="flex justify-between items-start mb-2">
                <div>
                    <h4 className="font-black text-gray-900 leading-tight">{p.name}</h4>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">
                        {categories.find(c => c.id === p.categoryId)?.name}
                    </p>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="icon" title="Công thức" onClick={() => handleOpenRecipe(p)} className="h-8 w-8 text-orange-600 bg-orange-50 rounded-lg"><ChefHat className="w-4 h-4" /></Button>
                    <Button variant="ghost" size="icon" title="Chỉnh sửa" onClick={() => handleOpenProduct(p)} className="h-8 w-8 text-blue-600 bg-blue-50 rounded-lg"><Edit className="w-4 h-4" /></Button>
                    <Button variant="ghost" size="icon" title="Xóa" onClick={() => handleDeleteProduct(p.id)} className="h-8 w-8 text-red-600 bg-red-50 rounded-lg"><Trash2 className="w-4 h-4" /></Button>
                </div>
              </div>
              <p className="text-orange-600 font-black text-2xl mt-4">{p.price.toLocaleString("vi-VN")}đ</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredProducts.length === 0 && (
          <div className="text-center py-20 bg-white rounded-[32px] border-2 border-dashed border-gray-100">
              <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Không tìm thấy món ăn nào</p>
          </div>
      )}

      {/* MODAL THÊM DANH MỤC */}
      <Dialog open={isCategoryModalOpen} onOpenChange={setIsCategoryModalOpen}>
          <DialogContent className="max-w-md rounded-[32px]">
              <DialogHeader>
                  <DialogTitle className="text-2xl font-black">{currentCategory ? "Chỉnh sửa danh mục" : "Thêm danh mục mới"}</DialogTitle>
              </DialogHeader>
              <div className="space-y-5 py-4">
                  <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Tên danh mục</Label>
                      <Input value={categoryForm.name} onChange={(e: any) => setCategoryForm({...categoryForm, name: e.target.value})} className="h-12 rounded-xl" placeholder="Vd: Khai vị, Đồ uống..." />
                  </div>
                  <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Thứ tự hiển thị</Label>
                      <Input type="number" value={categoryForm.displayOrder} onChange={(e: any) => setCategoryForm({...categoryForm, displayOrder: parseInt(e.target.value) || 0})} className="h-12 rounded-xl" />
                  </div>
                  <Button onClick={handleSaveCategory} className="w-full h-12 bg-orange-600 hover:bg-orange-700 font-black text-lg shadow-xl shadow-orange-100 rounded-xl mt-4">
                      {currentCategory ? "CẬP NHẬT" : "TẠO DANH MỤC"}
                  </Button>
              </div>
          </DialogContent>
      </Dialog>

      {/* MODAL THÊM / SỬA SẢN PHẨM */}
      <Dialog open={isProductModalOpen} onOpenChange={setIsProductModalOpen}>
          <DialogContent className="max-w-md rounded-[32px]">
              <DialogHeader>
                  <DialogTitle className="text-2xl font-black">{currentProduct ? "Chỉnh sửa món" : "Thêm món mới"}</DialogTitle>
              </DialogHeader>

              <div className="space-y-5 py-4">
                  <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Tên món ăn</Label>
                      <Input value={productForm.name} onChange={(e: any) => setEditForm({...productForm, name: e.target.value})} className="h-12 rounded-xl" placeholder="Vd: Phở bò đặc biệt" />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Giá bán (VNĐ)</Label>
                        <Input type="number" value={productForm.price} onChange={(e: any) => setEditForm({...productForm, price: parseFloat(e.target.value)})} className="h-12 rounded-xl" />
                    </div>
                    <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Danh mục</Label>
                        <Select value={productForm.categoryId} onValueChange={(v) => setEditForm({...productForm, categoryId: v})}>
                            <SelectTrigger className="h-12 rounded-xl"><SelectValue /></SelectTrigger>
                            <SelectContent>
                                {categories.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Link ảnh (Không bắt buộc)</Label>
                      <Input value={productForm.imageUrl} onChange={(e: any) => setEditForm({...productForm, imageUrl: e.target.value})} className="h-12 rounded-xl" placeholder="https://..." />
                  </div>

                  <Button onClick={handleSaveProduct} className="w-full h-12 bg-orange-600 hover:bg-orange-700 font-black text-lg shadow-xl shadow-orange-100 rounded-xl mt-4">
                      {currentProduct ? "CẬP NHẬT MÓN" : "THÊM VÀO THỰC ĐƠN"}
                  </Button>
              </div>
          </DialogContent>
      </Dialog>

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
