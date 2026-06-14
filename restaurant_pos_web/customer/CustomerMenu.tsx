import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Search, Loader2, Info, UtensilsCrossed, Star } from "lucide-react";
import api from "../services/api";

export function CustomerMenu() {
  const [searchParams] = useSearchParams();
  const queryRestaurantId = searchParams.get("restaurantId");
  const branchName = searchParams.get("branchName");

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

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-brand-dark"><Loader2 className="animate-spin text-brand-accent w-12 h-12" /></div>;

  return (
    <div className="min-h-screen bg-brand-dark text-white p-6 md:p-12 space-y-12">
      {/* Premium Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 border-b border-white/5 pb-12">
         <div className="space-y-4">
            <div className="flex items-center gap-3">
                <UtensilsCrossed className="text-brand-accent w-8 h-8" />
                <h1 className="text-4xl md:text-6xl font-black tracking-tighter uppercase">Thực Đơn <span className="text-brand-accent italic">Signature</span></h1>
            </div>
            <p className="text-gray-400 text-lg font-medium max-w-2xl leading-relaxed">
                Khám phá bản giao hưởng hương vị {branchName ? `tại ${branchName}` : ""} được tinh tuyển bởi các đầu bếp nghệ nhân.
            </p>
         </div>
         <div className="bg-white/5 backdrop-blur-xl text-brand-accent px-8 py-4 rounded-2xl flex items-center gap-4 border border-white/10 shadow-2xl">
            <Info className="w-5 h-5 animate-pulse" />
            <p className="text-[10px] font-black uppercase tracking-[0.2em]">Chế độ tham khảo trực tuyến</p>
         </div>
      </div>

      {/* Advanced Filter Bar */}
      <div className="flex flex-col lg:flex-row gap-8 items-center sticky top-28 z-40 bg-brand-dark/80 backdrop-blur-md py-4 -mx-4 px-4">
         <div className="relative flex-1 w-full group">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5 group-focus-within:text-brand-accent transition-colors" />
            <Input
                placeholder="Tìm kiếm món ăn tinh hoa..."
                className="pl-14 h-16 bg-white/5 border border-white/10 rounded-2xl text-lg font-bold placeholder:text-gray-600 focus:border-brand-accent focus:ring-0 transition-all"
                value={searchTerm}
                onChange={(e: any) => setSearchTerm(e.target.value)}
            />
         </div>
         <div className="flex gap-4 overflow-x-auto w-full lg:w-auto pb-4 lg:pb-0 no-scrollbar">
            <FilterTab
                active={activeCategory === "all"}
                onClick={() => setActiveCategory("all")}
                label="Tất cả"
            />
            {categories.map(c => (
               <FilterTab
                    key={c.id}
                    active={activeCategory === c.id}
                    onClick={() => setActiveCategory(c.id)}
                    label={c.name}
               />
            ))}
         </div>
      </div>

      {/* Cinematic Product Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-12">
            {filteredItems.map(p => (
              <div key={p.id} className="group space-y-6">
                <div className="aspect-[4/5] bg-white/5 rounded-[40px] overflow-hidden relative shadow-2xl border border-white/5 transition-all duration-500 hover:-translate-y-2 hover:border-brand-accent/30">
                    {p.imageUrl ? (
                        <img src={p.imageUrl} className="w-full h-full object-cover transition-transform duration-[1.5s] group-hover:scale-110" alt={p.name} />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-7xl opacity-20">🍽️</div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-brand-dark via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity"></div>

                    <div className="absolute top-6 right-6">
                        <div className="bg-brand-dark/60 backdrop-blur-md p-3 rounded-2xl border border-white/10 text-brand-accent">
                            <Star className="w-4 h-4 fill-current" />
                        </div>
                    </div>
                </div>

                <div className="px-2 space-y-2">
                    <h4 className="font-black text-2xl tracking-tighter uppercase group-hover:text-brand-accent transition-colors truncate">{p.name}</h4>
                    <p className="text-gray-500 text-sm font-medium line-clamp-2 leading-relaxed">{p.description || "Một tuyệt phẩm nghệ thuật ẩm thực kết hợp từ những nguyên liệu tươi ngon nhất."}</p>
                    <div className="pt-4 flex justify-between items-center">
                        <div className="flex flex-col">
                            <span className="text-[9px] font-black text-gray-600 uppercase tracking-widest">Giá niêm yết</span>
                            <p className="text-brand-accent font-black text-3xl tracking-tighter">{p.price.toLocaleString("vi-VN")}đ</p>
                        </div>
                        <Button className="bg-white/5 hover:bg-brand-accent border border-white/10 rounded-xl h-12 w-12 p-0 shadow-xl transition-all">
                            <Info className="w-5 h-5" />
                        </Button>
                    </div>
                </div>
              </div>
            ))}
      </div>

      {filteredItems.length === 0 && (
          <div className="text-center py-40 bg-white/5 rounded-[60px] border-2 border-dashed border-white/10">
              <UtensilsCrossed className="w-16 h-16 mx-auto mb-6 text-gray-700 opacity-30" />
              <p className="font-black text-gray-500 uppercase tracking-widest">Không tìm thấy món ăn phù hợp</p>
          </div>
      )}
    </div>
  );
}

function FilterTab({ active, onClick, label }: { active: boolean, onClick: () => void, label: string }) {
    return (
        <button
            onClick={onClick}
            className={`px-10 h-14 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all whitespace-nowrap border ${active ? 'bg-brand-accent text-white border-brand-accent shadow-[0_0_20px_rgba(249,115,22,0.4)]' : 'bg-white/5 text-gray-500 border-white/10 hover:border-white/20'}`}
        >
            {label}
        </button>
    );
}
