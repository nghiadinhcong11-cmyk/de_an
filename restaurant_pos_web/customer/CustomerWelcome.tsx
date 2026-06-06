import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { QrCode, ArrowRight, Star, TrendingUp, Gift, Utensils, MapPin, Phone as PhoneIcon, Loader2 } from "lucide-react";
import api from "../services/api";

export function CustomerWelcome() {
  const navigate = useNavigate();
  const [tableId, setTableId] = useState("");
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

  const handleGoToTable = () => {
    if (tableId.length > 5) {
      navigate(`/qr/${tableId}`);
    } else {
      alert("Vui lòng nhập mã bàn hợp lệ (UUID)");
    }
  };

  return (
    <div className="space-y-16 pb-12">
      {/* Hero Section */}
      <div className="relative rounded-[50px] overflow-hidden bg-gray-900 text-white p-8 md:p-20">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-orange-600/20 to-transparent"></div>
        <div className="relative z-10 max-w-2xl space-y-6">
          <Badge text="Chào mừng bạn quay trở lại" />
          <h1 className="text-4xl md:text-6xl font-black leading-tight">
            Thưởng thức <span className="text-orange-500">tinh hoa</span> ẩm thực tại chỗ
          </h1>
          <p className="text-gray-400 text-lg font-medium">
            Hãy quét mã QR tại bàn để bắt đầu gọi món và nhận phục vụ tức thì từ đội ngũ của chúng tôi.
          </p>

          <div className="pt-8 flex flex-col sm:flex-row gap-4">
             <Button onClick={() => navigate('/customer/menu')} className="bg-orange-600 hover:bg-orange-700 h-16 px-8 rounded-2xl font-black text-lg gap-3">
                XEM THỰC ĐƠN <Utensils className="w-5 h-5" />
             </Button>
          </div>
        </div>
      </div>

      {/* QR Scanning Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
         <div className="space-y-6">
            <h2 className="text-3xl font-black text-gray-900">Bắt đầu đặt món ngay?</h2>
            <p className="text-gray-500 font-medium leading-relaxed">
                Nếu bạn đang ngồi tại bàn, hãy quét mã QR có sẵn hoặc nhập mã định danh bàn bên dưới để xem thực đơn riêng của chi nhánh và gửi yêu cầu cho nhân viên.
            </p>
            <div className="flex gap-3 bg-white p-3 rounded-[24px] shadow-xl border border-gray-50">
               <Input
                 placeholder="Nhập mã bàn..."
                 className="h-14 border-none bg-transparent font-bold text-lg focus-visible:ring-0"
                 value={tableId}
                 onChange={(e: any) => setTableId(e.target.value)}
               />
               <Button onClick={handleGoToTable} className="bg-gray-900 h-14 w-14 rounded-2xl p-0">
                  <ArrowRight className="w-6 h-6" />
               </Button>
            </div>
         </div>
         <div className="bg-orange-50 rounded-[40px] p-10 flex flex-col items-center text-center space-y-4 border-2 border-orange-100/50">
            <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center shadow-lg text-orange-600">
               <QrCode className="w-10 h-10" />
            </div>
            <h3 className="text-xl font-black text-gray-900">Sử dụng Camera</h3>
            <p className="text-sm text-gray-400 font-bold uppercase tracking-widest">Quét mã QR trên bàn để vào bàn ngay</p>
         </div>
      </div>

      {/* Branches Section */}
      <div className="space-y-8">
        <h2 className="text-3xl font-black text-gray-900">Các cơ sở của chúng tôi</h2>
        {loading ? <div className="flex justify-center py-10"><Loader2 className="animate-spin text-orange-600" /></div> : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {branches.map(branch => (
              <Card key={branch.id} className="border-none shadow-sm hover:shadow-md transition-all rounded-[32px] overflow-hidden bg-white">
                <CardContent className="p-8 space-y-4">
                  <h3 className="text-xl font-black text-gray-900">{branch.name}</h3>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-gray-500 text-sm font-medium">
                      <MapPin className="w-4 h-4 text-orange-500" /> {branch.address || "Địa chỉ đang cập nhật"}
                    </div>
                    <div className="flex items-center gap-2 text-gray-500 text-sm font-medium">
                      <PhoneIcon className="w-4 h-4 text-orange-500" /> {branch.phone || "Số điện thoại đang cập nhật"}
                    </div>
                  </div>
                  <Button
                    onClick={() => navigate(`/customer/menu?restaurantId=${user.restaurantId || branches[0].restaurantId}&branchName=${encodeURIComponent(branch.name)}`)}
                    variant="outline"
                    className="w-full mt-4 rounded-xl border-orange-100 text-orange-600 font-bold hover:bg-orange-50"
                  >
                    XEM THỰC ĐƠN TẠI ĐÂY
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Quick Stats / Membership */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
         <MemberCard
            icon={<Star className="text-orange-500" />}
            title="Điểm tích lũy"
            value={`${user.points || 0} PTS`}
            desc="Tích 1 điểm cho mỗi 10,000đ"
         />
         <MemberCard
            icon={<Gift className="text-pink-500" />}
            title="Hạng thành viên"
            value="Hạng Vàng"
            desc="Ưu đãi giảm giá 5% hóa đơn"
         />
         <MemberCard
            icon={<TrendingUp className="text-green-500" />}
            title="Ưu đãi sắp tới"
            value="3 Vouchers"
            desc="Có hiệu lực tại mọi chi nhánh"
         />
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
