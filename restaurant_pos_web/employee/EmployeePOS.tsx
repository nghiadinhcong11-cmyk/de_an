import { useState } from "react";
import { Card, CardContent, CardHeader } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../components/ui/dialog";
import { Label } from "../components/ui/label";
import { CheckCircle2, UserPlus, Loader2, ArrowRight, Star } from "lucide-react";
import api from "../services/api";
import { mockMenuItems, mockTables } from "../data/mockData";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";

export function EmployeePOS() {
  const [selectedTable, setSelectedTable] = useState("");
  const [cart, setCart] = useState<any[]>([]);
  const [showCheckout, setShowCheckout] = useState(false);
  const [showLoyaltyModal, setShowLoyaltyModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [currentOrderId, setCurrentOrderId] = useState<string | null>(null);

  const [loyaltyForm, setLoyaltyForm] = useState({ phoneNumber: '', fullName: '' });

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleCheckout = () => {
    // Giả lập thanh toán -> Tạo order
    setCurrentOrderId("ORD-DEMO-ID"); // Trong thực tế lấy ID từ API create order
    setShowLoyaltyModal(true);
  };

  const handleAddPoints = async () => {
    setLoading(true);
    try {
      await api.post("/customers/loyalty/add-points", {
          ...loyaltyForm,
          orderId: currentOrderId
      });
      alert(`Đã cộng điểm thành công cho khách ${loyaltyForm.fullName}!`);
      resetPOS();
    } catch {
      alert("Lỗi khi tích điểm");
    } finally {
      setLoading(false);
    }
  };

  const resetPOS = () => {
    setCart([]);
    setSelectedTable("");
    setShowLoyaltyModal(false);
    setLoyaltyForm({ phoneNumber: '', fullName: '' });
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50 text-gray-900">
      <div className="bg-white border-b border-gray-200 p-4 flex items-center justify-between sticky top-0 z-10">
          <h2 className="text-xl font-black italic">GREEN POS</h2>
          <Button onClick={handleCheckout} disabled={cart.length === 0} className="bg-green-600 font-bold">THANH TOÁN ({total.toLocaleString("vi-VN")}đ)</Button>
      </div>

      <div className="flex-1 p-4 md:p-8 overflow-y-auto">
          <p className="text-gray-400 font-bold text-xs uppercase tracking-widest mb-4">Thực đơn nhà hàng</p>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {mockMenuItems.map(item => (
                  <Card key={item.id} className="cursor-pointer hover:border-orange-500 transition-colors shadow-sm rounded-2xl overflow-hidden" onClick={() => setCart([...cart, {...item, quantity: 1}])}>
                      <div className="h-32 bg-gray-100 flex items-center justify-center text-4xl">🍽️</div>
                      <CardContent className="p-4">
                        <div className="font-bold text-sm truncate">{item.name}</div>
                        <div className="text-orange-600 font-black mt-1">{item.price.toLocaleString("vi-VN")}đ</div>
                      </CardContent>
                  </Card>
              ))}
          </div>
      </div>

      {/* LOYALTY MODAL (SAU THANH TOÁN) */}
      <Dialog open={showLoyaltyModal} onOpenChange={setShowLoyaltyModal}>
        <DialogContent className="max-w-md border-none shadow-2xl">
          <div className="text-center mb-6">
             <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Star className="text-orange-600 w-8 h-8 fill-current" />
             </div>
             <DialogTitle className="text-2xl font-black">Tích điểm thành viên?</DialogTitle>
             <DialogDescription>Hỏi khách hàng SĐT để cộng điểm thưởng</DialogDescription>
          </div>

          <div className="space-y-4">
             <div className="space-y-1.5">
                <Label className="font-bold text-xs uppercase text-gray-400 ml-1">Số điện thoại</Label>
                <Input
                    placeholder="090..."
                    className="h-12 text-lg font-bold rounded-xl bg-gray-50 border-none"
                    value={loyaltyForm.phoneNumber}
                    onChange={(e: any) => setLoyaltyForm({...loyaltyForm, phoneNumber: e.target.value})}
                />
             </div>
             <div className="space-y-1.5">
                <Label className="font-bold text-xs uppercase text-gray-400 ml-1">Họ tên khách hàng</Label>
                <Input
                    placeholder="Nguyễn Văn A"
                    className="h-12 font-bold rounded-xl bg-gray-50 border-none"
                    value={loyaltyForm.fullName}
                    onChange={(e: any) => setLoyaltyForm({...loyaltyForm, fullName: e.target.value})}
                />
             </div>

             <div className="pt-4 flex gap-3">
                <Button variant="ghost" className="flex-1 font-bold text-gray-400" onClick={resetPOS}>BỎ QUA</Button>
                <Button
                    className="flex-1 bg-orange-600 hover:bg-orange-700 font-bold h-12 rounded-xl shadow-lg shadow-orange-100 gap-2"
                    onClick={handleAddPoints}
                    disabled={loading || !loyaltyForm.phoneNumber}
                >
                    {loading ? <Loader2 className="animate-spin" /> : <><CheckCircle2 className="w-4 h-4" /> LƯU & TÍCH ĐIỂM</>}
                </Button>
             </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
