import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Card, CardContent } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Search, Loader2, Info } from "lucide-react";
import api from "../services/api";

export function CustomerMenu() {
  const [searchParams] = useSearchParams();
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
        let targetId = queryRestaurantId || localStorage.getItem("current_restaurant_id");

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
      <div className="bg-white p-8 rounded-[40px] shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-center gap-6">
         <div>
            <h1 className="text-3xl font-black text-gray-900">Thực đơn nhà hàng</h1>
            <p className="text-gray-500 font-medium">Khám phá các món ăn tinh hoa được chế biến từ đầu bếp hàng đầu</p>
         </div>
         <div className="bg-blue-50 text-blue-700 px-6 py-3 rounded-2xl flex items-center gap-3">
            <Info className="w-5 h-5" />
            <p className="text-xs font-black uppercase tracking-wider">Chỉ xem & Tham khảo</p>
         </div>
      </div>

      {/* Search & Category Tabs */}
      <div className="flex flex-col md:flex-row gap-6 items-center">
         <div className="relative flex-1 w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 w-5 h-5" />
            <Input
                placeholder="Bạn muốn tìm món gì hôm nay?"
                className="pl-12 h-14 bg-white border-none rounded-2xl text-lg font-bold shadow-sm"
                value={searchTerm}
                onChange={(e: any) => setSearchTerm(e.target.value)}
            />
         </div>
         <div className="flex gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-hide">
            <button
                onClick={() => setActiveCategory("all")}
                className={`px-8 h-12 rounded-2xl text-xs font-black uppercase transition-all whitespace-nowrap ${activeCategory === 'all' ? 'bg-orange-600 text-white shadow-lg' : 'bg-white text-gray-400 shadow-sm'}`}
            >
                Tất cả
            </button>
            {categories.map(c => (
               <button
                    key={c.id}
                    onClick={() => setActiveCategory(c.id)}
                    className={`px-8 h-12 rounded-2xl text-xs font-black uppercase whitespace-nowrap transition-all ${activeCategory === c.id ? 'bg-orange-600 text-white shadow-lg' : 'bg-white text-gray-400 shadow-sm'}`}
               >
                   {c.name}
               </button>
            ))}
         </div>
      </div>

      {/* Product List */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {filteredItems.map(p => (
              <Card key={p.id} className="border-none shadow-sm hover:shadow-xl transition-all rounded-[32px] overflow-hidden group bg-white">
                 <div className="aspect-square bg-orange-50 flex items-center justify-center text-7xl relative group-hover:scale-105 transition-transform duration-500">
                    {p.imageUrl ? <img src={p.imageUrl} className="w-full h-full object-cover" /> : "🍽️"}
                 </div>
                 <CardContent className="p-6">
                    <h4 className="font-black text-xl text-gray-900 truncate mb-1">{p.name}</h4>
                    <p className="text-gray-400 text-xs font-medium mb-4 line-clamp-2">{p.description || "Hương vị thơm ngon, đậm đà chuẩn vị truyền thống."}</p>
                    <div className="pt-4 border-t border-gray-50 flex justify-between items-center">
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Giá bán</span>
                        <p className="text-orange-600 font-black text-2xl">${p.price.toFixed(2)}</p>
                    </div>
                 </CardContent>
              </Card>
            ))}
      </div>

      {filteredItems.length === 0 && (
          <div className="text-center py-20 bg-white rounded-[40px] shadow-sm border border-dashed border-gray-200">
              <p className="text-gray-400 font-bold">Không tìm thấy món ăn phù hợp</p>
          </div>
      )}
    </div>
  );
}
