import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { QrCode, ArrowRight, Star, TrendingUp, Gift, Utensils, MapPin, Phone as PhoneIcon, Loader2 } from "lucide-react";
import api from "../services/api";

export function CustomerWelcome() {
  const navigate = useNavigate();
  const [branches, setBranches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const infoRes = await api.get("/auth/find-restaurant-info");
        const res = await api.get(`/branches/public?restaurantId=${infoRes.data.id}`);
        setBranches(res.data);
      } catch (err) {
        console.error("Lỗi tải danh sách chi nhánh", err);
      } finally {
        setLoading(false);
      }
    };
    fetchBranches();
  }, []);

  return (
    <div className="space-y-16 pb-12 p-4 md:p-0">
      {/* Hero Section - Chào mừng & Khám phá */}
      <div className="relative rounded-[40px] md:rounded-[50px] overflow-hidden bg-gray-900 text-white p-6 md:p-20 shadow-2xl">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-orange-600/20 to-transparent"></div>
        <div className="relative z-10 max-w-2xl space-y-6">
          <Badge text="Hệ thống nhà hàng chính hãng" />
          <h1 className="text-3xl md:text-6xl font-black leading-tight">
            Khám phá <span className="text-orange-500">hương vị</span> độc bản của chúng tôi
          </h1>
          <p className="text-gray-400 text-base md:text-lg font-medium leading-relaxed">
            Bạn có thể xem trước thực đơn, hình ảnh món ăn và thông tin các chi nhánh của chúng tôi tại đây.
            Để đặt món, vui lòng quét mã QR trực tiếp tại bàn khi đến nhà hàng.
          </p>

          <div className="pt-4 md:pt-8">
             <Button
                onClick={() => {
                  const element = document.getElementById('branches-section');
                  element?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="bg-orange-600 hover:bg-orange-700 h-14 md:h-16 px-10 rounded-2xl font-black text-lg gap-3 shadow-lg shadow-orange-900/20 transition-all active:scale-95"
             >
                XEM CHI NHÁNH & MENU <ArrowRight className="w-5 h-5" />
             </Button>
          </div>
        </div>
      </div>

      {/* Branches Section - Trọng tâm chính */}
      <div id="branches-section" className="space-y-8 scroll-mt-24">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
                <h2 className="text-3xl font-black text-gray-900 tracking-tight">Hệ thống cơ sở</h2>
                <p className="text-gray-500 font-medium">Chọn một cơ sở gần bạn nhất để xem thực đơn chi tiết</p>
            </div>
            <div className="bg-orange-50 px-4 py-2 rounded-xl text-orange-600 font-bold text-xs uppercase tracking-widest border border-orange-100">
                {branches.length} Chi nhánh đang hoạt động
            </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="animate-spin text-orange-600 w-12 h-12" /></div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {branches.map(branch => (
              <Card key={branch.id} className="border-none shadow-sm hover:shadow-2xl transition-all duration-500 rounded-[40px] overflow-hidden bg-white group border border-gray-50">
                <CardContent className="p-0">
                  <div className="h-48 bg-gray-100 relative overflow-hidden">
                     <div className="absolute inset-0 bg-orange-600/5 group-hover:bg-transparent transition-colors z-10"></div>
                     <img
                        src={`https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=800`}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        alt={branch.name}
                     />
                     <div className="absolute top-4 left-4 z-20">
                        <Badge text="Đang mở cửa" />
                     </div>
                  </div>
                  <div className="p-8 space-y-4">
                    <h3 className="text-2xl font-black text-gray-900 group-hover:text-orange-600 transition-colors">{branch.name}</h3>
                    <div className="space-y-3">
                      <div className="flex items-start gap-3 text-gray-500 text-sm font-medium">
                        <MapPin className="w-5 h-5 text-orange-500 shrink-0" />
                        <span className="leading-snug">{branch.address || "Địa chỉ đang cập nhật"}</span>
                      </div>
                      <div className="flex items-center gap-3 text-gray-500 text-sm font-medium">
                        <PhoneIcon className="w-5 h-5 text-orange-500 shrink-0" />
                        <span>{branch.phone || "Liên hệ: 1900 xxxx"}</span>
                      </div>
                    </div>
                    <Button
                      onClick={() => navigate(`/customer/menu?restaurantId=${user.restaurantId || branch.restaurantId}&branchName=${encodeURIComponent(branch.name)}`)}
                      className="w-full mt-6 h-14 rounded-2xl bg-gray-900 hover:bg-orange-600 text-white font-black transition-all shadow-lg"
                    >
                      XEM THỰC ĐƠN TẠI ĐÂY
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Membership Info - Thông tin bổ trợ */}
      <div className="bg-white rounded-[50px] p-8 md:p-12 border border-gray-50 shadow-sm grid grid-cols-1 lg:grid-cols-3 gap-12">
         <div className="flex items-center gap-6">
            <div className="w-16 h-16 bg-orange-50 rounded-2xl flex items-center justify-center text-orange-600 shrink-0">
                <Star className="w-8 h-8 fill-current" />
            </div>
            <div>
                <h4 className="font-black text-lg text-gray-900">Tích điểm nhận quà</h4>
                <p className="text-gray-400 text-sm font-medium">Đăng ký thành viên để tích 5% mỗi hóa đơn.</p>
            </div>
         </div>
         <div className="flex items-center gap-6">
            <div className="w-16 h-16 bg-pink-50 rounded-2xl flex items-center justify-center text-pink-600 shrink-0">
                <Gift className="w-8 h-8" />
            </div>
            <div>
                <h4 className="font-black text-lg text-gray-900">Ưu đãi độc quyền</h4>
                <p className="text-gray-400 text-sm font-medium">Hàng ngàn Voucher giảm giá mỗi cuối tuần.</p>
            </div>
         </div>
         <div className="flex items-center gap-6">
            <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 shrink-0">
                <TrendingUp className="w-8 h-8" />
            </div>
            <div>
                <h4 className="font-black text-lg text-gray-900">Tiết kiệm thời gian</h4>
                <p className="text-gray-400 text-sm font-medium">Đặt món nhanh qua QR, không cần chờ đợi.</p>
            </div>
         </div>
      </div>
    </div>
  );
}
}

function Badge({ text }: { text: string }) {
    return (
        <div className="inline-flex items-center bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/20">
            <span className="text-[10px] font-black uppercase tracking-[2px] text-orange-500">{text}</span>
        </div>
    );
}

function MemberCard({ icon, title, value, desc }: any) {
    return (
        <Card className="border-none shadow-sm bg-white rounded-[32px] overflow-hidden group hover:shadow-xl transition-all">
            <CardContent className="p-8">
                <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">{icon}</div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{title}</p>
                <h4 className="text-2xl font-black text-gray-900 mb-2">{value}</h4>
                <p className="text-xs text-gray-400 font-medium">{desc}</p>
            </CardContent>
        </Card>
    );
}
