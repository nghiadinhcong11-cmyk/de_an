import { Link } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { QrCode, UtensilsCrossed, Star, ArrowRight } from "lucide-react";
import { mockRestaurant } from "../data/mockData";

export function CustomerWelcome() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="bg-orange-600 h-64 relative rounded-b-[40px] shadow-2xl flex flex-col items-center justify-center text-white overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('https://www.transparenttextures.com/patterns/food.png')]"></div>
        <div className="w-24 h-24 bg-white rounded-3xl flex items-center justify-center shadow-xl mb-4 relative z-10 animate-bounce-slow">
          <span className="text-5xl">{mockRestaurant.logo}</span>
        </div>
        <h1 className="text-3xl font-black relative z-10 tracking-tight">{mockRestaurant.name}</h1>
        <p className="opacity-80 text-sm relative z-10 font-medium">Hân hạnh phục vụ quý khách</p>
      </div>

      <div className="max-w-md mx-auto px-6 -mt-10 relative z-20 pb-24">
        {/* Quick Actions */}
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

          <Card className="hover:shadow-xl transition-all border-none bg-white shadow-lg group cursor-pointer">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center group-hover:bg-blue-600 transition-colors">
                <QrCode className="w-8 h-8 text-blue-600 group-hover:text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-lg text-gray-900">Quét mã tại bàn</h3>
                <p className="text-sm text-gray-500 font-medium">Gọi món nhanh chóng, tiện lợi</p>
              </div>
              <ArrowRight className="w-5 h-5 text-gray-300 group-hover:text-blue-600 transform group-hover:translate-x-1 transition-all" />
            </CardContent>
          </Card>
        </div>

        {/* Loyalty Points */}
        <Card className="mb-8 border-none bg-gradient-to-r from-gray-900 to-gray-800 text-white shadow-2xl rounded-3xl overflow-hidden relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-2xl"></div>
          <CardContent className="p-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <div className="text-xs uppercase tracking-widest font-black text-orange-400 mb-1">Điểm của bạn</div>
                <div className="text-5xl font-black">450</div>
              </div>
              <div className="w-20 h-20 bg-orange-600 rounded-2xl flex items-center justify-center shadow-lg transform rotate-3">
                <Star className="w-10 h-10 fill-current text-white" />
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm font-bold">
              <div className="flex-1 bg-white/10 h-2 rounded-full overflow-hidden">
                <div className="bg-orange-500 h-full w-[90%]" />
              </div>
              <span>90%</span>
            </div>
            <p className="mt-3 text-[10px] text-gray-400 font-medium">
              Bạn chỉ còn thiếu <span className="text-orange-400 font-bold">50 điểm</span> để đổi voucher 50k!
            </p>
          </CardContent>
        </Card>

        {/* Featured Items */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4 px-1">
            <h3 className="font-black text-gray-900 text-xl tracking-tight">Món ăn nổi bật</h3>
            <Link to="/customer/menu" className="text-orange-600 text-xs font-black uppercase hover:underline">Tất cả</Link>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Card className="border-none shadow-md rounded-2xl hover:scale-105 transition-transform">
              <CardContent className="p-4 text-center">
                <div className="text-5xl mb-3 p-4 bg-gray-50 rounded-xl">🍔</div>
                <h4 className="font-bold text-gray-900 mb-1">Classic Burger</h4>
                <div className="text-orange-600 font-black">$12.99</div>
              </CardContent>
            </Card>
            <Card className="border-none shadow-md rounded-2xl hover:scale-105 transition-transform">
              <CardContent className="p-4 text-center">
                <div className="text-5xl mb-3 p-4 bg-gray-50 rounded-xl">🍕</div>
                <h4 className="font-bold text-gray-900 mb-1">Pizza M</h4>
                <div className="text-orange-600 font-black">$14.99</div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* CTA */}
        <Link to="/customer/menu">
          <Button className="w-full bg-orange-600 hover:bg-orange-700 h-14 rounded-2xl text-lg font-black shadow-xl shadow-orange-600/20" size="lg">
            ĐẶT MÓN NGAY
          </Button>
        </Link>
      </div>
    </div>
  );
}
