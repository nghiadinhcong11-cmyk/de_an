import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { CheckCircle2, Clock, ChefHat, UtensilsCrossed } from "lucide-react";

interface Order {
  id: string;
  date: string;
  status: "sent" | "preparing" | "ready" | "served";
  items: Array<{ name: string; quantity: number; price: number }>;
  total: number;
}

export function CustomerOrders() {
  const [orders] = useState<Order[]>([
    {
      id: "ORD-001",
      date: "2026-06-01T11:30:00",
      status: "preparing",
      items: [
        { name: "Classic Burger", quantity: 2, price: 12.99 },
        { name: "Coca Cola", quantity: 2, price: 2.99 },
      ],
      total: 31.96,
    },
    {
      id: "ORD-002",
      date: "2026-05-28T19:15:00",
      status: "served",
      items: [
        { name: "Grilled Salmon", quantity: 1, price: 19.99 },
        { name: "Fresh Orange Juice", quantity: 1, price: 4.99 },
      ],
      total: 24.98,
    },
  ]);

  const getStatusInfo = (status: Order["status"]) => {
    switch (status) {
      case "sent":
        return {
          icon: Clock,
          color: "bg-blue-100 text-blue-800",
          label: "Đã gửi đơn",
        };
      case "preparing":
        return {
          icon: ChefHat,
          color: "bg-yellow-100 text-yellow-800",
          label: "Đang chế biến",
        };
      case "ready":
        return {
          icon: CheckCircle2,
          color: "bg-green-100 text-green-800",
          label: "Đã xong",
        };
      case "served":
        return {
          icon: UtensilsCrossed,
          color: "bg-gray-100 text-gray-800",
          label: "Đã phục vụ",
        };
    }
  };

  const activeOrder = orders.find((o) => o.status !== "served");

  return (
    <div className="pb-24">
      {/* Header */}
      <div className="bg-white sticky top-0 z-10 border-b border-gray-200 p-4">
        <h2 className="text-xl font-bold">Lịch sử đặt món</h2>
        <p className="text-sm text-gray-600 mt-1">Theo dõi tiến độ đơn hàng</p>
      </div>

      <div className="p-4 space-y-4">
        {/* Active Order Tracking */}
        {activeOrder && (
          <Card className="border-orange-600 shadow-lg">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-bold">Đơn hàng đang chờ</CardTitle>
                <Badge className={getStatusInfo(activeOrder.status).color}>
                  {getStatusInfo(activeOrder.status).label}
                </Badge>
              </div>
              <p className="text-xs text-gray-400">Mã đơn: {activeOrder.id}</p>
            </CardHeader>
            <CardContent>
              {/* Timeline */}
              <div className="space-y-6 mb-8 mt-4">
                {[
                  { id: 'sent', label: 'Đã gửi đơn', icon: Clock, desc: 'Đơn hàng đã được bếp tiếp nhận' },
                  { id: 'preparing', label: 'Đang nấu', icon: ChefHat, desc: 'Đầu bếp đang chuẩn bị món ăn' },
                  { id: 'ready', label: 'Hoàn thành', icon: CheckCircle2, desc: 'Món ăn đã sẵn sàng phục vụ' },
                  { id: 'served', label: 'Đã phục vụ', icon: UtensilsCrossed, desc: 'Chúc bạn ngon miệng!' }
                ].map((step, idx) => {
                  const isActive = activeOrder.status === step.id ||
                    (activeOrder.status === 'preparing' && idx < 1) ||
                    (activeOrder.status === 'ready' && idx < 2) ||
                    (activeOrder.status === 'served' && idx < 3);
                  const isDone = (activeOrder.status === 'preparing' && idx < 1) ||
                    (activeOrder.status === 'ready' && idx < 2) ||
                    (activeOrder.status === 'served' && idx < 3);
                  const isCurrent = activeOrder.status === step.id;

                  return (
                    <div key={step.id} className="flex items-start gap-4 relative">
                      {idx < 3 && (
                        <div className={`absolute left-[19px] top-10 w-0.5 h-10 ${isDone ? 'bg-orange-600' : 'bg-gray-200'}`} />
                      )}
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 z-10 ${
                        isActive ? 'bg-orange-600 text-white shadow-md' : 'bg-gray-100 text-gray-400'
                      }`}>
                        <step.icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <div className={`font-bold text-sm ${isActive ? 'text-gray-900' : 'text-gray-400'}`}>{step.label}</div>
                        <div className="text-xs text-gray-500">{step.desc}</div>
                      </div>
                      {isDone && <CheckCircle2 className="w-5 h-5 text-orange-600 mt-1" />}
                      {isCurrent && <div className="w-2 h-2 rounded-full bg-orange-600 animate-ping mt-2.5" />}
                    </div>
                  );
                })}
              </div>

              {/* Order Items */}
              <div className="border-t pt-4 bg-gray-50 -mx-6 px-6 pb-4">
                <h4 className="font-bold text-sm mb-3">Chi tiết món ăn</h4>
                <div className="space-y-2 mb-4">
                  {activeOrder.items.map((item, index) => (
                    <div key={index} className="flex justify-between text-sm">
                      <span className="text-gray-700">
                        {item.quantity}x <span className="font-medium text-gray-900">{item.name}</span>
                      </span>
                      <span className="text-gray-600">
                        ${(item.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between font-bold pt-3 border-t border-gray-200">
                  <span>Tổng thanh toán</span>
                  <span className="text-orange-600">${activeOrder.total.toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Order History */}
        <div className="pt-2">
          <h3 className="font-bold text-gray-900 mb-3">Đơn hàng cũ</h3>
          <div className="space-y-3">
            {orders
              .filter((o) => o.status === "served")
              .map((order) => {
                const statusInfo = getStatusInfo(order.status);
                return (
                  <Card key={order.id} className="border-none shadow-sm">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <div className="font-bold text-sm">{order.id}</div>
                          <div className="text-xs text-gray-400">
                            {new Date(order.date).toLocaleDateString("vi-VN")}
                          </div>
                        </div>
                        <Badge className="bg-gray-100 text-gray-600 border-none">{statusInfo.label}</Badge>
                      </div>

                      <div className="space-y-2 mb-3">
                        {order.items.map((item, index) => (
                          <div key={index} className="flex justify-between text-xs">
                            <span className="text-gray-500">
                              {item.quantity}x {item.name}
                            </span>
                            <span className="text-gray-400">
                              ${(item.price * item.quantity).toFixed(2)}
                            </span>
                          </div>
                        ))}
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                        <span className="font-bold text-sm text-gray-900">Tổng</span>
                        <span className="font-bold text-orange-600">
                          ${order.total.toFixed(2)}
                        </span>
                      </div>

                      <Button variant="outline" className="w-full mt-3 border-orange-100 text-orange-600 h-9 text-xs font-bold">
                        Đặt lại đơn này
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
          </div>
        </div>
      </div>
    </div>
  );
}
