import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import { Search, Plus, Loader2, Filter, ShoppingBag } from "lucide-react";
import api from "../services/api";

export function CustomerMenu() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const restaurantId = searchParams.get("restaurantId");

  const [categories, setCategories] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [catRes, prodRes] = await Promise.all([
          api.get(`/menu/categories?restaurantId=${restaurantId}`),
          api.get(`/menu/products?restaurantId=${restaurantId}`)
        ]);
        setCategories(catRes.data);
        setProducts(prodRes.data);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [restaurantId]);

  const filteredItems = products.filter((p) => {
    const matchesCategory = activeCategory === "all" || p.categoryId === activeCategory;
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-orange-600 w-12 h-12" /></div>;

  return (
    <div className="space-y-8">
      {/* Search & Category Filter Section */}
      <div className="flex flex-col md:flex-row gap-6 items-center justify-between bg-white p-6 rounded-3xl shadow-sm">
         <div className="relative flex-1 w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 w-5 h-5" />
            <Input
                placeholder="Tìm món ngon bạn thích..."
                className="pl-12 h-14 bg-gray-50 border-none rounded-2xl text-lg font-medium"
                value={searchTerm}
                onChange={(e: any) => setSearchTerm(e.target.value)}
            />
         </div>
         <div className="flex gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-hide">
            <button
                onClick={() => setActiveCategory("all")}
                className={`px-8 h-12 rounded-2xl text-sm font-black uppercase transition-all whitespace-nowrap ${activeCategory === 'all' ? 'bg-orange-600 text-white shadow-xl shadow-orange-100' : 'bg-gray-100 text-gray-400'}`}
            >
                Tất cả
            </button>
            {categories.map(c => (
               <button
                    key={c.id}
                    onClick={() => setActiveCategory(c.id)}
                    className={`px-8 h-12 rounded-2xl text-sm font-black uppercase whitespace-nowrap transition-all ${activeCategory === c.id ? 'bg-orange-600 text-white shadow-xl shadow-orange-100' : 'bg-gray-100 text-gray-400'}`}
               >
                   {c.name}
               </button>
            ))}
         </div>
      </div>

      {/* Main Grid List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {filteredItems.map(p => (
          <Card key={p.id} className="border-none shadow-sm hover:shadow-2xl transition-all rounded-[32px] overflow-hidden group bg-white">
             <div className="aspect-square bg-orange-50 flex items-center justify-center text-7xl relative">
                <div className="absolute top-4 right-4"><Badge className="bg-white/80 backdrop-blur-md text-orange-600 border-none font-black text-[10px]">NEW</Badge></div>
                🍽️
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors"></div>
             </div>
             <CardContent className="p-6">
                <div className="mb-4">
                  <h4 className="font-black text-xl text-gray-900 truncate mb-1">{p.name}</h4>
                  <p className="text-sm text-gray-400 font-medium line-clamp-2 h-10">{p.description || "Hương vị thơm ngon, chế biến từ nguyên liệu sạch tươi mỗi ngày..."}</p>
                </div>
                <div className="flex justify-between items-center pt-4 border-t border-gray-50">
                  <div>
                    <p className="text-[10px] text-gray-400 font-black uppercase tracking-tighter">Giá bán</p>
                    <p className="text-2xl font-black text-orange-600">${p.price.toFixed(2)}</p>
                  </div>
                  <Button className="h-12 w-12 rounded-2xl bg-gray-900 hover:bg-orange-600 shadow-lg shadow-gray-200 p-0 transition-all active:scale-90">
                    <Plus className="w-6 h-6" />
                  </Button>
                </div>
             </CardContent>
          </Card>
        ))}
      </div>

      {filteredItems.length === 0 && (
         <div className="py-32 text-center bg-white rounded-[40px] shadow-sm">
            <div className="text-6xl mb-6">🏜️</div>
            <h3 className="text-xl font-black text-gray-900">Không tìm thấy món ăn nào</h3>
            <p className="text-gray-400 font-medium">Bạn hãy thử tìm kiếm với từ khóa khác nhé</p>
         </div>
      )}
    </div>
  );
}
