import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../components/ui/dialog";
import { Plus, Minus, Trash2, Tag, QrCode, Loader2, ArrowLeft, CreditCard, ShoppingBag, CheckCircle } from "lucide-react";
import api from "../services/api";

export function CustomerCart() {
  const navigate = useNavigate();
  const [cart, setCart] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [orderInfo, setOrderInfo] = useState<any>(null);

  useEffect(() => {
    const savedCart = localStorage.getItem("customer_cart");
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
  }, []);

  const saveCart = (newCart: any[]) => {
    setCart(newCart);
    localStorage.setItem("customer_cart", JSON.stringify(newCart));
    window.dispatchEvent(new Event("storage"));
  };

  const subtotal = cart.reduce((sum, item) => sum + (item.price ?? 0) * (item.quantity ?? 0), 0);
  const serviceCharge = subtotal * 0.05; // 5% phí phục vụ
  const total = subtotal + serviceCharge;

  const updateQty = (id: string, delta: number) => {
      const newCart = cart.map(i => i.id === id ? { ...i, quantity: Math.max(1, (i.quantity ?? 0) + delta) } : i);
      saveCart(newCart);
  };

  const removeItem = (id: string) => {
      const newCart = cart.filter(i => i.id !== id);
      saveCart(newCart);
  };

  const handlePlaceOrder = async () => {
    const savedTableId = localStorage.getItem("current_table_id");
    if (!savedTableId) {
        alert("Không tìm thấy thông tin bàn. Vui lòng quét lại mã QR tại bàn.");
        return;
    }

    setLoading(true);
    try {
      const userStr = localStorage.getItem("user");
      const profile = userStr ? JSON.parse(userStr) : {};

      const res = await api.post("/qrordering/submit-request", {
        tableId: savedTableId,
        customerName: profile.fullName || "Khách vãng lai",
        items: cart.map(i => ({ productId: i.id, quantity: i.quantity }))
      });

      // Lưu thông tin đơn hàng vừa đặt
      setOrderInfo(res.data);

      // Lưu orderId vào localStorage để khách theo dõi
      localStorage.setItem("active_order_id", res.data.orderId);

      // Xóa giỏ hàng sau khi đặt thành công
      localStorage.removeItem("customer_cart");
      window.dispatchEvent(new Event("storage"));
      setCart([]);

      // Hiển thị thông báo thành công
      setShowSuccess(true);

    } catch (err: any) {
        alert(err.response?.data || "Lỗi khi đặt món. Vui lòng liên hệ nhân viên.");
    } finally {
        setLoading(false);
    }
  };

  if (cart.length === 0 && !showSuccess) {
    return (
        <div className="flex flex-col items-center justify-center py-32 space-y-6">
            <div className="w-24 h-24 bg-orange-50 rounded-full flex items-center justify-center text-5xl">🛒</div>
            <h2 className="text-2xl font-black text-gray-900">Giỏ hàng đang trống</h2>
            <Button onClick={() => navigate('/customer/menu')} className="bg-orange-600 rounded-2xl h-12 px-8 font-bold uppercase tracking-wider">Khám phá thực đơn</Button>
        </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 px-4 md:px-0">
      <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate(-1)} className="rounded-full h-12 w-12 hover:bg-orange-50 text-orange-600"><ArrowLeft /></Button>
          <h1 className="text-3xl font-black text-gray-900">Xác nhận đơn hàng</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* CỘT TRÁI: DANH SÁCH MÓN */}
        <div className="lg:col-span-2 space-y-4">
          {cart.map((item) => (
            <Card key={item.id} className="border-none shadow-sm hover:shadow-md transition-all rounded-[32px] overflow-hidden bg-white">
              <CardContent className="p-4 md:p-6 flex items-center gap-4 md:gap-6">
                <div className="w-16 h-16 md:w-20 md:h-20 bg-orange-50 rounded-2xl flex items-center justify-center text-3xl shrink-0">🍽️</div>
                <div className="flex-1 min-w-0">
                   <h4 className="font-black text-lg md:text-xl text-gray-900 truncate">{item.name}</h4>
                   <p className="text-orange-600 font-bold text-base md:text-lg">${item.price}</p>
                </div>
                <div className="flex items-center gap-2 md:gap-4 bg-gray-50 p-1.5 md:p-2 rounded-2xl">
                   <Button variant="ghost" size="icon" onClick={() => updateQty(item.id, -1)} className="h-8 w-8 md:h-10 md:w-10 bg-white rounded-xl shadow-sm text-gray-400 hover:text-orange-600"><Minus className="w-3 h-3 md:w-4 md:h-4" /></Button>
                   <span className="font-black text-base md:text-lg w-4 md:w-6 text-center">{item.quantity}</span>
                   <Button variant="ghost" size="icon" onClick={() => updateQty(item.id, 1)} className="h-8 w-8 md:h-10 md:w-10 bg-white rounded-xl shadow-sm text-gray-400 hover:text-orange-600"><Plus className="w-3 h-3 md:w-4 md:h-4" /></Button>
                </div>
                <Button variant="ghost" size="icon" onClick={() => removeItem(item.id)} className="text-red-200 hover:text-red-500 transition-colors"><Trash2 className="w-5 h-5" /></Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* CỘT PHẢI: TỔNG KẾT */}
        <div className="space-y-6">
           <Card className="border-none shadow-xl rounded-[32px] bg-white p-2">
              <CardHeader><CardTitle className="font-black text-xl">Tóm tắt chi phí</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                 <div className="flex justify-between text-gray-500 font-medium">
                    <span>Tạm tính</span>
                    <span>${subtotal.toFixed(2)}</span>
                 </div>
                 <div className="flex justify-between text-gray-500 font-medium">
                    <span>Phí phục vụ (5%)</span>
                    <span>${serviceCharge.toFixed(2)}</span>
                 </div>
                 <div className="pt-4 border-t border-gray-100 flex justify-between items-center">
                    <span className="font-black text-gray-900">TỔNG CỘNG</span>
                    <span className="text-3xl font-black text-orange-600">${total.toFixed(2)}</span>
                 </div>

                 <div className="pt-6">
                    <Button
                        className="w-full bg-gray-900 hover:bg-orange-600 text-white h-16 rounded-2xl font-black text-lg shadow-xl transition-all gap-3 uppercase tracking-wider"
                        onClick={handlePlaceOrder}
                        disabled={loading}
                    >
                        {loading ? <Loader2 className="animate-spin" /> : <><ShoppingBag className="w-6 h-6" /> Gửi yêu cầu ngay</>}
                    </Button>
                    <p className="text-[10px] text-gray-400 text-center font-bold uppercase tracking-widest mt-4">Đơn hàng sẽ được nhân viên xác nhận tại bàn</p>
                 </div>
              </CardContent>
           </Card>
        </div>
      </div>

      {/* DIALOG THÀNH CÔNG */}
      <Dialog open={showSuccess} onOpenChange={(val) => {
          setShowSuccess(val);
          if(!val) navigate('/customer');
      }}>
          <DialogContent className="rounded-[40px] p-10 text-center max-w-sm">
              <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
                  <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center animate-bounce shadow-lg shadow-green-200">
                    <CheckCircle className="text-white w-10 h-10" />
                  </div>
              </div>
              <DialogTitle className="text-3xl font-black text-gray-900 mb-2">Đã nhận yêu cầu!</DialogTitle>
              <DialogDescription className="text-gray-500 font-bold text-base leading-relaxed">
                  Đơn hàng của bạn đã được gửi tới nhân viên. <br/>
                  <span className="text-orange-600">Vui lòng chờ trong giây lát!</span>
              </DialogDescription>

              <div className="mt-8">
                  <Button onClick={() => navigate('/customer')} className="w-full bg-gray-900 h-12 rounded-xl font-black uppercase tracking-widest">Xem trạng thái đơn</Button>
              </div>
          </DialogContent>
      </Dialog>
    </div>
  );
}
