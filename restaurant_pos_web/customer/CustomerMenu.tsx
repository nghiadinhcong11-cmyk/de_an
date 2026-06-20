import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Search, Loader2, Info, UtensilsCrossed, Star, ChevronDown } from "lucide-react";
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
         <div className="bg-white/10 backdrop-blur-xl text-brand-accent px-8 py-4 rounded-2xl flex items-center gap-4 border border-white/20 shadow-2xl">
            <Info className="w-5 h-5 animate-pulse" />
            <p className="text-xs font-black uppercase tracking-wider">Chế độ tham khảo trực tuyến</p>
         </div>
      </div>

      {/* Advanced Filter Bar */}
      <div className="flex flex-col lg:flex-row gap-8 items-center sticky top-28 z-40 bg-brand-dark/90 backdrop-blur-md py-4 -mx-4 px-4 border-b border-white/5">
         <div className="relative flex-1 w-full group">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-brand-accent transition-colors w-5 h-5" />
            <Input
                placeholder="Tìm kiếm món ăn tinh hoa..."
                className="pl-14 h-16 bg-white/10 border border-white/20 rounded-2xl text-lg font-bold text-white placeholder:text-gray-500 focus:border-brand-accent focus:ring-0 transition-all"
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
         <Button
            variant="outline"
            onClick={() => document.getElementById('reviews-section')?.scrollIntoView({ behavior: 'smooth' })}
            className="hidden lg:flex bg-brand-accent/10 border-brand-accent/20 text-brand-accent rounded-2xl h-16 px-6 font-black uppercase text-xs tracking-widest gap-3"
         >
            <Star className="w-4 h-4 fill-current" /> Xem Đánh giá
         </Button>
      </div>

      {/* Cinematic Product Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-12">
            {filteredItems.map(p => (
              <div key={p.id} className="group space-y-6">
                <div className="aspect-[4/5] bg-white/10 rounded-[40px] overflow-hidden relative shadow-2xl border border-white/10 transition-all duration-500 hover:-translate-y-2 hover:border-brand-accent/30">
                    {p.imageUrl ? (
                        <img src={p.imageUrl} className="w-full h-full object-cover transition-transform duration-[1.5s] group-hover:scale-110" alt={p.name} />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-7xl opacity-20">🍽️</div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-brand-dark via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity"></div>

                    <div className="absolute top-6 right-6">
                        <div className="bg-brand-dark/80 backdrop-blur-md p-3 rounded-2xl border border-white/20 text-brand-accent">
                            <Star className="w-4 h-4 fill-current" />
                        </div>
                    </div>
                </div>

                <div className="px-2 space-y-2">
                    <h4 className="font-black text-2xl tracking-tighter uppercase group-hover:text-brand-accent transition-colors truncate">{p.name}</h4>
                    <p className="text-gray-300 text-sm font-medium line-clamp-2 leading-relaxed">{p.description || "Một tuyệt phẩm nghệ thuật ẩm thực kết hợp từ những nguyên liệu tươi ngon nhất."}</p>
                    <div className="pt-4 flex justify-between items-center">
                        <div className="flex flex-col">
                            <span className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Giá niêm yết</span>
                            <p className="text-brand-accent font-black text-3xl tracking-tighter">{p.price.toLocaleString("vi-VN")}đ</p>
                        </div>
                        <Button className="bg-white/10 hover:bg-brand-accent border border-white/20 rounded-xl h-12 w-12 p-0 shadow-xl transition-all text-white">
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

      {/* Reviews Section */}
      <ReviewGrid restaurantId={queryRestaurantId || localStorage.getItem("current_restaurant_id")} />
    </div>
  );
}

function ReviewGrid({ restaurantId }: { restaurantId: string | null }) {
    const [reviews, setReviews] = useState<any[]>([]);
    const [branches, setBranches] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Filter states
    const [selectedBranch, setSelectedBranch] = useState("all");
    const [selectedStars, setSelectedStars] = useState("all");
    const [isCollapsed, setIsCollapsed] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const targetId = restaurantId || localStorage.getItem("current_restaurant_id");

                const [feedbackRes, branchRes] = await Promise.all([
                    api.get(`/feedbacks?restaurantId=${targetId}`),
                    api.get(`/branches/public?restaurantId=${targetId}`)
                ]);
                setReviews(feedbackRes.data);
                setBranches(branchRes.data);
            } catch (err) {
                console.error("Lỗi tải đánh giá và chi nhánh", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [restaurantId]);

    const filteredReviews = reviews.filter(r => {
        const avgRating = ((r.serviceRating || 0) + (r.foodRating || 0) + (r.priceRating || 0) + (r.atmosphereRating || 0)) / 4;
        const matchesBranch = selectedBranch === "all" || r.branchName === selectedBranch;
        const matchesStars = selectedStars === "all" || Math.round(avgRating).toString() === selectedStars;
        return matchesBranch && matchesStars;
    });

    // Calculate dynamic stats for the header (respects branch filter)
    const stats = useMemo(() => {
        const targetReviews = selectedBranch === "all"
            ? reviews
            : reviews.filter(r => r.branchName === selectedBranch);

        if (targetReviews.length === 0) return { avg: "5.0", count: 0 };

        const total = targetReviews.reduce((acc, r) => acc + ((r.serviceRating || 0) + (r.foodRating || 0) + (r.priceRating || 0) + (r.atmosphereRating || 0)) / 4, 0);
        return {
            avg: (total / targetReviews.length).toFixed(1),
            count: targetReviews.length
        };
    }, [reviews, selectedBranch]);

    if (loading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-brand-accent w-10 h-10" /></div>;

    return (
        <div id="reviews-section" className="pt-24 space-y-12">
            {/* Dynamic Header */}
            <div className="flex flex-col md:flex-row items-end justify-between gap-8 border-b border-white/5 pb-12">
                <div className="space-y-4">
                    <div className="flex items-center gap-3 text-brand-accent">
                        <Star className="w-8 h-8 fill-current" />
                        <span className="text-sm font-black uppercase tracking-[0.3em]">Community Reviews</span>

                        {/* Dynamic Rating Badge */}
                        <div className="ml-auto flex items-center gap-2 bg-white/5 backdrop-blur-xl px-4 py-2 rounded-2xl border border-white/10 shadow-2xl">
                            <Star className="w-3.5 h-3.5 fill-brand-accent text-brand-accent" />
                            <div className="flex flex-col leading-none">
                                <span className="text-xs font-black text-white">{stats.avg}</span>
                                <span className="text-[9px] font-bold text-gray-500 mt-0.5">({stats.count} đánh giá)</span>
                            </div>
                        </div>
                    </div>
                    <h2 className="text-5xl md:text-7xl font-black tracking-tighter uppercase leading-none">
                        Cảm nhận <br /> <span className="text-brand-accent italic">Khách hàng</span>
                    </h2>
                </div>
                <p className="text-gray-400 text-lg max-w-md font-medium leading-relaxed">
                    Những chia sẻ chân thực từ cộng đồng khách hàng đã trải nghiệm dịch vụ tại nhà hàng.
                </p>
            </div>

            {/* Filter and Toggle Controls */}
            <div className="flex flex-wrap items-center justify-between gap-6 bg-white/5 p-6 rounded-[32px] border border-white/10">
                <div className="flex flex-wrap items-center gap-6">
                    {/* Branch Filter */}
                    <div className="flex flex-col gap-2">
                        <span className="text-[10px] uppercase tracking-widest text-gray-400 font-black">Chi nhánh</span>
                        <select
                            value={selectedBranch}
                            onChange={(e) => setSelectedBranch(e.target.value)}
                            className="bg-brand-dark border border-white/10 text-white rounded-xl px-4 py-2.5 text-xs font-bold outline-none focus:border-brand-accent transition-all min-w-[180px]"
                        >
                            <option value="all">Tất cả chi nhánh</option>
                            {branches.map(b => (
                                <option key={b.id} value={b.name}>{b.name}</option>
                            ))}
                        </select>
                    </div>

                    {/* Star Rating Filter */}
                    <div className="flex flex-col gap-2">
                        <span className="text-[10px] uppercase tracking-widest text-gray-400 font-black">Xếp hạng</span>
                        <div className="flex p-1 bg-brand-dark border border-white/10 rounded-xl gap-1 overflow-x-auto no-scrollbar">
                            {["all", "5", "4", "3", "2", "1"].map((star) => (
                                <button
                                    key={star}
                                    onClick={() => setSelectedStars(star)}
                                    className={`px-3 py-1.5 rounded-lg text-[10px] font-black transition-all uppercase whitespace-nowrap ${
                                        selectedStars === star
                                        ? 'bg-brand-accent text-white shadow-md'
                                        : 'text-gray-400 hover:text-white'
                                    }`}
                                >
                                    {star === "all" ? "Tất cả" : `${star}★`}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Collapse Toggle Button */}
                <button
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className="p-3 bg-brand-dark border border-white/10 rounded-xl text-gray-400 hover:text-brand-accent hover:border-brand-accent/30 transition-all flex items-center justify-center"
                    title={isCollapsed ? "Mở rộng" : "Thu gọn"}
                >
                    <ChevronDown className={`w-5 h-5 transition-transform duration-500 ${isCollapsed ? 'rotate-180' : ''}`} />
                </button>
            </div>

            {/* Reviews Content Grid */}
            <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 transition-all duration-500 origin-top ${
                isCollapsed ? 'max-h-0 opacity-0 scale-y-0 overflow-hidden hidden' : 'max-h-[5000px] opacity-100 scale-y-100'
            }`}>
                {filteredReviews.map((r) => {
                    const avgRating = ((r.serviceRating || 0) + (r.foodRating || 0) + (r.priceRating || 0) + (r.atmosphereRating || 0)) / 4;
                    return (
                        <div key={r.id} className="bg-white/5 border border-white/10 p-8 rounded-[40px] space-y-6 hover:bg-white/[0.08] transition-all group">
                            <div className="flex justify-between items-start">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-brand-accent/20 rounded-2xl flex items-center justify-center text-brand-accent font-black text-xl shadow-inner">
                                        {r.name?.charAt(0) || "C"}
                                    </div>
                                    <div>
                                        <h4 className="font-black text-white uppercase text-sm tracking-wider">{r.name || "Khách hàng"}</h4>
                                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">{new Date(r.createdAtUtc).toLocaleDateString("vi-VN")}</p>
                                    </div>
                                </div>
                                <div className="flex gap-1">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <Star key={star} className={`w-3 h-3 ${star <= Math.round(avgRating) ? 'text-brand-accent fill-current' : 'text-gray-700'}`} />
                                    ))}
                                </div>
                            </div>

                            <p className="text-gray-300 text-sm italic font-medium leading-relaxed">
                                "{r.message}"
                            </p>

                            <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                     <div className={`w-2 h-2 rounded-full ${avgRating >= 4 ? 'bg-green-500' : 'bg-orange-500'}`}></div>
                                     <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Đánh giá: {avgRating.toFixed(1)}/5</span>
                                </div>
                                <span className="text-[10px] font-black text-brand-accent uppercase tracking-widest truncate max-w-[120px]">{r.branchName}</span>
                            </div>
                        </div>
                    );
                })}

                {filteredReviews.length === 0 && (
                    <div className="col-span-full text-center py-20 bg-white/5 rounded-[40px] border border-dashed border-white/10">
                        <Star className="w-12 h-12 mx-auto mb-4 text-gray-700 opacity-20" />
                        <p className="text-gray-500 font-black uppercase text-xs tracking-widest">Không có đánh giá nào phù hợp với bộ lọc</p>
                    </div>
                )}
            </div>
        </div>
    );
}

function FilterTab({ active, onClick, label }: { active: boolean, onClick: () => void, label: string }) {
    return (
        <button
            onClick={onClick}
            className={`px-10 h-14 rounded-2xl text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap border ${active ? 'bg-brand-accent text-white border-brand-accent shadow-[0_0_20px_rgba(249,115,22,0.4)]' : 'bg-white/5 text-gray-400 border-white/10 hover:border-white/20'}`}
        >
            {label}
        </button>
    );
}
