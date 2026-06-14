import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Label } from "../components/ui/label";
import { Loader2, ShoppingBag, Calendar, ChevronDown, CheckCircle, Clock, UtensilsCrossed, Star, MessageSquare } from "lucide-react";
import api from "../services/api";
import * as signalR from "@microsoft/signalr";

export function CustomerOrders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Feedback state for current expanded order
  const [feedbackForm, setFeedbackForm] = useState({
      serviceRating: 5,
      foodRating: 5,
      priceRating: 5,
      atmosphereRating: 5,
      message: ""
  });
  const [submittingFeedback, setSubmittingFeedback] = useState(false);

  const fetchOrders = async () => {
    try {
      const res = await api.get("/orders/customer/my-orders");
      setOrders(res.data);
    } catch (err) {
      console.error("Lỗi tải đơn hàng");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitFeedback = async (orderId: string) => {
      if (!feedbackForm.message) return alert("Vui lòng nhập lời nhắn góp ý");
      setSubmittingFeedback(true);
      try {
          await api.post("/feedbacks", {
              ...feedbackForm,
              orderId: orderId
          });
          alert("Cảm ơn bạn đã gửi đánh giá! Bạn được tặng 5 điểm thưởng.");
          setFeedbackForm({ serviceRating: 5, foodRating: 5, priceRating: 5, atmosphereRating: 5, message: "" });
          fetchOrders();
      } catch (err) {
          alert("Lỗi khi gửi đánh giá");
      } finally {
          setSubmittingFeedback(false);
      }
  };

  useEffect(() => {
    fetchOrders();

    const connection = new signalR.HubConnectionBuilder()
      .withUrl("https://restaurant-pos-api-uvcz.onrender.com/notificationHub")
      .withAutomaticReconnect()
      .build();

    connection.start()
      .then(() => {
        connection.on("OrderStatusUpdated", (data) => {
           console.log("Trạng thái đơn hàng thay đổi:", data);
           fetchOrders();
           alert(`Đơn hàng #${data.orderNumber} của bạn: ${data.newStatus}`);
        });
      })
      .catch(err => console.error("Lỗi SignalR Khách:", err));

    return () => { connection.stop(); };
  }, []);

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-brand-dark"><Loader2 className="animate-spin text-brand-accent w-12 h-12" /></div>;

  return (
    <div className="min-h-screen bg-brand-dark text-white p-6 md:p-12 space-y-12 pb-24 font-['Montserrat']">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 border-b border-white/5 pb-12">
         <div className="space-y-4">
            <h1 className="text-4xl md:text-7xl font-black tracking-tighter uppercase leading-none">Lịch Sử <span className="text-brand-accent">Thưởng Thức</span></h1>
            <p className="text-gray-400 text-lg font-medium max-w-2xl leading-relaxed">
                Hành trình khám phá hương vị của bạn. Theo dõi trạng thái các đơn hàng đang thực hiện.
            </p>
         </div>
         <div className="bg-white/5 backdrop-blur-xl text-brand-accent px-8 py-4 rounded-2xl flex items-center gap-4 border border-white/10 shadow-2xl animate-pulse">
            <div className="w-2 h-2 bg-brand-accent rounded-full"></div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em]">Cập nhật thời gian thực</p>
         </div>
      </div>

      {/* Orders Grid */}
      <div className="grid grid-cols-1 gap-12 max-w-5xl mx-auto">
        {orders.length === 0 ? (
          <div className="text-center py-40 bg-white/5 rounded-[60px] border-2 border-dashed border-white/10">
             <ShoppingBag className="mx-auto w-24 h-24 text-gray-700 mb-8 opacity-20" />
             <h3 className="text-2xl font-black text-gray-500 uppercase tracking-widest">BẠN CHƯA CÓ ĐƠN HÀNG NÀO</h3>
             <Button onClick={() => window.location.href='/customer/menu'} className="mt-10 bg-brand-accent hover:bg-orange-600 h-16 px-12 rounded-3xl font-black text-sm uppercase tracking-widest transition-all shadow-xl shadow-brand-accent/20">Khám phá thực đơn</Button>
          </div>
        ) : (
          orders.map((order) => (
            <Card key={order.id} className="border-none shadow-2xl bg-white/5 backdrop-blur-3xl rounded-[50px] overflow-hidden border border-white/5 group hover:border-brand-accent/30 transition-all duration-500">
              <CardContent className="p-0">
                <div
                    className="p-10 flex flex-col lg:flex-row justify-between items-center gap-10 cursor-pointer"
                    onClick={() => setExpandedId(expandedId === order.id ? null : order.id)}
                >
                  <div className="flex items-center gap-8">
                     <div className={`w-24 h-24 rounded-[32px] flex items-center justify-center text-4xl shadow-inner border ${
                         order.status === 'Completed'
                         ? 'bg-green-500/10 text-green-500 border-green-500/20'
                         : 'bg-brand-accent/10 text-brand-accent border-brand-accent/20'
                     }`}>
                        {order.status === 'Completed' ? <CheckCircle className="w-12 h-12" /> : <Clock className="w-12 h-12" />}
                     </div>
                     <div>
                        <div className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Mã định danh đơn hàng</div>
                        <div className="font-black text-4xl text-white tracking-tighter leading-none">#{order.orderNumber.split('-')[1]}</div>
                        <div className="flex flex-col gap-3 mt-4">
                           <div className="flex items-center gap-3 text-xs font-black uppercase text-gray-400 tracking-wider">
                              <ShoppingBag className="w-4 h-4 text-brand-accent" /> {order.branchName}
                           </div>
                           <div className="flex items-center gap-3 text-[10px] text-gray-500 font-black uppercase tracking-widest">
                              <Calendar className="w-4 h-4" /> {new Date(order.createdAtUtc).toLocaleString("vi-VN")}
                           </div>
                        </div>
                     </div>
                  </div>

                  {/* Status Progress */}
                  <div className="hidden xl:block flex-1 max-w-sm mx-12">
                      <div className="flex justify-between mb-3">
                          <span className="text-[9px] font-black uppercase tracking-[0.2em] text-brand-accent">{order.status}</span>
                          <span className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-600">Processing</span>
                      </div>
                      <div className="h-2 bg-white/5 rounded-full relative overflow-hidden border border-white/5">
                         <div className={`absolute top-0 left-0 h-full bg-brand-accent shadow-[0_0_15px_#F97316] transition-all duration-1000 ${
                             order.status === 'Preparing' ? 'w-1/3' : order.status === 'Ready' ? 'w-2/3' : 'w-full'
                         }`}></div>
                      </div>
                  </div>

                  <div className="text-right flex items-center gap-8 shrink-0">
                     <div>
                        <div className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 text-right">Tổng giá trị</div>
                        <div className="font-black text-4xl text-brand-accent tracking-tighter leading-none">{order.totalAmount.toLocaleString("vi-VN")}đ</div>
                     </div>
                     <div className={`p-3 rounded-2xl bg-white/5 transition-all ${expandedId === order.id ? 'bg-brand-accent text-white rotate-180' : 'text-gray-600'}`}>
                        <ChevronDown className="w-8 h-8" />
                     </div>
                  </div>
                </div>

                {/* Expanded Details */}
                {expandedId === order.id && (
                  <div className="px-10 pb-10 pt-4 border-t border-white/5 bg-white/[0.01] animate-in slide-in-from-top-4 duration-500">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-16 pt-8">
                        {/* List items */}
                        <div className="space-y-6">
                           <div className="flex items-center gap-3 mb-4">
                                <UtensilsCrossed className="w-5 h-5 text-brand-accent" />
                                <h4 className="text-xs font-black text-white uppercase tracking-[0.3em]">Danh mục món ăn</h4>
                           </div>
                           <div className="space-y-4">
                            {order.orderItems?.map((item: any) => (
                                    <div key={item.id} className="flex justify-between items-center p-6 bg-white/5 rounded-[32px] border border-white/5 group/item hover:border-brand-accent/20 transition-all">
                                        <div className="flex gap-5 items-center">
                                            <span className="w-12 h-12 rounded-2xl bg-brand-accent/10 flex items-center justify-center text-sm font-black text-brand-accent border border-brand-accent/20">{item.quantity}</span>
                                            <span className="font-black text-white uppercase tracking-tight text-lg">{item.product?.name || "Món ăn"}</span>
                                        </div>
                                        <span className="font-black text-gray-500 group-hover/item:text-brand-accent transition-colors">{item.totalPrice.toLocaleString("vi-VN")}đ</span>
                                    </div>
                            ))}
                           </div>
                        </div>

                        {/* Order Info & Summary */}
                        <div className="space-y-8">
                            <Card className="border-none shadow-2xl bg-brand-dark/40 p-10 rounded-[40px] border border-white/5">
                                <div className="space-y-6">
                                    <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.4em] mb-8">Chi tiết đơn hàng</h4>
                                    <div className="space-y-5">
                                        <DetailRow label="Trạng thái" value={order.status} valueClass="text-brand-accent" />
                                        <DetailRow label="Nhân viên" value={order.createdByUserName || "Hệ thống"} />
                                        <DetailRow label="Ngày đặt" value={new Date(order.createdAtUtc).toLocaleString("vi-VN")} />
                                        <DetailRow label="Thanh toán" value={order.paymentStatus} valueClass="text-green-500" />
                                    </div>
                                    <div className="pt-8 border-t border-white/5 flex gap-4">
                                        <Button className="flex-1 bg-white text-brand-dark hover:bg-brand-accent hover:text-white h-14 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all">Đặt lại đơn hàng</Button>
                                    </div>
                                </div>
                            </Card>

                            {/* REVIEW SECTION */}
                            {order.status === 'Completed' && !order.isReviewed && (
                                <div className="bg-brand-accent/5 p-10 rounded-[40px] border border-brand-accent/10 space-y-8 relative overflow-hidden">
                                    <div className="relative z-10">
                                        <div className="flex items-center gap-3 mb-4">
                                            <MessageSquare className="w-6 h-6 text-brand-accent" />
                                            <h4 className="font-black text-white text-xl tracking-tighter uppercase">Đánh giá trải nghiệm</h4>
                                        </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                                            <RatingInputSmall label="Phục vụ" value={feedbackForm.serviceRating} onChange={(v) => setFeedbackForm({...feedbackForm, serviceRating: v})} />
                                            <RatingInputSmall label="Món ăn" value={feedbackForm.foodRating} onChange={(v) => setFeedbackForm({...feedbackForm, foodRating: v})} />
                                            <RatingInputSmall label="Giá cả" value={feedbackForm.priceRating} onChange={(v) => setFeedbackForm({...feedbackForm, priceRating: v})} />
                                            <RatingInputSmall label="Không gian" value={feedbackForm.atmosphereRating} onChange={(v) => setFeedbackForm({...feedbackForm, atmosphereRating: v})} />
                                        </div>
                                        <div className="mt-8">
                                            <textarea
                                                className="w-full h-32 p-6 bg-white/5 border border-white/10 rounded-3xl text-sm font-medium text-white focus:border-brand-accent transition-all outline-none resize-none placeholder:text-gray-700"
                                                placeholder="Bạn cảm thấy thế nào về bữa ăn này?..."
                                                value={feedbackForm.message}
                                                onChange={(e) => setFeedbackForm({...feedbackForm, message: e.target.value})}
                                            ></textarea>
                                        </div>
                                        <Button
                                            onClick={() => handleSubmitFeedback(order.id)}
                                            disabled={submittingFeedback}
                                            className="w-full h-16 bg-brand-accent hover:bg-orange-600 text-white font-black text-xs rounded-2xl shadow-xl mt-6 uppercase tracking-widest"
                                        >
                                            {submittingFeedback ? <Loader2 className="animate-spin" /> : "GỬI ĐÁNH GIÁ NGAY"}
                                        </Button>
                                    </div>
                                </div>
                            )}

                            {order.isReviewed && (
                                <div className="bg-green-500/5 p-10 rounded-[40px] text-center border border-green-500/10">
                                    <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4 opacity-40" />
                                    <p className="text-[10px] font-black text-green-500 uppercase tracking-[0.3em]">BẠN ĐÃ ĐÁNH GIÁ ĐƠN HÀNG NÀY</p>
                                    <p className="text-gray-500 font-medium mt-3 text-sm">Cảm ơn bạn đã tin tưởng và góp ý cho chúng tôi!</p>
                                </div>
                            )}
                        </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

function DetailRow({ label, value, valueClass = "text-white" }: { label: string, value: string, valueClass?: string }) {
    return (
        <div className="flex justify-between items-center text-sm">
            <span className="text-gray-500 font-bold uppercase tracking-tighter">{label}</span>
            <span className={`font-black uppercase tracking-tight ${valueClass}`}>{value}</span>
        </div>
    )
}

function RatingInputSmall({ label, value, onChange }: { label: string, value: number, onChange: (v: number) => void }) {
    return (
        <div className="space-y-3">
            <div className="text-[9px] font-black uppercase text-gray-500 tracking-widest ml-1">{label}</div>
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
