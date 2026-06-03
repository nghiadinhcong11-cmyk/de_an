import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Search, MapPin, Star, ArrowRight, Loader2, UtensilsCrossed } from "lucide-react";
import api from "../services/api";

export function CustomerWelcome() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [restaurants, setRestaurants] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Tìm kiếm nhà hàng khi người dùng gõ
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      handleSearch();
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

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header với Search Bar */}
      <div className="bg-orange-600 p-6 pt-12 rounded-b-[40px] shadow-lg sticky top-0 z-30">
        <h1 className="text-2xl font-black text-white mb-4">Khám phá quán ngon</h1>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Input
            placeholder="Tìm tên nhà hàng, món ăn..."
            className="pl-10 h-12 rounded-2xl border-none shadow-inner bg-white/95 focus:bg-white transition-all"
            value={searchTerm}
            onChange={(e: any) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="p-6 space-y-6 max-w-md mx-auto">
        {/* Kết quả tìm kiếm */}
        <div className="space-y-4">
          <h3 className="font-black text-gray-900 text-lg uppercase tracking-tight ml-1">
            {searchTerm ? "Kết quả tìm kiếm" : "Nhà hàng nổi bật"}
          </h3>

          {loading ? (
            <div className="flex justify-center py-10"><Loader2 className="animate-spin text-orange-600" /></div>
          ) : (
            <>
              {restaurants.map((res) => (
                <Card
                    key={res.id}
                    className="border-none shadow-md overflow-hidden group cursor-pointer hover:shadow-xl transition-all"
                    onClick={() => navigate(`/customer/menu?restaurantId=${res.id}`)}
                >
                  <CardContent className="p-0">
                    <div className="flex">
                       <div className="w-24 h-24 bg-orange-100 flex items-center justify-center text-4xl group-hover:scale-110 transition-transform">
                          {res.logo || "🥗"}
                       </div>
                       <div className="flex-1 p-4 flex flex-col justify-between">
                          <div>
                            <div className="font-bold text-gray-900 leading-tight mb-1">{res.name}</div>
                            <div className="flex items-center gap-1 text-[10px] text-gray-400 font-medium italic">
                               <MapPin className="w-3 h-3" /> {res.address || "Đang cập nhật địa chỉ..."}
                            </div>
                          </div>
                          <div className="flex items-center justify-between mt-2">
                             <div className="flex items-center gap-1 text-xs font-bold text-orange-600">
                                <Star className="w-3 h-3 fill-current" /> 4.5
                             </div>
                             <div className="text-[10px] font-black text-orange-600 uppercase flex items-center gap-1">
                                Xem menu <ArrowRight className="w-3 h-3" />
                             </div>
                          </div>
                       </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {!loading && restaurants.length === 0 && (
                <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-gray-100">
                   <UtensilsCrossed className="w-12 h-12 mx-auto text-gray-200 mb-4" />
                   <p className="text-gray-400 font-bold">Không tìm thấy quán bạn yêu cầu</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
