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
import { Gift, ShoppingBag, Loader2, Coins, PlusCircle, MinusCircle, Clock, Edit2, Save, KeyRound, Star, MessageSquare, Utensils, DollarSign, Home, Users, CheckCircle } from "lucide-react";
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

  if (loading) return <div className="flex justify-center p-20"><Loader2 className="animate-spin text-orange-600" /></div>;

  return (
    <div className="pb-24 bg-gray-50 min-h-screen">
      {/* Profile Header */}
      <div className="bg-gradient-to-br from-orange-500 to-red-600 text-white p-6 pt-10 rounded-b-[40px] shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Avatar className="w-16 h-16 border-2 border-white/50">
              {profile?.avatarUrl ? (
                <img src={profile.avatarUrl} alt={profile.fullName} className="aspect-square h-full w-full object-cover" />
              ) : (
                <AvatarFallback className="bg-white text-orange-600 font-black text-xl">
                  {profile?.fullName?.charAt(0)}
                </AvatarFallback>
              )}
            </Avatar>
            <div>
              <h2 className="text-xl font-black">{profile?.fullName}</h2>
              <p className="text-white/70 text-xs font-bold uppercase tracking-widest">{profile?.phoneNumber}</p>
            </div>
          </div>

          <div className="flex gap-2">
            <Link to="/customer/change-password">
              <Button variant="ghost" size="icon" className="text-white hover:bg-white/20 rounded-full">
                <KeyRound className="w-5 h-5" />
              </Button>
            </Link>
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
              <DialogTrigger onClick={() => setIsEditDialogOpen(true)}>
                <Button variant="ghost" size="icon" className="text-white hover:bg-white/20 rounded-full">
                  <Edit2 className="w-5 h-5" />
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Chỉnh sửa trang cá nhân</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4 text-gray-900">
                  <div className="grid gap-2">
                    <Label htmlFor="name">Họ và tên</Label>
                    <Input id="name" value={editName} onChange={(e) => setEditName(e.target.value)} />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="avatar">Link ảnh đại diện</Label>
                    <Input id="avatar" value={editAvatar} placeholder="https://..." onChange={(e) => setEditAvatar(e.target.value)} />
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={handleUpdateProfile} disabled={updating} className="bg-orange-600 hover:bg-orange-700">
                    {updating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Lưu thay đổi
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <Card className="mt-6 border-none bg-white/10 backdrop-blur-md text-white">
          <CardContent className="p-4 flex justify-between items-center">
            <div>
              <p className="text-[10px] font-black uppercase opacity-70">Điểm hiện có</p>
              <p className="text-3xl font-black tracking-tighter">{profile?.points?.toLocaleString()}</p>
            </div>
            <div className="bg-white text-orange-600 px-3 py-1 rounded-full text-xs font-bold shadow-sm">
              Hạng Vàng
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="p-4">
        <Tabs defaultValue="history">
          <TabsList className="w-full bg-white border border-gray-100 p-1 rounded-2xl shadow-sm mb-6 flex overflow-x-auto">
            <TabsTrigger value="history" className="flex-1 font-bold rounded-xl py-2.5">Lịch sử</TabsTrigger>
            <TabsTrigger value="redeem" className="flex-1 font-bold rounded-xl py-2.5">Đổi quà</TabsTrigger>
            <TabsTrigger value="bookings" className="flex-1 font-bold rounded-xl py-2.5">Lịch hẹn</TabsTrigger>
            <TabsTrigger value="feedback" className="flex-1 font-bold rounded-xl py-2.5">Đánh giá</TabsTrigger>
          </TabsList>

          {/* TAB 1: LỊCH SỬ TÍCH ĐIỂM & ĐƠN HÀNG */}
          <TabsContent value="history">
            <div className="space-y-6">
              {history.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-gray-100">
                  <Clock className="mx-auto w-10 h-10 text-gray-200 mb-2" />
                  <p className="text-gray-400 font-bold">Chưa có lịch sử hoạt động</p>
                </div>
              ) : (
                history.map((item) => (
                  <Card key={item.id} className="border-none shadow-xl ring-1 ring-black/5 rounded-[32px] overflow-hidden bg-white">
                    <CardContent className="p-0">
                      <div className="p-6 flex items-center justify-between border-b border-gray-50">
                        <div className="flex items-center gap-4">
                          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-inner ${
                            item.points > 0 ? 'bg-green-50 text-green-600' : 'bg-orange-50 text-orange-600'
                          }`}>
                            {item.points > 0 ? <PlusCircle className="w-6 h-6" /> : <MinusCircle className="w-6 h-6" />}
                          </div>
                          <div>
                            <div className="font-black text-gray-900 leading-tight">
                                {item.order ? `Đơn hàng #${item.order.orderNumber.split('-')[1]}` : item.description}
                            </div>
                            <div className="text-[10px] text-gray-400 font-black uppercase tracking-widest mt-1">
                                {new Date(item.createdAtUtc).toLocaleString("vi-VN")}
                            </div>
                          </div>
                        </div>
                        <div className={`text-xl font-black ${item.points > 0 ? 'text-green-600' : 'text-orange-600'}`}>
                          {item.points > 0 ? '+' : ''}{item.points}
                        </div>
                      </div>

                      {item.order && (
                        <div className="px-6 py-5 space-y-4 bg-gray-50/30">
                           <div className="flex justify-between items-center text-xs">
                              <span className="text-gray-400 font-bold uppercase tracking-tighter">Phục vụ: <span className="text-gray-900">{item.order.createdByUserName}</span></span>
                              <span className="font-black text-gray-900">{item.order.totalAmount.toLocaleString("vi-VN")}đ</span>
                           </div>

                           <div className="space-y-1">
                              {item.order.items?.map((food: any, idx: number) => (
                                <div key={idx} className="flex justify-between text-[11px] text-gray-500 font-medium">
                                   <span>{food.quantity}x {food.productName}</span>
                                   <span>{food.totalPrice.toLocaleString("vi-VN")}đ</span>
                                </div>
                              ))}
                           </div>

                           {item.order.status === 'Completed' && !item.order.isReviewed && (
                             <Button
                                onClick={() => {
                                    setExpandedOrderForFeedback(item.order);
                                    setIsFeedbackDialogOpen(true);
                                }}
                                className="w-full h-10 bg-orange-600 hover:bg-orange-700 font-black text-[10px] uppercase tracking-widest rounded-xl shadow-lg shadow-orange-100"
                             >
                                <Star className="w-3 h-3 mr-2 fill-current" /> Đánh giá món ăn
                             </Button>
                           )}

                           {item.order.isReviewed && (
                             <div className="flex items-center justify-center gap-1.5 py-2 text-[10px] font-black text-green-600 uppercase">
                                <CheckCircle className="w-3 h-3" /> Đã đánh giá
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
            <div className="space-y-4">
              {vouchers.map((v) => (
                <Card key={v.id} className="border-none shadow-sm overflow-hidden bg-white">
                  <CardContent className="p-0 flex h-20">
                    <div className="w-20 bg-orange-600 flex flex-col items-center justify-center text-white">
                      <span className="font-black text-xl">{v.discountValue}%</span>
                      <span className="text-[8px] font-bold uppercase opacity-80">OFF</span>
                    </div>
                    <div className="flex-1 p-3 flex flex-col justify-center">
                      <div className="font-bold text-sm text-gray-900">{v.name}</div>
                      <div className="text-[10px] text-orange-600 font-bold uppercase tracking-tighter">
                        Chi phí: {v.discountValue * 10} điểm
                      </div>
                    </div>
                    <div className="p-3 flex items-center">
                      <Button
                        onClick={() => handleRedeem(v.id)}
                        disabled={updating || (profile?.points < v.discountValue * 10)}
                        size="sm"
                        className="h-8 rounded-lg bg-orange-100 text-orange-600 hover:bg-orange-600 hover:text-white font-black text-[10px] uppercase"
                      >
                        {profile?.points < (v.discountValue * 10) ? 'Thiếu điểm' : 'Đổi'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* TAB 3: LỊCH ĐẶT BÀN */}
          <TabsContent value="bookings">
            <div className="space-y-4">
              {bookings.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-gray-100">
                  <Calendar className="mx-auto w-10 h-10 text-gray-200 mb-2" />
                  <p className="text-gray-400 font-bold">Chưa có lịch đặt bàn</p>
                  <Link to="/customer/booking">
                    <Button variant="link" className="text-orange-600 font-bold">Đặt bàn ngay</Button>
                  </Link>
                </div>
              ) : (
                bookings.map((b) => (
                  <Card key={b.id} className="border-none shadow-sm overflow-hidden bg-white">
                    <CardContent className="p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-orange-50 rounded-2xl flex items-center justify-center text-orange-600">
                            <Clock className="w-6 h-6" />
                        </div>
                        <div>
                          <div className="font-black text-gray-900 text-sm">
                            {b.tableId ? `Bàn ${b.tableNumber}` : "Bàn tự do"} - {b.branchName}
                          </div>
                          <div className="text-[10px] text-gray-400 font-bold uppercase">
                            {new Date(b.bookingDate).toLocaleString("vi-VN")} • {b.status}
                          </div>
                        </div>
                      </div>
                      <Link to="/customer/my-bookings">
                        <Button size="icon" variant="ghost" className="rounded-full text-gray-300 hover:text-orange-600">
                            <ChevronRight className="w-5 h-5" />
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
              <Card className="border-none shadow-sm bg-white rounded-[32px] overflow-hidden">
                  <CardHeader className="bg-orange-50/50">
                      <CardTitle className="text-lg font-black flex items-center gap-2">
                          <MessageSquare className="w-5 h-5 text-orange-600" />
                          Đánh giá chất lượng
                      </CardTitle>
                      <p className="text-xs text-gray-500 font-medium">Góp ý của bạn giúp chúng tôi hoàn thiện hơn mỗi ngày. Gửi đánh giá để nhận ngay <span className="text-orange-600 font-bold">5 điểm thưởng</span>!</p>
                  </CardHeader>
                  <CardContent className="p-6 space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <RatingInput
                            label="Phục vụ"
                            icon={<Users className="w-4 h-4" />}
                            value={feedbackForm.serviceRating}
                            onChange={(v) => setFeedbackForm({...feedbackForm, serviceRating: v})}
                          />
                          <RatingInput
                            label="Món ăn"
                            icon={<Utensils className="w-4 h-4" />}
                            value={feedbackForm.foodRating}
                            onChange={(v) => setFeedbackForm({...feedbackForm, foodRating: v})}
                          />
                          <RatingInput
                            label="Giá cả"
                            icon={<DollarSign className="w-4 h-4" />}
                            value={feedbackForm.priceRating}
                            onChange={(v) => setFeedbackForm({...feedbackForm, priceRating: v})}
                          />
                          <RatingInput
                            label="Không gian"
                            icon={<Home className="w-4 h-4" />}
                            value={feedbackForm.atmosphereRating}
                            onChange={(v) => setFeedbackForm({...feedbackForm, atmosphereRating: v})}
                          />
                      </div>

                      <div className="space-y-2">
                          <Label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">Lời nhắn của bạn</Label>
                          <textarea
                            className="w-full h-32 p-4 bg-gray-50 border-none rounded-2xl text-sm font-medium focus:ring-2 focus:ring-orange-500 transition-all outline-none"
                            placeholder="Chia sẻ trải nghiệm thực tế của bạn tại nhà hàng..."
                            value={feedbackForm.message}
                            onChange={(e) => setFeedbackForm({...feedbackForm, message: e.target.value})}
                          ></textarea>
                      </div>

                      <Button
                        onClick={handleSubmitFeedback}
                        disabled={submittingFeedback}
                        className="w-full h-14 bg-orange-600 hover:bg-orange-700 font-black text-lg rounded-2xl shadow-xl shadow-orange-100"
                      >
                          {submittingFeedback ? <Loader2 className="animate-spin" /> : "GỬI ĐÁNH GIÁ NGAY"}
                      </Button>
                  </CardContent>
              </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* FEEDBACK DIALOG */}
      <Dialog open={isFeedbackDialogOpen} onOpenChange={setIsFeedbackDialogOpen}>
          <DialogContent className="max-w-md rounded-[40px] border-none shadow-2xl p-0 overflow-hidden">
              <div className="bg-orange-600 p-8 text-white relative overflow-hidden">
                  <Star className="absolute -right-4 -bottom-4 w-32 h-32 opacity-10 rotate-12" />
                  <DialogTitle className="text-2xl font-black">Đánh giá đơn hàng</DialogTitle>
                  <p className="text-white/70 text-sm font-medium mt-1">Đóng góp của bạn giúp chúng tôi hoàn thiện hơn.</p>
              </div>
              <div className="p-8 space-y-6">
                  <div className="grid grid-cols-2 gap-6">
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
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">Lời nhắn của bạn</Label>
                    <textarea
                        className="w-full h-24 p-4 bg-gray-50 border-none rounded-2xl text-sm font-medium focus:ring-2 focus:ring-orange-500 transition-all outline-none"
                        placeholder="Món ăn có vừa miệng bạn không?..."
                        value={feedbackForm.message}
                        onChange={(e) => setFeedbackForm({...feedbackForm, message: e.target.value})}
                    ></textarea>
                  </div>
                  <Button
                    onClick={handleSubmitFeedback}
                    disabled={submittingFeedback}
                    className="w-full h-14 bg-orange-600 hover:bg-orange-700 font-black text-lg rounded-2xl shadow-xl shadow-orange-100 uppercase"
                  >
                    {submittingFeedback ? <Loader2 className="animate-spin" /> : "GỬI ĐÁNH GIÁ NGAY"}
                  </Button>
              </div>
          </DialogContent>
      </Dialog>
    </div>
  );
}

function RatingInputSmall({ label, value, onChange }: { label: string, value: number, onChange: (v: number) => void }) {
    return (
        <div className="space-y-1.5">
            <div className="text-[9px] font-black uppercase text-gray-400 tracking-widest ml-1">{label}</div>
            <div className="flex gap-1.5">
                {[1, 2, 3, 4, 5].map((star) => (
                    <button
                        key={star}
                        onClick={() => onChange(star)}
                        className={`transition-all ${
                            star <= value ? 'text-orange-500 scale-110' : 'text-gray-200'
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
        <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-black uppercase text-gray-400 tracking-widest ml-1">
                {icon}
                {label}
            </div>
            <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                    <button
                        key={star}
                        onClick={() => onChange(star)}
                        className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                            star <= value ? 'bg-orange-100 text-orange-600' : 'bg-gray-50 text-gray-300'
                        }`}
                    >
                        <Star className={`w-5 h-5 ${star <= value ? 'fill-current' : ''}`} />
                    </button>
                ))}
            </div>
        </div>
    );
}
