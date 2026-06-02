import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { QrCode, UtensilsCrossed, Star, ArrowRight, Loader2 } from "lucide-react";
import api from "../services/api";

export function CustomerWelcome() {
  const [restaurant, setRestaurant] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Tạm thời lấy nhà hàng đầu tiên hoặc qua API public
    const fetchInfo = async () => {
        try {
            // Giả sử có API lấy thông tin chung
            const res = await api.get("/auth/find-restaurant-info");
            setRestaurant(res.data);
        } catch {
            setRestaurant({ name: "Restaurant POS", logo: "🥗" });
        } finally {
            setLoading(false);
        }
    };
    fetchInfo();
  }, []);

  if (loading) return <div className="flex justify-center p-20"><Loader2 className="animate-spin text-orange-600" /></div>;

  return (
    <div className="min-h-screen bg-white">
      <div className="bg-orange-600 h-64 relative rounded-b-[40px] shadow-2xl flex flex-col items-center justify-center text-white overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('https://www.transparenttextures.com/patterns/food.png')]"></div>
        <div className="w-24 h-24 bg-white rounded-3xl flex items-center justify-center shadow-xl mb-4 relative z-10">
          <span className="text-5xl">{restaurant?.logo || "🥗"}</span>
        </div>
        <h1 className="text-3xl font-black relative z-10 tracking-tight">{restaurant?.name}</h1>
        <p className="opacity-80 text-sm relative z-10 font-medium">Hân hạnh phục vụ quý khách</p>
      </div>

      <div className="max-w-md mx-auto px-6 -mt-10 relative z-20 pb-24">
        <div className="grid grid-cols-1 gap-4 mb-8">
          <Link to="/customer/menu">
            <Card className="hover:shadow-xl transition-all border-none bg-white shadow-lg overflow-hidden group">
              <CardContent className="p-0">
                <div className="flex items-center gap-4 p-6">
                  <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center group-hover:bg-orange-600 transition-colors">
                    <UtensilsCrossed className="w-8 h-8 text-orange-600 group-hover:text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-lg text-gray-900">Xem thực đơn</h3>
                    <p className="text-sm text-gray-500 font-medium">Khám phá tinh hoa ẩm thực</p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-gray-300 group-hover:text-orange-600 transform group-hover:translate-x-1 transition-all" />
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>

        <Card className="mb-8 border-none bg-gradient-to-r from-gray-900 to-gray-800 text-white shadow-2xl rounded-3xl overflow-hidden relative">
          <CardContent className="p-8 text-center">
             <QrCode className="w-12 h-12 mx-auto mb-2 text-orange-400" />
             <h3 className="font-bold">Quét mã tại bàn</h3>
             <p className="text-xs opacity-60">Vui lòng quét mã QR đặt tại bàn để bắt đầu gọi món</p>
          </CardContent>
        </Card>

        <Link to="/customer/menu">
          <Button className="w-full bg-orange-600 hover:bg-orange-700 h-14 rounded-2xl text-lg font-black" size="lg">
            ĐẶT MÓN NGAY
          </Button>
        </Link>
      </div>
    </div>
  );
}
