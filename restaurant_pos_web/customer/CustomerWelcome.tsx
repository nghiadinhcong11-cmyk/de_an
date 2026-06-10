import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Star, TrendingUp, Gift, MapPin, Phone as PhoneIcon, Loader2, Store, Clock, ArrowRight, CheckCircle2 } from "lucide-react";
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
    <div className="space-y-12 md:space-y-24 pb-20 p-4 md:p-0">
      {/* Dynamic Ad Hero Section */}
      <section className="relative h-[450px] md:h-[600px] w-full rounded-[40px] md:rounded-[60px] overflow-hidden group shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-r from-gray-900 via-gray-900/80 to-transparent z-10"></div>
        <img
            src="https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&q=80&w=2000"
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-[20s] group-hover:scale-110"
            alt="Hero Banner"
        />

        <div className="relative z-20 h-full flex flex-col justify-center px-8 md:px-20 max-w-4xl space-y-6">
          <div className="flex items-center gap-2 bg-orange-600/90 text-white w-fit px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-xl">
             <Star className="w-3 h-3 fill-current" /> Ưu đãi hôm nay
          </div>
          <h1 className="text-4xl md:text-7xl font-black text-white leading-[1.1] tracking-tight">
            Nơi <span className="text-orange-500">Ẩm Thực</span> <br/>
            Giao Thoa Cảm Xúc.
          </h1>
          <p className="text-gray-300 text-base md:text-xl font-medium max-w-lg leading-relaxed">
            Thưởng thức những món ăn thượng hạng trong không gian ấm cúng. Giảm ngay 20% cho đơn hàng đầu tiên của thành viên mới.
          </p>

          <div className="pt-6 flex flex-col sm:flex-row gap-4">
             <Button
                onClick={() => document.getElementById('menu-preview')?.scrollIntoView({ behavior: 'smooth' })}
                className="bg-white text-gray-900 hover:bg-orange-500 hover:text-white h-16 md:h-20 px-10 rounded-[28px] font-black text-lg transition-all duration-300 shadow-2xl active:scale-95"
             >
                XEM CHI NHÁNH & MENU
             </Button>
          </div>
        </div>

        {/* Floating Promo Tag */}
        <div className="absolute bottom-10 right-10 z-20 hidden md:block animate-bounce">
            <div className="bg-white/10 backdrop-blur-md border border-white/20 p-6 rounded-[32px] text-white">
                <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Ưu đãi Voucher</p>
                <p className="text-2xl font-black text-orange-500">-50K</p>
            </div>
        </div>
      </section>

      {/* Featured Promotions Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <PromoCard
            title="Happy Hour"
            desc="Giảm 30% Đồ uống từ 14h - 17h hàng ngày"
            icon={<Clock className="text-blue-500" />}
            bg="bg-blue-50"
          />
          <PromoCard
            title="Thẻ Thành Viên"
            desc="Tích điểm 5% cho mỗi lần dùng bữa tại quán"
            icon={<Users className="text-orange-500" />}
            bg="bg-orange-50"
          />
          <PromoCard
            title="Giao Hàng"
            desc="Miễn phí vận chuyển bán kính 3km"
            icon={<MapPin className="text-green-500" />}
            bg="bg-green-50"
          />
      </div>

      {/* Branches Exploration */}
      <div id="menu-preview" className="space-y-12 scroll-mt-28">
        <div className="text-center space-y-4">
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tighter uppercase">Hệ Thống Nhà Hàng</h2>
            <p className="text-gray-400 font-medium max-w-xl mx-auto text-sm md:text-base px-4">Mỗi chi nhánh là một phong cách riêng biệt, mang đến trải nghiệm độc đáo cho thực khách.</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="animate-spin text-orange-600 w-12 h-12" /></div>
        ) : branches.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {branches.map(branch => (
              <Card key={branch.id} className="border-none shadow-[0_20px_50px_rgba(0,0,0,0.04)] hover:shadow-2xl transition-all duration-500 rounded-[50px] overflow-hidden bg-white group cursor-pointer border border-gray-100">
                <CardContent className="p-0">
                  <div className="h-64 relative overflow-hidden">
                     <img
                        src={`https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&q=80&w=800`}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        alt={branch.name}
                     />
                     <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end p-8">
                        <Button className="w-full bg-white text-gray-900 rounded-2xl font-black py-4">KHÁM PHÁ NGAY</Button>
                     </div>
                  </div>
                  <div className="p-10 space-y-6">
                    <div className="flex justify-between items-start">
                        <h3 className="text-2xl font-black text-gray-900 leading-tight">{branch.name}</h3>
                        <div className="bg-green-50 text-green-600 p-2 rounded-xl"><CheckCircle2 className="w-4 h-4" /></div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-start gap-3 text-gray-500 text-sm font-medium">
                        <MapPin className="w-5 h-5 text-orange-500 shrink-0" />
                        <span className="leading-snug">{branch.address || "Địa chỉ đang cập nhật"}</span>
                      </div>
                    </div>
                    <Button
                      onClick={() => navigate(`/customer/menu?restaurantId=${branch.restaurantId}&branchName=${encodeURIComponent(branch.name)}`)}
                      variant="outline"
                      className="w-full h-14 rounded-2xl border-gray-100 text-gray-400 font-black transition-all hover:border-orange-600 hover:text-orange-600 group-hover:bg-orange-50/50"
                    >
                      XEM THỰC ĐƠN CHI TIẾT
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="py-20 text-center bg-white rounded-[40px] border-2 border-dashed border-gray-100 shadow-inner">
             <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-300">
                <Store className="w-10 h-10" />
             </div>
             <h3 className="text-xl font-black text-gray-900 mb-2">Chưa có chi nhánh khả dụng</h3>
             <p className="text-gray-400 font-medium max-w-xs mx-auto">
                Hiện tại chúng tôi đang cập nhật danh sách cơ sở. Vui lòng quay lại sau ít phút.
             </p>
             <Button
                variant="outline"
                onClick={() => window.location.reload()}
                className="mt-8 rounded-xl border-gray-200 font-bold"
             >
                Tải lại trang
             </Button>
          </div>
        )}
      </div>

      {/* Membership Info - Thông tin bổ trợ */}
      <div className="bg-white rounded-[50px] p-8 md:p-12 border border-gray-50 shadow-sm grid grid-cols-1 lg:grid-cols-3 gap-12 px-4 md:px-12">
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

function Badge({ text }: { text: string }) {
    return (
        <div className="inline-flex items-center bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/20">
            <span className="text-[10px] font-black uppercase tracking-[2px] text-orange-500">{text}</span>
        </div>
    );
}

function PromoCard({ title, desc, icon, bg }: any) {
    return (
        <div className={`${bg} p-8 rounded-[40px] border border-black/5 flex items-start gap-6 transition-all hover:-translate-y-1 hover:shadow-xl`}>
            <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-sm shrink-0">{icon}</div>
            <div>
                <h4 className="font-black text-gray-900 text-lg">{title}</h4>
                <p className="text-gray-500 text-sm font-medium mt-1 leading-relaxed">{desc}</p>
            </div>
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

function Users({ className }: { className: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
    );
}
