import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Loader2, ShoppingBag, Calendar, ChevronDown, CheckCircle } from "lucide-react";
import api from "../services/api";

export function CustomerOrders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
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
    fetchOrders();
  }, []);

  if (loading) return <div className="flex justify-center p-20"><Loader2 className="animate-spin text-orange-600 w-10 h-10" /></div>;

  return (
    <div className="pb-24 bg-gray-50 min-h-screen">
      <div className="bg-white border-b border-gray-100 p-6 pt-12 sticky top-0 z-20">
         <h1 className="text-2xl font-black text-gray-900 flex items-center gap-3">
            <ShoppingBag className="text-orange-600" /> Đơn hàng của tôi
         </h1>
         <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">Lịch sử thưởng thức món ngon</p>
      </div>

      <div className="p-4 space-y-4">
        {orders.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-gray-100">
             <ShoppingBag className="mx-auto w-16 h-16 text-gray-100 mb-4" />
             <p className="text-gray-400 font-bold">Bạn chưa đặt đơn hàng nào</p>
             <Button variant="outline" className="mt-4 border-orange-200 text-orange-600 rounded-full">Đặt món ngay thôi!</Button>
          </div>
        ) : (
          orders.map((order) => (
            <Card key={order.id} className="border-none shadow-sm overflow-hidden bg-white group">
              <CardContent className="p-0">
                <div
                    className="p-4 flex justify-between items-center cursor-pointer"
                    onClick={() => setExpandedId(expandedId === order.id ? null : order.id)}
                >
                  <div className="flex items-center gap-4">
                     <div className="w-12 h-12 bg-orange-50 rounded-2xl flex items-center justify-center text-orange-600">
                        <Calendar className="w-6 h-6" />
                     </div>
                     <div>
                        <div className="font-black text-gray-900 text-sm">#{order.orderNumber.split('-')[1]}</div>
                        <div className="text-[10px] text-gray-400 font-bold uppercase">{new Date(order.createdAtUtc).toLocaleDateString("vi-VN")}</div>
                     </div>
                  </div>
                  <div className="text-right flex items-center gap-3">
                     <div>
                        <div className="font-black text-orange-600 text-lg">${order.totalAmount.toFixed(2)}</div>
                        <Badge className="bg-green-50 text-green-700 border-none text-[8px] uppercase font-black">{order.status}</Badge>
                     </div>
                     <ChevronDown className={`w-5 h-5 text-gray-300 transition-transform ${expandedId === order.id ? 'rotate-180' : ''}`} />
                  </div>
                </div>

                {/* Phần chi tiết (Chỉ hiện khi nhấn vào) */}
                {expandedId === order.id && (
                  <div className="px-4 pb-4 pt-2 border-t border-gray-50 bg-gray-50/30 animate-in slide-in-from-top-2 duration-200">
                    <h4 className="text-[10px] font-black text-gray-400 uppercase mb-3 tracking-widest">Danh sách món ăn</h4>
                    <div className="space-y-3">
                      {order.orderItems?.map((item: any) => (
                        <div key={item.id} className="flex justify-between items-center">
                           <div className="flex gap-2 items-center">
                              <span className="w-6 h-6 rounded-lg bg-white border border-gray-100 flex items-center justify-center text-xs font-black text-orange-600">{item.quantity}</span>
                              <span className="text-sm font-bold text-gray-700">{item.product?.name || "Món ăn"}</span>
                           </div>
                           <span className="text-sm font-black text-gray-400">${item.totalPrice.toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                    <div className="mt-6 flex gap-2">
                       <Button className="flex-1 bg-orange-600 font-bold text-xs uppercase h-10 rounded-xl">Mua lại đơn này</Button>
                       <Button variant="outline" className="h-10 w-10 border-gray-100 bg-white"><CheckCircle className="w-4 h-4 text-green-500" /></Button>
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
