import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import { Search, Plus, Loader2, ArrowLeft, ShoppingBag } from "lucide-react";
import api from "../services/api";

export function CustomerMenu() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Lấy restaurantId từ URL (Khi khách nhấn từ trang Explore)
  const queryRestaurantId = searchParams.get("restaurantId");

  const [categories, setCategories] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Nếu không có ID trong URL, hãy thử lấy thông tin quán mặc định đầu tiên
        let targetId = queryRestaurantId;
        if (!targetId) {
            const infoRes = await api.get("/auth/find-restaurant-info");
            targetId = infoRes.data.id;
        }

        const [catRes, prodRes] = await Promise.all([
          api.get(`/menu/categories?restaurantId=${targetId}`),
          api.get(`/menu/products?restaurantId=${targetId}`)
        ]);
        setCategories(catRes.data);
        setProducts(prodRes.data);
      } catch (err) {
        console.error("Lỗi lấy dữ liệu menu", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [queryRestaurantId]);

  const filteredItems = products.filter((p) => {
    const matchesCategory = activeCategory === "all" || p.categoryId === activeCategory;
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-orange-600 w-12 h-12" /></div>;

  return (
    <div className="space-y-8">
      {/* Search & Category Tabs */}
      <div className="flex flex-col md:flex-row gap-6 items-center bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
         <div className="relative flex-1 w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 w-5 h-5" />
            <Input
                placeholder="Tìm món ăn ngon..."
                className="pl-12 h-14 bg-gray-50 border-none rounded-2xl text-lg font-bold"
                value={searchTerm}
                onChange={(e: any) => setSearchTerm(e.target.value)}
            />
         </div>
         <div className="flex gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-hide">
            <button
                onClick={() => setActiveCategory("all")}
                className={`px-8 h-12 rounded-2xl text-sm font-black uppercase transition-all whitespace-nowrap ${activeCategory === 'all' ? 'bg-orange-600 text-white shadow-lg shadow-orange-100' : 'bg-gray-100 text-gray-400'}`}
            >
                Tất cả
            </button>
            {categories.map(c => (
               <button
                    key={c.id}
                    onClick={() => setActiveCategory(c.id)}
                    className={`px-8 h-12 rounded-2xl text-sm font-black uppercase whitespace-nowrap transition-all ${activeCategory === c.id ? 'bg-orange-600 text-white shadow-lg shadow-orange-100' : 'bg-gray-100 text-gray-400'}`}
               >
                   {c.name}
               </button>
            ))}
         </div>
      </div>

      {/* Product List */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {filteredItems.map(p => (
              <Card key={p.id} className="border-none shadow-sm hover:shadow-2xl transition-all rounded-[32px] overflow-hidden group bg-white">
                 <div className="aspect-square bg-orange-50 flex items-center justify-center text-7xl relative group-hover:scale-105 transition-transform duration-500">
                    🍽️
                 </div>
                 <CardContent className="p-6">
                    <div>
                        <h4 className="font-black text-xl text-gray-900 truncate mb-1">{p.name}</h4>
                        <p className="text-orange-600 font-black text-2xl">${p.price.toFixed(2)}</p>
                    </div>
                    <Button className="w-full mt-4 bg-gray-900 hover:bg-orange-600 h-12 rounded-2xl font-black gap-2 transition-all">
                        <Plus className="w-5 h-5" /> CHỌN MÓN
                    </Button>
                 </CardContent>
              </Card>
            ))}
      </div>

      {/* Floating Cart Button */}
      <div className="fixed bottom-24 right-10 z-40">
         <Button onClick={() => navigate('/customer/cart')} className="h-16 w-16 rounded-full bg-orange-600 shadow-2xl flex flex-col items-center justify-center p-0 hover:scale-110 transition-all">
            <ShoppingBag className="w-6 h-6 text-white" />
         </Button>
      </div>
    </div>
  );
}
