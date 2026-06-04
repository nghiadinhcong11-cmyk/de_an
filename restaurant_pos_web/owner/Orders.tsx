import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "../components/ui/dialog";
import { Search, Loader2, Calendar, User, CreditCard, Eye, ShoppingBasket } from "lucide-react";
import api from "../services/api";

export function OwnerOrders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Chi tiết đơn hàng
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await api.get("/orders");
      setOrders(res.data);
    } catch (err) {
      console.error("Lỗi tải lịch sử đơn hàng");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleShowDetail = (order: any) => {
    setSelectedOrder(order);
    setIsDetailOpen(true);
  };

  const filteredOrders = orders.filter(o =>
    o.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    o.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    o.tableNumber?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-8 bg-gray-50 min-h-screen text-gray-900">
      <div className="mb-8">
        <h1 className="text-2xl font-black">Lịch sử đơn hàng</h1>
        <p className="text-gray-500">Quản lý và tra cứu tất cả giao dịch của hệ thống</p>
      </div>

      <Card className="border-none shadow-sm overflow-hidden bg-white">
        <CardHeader className="bg-white border-b border-gray-50 flex flex-row items-center justify-between">
           <div className="relative max-w-sm w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Tìm theo mã đơn, tên khách, số bàn..."
                className="pl-10 h-10 border-none bg-gray-50"
                value={searchTerm}
                onChange={(e: any) => setSearchTerm(e.target.value)}
              />
           </div>
        </CardHeader>
        <CardContent className="p-0">
           {loading ? <div className="p-20 flex justify-center"><Loader2 className="animate-spin text-orange-600" /></div> : (
             <Table>
                <TableHeader className="bg-gray-50/50"><TableRow>
                   <TableHead className="font-bold">Mã đơn</TableHead>
                   <TableHead className="font-bold">Thời gian</TableHead>
                   <TableHead className="font-bold">Bàn</TableHead>
                   <TableHead className="font-bold">Khách hàng</TableHead>
                   <TableHead className="font-bold">Tổng tiền</TableHead>
                   <TableHead className="font-bold">Trạng thái</TableHead>
                   <TableHead className="font-bold text-right">Chi tiết</TableHead>
                </TableRow></TableHeader>
                <TableBody>
                   {filteredOrders.map(order => (
                     <TableRow key={order.id} className="hover:bg-gray-50/50 transition-colors">
                        <TableCell className="font-black text-xs">#{order.orderNumber}</TableCell>
                        <TableCell className="text-gray-500 text-xs">
                           <div className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {new Date(order.createdAtUtc).toLocaleString("vi-VN")}</div>
                        </TableCell>
                        <TableCell className="font-bold text-orange-600">{order.tableNumber}</TableCell>
                        <TableCell>
                           <div className="flex items-center gap-2">
                              <div className="w-7 h-7 rounded-full bg-orange-50 flex items-center justify-center text-orange-600"><User className="w-3.5 h-3.5" /></div>
                              <div>
                                 <div className="font-bold text-sm">{order.customerName}</div>
                                 <div className="text-[10px] text-gray-400 font-bold">{order.customerPhone || "Khách lẻ"}</div>
                              </div>
                           </div>
                        </TableCell>
                        <TableCell className="font-black text-gray-900">${order.totalAmount.toLocaleString()}</TableCell>
                        <TableCell>
                           <Badge variant="outline" className={`font-bold border-none uppercase text-[10px] ${
                              order.status === 'Completed' ? 'bg-green-50 text-green-700' : 'bg-orange-50 text-orange-600'
                           }`}>
                              {order.status === 'Completed' ? 'Hoàn tất' : 'Đang xử lý'}
                           </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                           <Button
                             onClick={() => handleShowDetail(order)}
                             variant="ghost"
                             size="icon"
                             className="h-8 w-8 text-gray-400 hover:text-orange-600"
                           >
                             <Eye className="w-4 h-4" />
                           </Button>
                        </TableCell>
                     </TableRow>
                   ))}
                </TableBody>
             </Table>
           )}
           {filteredOrders.length === 0 && !loading && (
              <div className="text-center py-20 text-gray-400 font-bold uppercase tracking-widest text-xs">Không tìm thấy đơn hàng nào</div>
           )}
        </CardContent>
      </Card>

      {/* DIALOG CHI TIẾT ĐƠN HÀNG */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-2xl">
           <DialogHeader>
              <DialogTitle className="text-2xl font-black flex items-center gap-3">
                 <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center text-orange-600">
                    <ShoppingBasket className="w-6 h-6" />
                 </div>
                 Chi tiết đơn hàng #{selectedOrder?.orderNumber.split('-').pop()}
              </DialogTitle>
              <DialogDescription className="font-bold text-gray-400">
                 Bàn {selectedOrder?.tableNumber} • {selectedOrder && new Date(selectedOrder.createdAtUtc).toLocaleString("vi-VN")}
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
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Phương thức</p>
                    <Badge className="bg-blue-50 text-blue-700 border-none font-bold uppercase text-[10px]">
                       {selectedOrder?.paymentStatus === 'Paid' ? 'Đã thanh toán' : 'Chờ thu tiền'}
                    </Badge>
                 </div>
              </div>

              <div className="space-y-4">
                 <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Danh sách món ăn</p>
                 <div className="border border-gray-100 rounded-2xl overflow-hidden">
                    <Table>
                       <TableHeader className="bg-gray-50/50">
                          <TableRow>
                             <TableHead className="font-bold">Tên món</TableHead>
                             <TableHead className="text-center font-bold">SL</TableHead>
                             <TableHead className="text-right font-bold">Đơn giá</TableHead>
                             <TableHead className="text-right font-bold">Thành tiền</TableHead>
                          </TableRow>
                       </TableHeader>
                       <TableBody>
                          {selectedOrder?.items?.map((item: any, idx: number) => (
                             <TableRow key={idx}>
                                <TableCell className="font-bold text-gray-900">{item.name}</TableCell>
                                <TableCell className="text-center font-black text-gray-500">x{item.quantity}</TableCell>
                                <TableCell className="text-right font-medium text-gray-500">${item.unitPrice.toLocaleString()}</TableCell>
                                <TableCell className="text-right font-black text-gray-900">${item.totalPrice.toLocaleString()}</TableCell>
                             </TableRow>
                          ))}
                       </TableBody>
                    </Table>
                 </div>
              </div>

              <div className="mt-8 space-y-3 px-2">
                 <div className="flex justify-between text-sm text-gray-500 font-medium">
                    <span>Tạm tính</span>
                    <span>${selectedOrder?.subtotal?.toLocaleString()}</span>
                 </div>
                 <div className="flex justify-between text-sm text-red-500 font-bold">
                    <span>Giảm giá (Voucher)</span>
                    <span>-${selectedOrder?.discountAmount?.toLocaleString()}</span>
                 </div>
                 <div className="pt-4 border-t border-gray-100 flex justify-between items-center">
                    <span className="font-black text-gray-900">TỔNG CỘNG</span>
                    <span className="text-3xl font-black text-orange-600">${selectedOrder?.totalAmount?.toLocaleString()}</span>
                 </div>
              </div>
           </div>

           <div className="mt-6 flex gap-3">
              <Button variant="outline" onClick={() => setIsDetailOpen(false)} className="flex-1 h-12 rounded-xl font-bold border-gray-100 text-gray-400 hover:bg-gray-50">ĐÓNG</Button>
              <Button className="flex-1 h-12 bg-gray-900 hover:bg-black text-white rounded-xl font-black gap-2 uppercase text-xs tracking-widest">
                 <CreditCard className="w-4 h-4" /> In hóa đơn
              </Button>
           </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

