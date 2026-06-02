import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../components/ui/dialog";
import { Plus, Minus, Trash2, Tag, QrCode, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

export function CustomerCart() {
  const navigate = useNavigate();
  const [cart, setCart] = useState<CartItem[]>([
    { id: "1", name: "Classic Burger", price: 12.99, quantity: 2 },
    { id: "2", name: "Coca Cola", price: 2.99, quantity: 2 },
  ]);
  const [loading, setLoading] = useState(false);
  const [qrData, setQrData] = useState<any>(null);
  const [showCheckout, setShowCheckout] = useState(false);
  const [showQR, setShowQR] = useState(false);

  // XÓA THUẾ: Chỉ tính tổng tiền món ăn
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handlePlaceOrder = async (method: string) => {
    setLoading(true);
    try {
      const res = await api.post("/qrordering/submit-request", {
        tableId: "t1",
        customerName: "Khách hàng",
        items: cart.map(i => ({ productId: i.id, quantity: i.quantity }))
      });

      const requestId = res.data.requestId;

      if (method === 'vietqr') {
        const qrRes = await api.get(`/qrordering/generate-qr-request/${requestId}`);
        setQrData(qrRes.data);
        setShowCheckout(false);
        setShowQR(true);
      } else {
        navigate("/customer/orders");
      }
    } catch (err) {
      alert("Lỗi khi đặt món");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pb-24">
      <div className="bg-white sticky top-0 z-10 border-b border-gray-200 p-4">
        <h2 className="text-xl font-bold text-gray-900">Giỏ hàng</h2>
      </div>

      <div className="p-4 space-y-4">
        {cart.map((item) => (
          <Card key={item.id} className="border-none shadow-sm">
            <CardContent className="p-4 flex justify-between items-center">
              <div>
                <h4 className="font-bold">{item.name}</h4>
                <p className="text-sm text-gray-500">${item.price} x {item.quantity}</p>
              </div>
              <div className="font-bold text-orange-600">${(item.price * item.quantity).toFixed(2)}</div>
            </CardContent>
          </Card>
        ))}

        <Card className="bg-orange-600 text-white border-none shadow-lg">
          <CardContent className="p-6">
            <div className="flex justify-between items-center mb-2">
              <span className="opacity-80">Tổng cộng</span>
              <span className="text-3xl font-black">${total.toFixed(2)}</span>
            </div>
            <p className="text-[10px] opacity-60 text-right italic">* Đã bao gồm phí phục vụ (nếu có)</p>
          </CardContent>
        </Card>

        <Button
          className="w-full bg-orange-600 hover:bg-orange-700 h-14 text-lg font-bold rounded-2xl"
          onClick={() => setShowCheckout(true)}
          disabled={loading}
        >
          {loading ? <Loader2 className="animate-spin" /> : "Xác nhận đặt món"}
        </Button>
      </div>

      <Dialog open={showCheckout} onOpenChange={setShowCheckout}>
        <DialogContent>
          <DialogHeader><DialogTitle className="font-bold">Thanh toán</DialogTitle></DialogHeader>
          <div className="grid gap-3 py-4">
             <Button variant="outline" className="h-16 justify-start border-orange-100" onClick={() => handlePlaceOrder('vietqr')}>
               <QrCode className="w-6 h-6 mr-3 text-orange-600" />
               <div className="text-left">
                  <div className="font-bold">Chuyển khoản VietQR</div>
                  <div className="text-xs text-gray-400">Tự động nhận diện giao dịch</div>
               </div>
             </Button>
             <Button variant="outline" className="h-16 justify-start border-orange-100" onClick={() => handlePlaceOrder('counter')}>
               <span className="text-2xl mr-3">💰</span>
               <div className="text-left">
                  <div className="font-bold">Thanh toán tại quầy</div>
                  <div className="text-xs text-gray-400">Trả tiền mặt sau khi ăn</div>
               </div>
             </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showQR} onOpenChange={setShowQR}>
        <DialogContent className="text-center">
          <DialogHeader><DialogTitle className="font-bold">Quét mã VietQR</DialogTitle></DialogHeader>
          {qrData && (
            <div className="py-4">
              <div className="bg-white p-4 border-2 border-orange-600 rounded-3xl inline-block mb-4">
                <img src={qrData.qrUrl} alt="VietQR" className="w-64 h-64" />
              </div>
              <p className="text-sm text-gray-600 mb-6">Vui lòng quét mã trên để thanh toán <br/> <b>${qrData.amount.toFixed(2)}</b></p>
              <Button className="w-full bg-orange-600" onClick={() => navigate("/customer/orders")}>Tôi đã chuyển khoản</Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
