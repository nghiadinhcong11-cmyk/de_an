import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../components/ui/dialog";
import { Plus, Minus, Trash2, Tag, QrCode, Loader2, ArrowLeft, CreditCard, ShoppingBag } from "lucide-react";
import api from "../services/api";

export function CustomerCart() {
  const navigate = useNavigate();
  const [cart, setCart] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [qrData, setQrData] = useState<any>(null);
  const [showCheckout, setShowCheckout] = useState(false);
  const [showQR, setShowQR] = useState(false);

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

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const serviceCharge = subtotal * 0.05; // 5% phí phục vụ
  const total = subtotal + serviceCharge;

  const updateQty = (id: string, delta: number) => {
      const newCart = cart.map(i => i.id === id ? { ...i, quantity: Math.max(1, i.quantity + delta) } : i);
      saveCart(newCart);
  };

  const removeItem = (id: string) => {
      const newCart = cart.filter(i => i.id !== id);
      saveCart(newCart);
  };

  const handlePlaceOrder = async (method: string) => {
    setLoading(true);
    try {
      const savedTableId = localStorage.getItem("current_table_id") || "t1";
      const userStr = localStorage.getItem("user");
      const profile = userStr ? JSON.parse(userStr) : {};

      const res = await api.post("/qrordering/submit-request", {
        tableId: savedTableId,
        customerName: profile.fullName || "Khách hàng",
        items: cart.map(i => ({ productId: i.id, quantity: i.quantity }))
      });

      // Xóa giỏ hàng sau khi đặt thành công
      localStorage.removeItem("customer_cart");
      window.dispatchEvent(new Event("storage"));

      if (method === 'vietqr') {
        const qrRes = await api.get(`/qrordering/generate-qr-request/${res.data.requestId}`);
        setQrData(qrRes.data);
        setShowCheckout(false);
        setShowQR(true);
      } else {
        navigate("/customer/orders");
      }
    } catch (err) { alert("Lỗi khi đặt món"); }
    finally { setLoading(false); }
  };

  if (cart.length === 0) {
    return (
        <div className="flex flex-col items-center justify-center py-32 space-y-6">
            <div className="w-24 h-24 bg-orange-50 rounded-full flex items-center justify-center text-5xl">🛒</div>
            <h2 className="text-2xl font-black text-gray-900">Giỏ hàng đang trống</h2>
            <Button onClick={() => navigate('/customer/menu')} className="bg-orange-600 rounded-2xl h-12 px-8 font-bold">KHÁM PHÁ THỰC ĐƠN NGAY</Button>
        </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate(-1)} className="rounded-full"><ArrowLeft /></Button>
          <h1 className="text-3xl font-black text-gray-900">Giỏ hàng của bạn</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* CỘT TRÁI: DANH SÁCH MÓN */}
        <div className="lg:col-span-2 space-y-4">
          {cart.map((item) => (
            <Card key={item.id} className="border-none shadow-sm hover:shadow-md transition-shadow rounded-[32px] overflow-hidden bg-white">
              <CardContent className="p-6 flex items-center gap-6">
                <div className="w-24 h-24 bg-orange-50 rounded-2xl flex items-center justify-center text-4xl shrink-0">🍽️</div>
                <div className="flex-1 min-w-0">
                   <h4 className="font-black text-xl text-gray-900 truncate">{item.name}</h4>
                   <p className="text-orange-600 font-bold text-lg">${item.price}</p>
                </div>
                <div className="flex items-center gap-4 bg-gray-50 p-2 rounded-2xl">
                   <Button variant="ghost" size="icon" onClick={() => updateQty(item.id, -1)} className="h-10 w-10 bg-white rounded-xl shadow-sm text-gray-400 hover:text-orange-600"><Minus className="w-4 h-4" /></Button>
                   <span className="font-black text-lg w-6 text-center">{item.quantity}</span>
                   <Button variant="ghost" size="icon" onClick={() => updateQty(item.id, 1)} className="h-10 w-10 bg-white rounded-xl shadow-sm text-gray-400 hover:text-orange-600"><Plus className="w-4 h-4" /></Button>
                </div>
                <Button variant="ghost" size="icon" onClick={() => removeItem(item.id)} className="text-red-300 hover:text-red-500 transition-colors"><Trash2 className="w-5 h-5" /></Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* CỘT PHẢI: THANH TOÁN */}
        <div className="space-y-6">
           <Card className="border-none shadow-xl rounded-[32px] bg-white p-2">
              <CardHeader><CardTitle className="font-black text-xl">Tóm tắt đơn hàng</CardTitle></CardHeader>
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
                    <span className="font-bold text-gray-900">TỔNG CỘNG</span>
                    <span className="text-3xl font-black text-orange-600">${total.toFixed(2)}</span>
                 </div>

                 <div className="pt-6 space-y-3">
                    <Button
                        className="w-full bg-gray-900 hover:bg-black text-white h-14 rounded-2xl font-black text-lg shadow-xl shadow-gray-200 gap-3"
                        onClick={() => setShowCheckout(true)}
                        disabled={loading}
                    >
                        {loading ? <Loader2 className="animate-spin" /> : <><CreditCard className="w-6 h-6" /> ĐẶT MÓN NGAY</>}
                    </Button>
                    <p className="text-[10px] text-gray-400 text-center font-bold uppercase tracking-widest">Đảm bảo an toàn & bảo mật 100%</p>
                 </div>
              </CardContent>
           </Card>

           <div className="bg-orange-50 p-6 rounded-[32px] border border-orange-100 flex items-center gap-4">
              <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm"><Tag className="text-orange-600 w-6 h-6" /></div>
              <div>
                 <p className="font-black text-orange-900 text-sm">Bạn có Voucher?</p>
                 <p className="text-xs text-orange-700 font-medium">Áp dụng mã giảm giá ở bước tiếp theo</p>
              </div>
           </div>
        </div>
      </div>

      {/* DIALOG CHỌN THANH TOÁN */}
      <Dialog open={showCheckout} onOpenChange={setShowCheckout}>
          <DialogContent className="rounded-[40px] p-10">
              <DialogHeader className="text-center mb-8">
                  <div className="w-20 h-20 bg-orange-100 rounded-3xl flex items-center justify-center mx-auto mb-4">
                      <ShoppingBag className="text-orange-600 w-10 h-10" />
                  </div>
                  <DialogTitle className="text-3xl font-black">Hình thức đặt món</DialogTitle>
                  <DialogDescription className="font-bold text-gray-400">Chọn cách bạn muốn đặt đơn hàng này</DialogDescription>
              </DialogHeader>

              <div className="grid gap-4">
                  <button
                    onClick={() => handlePlaceOrder('vietqr')}
                    className="flex items-center gap-6 p-6 rounded-3xl border-2 border-orange-50 hover:border-orange-600 hover:bg-orange-50/30 transition-all text-left group"
                  >
                      <div className="w-14 h-14 bg-white rounded-2xl shadow-sm flex items-center justify-center group-hover:scale-110 transition-transform"><QrCode className="text-orange-600 w-8 h-8" /></div>
                      <div>
                          <div className="font-black text-xl text-gray-900">Thanh toán VietQR</div>
                          <p className="text-xs text-gray-400 font-bold uppercase tracking-tighter mt-1">Chuyển khoản nhanh qua ngân hàng</p>
                      </div>
                  </button>

                  <button
                    onClick={() => handlePlaceOrder('counter')}
                    className="flex items-center gap-6 p-6 rounded-3xl border-2 border-gray-50 hover:border-gray-900 hover:bg-gray-50 transition-all text-left group"
                  >
                      <div className="w-14 h-14 bg-white rounded-2xl shadow-sm flex items-center justify-center group-hover:scale-110 transition-transform text-2xl">💰</div>
                      <div>
                          <div className="font-black text-xl text-gray-900">Trả tại quầy</div>
                          <p className="text-xs text-gray-400 font-bold uppercase tracking-tighter mt-1">Thanh toán tiền mặt sau khi ăn</p>
                      </div>
                  </button>
              </div>
          </DialogContent>
      </Dialog>
    </div>
  );
}
