import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Search, MapPin, Star, ArrowRight, Loader2, UtensilsCrossed, TrendingUp } from "lucide-react";
import api from "../services/api";

export function CustomerWelcome() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [restaurants, setRestaurants] = useState<any[]>([]);
  const [featuredRestaurants, setFeaturedRestaurants] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Luôn tải danh sách tiêu biểu khi vào trang
    const fetchFeatured = async () => {
      try {
        const res = await api.get("/auth/featured-restaurants");
        setFeaturedRestaurants(res.data);
      } catch (err) {
        console.error("Lỗi lấy dữ liệu tiêu biểu");
      }
    };
    fetchFeatured();
  }, []);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchTerm) {
        handleSearch();
      } else {
        setRestaurants([]);
      }
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  const handleSearch = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/auth/search-restaurants?name=${searchTerm}`);
      setRestaurants(res.data);
    } catch {
      console.error("Lỗi tìm kiếm");
    } finally {
      setLoading(false);
    }
  };

  const displayList = searchTerm ? restaurants : featuredRestaurants;

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="bg-orange-600 rounded-[48px] p-12 text-white relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('https://www.transparenttextures.com/patterns/food.png')]"></div>
        <div className="relative z-10 max-w-2xl">
          <h1 className="text-5xl font-black mb-4 tracking-tighter leading-tight">Giao tận nơi, <br/> Món mời tại chỗ!</h1>
          <p className="text-orange-100 text-lg font-medium mb-8">Tìm kiếm những hương vị tuyệt vời nhất xung quanh bạn</p>

          <div className="relative max-w-xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Nhập tên quán bạn muốn tìm..."
              className="pl-12 h-16 rounded-2xl border-none shadow-xl bg-white text-gray-900 text-lg font-bold"
              value={searchTerm}
              onChange={(e: any) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </section>

      {/* Featured/Search Results Section */}
      <section>
        <div className="flex items-center gap-3 mb-8 px-2">
           {searchTerm ? <Search className="text-orange-600" /> : <TrendingUp className="text-orange-600" />}
           <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tight">
              {searchTerm ? `Kết quả tìm kiếm cho "${searchTerm}"` : "Nhà hàng tiêu biểu đề xuất"}
           </h2>
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="animate-spin text-orange-600 w-12 h-12" /></div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {displayList.map((res) => (
              <Card
                  key={res.id}
                  className="border-none shadow-sm hover:shadow-2xl transition-all rounded-[32px] overflow-hidden group cursor-pointer bg-white"
                  onClick={() => navigate(`/customer/menu?restaurantId=${res.id}`)}
              >
                <CardContent className="p-0">
                  <div className="flex flex-col sm:flex-row h-full">
                     <div className="w-full sm:w-40 h-40 bg-orange-50 flex items-center justify-center text-6xl group-hover:scale-105 transition-transform shrink-0">
                        {res.logo || "🥗"}
                     </div>
                     <div className="flex-1 p-6 flex flex-col justify-between">
                        <div>
                          <div className="font-black text-xl text-gray-900 leading-tight mb-2">{res.name}</div>
                          <div className="flex items-center gap-2 text-sm text-gray-400 font-bold mb-4 uppercase tracking-tighter">
                             <MapPin className="w-4 h-4 text-orange-400" /> {res.address || "Việt Nam"}
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                           <div className="flex items-center gap-1.5 px-3 py-1 bg-orange-50 rounded-full text-xs font-black text-orange-600">
                              <Star className="w-3 h-3 fill-current" /> 4.9 (500+)
                           </div>
                           <ArrowRight className="w-5 h-5 text-gray-300 group-hover:text-orange-600 transition-colors" />
                        </div>
                     </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {!loading && displayList.length === 0 && (
              <div className="col-span-full text-center py-32 bg-white rounded-[40px] border-2 border-dashed border-gray-100">
                 <UtensilsCrossed className="w-16 h-16 mx-auto text-gray-200 mb-6" />
                 <h3 className="text-xl font-black text-gray-400 uppercase">Không tìm thấy quán nào</h3>
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
