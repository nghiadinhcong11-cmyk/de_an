import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Avatar, AvatarFallback } from "../components/ui/avatar";
import { Badge } from "../components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "../components/ui/dialog";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Link } from "react-router-dom";
import { Gift, ShoppingBag, Loader2, Coins, PlusCircle, MinusCircle, Clock, Edit2, Save, KeyRound, Star, MessageSquare, Utensils, DollarSign, Home, Users, CheckCircle, Calendar, ChevronRight, Store, Timer, MapPin, Layers } from "lucide-react";
import api from "../services/api";

export function CustomerProfile() {
  const [profile, setProfile] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [vouchers, setVouchers] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Edit state
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editName, setEditName] = useState("");
  const [editAvatar, setEditAvatar] = useState("");
  const [updating, setUpdating] = useState(false);

  // Feedback Dialog state
  const [isFeedbackDialogOpen, setIsFeedbackDialogOpen] = useState(false);
  const [expandedOrderForFeedback, setExpandedOrderForFeedback] = useState<any>(null);

  // Feedback state
  const [feedbackForm, setFeedbackForm] = useState({
    serviceRating: 5,
    foodRating: 5,
    priceRating: 5,
    atmosphereRating: 5,
    message: ""
  });
  const [submittingFeedback, setSubmittingFeedback] = useState(false);

  const fetchData = async () => {
    try {
      const [pRes, hRes, vRes, bRes] = await Promise.all([
        api.get("/customers/me"),
        api.get("/customers/me/points-history"),
        api.get("/vouchers"),
        api.get("/bookings/my-bookings")
      ]);
      setProfile(pRes.data);
      localStorage.setItem("user_profile", JSON.stringify(pRes.data));
      const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
      localStorage.setItem("user", JSON.stringify({ ...currentUser, fullName: pRes.data.fullName, avatarUrl: pRes.data.avatarUrl }));

      setHistory(hRes.data);
      setVouchers(vRes.data);
      setBookings(bRes.data);
      setEditName(pRes.data.fullName);
      setEditAvatar(pRes.data.avatarUrl || "");
    } catch (err) {
      console.error("Lỗi tải thông tin");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async () => {
    setUpdating(true);
    try {
      await api.put("/customers/me", {
        fullName: editName,
        avatarUrl: editAvatar
      });
      await fetchData();
      setIsEditDialogOpen(false);
    } catch (err) {
      alert("Lỗi khi cập nhật thông tin");
    } finally {
      setUpdating(false);
    }
  };

  const handleRedeem = async (voucherId: string) => {
    if (!confirm("Bạn có chắc chắn muốn dùng điểm để đổi mã giảm giá này không?")) return;

    try {
      setUpdating(true);
      await api.post(`/vouchers/${voucherId}/redeem`);
      alert("Đổi quà thành công! Mã giảm giá đã được thêm vào kho của bạn.");
      await fetchData();
    } catch (err: any) {
      alert(err.response?.data || "Lỗi khi đổi quà");
    } finally {
      setUpdating(false);
    }
  };

  const handleSubmitFeedback = async () => {
      if (!feedbackForm.message) return alert("Vui lòng nhập nội dung góp ý");
      setSubmittingFeedback(true);
      try {
          const res = await api.post("/feedbacks", {
              ...feedbackForm,
              orderId: expandedOrderForFeedback?.id
          });
          alert(res.data.message || "Cảm ơn bạn đã đánh giá!");
          setFeedbackForm({ serviceRating: 5, foodRating: 5, priceRating: 5, atmosphereRating: 5, message: "" });
          setIsFeedbackDialogOpen(false);
          await fetchData(); // Tải lại để cập nhật điểm thưởng
      } catch {
          alert("Lỗi khi gửi đánh giá");
      } finally {
          setSubmittingFeedback(false);
      }
  };

  useEffect(() => { fetchData(); }, []);

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-brand-dark"><Loader2 className="animate-spin text-brand-accent w-12 h-12" /></div>;

  return (
    <div className="pb-24 bg-brand-dark min-h-screen font-['Montserrat']">
      {/* Profile Header */}
      <div className="bg-gradient-to-br from-orange-500 to-red-600 text-white p-8 pt-12 rounded-b-[60px] shadow-2xl relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Avatar className="w-20 h-20 border-4 border-white/20 shadow-xl">
              {profile?.avatarUrl ? (
                <img src={profile.avatarUrl} alt={profile.fullName} className="aspect-square h-full w-full object-cover" />
              ) : (
                <AvatarFallback className="bg-white text-orange-600 font-black text-2xl">
                  {profile?.fullName?.charAt(0)}
                </AvatarFallback>
              )}
            </Avatar>
            <div>
              <h2 className="text-3xl font-black tracking-tighter">{profile?.fullName}</h2>
              <p className="text-white/70 text-xs font-black uppercase tracking-[0.2em] mt-1">{profile?.phoneNumber}</p>
            </div>
          </div>

          <div className="flex gap-3">
            <Link to="/customer/change-password">
              <Button variant="ghost" size="icon" className="text-white hover:bg-white/20 rounded-2xl w-12 h-12">
                <KeyRound className="w-6 h-6" />
              </Button>
            </Link>
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
              <DialogTrigger onClick={() => setIsEditDialogOpen(true)}>
                <Button variant="ghost" size="icon" className="text-white hover:bg-white/20 rounded-2xl w-12 h-12">
                  <Edit2 className="w-6 h-6" />
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px] bg-brand-dark border-white/10 text-white rounded-[32px]">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-black uppercase tracking-tight">Chỉnh sửa trang cá nhân</DialogTitle>
                </DialogHeader>
                <div className="grid gap-6 py-6">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-xs font-black uppercase tracking-wider text-gray-300 ml-1">Họ và tên</Label>
                    <Input id="name" value={editName} onChange={(e) => setEditName(e.target.value)} className="bg-white/10 border-white/20 h-12 rounded-xl focus:border-brand-accent transition-all text-white placeholder:text-gray-500" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="avatar" className="text-xs font-black uppercase tracking-wider text-gray-300 ml-1">Link ảnh đại diện</Label>
                    <Input id="avatar" value={editAvatar} placeholder="https://..." onChange={(e) => setEditAvatar(e.target.value)} className="bg-white/10 border-white/20 h-12 rounded-xl focus:border-brand-accent transition-all text-white placeholder:text-gray-500" />
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={handleUpdateProfile} disabled={updating} className="w-full bg-brand-accent hover:bg-orange-600 h-12 rounded-xl font-black uppercase tracking-widest transition-all">
                    {updating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Lưu thay đổi"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <Card className="mt-8 border-none bg-white/10 backdrop-blur-xl text-white rounded-[32px]">
          <CardContent className="p-6 flex justify-between items-center">
            <div>
              <p className="text-xs font-black uppercase tracking-widest opacity-60 text-gray-300">Điểm thưởng tích lũy</p>
              <p className="text-5xl font-black tracking-tighter mt-1">{profile?.points?.toLocaleString()}<span className="text-xs ml-2 opacity-60 uppercase font-bold text-gray-400">pts</span></p>
            </div>
            <div className="bg-brand-accent text-white px-6 py-2 rounded-2xl text-xs font-black uppercase tracking-widest shadow-lg animate-pulse">
              Hạng Vàng
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="p-6 md:p-12">
        <Tabs defaultValue="history">
          <TabsList className="w-full bg-white/10 border border-white/20 p-1.5 rounded-[24px] shadow-sm mb-12 flex overflow-x-auto no-scrollbar h-auto">
            <TabsTrigger value="history" className="flex-1 font-black uppercase text-xs tracking-wider rounded-2xl py-4 data-[state=active]:bg-brand-accent data-[state=active]:text-white text-gray-400 transition-all">Lịch sử</TabsTrigger>
            <TabsTrigger value="redeem" className="flex-1 font-black uppercase text-xs tracking-wider rounded-2xl py-4 data-[state=active]:bg-brand-accent data-[state=active]:text-white text-gray-400 transition-all">Đổi quà</TabsTrigger>
            <TabsTrigger value="bookings" className="flex-1 font-black uppercase text-xs tracking-wider rounded-2xl py-4 data-[state=active]:bg-brand-accent data-[state=active]:text-white text-gray-400 transition-all">Lịch hẹn</TabsTrigger>
            <TabsTrigger value="feedback" className="flex-1 font-black uppercase text-xs tracking-wider rounded-2xl py-4 data-[state=active]:bg-brand-accent data-[state=active]:text-white text-gray-400 transition-all">Góp ý</TabsTrigger>
          </TabsList>

          {/* TAB 1: LỊCH SỬ TÍCH ĐIỂM & ĐƠN HÀNG */}
          <TabsContent value="history">
            <div className="space-y-8">
              {history.length === 0 ? (
                <div className="text-center py-32 bg-white/5 rounded-[50px] border-2 border-dashed border-white/10">
                  <Clock className="mx-auto w-16 h-16 text-gray-700 mb-4" />
                  <p className="text-gray-500 font-black uppercase tracking-widest">Chưa có lịch sử hoạt động</p>
                </div>
              ) : (
                history.map((item) => (
                  <Card key={item.id} className="border-none shadow-2xl bg-white/5 backdrop-blur-3xl rounded-[40px] overflow-hidden border border-white/5 group hover:border-brand-accent/30 transition-all duration-500">
                    <CardContent className="p-0">
                      <div className="p-8 flex items-center justify-between border-b border-white/5">
                        <div className="flex items-center gap-6">
                          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-inner ${
                            item.points > 0 ? 'bg-green-500/10 text-green-500' : 'bg-brand-accent/10 text-brand-accent'
                          }`}>
                            {item.points > 0 ? <PlusCircle className="w-7 h-7" /> : <MinusCircle className="w-7 h-7" />}
                          </div>
                          <div>
                            <div className="font-black text-xl text-white tracking-tight uppercase">
                                {item.order ? `Đơn hàng #${item.order.orderNumber.split('-')[1]}` : item.description}
                            </div>
                            <div className="text-xs text-gray-400 font-black uppercase tracking-wider mt-1.5 flex items-center gap-2">
                                <Calendar className="w-3.5 h-3.5" />
                                {new Date(item.createdAtUtc).toLocaleString("vi-VN")}
                            </div>
                          </div>
                        </div>
                        <div className={`text-3xl font-black tracking-tighter ${item.points > 0 ? 'text-green-500' : 'text-brand-accent'}`}>
                          {item.points > 0 ? '+' : ''}{item.points}
                        </div>
                      </div>

                      {item.order && (
                        <div className="px-8 py-8 space-y-6 bg-white/[0.02]">
                           <div className="flex justify-between items-center text-xs">
                              <span className="text-gray-500 font-black uppercase tracking-widest text-[11px]">Phục vụ bởi: <span className="text-white ml-2">{item.order.createdByUserName}</span></span>
                              <span className="font-black text-2xl text-white tracking-tighter">{item.order.totalAmount.toLocaleString("vi-VN")}đ</span>
                           </div>

                           <div className="space-y-3">
                              {item.order.items?.map((food: any, idx: number) => (
                                <div key={idx} className="flex justify-between text-sm text-gray-400 font-medium bg-white/5 p-4 rounded-2xl border border-white/5 hover:border-white/10 transition-all">
                                   <span className="flex items-center gap-3">
                                        <span className="w-6 h-6 bg-brand-accent/20 text-brand-accent rounded-lg flex items-center justify-center text-xs font-black">{food.quantity}</span>
                                        {food.productName}
                                   </span>
                                   <span className="text-white font-bold">{food.totalPrice.toLocaleString("vi-VN")}đ</span>
                                </div>
                              ))}
                           </div>

                           {item.order.status === 'Completed' && !item.order.isReviewed && (
                             <Button
                                onClick={() => {
                                    setExpandedOrderForFeedback(item.order);
                                    setIsFeedbackDialogOpen(true);
                                }}
                                className="group relative overflow-hidden w-full h-14 bg-brand-accent hover:bg-orange-600 text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-xl shadow-brand-accent/20 transition-all"
                             >
                                <span className="relative z-10 flex items-center justify-center gap-3">
                                    <Star className="w-4 h-4 fill-current" /> Đánh giá trải nghiệm nhận 5 pts
                                </span>
                                <div className="absolute inset-0 bg-white/20 -translate-x-full group-hover:animate-shine"></div>
                             </Button>
                           )}

                           {item.order.isReviewed && (
                             <div className="flex items-center justify-center gap-2 py-4 text-xs font-black text-green-500 uppercase tracking-widest bg-green-500/5 rounded-2xl border border-green-500/10">
                                <CheckCircle className="w-4 h-4" /> Đã gửi đánh giá thành công
                             </div>
                           )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          {/* TAB 2: ĐỔI QUÀ */}
          <TabsContent value="redeem">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {vouchers.map((v) => (
                <Card key={v.id} className="border-none shadow-2xl bg-white/5 backdrop-blur-3xl rounded-[40px] overflow-hidden border border-white/5 hover:border-brand-accent/30 transition-all duration-500 group">
                  <CardContent className="p-0 flex h-32">
                    <div className="w-32 bg-gradient-to-br from-brand-accent to-orange-700 flex flex-col items-center justify-center text-white relative overflow-hidden">
                      <div className="absolute inset-0 bg-white/10 -translate-x-full group-hover:animate-shine"></div>
                      <span className="font-black text-4xl tracking-tighter relative z-10">{v.discountValue}%</span>
                      <span className="text-[10px] font-black uppercase tracking-[0.3em] opacity-80 relative z-10">VOUCHER</span>
                    </div>
                    <div className="flex-1 p-6 flex flex-col justify-center">
                      <div className="font-black text-xl text-white uppercase tracking-tight truncate">{v.name}</div>
                      <div className="text-xs text-brand-accent font-black uppercase tracking-wider mt-2 flex items-center gap-2">
                        <Coins className="w-3.5 h-3.5" />
                        Chi phí: {v.discountValue * 10} points
                      </div>
                      <p className="text-[11px] text-gray-500 font-bold uppercase mt-2">Hết hạn: {new Date(v.endDate).toLocaleDateString("vi-VN")}</p>
                    </div>
                    <div className="p-6 flex items-center">
                      <Button
                        onClick={() => handleRedeem(v.id)}
                        disabled={updating || (profile?.points < v.discountValue * 10)}
                        size="sm"
                        className={`h-12 px-8 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${
                            profile?.points < (v.discountValue * 10)
                            ? 'bg-white/5 text-gray-600 cursor-not-allowed border border-white/5'
                            : 'bg-brand-accent hover:bg-orange-600 text-white shadow-lg shadow-brand-accent/20'
                        }`}
                      >
                        {profile?.points < (v.discountValue * 10) ? 'THIẾU ĐIỂM' : 'ĐỔI QUÀ'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* TAB 3: LỊCH ĐẶT BÀN */}
          <TabsContent value="bookings">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {bookings.length === 0 ? (
                <div className="col-span-full text-center py-32 bg-white/5 rounded-[50px] border-2 border-dashed border-white/10">
                  <Calendar className="mx-auto w-16 h-16 text-gray-700 mb-4" />
                  <p className="text-gray-500 font-black uppercase tracking-widest mb-6">Chưa có lịch đặt bàn</p>
                  <Link to="/customer/booking">
                    <Button className="bg-brand-accent hover:bg-orange-600 h-14 px-10 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-brand-accent/20 transition-all">Đặt bàn ngay</Button>
                  </Link>
                </div>
              ) : (
                bookings.map((b) => (
                  <Card key={b.id} className="border-none shadow-2xl bg-white/5 backdrop-blur-3xl rounded-[40px] overflow-hidden border border-white/5 hover:border-brand-accent/30 transition-all duration-500">
                    <CardContent className="p-8 flex items-center justify-between">
                      <div className="flex items-center gap-6">
                        <div className="w-16 h-16 bg-brand-accent/10 rounded-3xl flex items-center justify-center text-brand-accent border border-brand-accent/20">
                            <Clock className="w-8 h-8" />
                        </div>
                        <div className="space-y-2">
                          <div className="font-black text-2xl text-white tracking-tighter uppercase">
                            {b.tableId ? `Bàn ${b.tableNumber}` : "Bàn tự do"}
                          </div>
                          <div className="flex flex-col gap-1">
                            <div className="text-xs text-gray-400 font-black uppercase tracking-wider flex items-center gap-2">
                                <Store className="w-3.5 h-3.5 text-brand-accent" /> {b.branchName}
                            </div>
                            <div className="text-xs text-brand-accent font-black uppercase tracking-wider flex items-center gap-2">
                                <Timer className="w-3.5 h-3.5" /> {new Date(b.bookingDate).toLocaleString("vi-VN")} • {b.status.toUpperCase()}
                            </div>
                          </div>
                        </div>
                      </div>
                      <Link to="/customer/my-bookings">
                        <Button size="icon" variant="ghost" className="rounded-2xl w-12 h-12 bg-white/5 text-gray-400 hover:text-brand-accent hover:bg-white/10 transition-all">
                            <ChevronRight className="w-6 h-6" />
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          {/* TAB 4: ĐÁNH GIÁ GÓP Ý */}
          <TabsContent value="feedback">
              <Card className="border-none shadow-2xl bg-white/5 backdrop-blur-3xl rounded-[50px] overflow-hidden border border-white/5">
                  <CardHeader className="bg-white/5 p-10 md:p-16 border-b border-white/5">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 bg-brand-accent rounded-2xl flex items-center justify-center text-white shadow-xl">
                            <MessageSquare className="w-6 h-6" />
                        </div>
                        <CardTitle className="text-3xl md:text-5xl font-black tracking-tighter uppercase">Góp ý chất lượng</CardTitle>
                      </div>
                      <p className="text-gray-400 text-lg font-medium leading-relaxed">Đóng góp của bạn là kim chỉ nam giúp chúng tôi nâng tầm dịch vụ. <br /> Gửi đánh giá để nhận ngay <span className="text-brand-accent font-black">5 points</span> thưởng vào tài khoản!</p>
                  </CardHeader>
                  <CardContent className="p-10 md:p-16 space-y-12">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                          <RatingInput
                            label="Phục vụ"
                            icon={<Users className="w-5 h-5" />}
                            value={feedbackForm.serviceRating}
                            onChange={(v) => setFeedbackForm({...feedbackForm, serviceRating: v})}
                          />
                          <RatingInput
                            label="Món ăn"
                            icon={<Utensils className="w-5 h-5" />}
                            value={feedbackForm.foodRating}
                            onChange={(v) => setFeedbackForm({...feedbackForm, foodRating: v})}
                          />
                          <RatingInput
                            label="Giá cả"
                            icon={<DollarSign className="w-5 h-5" />}
                            value={feedbackForm.priceRating}
                            onChange={(v) => setFeedbackForm({...feedbackForm, priceRating: v})}
                          />
                          <RatingInput
                            label="Không gian"
                            icon={<Home className="w-5 h-5" />}
                            value={feedbackForm.atmosphereRating}
                            onChange={(v) => setFeedbackForm({...feedbackForm, atmosphereRating: v})}
                          />
                      </div>

                      <div className="space-y-4">
                          <Label className="text-xs font-black uppercase tracking-wider text-gray-300 ml-2">Lời nhắn của bạn</Label>
                          <textarea
                            className="w-full h-48 p-8 bg-white/10 border border-white/20 rounded-[32px] text-lg font-medium text-white focus:border-brand-accent transition-all outline-none resize-none placeholder:text-gray-500"
                            placeholder="Chia sẻ trải nghiệm ẩm thực của bạn..."
                            value={feedbackForm.message}
                            onChange={(e) => setFeedbackForm({...feedbackForm, message: e.target.value})}
                          ></textarea>
                      </div>

                      <Button
                        onClick={handleSubmitFeedback}
                        disabled={submittingFeedback}
                        className="group relative overflow-hidden w-full h-20 bg-brand-accent hover:bg-orange-600 text-white font-black text-xl rounded-3xl shadow-[0_20px_50px_rgba(249,115,22,0.3)] transition-all uppercase tracking-widest"
                      >
                          <span className="relative z-10 flex items-center justify-center gap-3">
                            {submittingFeedback ? <Loader2 className="animate-spin" /> : "GỬI ĐÁNH GIÁ NGAY"}
                          </span>
                          <div className="absolute inset-0 bg-white/20 -translate-x-full group-hover:animate-shine"></div>
                      </Button>
                  </CardContent>
              </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* FEEDBACK DIALOG */}
      <Dialog open={isFeedbackDialogOpen} onOpenChange={setIsFeedbackDialogOpen}>
          <DialogContent className="max-w-xl bg-brand-dark border-white/10 rounded-[50px] shadow-2xl p-0 overflow-hidden text-white">
              <div className="bg-gradient-to-br from-brand-accent to-orange-700 p-10 text-white relative overflow-hidden">
                  <Star className="absolute -right-8 -bottom-8 w-48 h-48 opacity-10 rotate-12" />
                  <DialogTitle className="text-3xl font-black tracking-tighter uppercase">Đánh giá đơn hàng</DialogTitle>
                  <p className="text-white/70 text-sm font-bold uppercase tracking-widest mt-2">Cảm ơn bạn đã tin tưởng dịch vụ của chúng tôi.</p>
              </div>
              <div className="p-10 space-y-10">
                  <div className="grid grid-cols-2 gap-8">
                        <RatingInputSmall
                            label="Phục vụ"
                            value={feedbackForm.serviceRating}
                            onChange={(v) => setFeedbackForm({...feedbackForm, serviceRating: v})}
                        />
                        <RatingInputSmall
                            label="Món ăn"
                            value={feedbackForm.foodRating}
                            onChange={(v) => setFeedbackForm({...feedbackForm, foodRating: v})}
                        />
                        <RatingInputSmall
                            label="Giá cả"
                            value={feedbackForm.priceRating}
                            onChange={(v) => setFeedbackForm({...feedbackForm, priceRating: v})}
                        />
                        <RatingInputSmall
                            label="Không gian"
                            value={feedbackForm.atmosphereRating}
                            onChange={(v) => setFeedbackForm({...feedbackForm, atmosphereRating: v})}
                        />
                  </div>
                  <div className="space-y-4">
                    <Label className="text-xs font-black uppercase tracking-wider text-gray-300 ml-2">Cảm nhận của bạn</Label>
                    <textarea
                        className="w-full h-32 p-6 bg-white/10 border border-white/20 rounded-3xl text-sm font-medium text-white focus:border-brand-accent transition-all outline-none resize-none placeholder:text-gray-500"
                        placeholder="Món ăn có vừa miệng bạn không?..."
                        value={feedbackForm.message}
                        onChange={(e) => setFeedbackForm({...feedbackForm, message: e.target.value})}
                    ></textarea>
                  </div>
                  <Button
                    onClick={handleSubmitFeedback}
                    disabled={submittingFeedback}
                    className="group relative overflow-hidden w-full h-16 bg-brand-accent hover:bg-orange-600 text-white font-black text-lg rounded-2xl shadow-xl shadow-brand-accent/20 transition-all uppercase tracking-widest"
                  >
                    <span className="relative z-10 flex items-center justify-center gap-3">
                        {submittingFeedback ? <Loader2 className="animate-spin" /> : "GỬI ĐÁNH GIÁ NGAY"}
                    </span>
                    <div className="absolute inset-0 bg-white/20 -translate-x-full group-hover:animate-shine"></div>
                  </Button>
              </div>
          </DialogContent>
      </Dialog>
    </div>
  );
}

function RatingInputSmall({ label, value, onChange }: { label: string, value: number, onChange: (v: number) => void }) {
    return (
        <div className="space-y-2">
            <div className="text-xs font-black uppercase text-gray-500 tracking-wider ml-1">{label}</div>
            <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                    <button
                        key={star}
                        onClick={() => onChange(star)}
                        className={`transition-all ${
                            star <= value ? 'text-brand-accent scale-110' : 'text-gray-700'
                        }`}
                    >
                        <Star className={`w-5 h-5 ${star <= value ? 'fill-current' : ''}`} />
                    </button>
                ))}
            </div>
        </div>
    );
}

function RatingInput({ label, icon, value, onChange }: { label: string, icon: any, value: number, onChange: (v: number) => void }) {
    return (
        <div className="space-y-4">
            <div className="flex items-center gap-3 text-xs font-black uppercase text-gray-500 tracking-widest ml-1">
                <span className="text-brand-accent">{icon}</span>
                {label}
            </div>
            <div className="flex gap-3">
                {[1, 2, 3, 4, 5].map((star) => (
                    <button
                        key={star}
                        onClick={() => onChange(star)}
                        className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${
                            star <= value ? 'bg-brand-accent text-white shadow-lg shadow-brand-accent/20' : 'bg-white/5 text-gray-600'
                        }`}
                    >
                        <Star className={`w-6 h-6 ${star <= value ? 'fill-current' : ''}`} />
                    </button>
                ))}
            </div>
        </div>
    );
}
