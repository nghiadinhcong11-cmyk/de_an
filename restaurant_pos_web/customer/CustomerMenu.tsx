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
        // Lấy dữ liệu menu dựa trên restaurantId (hoặc mặc định)
        const [catRes, prodRes] = await Promise.all([
          api.get(`/Menu/categories?restaurantId=${restaurantId}`),
          api.get(`/Menu/products?restaurantId=${restaurantId}`)
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

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-orange-600" /></div>;

  return (
    <div className="pb-24 bg-white min-h-screen">
      {/* Top Header */}
      <div className="p-4 flex items-center gap-4 sticky top-0 bg-white z-20 shadow-sm border-b border-gray-50">
         <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="rounded-full h-10 w-10"><ArrowLeft className="w-5 h-5" /></Button>
         <div className="flex-1">
            <h2 className="text-lg font-black leading-none">Thực đơn</h2>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Hương vị tuyệt hảo</p>
         </div>
      </div>

      <div className="p-4 space-y-4">
         {/* Search */}
         <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
                placeholder="Tìm món ăn ngon..."
                className="pl-10 h-11 bg-gray-50 border-none rounded-xl"
                value={searchTerm}
                onChange={(e: any) => setSearchTerm(e.target.value)}
            />
         </div>

         {/* Category Tabs */}
         <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            <button
                onClick={() => setActiveCategory("all")}
                className={`px-5 py-2 rounded-xl text-xs font-black uppercase transition-all ${activeCategory === 'all' ? 'bg-orange-600 text-white shadow-lg shadow-orange-100' : 'bg-gray-100 text-gray-400'}`}
            >
                Tất cả
            </button>
            {categories.map(c => (
               <button
                    key={c.id}
                    onClick={() => setActiveCategory(c.id)}
                    className={`px-5 py-2 rounded-xl text-xs font-black uppercase whitespace-nowrap transition-all ${activeCategory === c.id ? 'bg-orange-600 text-white shadow-lg shadow-orange-100' : 'bg-gray-100 text-gray-400'}`}
               >
                   {c.name}
               </button>
            ))}
         </div>

         {/* Product List */}
         <div className="grid grid-cols-1 gap-4">
            {filteredItems.map(p => (
              <Card key={p.id} className="border-none shadow-sm hover:shadow-md transition-shadow rounded-2xl overflow-hidden bg-gray-50/50">
                 <CardContent className="p-3 flex gap-4">
                    <div className="w-20 h-20 bg-white rounded-xl flex items-center justify-center text-4xl shadow-inner shrink-0">🍽️</div>
                    <div className="flex-1 min-w-0 flex flex-col justify-between py-1">
                       <div>
                          <h4 className="font-bold text-gray-900 truncate">{p.name}</h4>
                          <p className="text-[10px] text-gray-400 line-clamp-1">{p.description || "Món ăn ngon đậm đà bản sắc..."}</p>
                       </div>
                       <div className="flex justify-between items-center">
                          <span className="text-orange-600 font-black text-lg">${p.price.toFixed(2)}</span>
                          <Button size="sm" className="h-8 w-8 rounded-full p-0 bg-orange-600"><Plus className="w-4 h-4" /></Button>
                       </div>
                    </div>
                 </CardContent>
              </Card>
            ))}
         </div>
      </div>

      {/* Nút giỏ hàng nổi */}
      <div className="fixed bottom-24 right-6 z-40">
         <Button onClick={() => navigate('/customer/cart')} className="h-14 w-14 rounded-full bg-gray-900 shadow-2xl flex flex-col gap-0 items-center justify-center p-0 group hover:bg-orange-600 transition-all">
            <ShoppingBag className="w-5 h-5" />
            <span className="text-[8px] font-black uppercase">Cart</span>
         </Button>
      </div>
    </div>
  );
}
