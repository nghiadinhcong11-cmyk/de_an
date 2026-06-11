import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Bell, CheckCircle, XCircle, Clock, ChefHat, User, Loader2, ShoppingBag } from "lucide-react";
import api from "../services/api";
import * as signalR from "@microsoft/signalr";

export function EmployeeOrderRequests() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await api.get("/orders/pending-requests");
      setRequests(res.data);
    } catch (err) {
      console.error("Lỗi tải yêu cầu");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const branchId = user.branchId;

    const connection = new signalR.HubConnectionBuilder()
      .withUrl("https://restaurant-pos-api-uvcz.onrender.com/notificationHub")
      .withAutomaticReconnect()
      .build();

    connection.start().then(() => {
        if (branchId) {
            connection.invoke("JoinBranchGroup", branchId);
        }

        connection.on("ReceiveNewOrderRequest", () => fetchData());

        connection.on("NewBookingReceived", (data: any) => {
            alert(`📅 Có lịch đặt bàn mới từ ${data.customerName}!`);
            fetchData();
        });
    });

    return () => { connection.stop(); };
  }, []);

  const handleApprove = async (id: string) => {
    try {
      await api.post(`/orders/${id}/confirm`);
      fetchData();
    } catch { alert("Lỗi khi xác nhận"); }
  };

  const handleReject = async (id: string) => {
    if (!confirm("Từ chối yêu cầu này?")) return;
    try {
      await api.post(`/orders/reject-request/${id}`);
      fetchData();
    } catch { alert("Lỗi khi từ chối"); }
  };

  if (loading && requests.length === 0)
    return <div className="flex justify-center p-20"><Loader2 className="animate-spin text-orange-600 w-10 h-10" /></div>;

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen text-gray-900">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black uppercase tracking-tight">Yêu cầu gọi món</h1>
          <p className="text-xs text-gray-500 font-medium">Phê duyệt các đơn hàng khách vừa quét QR</p>
        </div>
        <div className="flex items-center gap-2 bg-green-100 px-4 py-2 rounded-full">
           <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
           <span className="text-[10px] font-black uppercase tracking-widest text-green-600">Trực tuyến</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {[
          { label: 'ĐANG CHỜ', val: requests.length, color: 'text-orange-600' },
          { label: 'TỔNG TIỀN CHỜ', val: `${requests.reduce((sum, r) => sum + r.totalAmount, 0).toLocaleString("vi-VN")}đ`, color: 'text-blue-600' },
          { label: 'THỜI GIAN THỰC', val: 'LIVE', color: 'text-green-600' },
        ].map((s, i) => (
          <Card key={i} className="border-none shadow-sm overflow-hidden bg-white rounded-2xl">
             <CardContent className="pt-6">
                <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{s.label}</div>
                <div className={`text-2xl font-black ${s.color}`}>{s.val}</div>
             </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {requests.map(req => (
          <Card key={req.id} className="border-none shadow-xl ring-1 ring-black/5 overflow-hidden rounded-[32px] bg-white animate-in fade-in slide-in-from-bottom-4">
             <div className="bg-gray-900 px-5 py-4 flex justify-between items-center text-white">
                <div className="flex items-center gap-2">
                   <Bell className="w-4 h-4 text-orange-500" />
                   <span className="text-xs font-black uppercase tracking-widest">Yêu cầu mới</span>
                </div>
                <div className="text-[10px] font-bold opacity-60">{new Date(req.createdAtUtc).toLocaleTimeString()}</div>
             </div>
             <CardContent className="pt-6 space-y-5">
                <div className="border-b border-gray-50 pb-4">
                   <div className="text-3xl font-black text-gray-900 tracking-tighter">Bàn {req.tableNumber}</div>
                   <div className="flex flex-col gap-1 mt-1">
                       <div className="flex items-center gap-1 text-[9px] text-gray-400 font-bold uppercase">
                           <ShoppingBag className="w-2.5 h-2.5" /> {req.branchName}
                       </div>
                       <div className="flex items-center gap-1 text-[10px] text-gray-400 font-bold uppercase">
                           <User className="w-3 h-3" /> {req.customerName || "Khách vãng lai"}
                       </div>
                   </div>
                </div>

                <div className="space-y-2 py-2">
                   {req.items.map((item: any, idx: number) => (
                     <div key={idx} className="flex justify-between items-start text-sm">
                        <span className="text-gray-400 font-black">x{item.quantity}</span>
                        <span className="flex-1 ml-3 font-bold text-gray-700 truncate">{item.productName}</span>
                     </div>
                   ))}
                </div>

                <div className="pt-4 border-t border-gray-100 flex justify-between items-center">
                    <span className="text-[10px] font-black text-gray-400 uppercase">Tổng cộng</span>
                    <span className="text-xl font-black text-orange-600">{req.totalAmount.toLocaleString("vi-VN")}đ</span>
                </div>

                <div className="flex gap-3 pt-2">
                   <Button onClick={() => handleApprove(req.id)} className="flex-1 bg-gray-900 hover:bg-black text-white font-black text-xs uppercase tracking-widest h-12 rounded-xl shadow-lg">
                      Xác nhận
                   </Button>
                   <Button onClick={() => handleReject(req.id)} variant="outline" className="w-12 border-red-100 text-red-500 hover:bg-red-50 h-12 rounded-xl">
                      <XCircle className="w-5 h-5" />
                   </Button>
                </div>
             </CardContent>
          </Card>
        ))}
      </div>

      {requests.length === 0 && !loading && (
         <div className="py-32 text-center space-y-4 bg-white rounded-[40px] border-2 border-dashed border-gray-100 shadow-inner">
            <div className="text-5xl opacity-20 grayscale animate-bounce">☕</div>
            <div className="text-gray-400 font-black uppercase tracking-widest text-xs">Hiện tại không có yêu cầu nào</div>
         </div>
      )}
    </div>
  );
}

