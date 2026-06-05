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

  const handleConfirm = async (id: string) => {
    try {
      await api.post(`/orders/${id}/confirm`);
      fetchData();
    } catch (err) { alert("Lỗi khi xác nhận đơn"); }
  };

  const handleReject = async (id: string) => {
    if (!confirm("Từ chối yêu cầu gọi món này?")) return;
    try {
        await api.post(`/orders/reject-request/${id}`);
        fetchData();
    } catch { alert("Lỗi khi từ chối"); }
  };

  if (loading && requests.length === 0 && orders.length === 0)
    return <div className="flex justify-center p-20"><Loader2 className="animate-spin w-10 h-10 text-orange-600" /></div>;

  return (
    <div className="p-8 bg-gray-50 min-h-screen text-gray-900">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black uppercase tracking-tight">Quản lý phục vụ</h1>
          <p className="text-gray-500 font-medium">Theo dõi và xác nhận món ăn tại bàn (Real-time)</p>
        </div>
        <div className="flex items-center gap-2 bg-green-50 text-green-600 px-6 py-2.5 rounded-2xl text-xs font-black uppercase tracking-widest border border-green-100 shadow-sm">
           <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
           Hệ thống trực tuyến
        </div>
      </div>

      <Tabs defaultValue="requests">
        <TabsList className="mb-8 bg-white p-1.5 rounded-2xl shadow-sm border border-gray-100 w-fit">
          <TabsTrigger value="requests" className="gap-2 px-8 font-bold rounded-xl data-[state=active]:bg-gray-900 data-[state=active]:text-white">
            Yêu cầu chờ duyệt
            {requests.length > 0 && <Badge className="bg-orange-600 text-white border-none h-5 min-w-5 flex items-center justify-center p-0 text-[10px]">{requests.length}</Badge>}
          </TabsTrigger>
          <TabsTrigger value="active" className="px-8 font-bold rounded-xl data-[state=active]:bg-gray-900 data-[state=active]:text-white">Đang phục vụ</TabsTrigger>
        </TabsList>

        <TabsContent value="requests">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {requests.map(req => (
              <Card key={req.id} className="border-none shadow-xl overflow-hidden rounded-[32px] bg-white ring-1 ring-black/5 animate-in fade-in slide-in-from-top-4 duration-500">
                <div className="bg-gray-900 p-5 text-white flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-orange-500" />
                    <span className="font-black text-xs uppercase tracking-widest">{new Date(req.createdAtUtc).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                  </div>
                  <Badge className="bg-orange-600/20 text-orange-500 border-none font-black text-[9px] uppercase tracking-tighter">Mới</Badge>
                </div>
                <CardContent className="p-6">
                  <div className="mb-6">
                    <div className="text-3xl font-black text-gray-900 tracking-tighter">Bàn {req.tableNumber}</div>
                    <div className="flex items-center gap-2 mt-1">
                        <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                        <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Khách vãng lai</p>
                    </div>
                  </div>

                  <div className="space-y-3 mb-8 bg-gray-50/50 p-4 rounded-2xl border border-gray-100">
                    {req.items?.map((item: any, idx: number) => (
                        <div key={idx} className="flex justify-between items-center text-sm font-bold text-gray-700">
                            <span className="text-gray-400 font-black">x{item.quantity}</span>
                            <span className="flex-1 ml-3 truncate">{item.productName}</span>
                        </div>
                    ))}
                    <div className="pt-3 mt-3 border-t border-gray-200 flex justify-between items-center">
                        <span className="text-[10px] font-black text-gray-400 uppercase">Tổng cộng</span>
                        <span className="text-lg font-black text-orange-600">${req.totalAmount}</span>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button onClick={() => handleConfirm(req.id)} className="flex-1 bg-gray-900 hover:bg-black text-white font-black text-xs uppercase tracking-widest h-12 rounded-xl shadow-lg">
                      Xác nhận
                    </Button>
                    <Button onClick={() => handleReject(req.id)} variant="outline" className="px-4 border-red-100 text-red-500 hover:bg-red-50 h-12 rounded-xl">
                      <XCircle className="w-5 h-5" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
            {requests.length === 0 && (
                <div className="col-span-full text-center py-32 bg-white rounded-[40px] border-2 border-dashed border-gray-100 shadow-inner">
                    <div className="text-5xl mb-6 grayscale opacity-50 animate-bounce">☕</div>
                    <p className="text-gray-400 font-black uppercase tracking-widest text-xs">Đang chờ khách gọi món...</p>
                </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="active">
           <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
             {orders.filter(o => o.status !== 'PendingConfirmation' && o.status !== 'Completed').map(order => (
               <Card key={order.id} className="border-none shadow-sm rounded-3xl bg-white overflow-hidden group hover:shadow-md transition-all">
                 <div className="h-1 bg-blue-500 w-full"></div>
                 <CardHeader className="border-b border-gray-50 p-5">
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-[10px] font-black text-gray-300 uppercase tracking-widest">#{order.orderNumber.split('-').pop()}</CardTitle>
                      <Badge className="bg-blue-50 text-blue-600 border-none font-black text-[9px] uppercase">{order.status}</Badge>
                    </div>
                 </CardHeader>
                 <CardContent className="p-6">
                    <div className="text-2xl font-black text-gray-900 mb-6">Bàn {order.tableNumber}</div>
                    <div className="flex justify-between items-center">
                       <div className="text-xl font-black text-gray-900">${order.totalAmount}</div>
                       <Button size="sm" variant="outline" className="font-black text-[10px] border-orange-100 text-orange-600 rounded-lg uppercase h-9 px-4">Xem chi tiết</Button>
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
