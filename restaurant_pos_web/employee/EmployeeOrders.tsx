import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Clock, CheckCircle, XCircle, Loader2, Bell } from "lucide-react";
import api from "../services/api";
import * as signalR from "@microsoft/signalr";

export function EmployeeOrders() {
  const [requests, setRequests] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [reqRes, orderRes] = await Promise.all([
        api.get("/orders/pending-requests"),
        api.get("/orders")
      ]);
      setRequests(reqRes.data);
      setOrders(orderRes.data);
    } catch (err) {
      console.error("Lỗi tải đơn hàng");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    // Thiết lập kết nối SignalR
    const connection = new signalR.HubConnectionBuilder()
      .withUrl("https://restaurant-pos-api-uvcz.onrender.com/notificationHub")
      .withAutomaticReconnect()
      .build();

    connection.start()
      .then(() => {
        console.log("Đã kết nối SignalR thành công!");

        // Lắng nghe sự kiện có yêu cầu mới
        connection.on("ReceiveNewOrderRequest", (data: any) => {
           console.log("Có đơn mới:", data);
           // Phát âm thanh thông báo
           const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
           audio.play();
           // Tải lại danh sách ngay lập tức
           fetchData();
        });
      })
      .catch((err: any) => console.error("Lỗi kết nối SignalR:", err));

    return () => {
      connection.stop();
    };
  }, []);

  const handleApprove = async (id: string) => {
    try {
      await api.post(`/orders/approve-request/${id}`);
      fetchData();
    } catch (err) { alert("Lỗi khi duyệt món"); }
  };

  const handleReject = async (id: string) => {
    if (!confirm("Từ chối yêu cầu gọi món này?")) return;
    await api.delete(`/orders/reject-request/${id}`);
    fetchData();
  };

  if (loading && requests.length === 0 && orders.length === 0)
    return <div className="flex justify-center p-20"><Loader2 className="animate-spin w-10 h-10 text-orange-600" /></div>;

  return (
    <div className="p-8 bg-gray-50 min-h-screen text-gray-900">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black">Quản lý đơn hàng</h1>
          <p className="text-gray-500">Tiếp nhận và xử lý đơn hàng từ khách (Thời gian thực)</p>
        </div>
        <div className="flex items-center gap-2 bg-green-100 text-green-700 px-4 py-2 rounded-full text-sm font-bold animate-pulse">
           <div className="w-2 h-2 bg-green-600 rounded-full"></div>
           Trực tuyến
        </div>
      </div>

      <Tabs defaultValue="requests">
        <TabsList className="mb-8 bg-white p-1 rounded-xl shadow-sm border border-gray-100">
          <TabsTrigger value="requests" className="gap-2 px-6">
            Yêu cầu mới
            {requests.length > 0 && <Badge className="bg-red-500">{requests.length}</Badge>}
          </TabsTrigger>
          <TabsTrigger value="active" className="px-6">Đơn hàng đang xử lý</TabsTrigger>
        </TabsList>

        <TabsContent value="requests">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {requests.map(req => (
              <Card key={req.id} className="border-none shadow-md overflow-hidden ring-2 ring-orange-500/20 animate-in fade-in slide-in-from-top-4 duration-500">
                <div className="bg-orange-600 p-4 text-white flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Bell className="w-4 h-4" />
                    <span className="font-bold">Khách gọi món</span>
                  </div>
                  <span className="text-xs font-medium opacity-80">{new Date(req.createdAtUtc).toLocaleTimeString()}</span>
                </div>
                <CardContent className="p-6">
                  <div className="mb-4">
                    <div className="text-2xl font-black text-gray-900">Bàn {req.tableId.substring(0, 4)}</div>
                    <p className="text-sm text-gray-500">Khách: {req.customerName || "Vãng lai"}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={() => handleApprove(req.id)} className="flex-1 bg-green-600 hover:bg-green-700 font-bold shadow-lg shadow-green-200">
                      <CheckCircle className="w-4 h-4 mr-1" /> Duyệt món
                    </Button>
                    <Button onClick={() => handleReject(req.id)} variant="outline" className="text-red-500 border-red-100 hover:bg-red-50">
                      <XCircle className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
            {requests.length === 0 && (
                <div className="col-span-full text-center py-20 bg-white rounded-3xl border-2 border-dashed border-gray-100">
                    <div className="text-4xl mb-4">☕</div>
                    <p className="text-gray-400 font-medium">Đang chờ yêu cầu từ khách hàng...</p>
                </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="active">
           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
             {orders.map(order => (
               <Card key={order.id} className="border-none shadow-sm">
                 <CardHeader className="border-b border-gray-50 pb-3">
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-sm font-bold text-gray-400 uppercase tracking-widest">#{order.orderNumber.split('-')[1]}</CardTitle>
                      <Badge className="bg-orange-100 text-orange-600 border-none">{order.status}</Badge>
                    </div>
                 </CardHeader>
                 <CardContent className="p-5">
                    <div className="text-2xl font-black mb-4">Bàn {order.tableId.substring(0, 2)}</div>
                    <div className="flex justify-between items-center pt-4 border-t border-gray-50">
                       <div className="text-lg font-black text-orange-600">${order.totalAmount}</div>
                       <Button size="sm" variant="outline" className="font-bold border-orange-100 text-orange-600">Hoàn tất đơn</Button>
                    </div>
                 </CardContent>
               </Card>
             ))}
           </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
