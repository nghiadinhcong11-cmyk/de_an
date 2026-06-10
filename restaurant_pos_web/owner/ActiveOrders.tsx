import { useState, useEffect } from "react";
import { Card, CardContent } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "../components/ui/dialog";
import { Loader2, User, Eye, ShoppingBasket, Clock, MapPin } from "lucide-react";
import api from "../services/api";

export function OwnerActiveOrders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Chi tiết đơn hàng
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await api.get("/orders");
      // Chỉ lấy các đơn hàng chưa hoàn tất
      setOrders(res.data.filter((o: any) => o.status !== 'Completed'));
    } catch (err) {
      console.error("Lỗi tải đơn hàng đang phục vụ");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleShowDetail = (order: any) => {
    setSelectedOrder(order);
    setIsDetailOpen(true);
  };

  return (
    <div className="p-4 md:p-8 bg-gray-50 min-h-screen text-gray-900">
      <div className="mb-8">
        <h1 className="text-2xl font-black">Khách đang tại quán</h1>
        <p className="text-gray-500 mt-1">Danh sách các bàn đang có khách ngồi và đơn hàng chưa thanh toán</p>
      </div>

      {loading ? (
        <div className="flex justify-center p-20"><Loader2 className="animate-spin text-orange-600 w-10 h-10" /></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {orders.map(order => (
            <Card key={order.id} className="border-none shadow-sm hover:shadow-md transition-all rounded-[32px] overflow-hidden bg-white group">
               <div className="bg-gray-900 p-5 text-white flex justify-between items-center">
                  <div className="flex items-center gap-2">
                     <Clock className="w-4 h-4 text-orange-500" />
                     <span className="font-black text-xs uppercase tracking-widest">
                        {new Date(order.createdAtUtc).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                     </span>
                  </div>
                  <div className={`px-2 py-0.5 rounded-full font-black text-[8px] uppercase ${
                      order.status === 'Preparing' ? 'bg-blue-500/20 text-blue-400' : 'bg-orange-500/20 text-orange-400'
                  }`}>
                      {order.status === 'Preparing' ? 'Đang chế biến' : 'Đã xác nhận'}
                  </div>
               </div>
               <CardContent className="p-6">
                  <div className="mb-6">
                    <div className="flex justify-between items-start">
                        <div className="text-4xl font-black text-gray-900 tracking-tighter">Bàn {order.tableNumber}</div>
                        <div className="text-right">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">Tạm tính</p>
                            <p className="text-xl font-black text-orange-600">{order.totalAmount.toLocaleString("vi-VN")}đ</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-1.5 mt-2 text-gray-400">
                        <MapPin className="w-3 h-3" />
                        <p className="text-[10px] font-bold uppercase tracking-tight">{order.branchName}</p>
                    </div>
                  </div>

                  <div className="space-y-2 mb-8 bg-gray-50 p-4 rounded-2xl border border-gray-100 min-h-[100px]">
                    <p className="text-[8px] font-black text-gray-300 uppercase tracking-widest mb-2">Tóm tắt món ăn</p>
                    {order.items?.slice(0, 3).map((item: any, idx: number) => (
                        <div key={idx} className="flex justify-between items-center text-xs font-bold text-gray-600">
                            <span className="truncate flex-1">{item.name}</span>
                            <span className="ml-2 text-gray-400">x{item.quantity}</span>
                        </div>
                    ))}
                    {order.items?.length > 3 && (
                        <p className="text-[10px] text-gray-400 italic mt-1">+ {order.items.length - 3} món khác...</p>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Button
                        onClick={() => handleShowDetail(order)}
                        className="flex-1 bg-gray-900 hover:bg-black text-white font-black text-xs uppercase tracking-widest h-12 rounded-xl"
                    >
                      <Eye className="w-4 h-4 mr-2" /> Chi tiết
                    </Button>
                  </div>
               </CardContent>
            </Card>
          ))}

          {orders.length === 0 && (
            <div className="col-span-full py-32 text-center bg-white rounded-[48px] border-2 border-dashed border-gray-100 shadow-inner">
                <ShoppingBasket className="mx-auto w-16 h-16 text-gray-100 mb-4" />
                <p className="text-gray-400 font-black uppercase tracking-widest text-xs">Hiện tại không có bàn nào đang ăn</p>
            </div>
          )}
        </div>
      )}

      {/* DIALOG CHI TIẾT ĐƠN HÀNG */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-2xl">
           <DialogHeader>
              <DialogTitle className="text-2xl font-black flex items-center gap-3">
                 <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center text-orange-600">
                    <ShoppingBasket className="w-6 h-6" />
                 </div>
                 Bàn {selectedOrder?.tableNumber}
              </DialogTitle>
              <DialogDescription className="font-bold text-gray-400 uppercase text-[10px] tracking-widest">
                 {selectedOrder?.branchName} • {selectedOrder?.orderNumber}
              </DialogDescription>
           </DialogHeader>

           <div className="py-4">
              <div className="bg-gray-50 rounded-2xl p-6 mb-6 flex justify-between items-center">
                 <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Khách hàng</p>
                    <p className="font-black text-gray-900">{selectedOrder?.customerName}</p>
                    <p className="text-xs text-gray-500 font-medium">{selectedOrder?.customerPhone || "Khách vãng lai"}</p>
                 </div>
                 <div className="text-right">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Trạng thái</p>
                    <div className="bg-orange-50 text-orange-600 px-3 py-1 rounded-full font-bold uppercase text-[10px] inline-block">
                        {selectedOrder?.status === 'Preparing' ? 'Đang chuẩn bị' : 'Đang phục vụ'}
                    </div>
                 </div>
              </div>

              <div className="space-y-4">
                 <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Món ăn đang gọi</p>
                 <div className="border border-gray-100 rounded-2xl overflow-hidden max-h-[300px] overflow-y-auto">
                    <Table>
                       <TableHeader className="bg-gray-50/50 sticky top-0 z-10">
                          <TableRow>
                             <TableHead className="font-bold">Tên món</TableHead>
                             <TableHead className="text-center font-bold">SL</TableHead>
                             <TableHead className="text-right font-bold">Thành tiền</TableHead>
                          </TableRow>
                       </TableHeader>
                       <TableBody>
                          {selectedOrder?.items?.map((item: any, idx: number) => (
                             <TableRow key={idx}>
                                <TableCell className="font-bold text-gray-900">{item.name}</TableCell>
                                <TableCell className="text-center font-black text-gray-500">x{item.quantity}</TableCell>
                                <TableCell className="text-right font-black text-gray-900">{item.totalPrice.toLocaleString("vi-VN")}đ</TableCell>
                             </TableRow>
                          ))}
                       </TableBody>
                    </Table>
                 </div>
              </div>

              <div className="mt-8 pt-4 border-t border-gray-100 flex justify-between items-center">
                 <span className="font-black text-gray-900 uppercase text-xs tracking-widest">TỔNG TIỀN HIỆN TẠI</span>
                 <span className="text-3xl font-black text-orange-600">{selectedOrder?.totalAmount?.toLocaleString("vi-VN")}đ</span>
              </div>
           </div>

           <div className="mt-6">
              <Button onClick={() => setIsDetailOpen(false)} className="w-full h-12 rounded-xl font-bold bg-gray-100 text-gray-600 hover:bg-gray-200 uppercase text-xs tracking-widest">ĐÓNG</Button>
           </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
