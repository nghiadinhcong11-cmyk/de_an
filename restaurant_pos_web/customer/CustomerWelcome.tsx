import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Star, TrendingUp, Gift, MapPin, Loader2, Store, Clock, CheckCircle2, Users, ArrowRight } from "lucide-react";
import api from "../services/api";

export function CustomerWelcome() {
  const navigate = useNavigate();
  const [branches, setBranches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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
    <div className="min-h-screen bg-brand-dark text-white font-['Montserrat'] selection:bg-brand-accent selection:text-white">
      {/* Cinematic Hero Section */}
      <section className="relative h-[90vh] flex items-center overflow-hidden">
        {/* Background Video/Image with Overlay */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-brand-dark/60 backdrop-blur-[2px] z-10"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-brand-dark via-brand-dark/40 to-transparent z-20"></div>
          <img
            src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&q=80&w=2000"
            className="w-full h-full object-cover scale-105 animate-float"
            alt="Hero Background"
          />
        </div>

        <div className="container mx-auto px-6 md:px-12 relative z-30 space-y-8">
          <div className="inline-flex items-center gap-2 bg-brand-accent px-6 py-2 rounded-full text-xs font-black uppercase tracking-wider shadow-[0_0_20px_rgba(249,115,22,0.4)] animate-bounce text-white">
            <Star className="w-4 h-4 fill-current" /> Đỉnh Cao Ẩm Thực
          </div>

          <h1 className="text-5xl md:text-8xl font-black leading-[0.9] tracking-tighter drop-shadow-2xl">
            THƯỞNG THỨC <br />
            <span className="text-brand-accent italic">NGHỆ THUẬT</span> <br />
            TRÊN TỪNG MÓN ĂN.
          </h1>

          <p className="text-gray-300 text-lg md:text-2xl font-medium max-w-2xl leading-relaxed">
            Hành trình khám phá hương vị tinh hoa trong không gian sang trọng và hiện đại.
            Giảm ngay <span className="text-white font-bold underline decoration-brand-accent underline-offset-8">20%</span> cho lần đặt đầu tiên.
          </p>

          <div className="pt-8 flex flex-col sm:flex-row gap-6">
            <Button
              onClick={() => document.getElementById('branches')?.scrollIntoView({ behavior: 'smooth' })}
              className="group relative overflow-hidden bg-brand-accent hover:bg-orange-600 text-white h-16 md:h-24 px-12 rounded-3xl font-black text-xl transition-all shadow-[0_10px_40px_rgba(249,115,22,0.3)] active:scale-95"
            >
              <span className="relative z-10 flex items-center gap-3">
                KHÁM PHÁ NGAY <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
              </span>
              <div className="absolute inset-0 bg-white/20 -translate-x-full group-hover:animate-shine"></div>
            </Button>

            <div className="flex items-center gap-4 px-6 py-4 bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 shadow-xl">
              <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center border border-white/10">
                <Clock className="w-6 h-6 text-brand-accent" />
              </div>
              <div>
                <p className="text-xs font-black text-gray-300 uppercase tracking-wider leading-none">Giờ mở cửa</p>
                <p className="text-sm font-black mt-1.5 uppercase tracking-tighter text-white">09:00 - 22:30 Hàng ngày</p>
              </div>
            </div>
          </div>
        </div>

        {/* Floating Decoration */}
        <div className="absolute bottom-12 right-12 hidden lg:block animate-float">
          <div className="bg-white/10 backdrop-blur-2xl border border-white/20 p-10 rounded-[48px] shadow-2xl">
            <p className="text-xs font-black uppercase tracking-wider text-brand-accent mb-2">Đặc Quyền Hội Viên</p>
            <p className="text-4xl font-black tracking-tighter text-white">FREE DRINK</p>
            <p className="text-xs font-bold text-gray-400 mt-3 uppercase tracking-widest">Cho hóa đơn trên 500K</p>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-6 py-24 space-y-32">
        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          <PromoCard
            title="ĐẶT BÀN NHANH"
            desc="Giữ chỗ chỉ trong 30 giây qua ứng dụng, không cần chờ đợi."
            icon={<Clock className="w-8 h-8" />}
            accent="text-blue-500"
          />
          <PromoCard
            title="TÍCH ĐIỂM THƯỞNG"
            desc="Nhận 5% hoàn tiền bằng điểm thưởng cho mỗi đơn hàng thành công."
            icon={<Star className="w-8 h-8" />}
            accent="text-brand-accent"
          />
          <PromoCard
            title="QUÀ TẶNG SINH NHẬT"
            desc="Ưu đãi bất ngờ dành riêng cho bạn vào tuần lễ sinh nhật."
            icon={<Gift className="w-8 h-8" />}
            accent="text-pink-500"
          />
        </div>

        {/* Branches Section */}
        <div id="branches" className="space-y-16">
          <div className="flex flex-col md:flex-row items-end justify-between gap-8">
            <div className="space-y-4">
              <h2 className="text-5xl md:text-7xl font-black tracking-tighter uppercase leading-none">
                Hệ Thống <br /> <span className="text-brand-accent">Cơ Sở</span>
              </h2>
              <div className="h-1 w-32 bg-brand-accent"></div>
            </div>
            <p className="text-gray-400 text-lg max-w-md font-medium leading-relaxed">
              Mỗi chi nhánh mang một phong cách kiến trúc độc bản nhưng vẫn giữ trọn vẹn tinh hoa hương vị đặc trưng.
            </p>
          </div>

          {loading ? (
            <div className="flex justify-center py-24"><Loader2 className="animate-spin text-brand-accent w-16 h-16" /></div>
          ) : branches.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {branches.map(branch => (
                <div
                  key={branch.id}
                  className="group relative h-[500px] rounded-[50px] overflow-hidden cursor-pointer shadow-2xl transition-transform hover:-translate-y-2 duration-500"
                  onClick={() => navigate(`/customer/menu?restaurantId=${branch.restaurantId}&branchName=${encodeURIComponent(branch.name)}`)}
                >
                  <img
                    src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=1200"
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    alt={branch.name}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-brand-dark via-brand-dark/20 to-transparent z-10"></div>

                  <div className="absolute inset-0 z-20 p-12 flex flex-col justify-end">
                    <div className="translate-y-8 group-hover:translate-y-0 transition-transform duration-500">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="bg-brand-accent p-2 rounded-xl text-white shadow-xl shadow-brand-accent/20">
                          <Store className="w-5 h-5" />
                        </div>
                        <h3 className="text-3xl font-black tracking-tighter uppercase">{branch.name}</h3>
                        <div className="flex items-center gap-1.5 bg-black/40 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 ml-auto">
                           <Star className="w-3.5 h-3.5 fill-brand-accent text-brand-accent" />
                           <span className="text-xs font-black text-white">{branch.averageRating?.toFixed(1) || "5.0"}</span>
                           <span className="text-[9px] font-bold text-gray-400">({branch.reviewCount || 0})</span>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 text-gray-300 mb-8 max-w-sm">
                        <MapPin className="w-5 h-5 text-brand-accent shrink-0" />
                        <span className="text-sm font-bold uppercase tracking-wider">{branch.address || "Địa chỉ đang cập nhật"}</span>
                      </div>
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100">
                        <Button className="bg-white text-gray-950 rounded-2xl px-8 h-14 font-black uppercase text-xs tracking-widest shadow-2xl transition-all duration-300 hover:bg-brand-accent hover:text-white hover:-translate-y-1 hover:scale-105 hover:shadow-[0_20px_40px_rgba(249,115,22,0.4)] active:scale-95">
                          ĐẶT BÀN TẠI ĐÂY
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-32 text-center bg-white/5 rounded-[60px] border-2 border-dashed border-white/10">
              <Store className="w-16 h-16 mx-auto mb-6 text-gray-700" />
              <p className="font-black text-gray-500 uppercase tracking-widest">Đang cập nhật danh sách cơ sở</p>
            </div>
          )}
        </div>
      </div>

      {/* Footer Decoration */}
      <div className="h-2 bg-gradient-to-r from-brand-dark via-brand-accent to-brand-dark"></div>
    </div>
  );
}

function PromoCard({ title, desc, icon, accent }: any) {
  return (
    <div className="bg-white/10 backdrop-blur-xl p-12 rounded-[50px] border border-white/20 transition-all hover:bg-white/15 hover:-translate-y-2 group shadow-2xl">
      <div className={`${accent} mb-8 transition-transform group-hover:scale-110 duration-500`}>{icon}</div>
      <h4 className="text-2xl font-black tracking-tighter mb-4 uppercase text-white">{title}</h4>
      <p className="text-gray-300 font-medium leading-relaxed">{desc}</p>
    </div>
  );
}
