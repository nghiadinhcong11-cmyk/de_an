import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Avatar, AvatarFallback } from "../components/ui/avatar";
import { Badge } from "../components/ui/badge";
import { Star, Gift, ShoppingBag, Loader2, Coins } from "lucide-react";
import api from "../services/api";

export function CustomerProfile() {
  const [profile, setProfile] = useState<any>(null);
  const [vouchers, setVouchers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [redeemingId, setRedeemingId] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      // Giả sử backend trả về thông tin khách hàng hiện tại
      const [pRes, vRes] = await Promise.all([
        api.get("/customers/me"), // Cần API lấy profile khách
        api.get("/vouchers")
      ]);
      setProfile(pRes.data);
      setVouchers(vRes.data);
    } catch (err) {
      console.error("Lỗi tải thông tin");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleRedeem = async (v: any) => {
    const cost = v.discountValue * 10;
    if (!confirm(`Dùng ${cost} điểm để đổi mã này?`)) return;

    setRedeemingId(v.id);
    try {
      await api.post(`/vouchers/redeem/${v.id}`);
      alert("Đổi điểm thành công! Mã đã được lưu vào ví của bạn.");
      fetchData();
    } catch (err: any) {
      alert(err.response?.data || "Đổi điểm thất bại");
    } finally {
      setRedeemingId(null);
    }
  };

  if (loading) return <div className="flex justify-center p-20"><Loader2 className="animate-spin text-orange-600" /></div>;

  return (
    <div className="pb-24 bg-gray-50 min-h-screen">
      <div className="bg-gradient-to-br from-orange-500 to-orange-700 text-white p-6 pt-10 rounded-b-[40px] shadow-lg">
        <div className="flex items-center gap-4">
          <Avatar className="w-20 h-20 border-4 border-white/30 shadow-xl">
            <AvatarFallback className="bg-white text-orange-600 text-2xl font-bold">
              {profile?.fullName?.charAt(0) || "U"}
            </AvatarFallback>
          </Avatar>
          <div>
            <h2 className="text-2xl font-black text-white">{profile?.fullName}</h2>
            <p className="text-white/80 text-sm font-medium">{profile?.phoneNumber}</p>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-6 -mt-6 relative z-10">
        {/* Point Card */}
        <Card className="border-none shadow-xl bg-white overflow-hidden rounded-3xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Coins className="w-5 h-5 text-yellow-500 fill-current" />
                <h3 className="font-bold text-gray-500 text-xs uppercase tracking-widest">Điểm khả dụng</h3>
              </div>
              <Badge className="bg-orange-600 font-bold px-3">Hạng Vàng</Badge>
            </div>
            <div className="text-5xl font-black text-orange-600 mb-2">{profile?.points?.toLocaleString()}</div>
          </CardContent>
        </Card>

        {/* Redeem Section */}
        <div>
          <div className="flex items-center gap-2 mb-4 px-1">
             <Gift className="w-5 h-5 text-orange-600" />
             <h3 className="font-black text-gray-900 text-lg">Đổi quà bằng điểm</h3>
          </div>

          <div className="space-y-4">
            {vouchers.map((v) => {
              const pointCost = v.discountValue * 10;
              const canAfford = (profile?.points || 0) >= pointCost;

              return (
                <Card key={v.id} className="border-none shadow-sm rounded-2xl overflow-hidden group">
                  <CardContent className="p-0">
                    <div className="flex h-24">
                      <div className={`w-24 ${canAfford ? 'bg-orange-600' : 'bg-gray-300'} flex flex-col items-center justify-center text-white p-2 text-center`}>
                         <div className="text-xl font-black">{v.discountValue}{v.discountType === 'percentage' ? '%' : '$'}</div>
                         <div className="text-[8px] font-bold uppercase opacity-80">OFF</div>
                      </div>
                      <div className="flex-1 p-4 flex flex-col justify-between">
                        <div>
                           <div className="font-bold text-gray-900 text-sm line-clamp-1">{v.name}</div>
                           <div className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">Chi phí: {pointCost} điểm</div>
                        </div>
                        <Button
                            disabled={!canAfford || redeemingId === v.id}
                            onClick={() => handleRedeem(v)}
                            className={`h-7 text-[10px] font-black uppercase rounded-lg ${canAfford ? 'bg-orange-600' : 'bg-gray-200'}`}
                        >
                          {redeemingId === v.id ? <Loader2 className="animate-spin w-3 h-3" /> : (canAfford ? "Đổi ngay" : "Không đủ điểm")}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Order History Summary */}
        <Card className="border-none shadow-sm rounded-2xl">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base font-bold">
              <ShoppingBag className="w-4 h-4 text-orange-600" /> Lịch sử chi tiêu
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
             <div className="flex justify-between items-center py-2">
                <span className="text-sm text-gray-500 font-medium">Tổng số đơn</span>
                <span className="font-black text-gray-900">12</span>
             </div>
             <div className="flex justify-between items-center py-2 border-t border-gray-50">
                <span className="text-sm text-gray-500 font-medium">Tổng tiền đã chi</span>
                <span className="font-black text-orange-600">${profile?.totalSpent?.toLocaleString()}</span>
             </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
