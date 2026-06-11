import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Label } from "../components/ui/label";
import { Loader2, ShoppingBag, Calendar, ChevronDown, CheckCircle, Clock, ChefHat, UtensilsCrossed, Star, User, Utensils, DollarSign, Home, MessageSquare } from "lucide-react";
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
          fetchOrders(); // Refresh to hide review form if IsReviewed logic is applied
      } catch (err) {
          alert("Lỗi khi gửi đánh giá");
      } finally {
          setSubmittingFeedback(false);
      }
  };

  useEffect(() => {
    fetchOrders();

    // TÍCH HỢP SIGNALR CHO KHÁCH HÀNG
    const connection = new signalR.HubConnectionBuilder()
      .withUrl("https://restaurant-pos-api-uvcz.onrender.com/notificationHub")
      .withAutomaticReconnect()
      .build();

    connection.start()
      .then(() => {
        // Lắng nghe tín hiệu khi trạng thái đơn hàng của mình thay đổi
        connection.on("OrderStatusUpdated", (data) => {
           // Nếu ID đơn hàng khớp, cập nhật lại danh sách
           console.log("Trạng thái đơn hàng thay đổi:", data);
           fetchOrders();
           // Hiện thông báo (Toast/Alert) nếu muốn
           alert(`Đơn hàng #${data.orderNumber} của bạn: ${data.newStatus}`);
        });
      })
      .catch(err => console.error("Lỗi SignalR Khách:", err));

    return () => { connection.stop(); };
  }, []);

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-50"><Loader2 className="animate-spin text-orange-600 w-12 h-12" /></div>;

  return (
    <div className="max-w-6xl mx-auto space-y-12 pb-24">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white p-10 rounded-[40px] shadow-sm border border-gray-100">
         <div>
            <h1 className="text-4xl font-black text-gray-900 tracking-tighter">Lịch sử thưởng thức</h1>
            <p className="text-gray-400 font-bold uppercase tracking-widest text-xs mt-2">Theo dõi đơn hàng & hành trình ẩm thực của bạn</p>
         </div>
         <div className="flex items-center gap-2 bg-orange-50 text-orange-600 px-6 py-3 rounded-2xl font-black text-sm uppercase tracking-tighter border border-orange-100 animate-pulse">
            <div className="w-2 h-2 bg-orange-600 rounded-full"></div>
            Cập nhật trực tiếp
         </div>
      </div>

      {/* Orders Grid */}
      <div className="grid grid-cols-1 gap-8">
        {orders.length === 0 ? (
          <div className="text-center py-32 bg-white rounded-[48px] border-2 border-dashed border-gray-100">
             <ShoppingBag className="mx-auto w-24 h-24 text-gray-50 mb-6" />
             <h3 className="text-2xl font-black text-gray-300">BẠN CHƯA CÓ ĐƠN HÀNG NÀO</h3>
             <Button variant="outline" className="mt-8 border-orange-200 text-orange-600 font-black px-10 h-14 rounded-2xl uppercase">Đặt món ngay</Button>
          </div>
        ) : (
          orders.map((order) => (
            <Card key={order.id} className="border-none shadow-sm hover:shadow-xl transition-all rounded-[40px] overflow-hidden bg-white group">
              <CardContent className="p-0">
                <div
                    className="p-8 flex flex-col lg:flex-row justify-between items-center gap-8 cursor-pointer"
                    onClick={() => setExpandedId(expandedId === order.id ? null : order.id)}
                >
                  <div className="flex items-center gap-6">
                     <div className={`w-20 h-20 rounded-[28px] flex items-center justify-center text-3xl shadow-inner ${
                         order.status === 'Completed' ? 'bg-green-50 text-green-600' : 'bg-orange-50 text-orange-600'
                     }`}>
                        {order.status === 'Completed' ? <CheckCircle className="w-10 h-10" /> : <Clock className="w-10 h-10" />}
                     </div>
                     <div>
                        <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Mã đơn hàng</div>
                        <div className="font-black text-2xl text-gray-900 leading-none">#{order.orderNumber.split('-')[1]}</div>
                        <div className="flex flex-col gap-1 mt-2">
                           <div className="flex items-center gap-2 text-xs text-gray-400 font-bold uppercase">
                              <ShoppingBag className="w-3 h-3 text-orange-600" /> {order.branchName}
                           </div>
                           <div className="flex items-center gap-2 text-[10px] text-gray-400 font-medium truncate max-w-[200px]">
                              {order.branchAddress}
                           </div>
                           <div className="flex items-center gap-2 text-xs text-gray-400 font-medium">
                              <Calendar className="w-3 h-3" /> {new Date(order.createdAtUtc).toLocaleDateString("vi-VN")}
                           </div>
                        </div>
                     </div>
                  </div>

                  {/* Status Timeline Progress (Dành cho bản Web) */}
                  <div className="hidden xl:flex items-center gap-4 flex-1 max-w-md mx-12">
                      <div className="flex-1 h-1.5 bg-gray-100 rounded-full relative">
                         <div className={`absolute top-0 left-0 h-full bg-orange-600 rounded-full transition-all duration-1000 ${
                             order.status === 'Preparing' ? 'w-1/3' : order.status === 'Ready' ? 'w-2/3' : 'w-full'
                         }`}></div>
                      </div>
                      <span className="text-[10px] font-black uppercase text-orange-600 tracking-tighter">{order.status}</span>
                  </div>

                  <div className="text-right flex items-center gap-6 shrink-0">
                     <div>
                        <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 text-right">Tổng thanh toán</div>
                        <div className="font-black text-3xl text-orange-600 leading-none">${order.totalAmount.toFixed(2)}</div>
                     </div>
                     <ChevronDown className={`w-8 h-8 text-gray-200 transition-transform ${expandedId === order.id ? 'rotate-180 text-orange-600' : ''}`} />
                  </div>
                </div>

                {/* Expanded Details */}
                {expandedId === order.id && (
                  <div className="px-10 pb-10 pt-4 border-t border-gray-50 bg-gray-50/20 animate-in slide-in-from-top-4 duration-300">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 pt-4">
                        {/* List items */}
                        <div className="space-y-4">
                           <h4 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-6">Món ăn đã gọi</h4>
                           {order.orderItems?.map((item: any) => (
                                <div key={item.id} className="flex justify-between items-center p-4 bg-white rounded-2xl shadow-sm border border-gray-50 group/item hover:border-orange-200 transition-colors">
                                    <div className="flex gap-4 items-center">
                                        <span className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center text-sm font-black text-orange-600">{item.quantity}</span>
                                        <span className="font-bold text-gray-700">{item.product?.name || "Món ăn"}</span>
                                    </div>
                                    <span className="font-black text-gray-400 group-hover/item:text-orange-600 transition-colors">${item.totalPrice.toFixed(2)}</span>
                                </div>
                           ))}
                        </div>

                        {/* Order Info & Summary */}
                        <div className="space-y-6">
                            <div className="bg-white p-8 rounded-[32px] shadow-sm border border-gray-50 flex flex-col justify-between">
                                <div>
                                    <h4 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-6">Thông tin đơn hàng</h4>
                                    <div className="space-y-4">
                                        <div className="flex justify-between text-sm"><span className="text-gray-400">Trạng thái:</span><span className="font-bold text-orange-600">{order.status}</span></div>
                                        <div className="flex justify-between text-sm"><span className="text-gray-400">Ngày đặt:</span><span className="font-bold text-gray-700">{new Date(order.createdAtUtc).toLocaleString("vi-VN")}</span></div>
                                        <div className="flex justify-between text-sm"><span className="text-gray-400">Thanh toán:</span><span className="font-bold text-green-600">{order.paymentStatus}</span></div>
                                    </div>
                                </div>
                                <div className="mt-8 pt-6 border-t border-gray-100 flex gap-3">
                                    <Button className="flex-1 bg-gray-900 hover:bg-black h-14 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-xl shadow-gray-200 active:scale-95">Đặt lại đơn hàng</Button>
                                    <Button variant="outline" className="h-14 w-14 rounded-2xl border-gray-100 hover:bg-orange-50 hover:border-orange-200 transition-colors"><UtensilsCrossed className="w-5 h-5 text-orange-600" /></Button>
                                </div>
                            </div>

                            {/* REVIEW SECTION - Only for Completed and Not Reviewed orders */}
                            {order.status === 'Completed' && !order.isReviewed && (
                                <Card className="border-none shadow-sm bg-white rounded-[32px] overflow-hidden border border-orange-100">
                                    <CardHeader className="bg-orange-50/50 py-4 px-6">
                                        <CardTitle className="text-sm font-black flex items-center gap-2">
                                            <MessageSquare className="w-4 h-4 text-orange-600" />
                                            ĐÁNH GIÁ TRẢI NGHIỆM
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="p-6 space-y-6">
                                        <div className="grid grid-cols-2 gap-4">
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
                                        <div className="space-y-1">
                                            <textarea
                                                className="w-full h-20 p-3 bg-gray-50 border-none rounded-xl text-xs font-medium focus:ring-2 focus:ring-orange-500 outline-none"
                                                placeholder="Bạn cảm thấy thế nào về bữa ăn này?..."
                                                value={feedbackForm.message}
                                                onChange={(e) => setFeedbackForm({...feedbackForm, message: e.target.value})}
                                            ></textarea>
                                        </div>
                                        <Button
                                            onClick={() => handleSubmitFeedback(order.id)}
                                            disabled={submittingFeedback}
                                            className="w-full h-11 bg-orange-600 hover:bg-orange-700 font-black text-xs rounded-xl shadow-lg uppercase"
                                        >
                                            {submittingFeedback ? <Loader2 className="animate-spin" /> : "GỬI ĐÁNH GIÁ"}
                                        </Button>
                                    </CardContent>
                                </Card>
                            )}

                            {order.isReviewed && (
                                <div className="bg-green-50 p-6 rounded-[32px] text-center border border-green-100">
                                    <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
                                    <p className="text-xs font-black text-green-700 uppercase">BẠN ĐÃ ĐÁNH GIÁ ĐƠN HÀNG NÀY</p>
                                    <p className="text-[10px] text-green-600 font-medium mt-1">Cảm ơn bạn đã tin tưởng và góp ý!</p>
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

function RatingInputSmall({ label, value, onChange }: { label: string, value: number, onChange: (v: number) => void }) {
    return (
        <div className="space-y-1">
            <div className="text-[9px] font-black uppercase text-gray-400 tracking-widest ml-1">{label}</div>
            <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                    <button
                        key={star}
                        onClick={() => onChange(star)}
                        className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all ${
                            star <= value ? 'text-orange-500' : 'text-gray-200'
                        }`}
                    >
                        <Star className={`w-4 h-4 ${star <= value ? 'fill-current' : ''}`} />
                    </button>
                ))}
            </div>
        </div>
    );
}
