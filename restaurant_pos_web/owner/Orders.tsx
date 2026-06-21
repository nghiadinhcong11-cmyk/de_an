import { useState, useEffect } from "react";
import { Card, CardContent } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "../components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Search, Loader2, Calendar, User, CreditCard, Eye, ShoppingBasket, Clock, MapPin, XCircle, CheckCircle2 } from "lucide-react";
import api from "../services/api";

export function OwnerOrders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("active");

  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await api.get("/orders");
      setOrders(res.data);
    } catch (err) {
      console.error("Lỗi tải đơn hàng");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const normalizeTableNumber = (tableNumber?: string | number) => {
    const value = String(tableNumber ?? "").trim();
    return value.replace(/^Bàn\s*/i, "").trim();
  };

  const formatTableLabel = (tableNumber?: string | number) => {
    const normalized = normalizeTableNumber(tableNumber);
    return normalized ? `Bàn ${normalized}` : "Bàn";
  };

  const filteredOrders = orders.filter(o => {
    const matchesSearch = o.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.tableNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.branchName?.toLowerCase().includes(searchTerm.toLowerCase());

    if (activeTab === "active") return matchesSearch && !['Completed', 'Cancelled'].includes(o.status);
    if (activeTab === "paid") return matchesSearch && o.status === 'Completed';
    if (activeTab === "cancelled") return matchesSearch && o.status === 'Cancelled';
    return matchesSearch;
  });

  const getStatusStyle = (status: string) => {
    switch (status) {
        case 'Completed': return 'bg-green-500 text-white';
        case 'Cancelled': return 'bg-red-500 text-white';
        case 'Preparing': return 'bg-orange-500 text-white animate-pulse';
        case 'Confirmed': return 'bg-orange-500 text-white';
        default: return 'bg-gray-400 text-white';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
        case 'Completed': return 'Hoàn tất';
        case 'Cancelled': return 'Đã hủy';
        case 'Preparing': return 'Đang phục vụ';
        case 'Confirmed': return 'Đang dùng';
        case 'PendingConfirmation': return 'Chờ duyệt';
        default: return status;
    }
  };

  return (
    <div className="p-4 md:p-8 bg-gray-50 min-h-screen text-gray-900 pb-20">
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black">Quản lý Đơn hàng</h1>
          <p className="text-gray-500">Giám sát hoạt động tại bàn và lịch sử thanh toán toàn hệ thống</p>
        </div>
      </div>

      <Tabs defaultValue="active" className="w-full" onValueChange={setActiveTab}>
        <div className="flex flex-col xl:flex-row items-center justify-between gap-4 mb-6">
            <TabsList className="bg-white border border-gray-100 p-1 rounded-2xl shadow-sm w-full md:w-fit overflow-x-auto h-auto">
                <TabsTrigger value="active" className="px-6 py-2.5 font-bold gap-2">
                    Đang dùng
                    <span className="bg-orange-600 text-white text-[10px] px-1.5 py-0.5 rounded-full">
                        {orders.filter(o => !['Completed', 'Cancelled'].includes(o.status)).length}
                    </span>
                </TabsTrigger>
                <TabsTrigger value="paid" className="px-6 py-2.5 font-bold">Đã thanh toán</TabsTrigger>
                <TabsTrigger value="cancelled" className="px-6 py-2.5 font-bold">Đơn hủy</TabsTrigger>
                <TabsTrigger value="all" className="px-6 py-2.5 font-bold">Tất cả</TabsTrigger>
            </TabsList>

            <div className="relative max-w-sm w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                    placeholder="Bàn, tên khách, mã đơn..."
                    className="pl-10 h-12 border-none bg-white shadow-sm rounded-2xl font-medium"
                    value={searchTerm}
                    onChange={(e: any) => setSearchTerm(e.target.value)}
                />
            </div>
        </div>

        <TabsContent value={activeTab} className="mt-0">
          {loading ? (
            <div className="flex justify-center p-20"><Loader2 className="animate-spin text-orange-600 w-10 h-10" /></div>
          ) : activeTab === "active" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredOrders.map(order => (
                    <Card key={order.id} className="border-none shadow-sm hover:shadow-md transition-all rounded-[32px] overflow-hidden bg-white group ring-1 ring-black/5">
                        <div className="bg-gray-900 p-5 text-white flex justify-between items-center">
                            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest">
                                <Clock className="w-4 h-4 text-orange-500" />
                                {new Date(order.createdAtUtc).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                            </div>
                            <div className={`px-3 py-1 rounded-full font-black text-[9px] uppercase shadow-sm ${getStatusStyle(order.status)}`}>
                                {getStatusText(order.status)}
                            </div>
                        </div>
                        <CardContent className="p-6">
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <div className="text-4xl font-black text-gray-900 tracking-tighter">{formatTableLabel(order.tableNumber)}</div>
                                    <div className="flex items-center gap-1.5 mt-2 text-gray-400">
                                        <MapPin className="w-3 h-3" />
                                        <p className="text-[10px] font-bold uppercase">{order.branchName}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] font-black text-gray-300 uppercase mb-1">Tạm tính</p>
                                    <p className="text-xl font-black text-orange-600">{order.totalAmount.toLocaleString("vi-VN")}đ</p>
                                </div>
                            </div>
                            <div className="space-y-2 mb-6 bg-gray-50 p-4 rounded-2xl border border-gray-100 min-h-[90px]">
                                {order.items?.slice(0, 2).map((item: any, idx: number) => (
                                    <div key={idx} className="flex justify-between items-center text-xs font-bold text-gray-600">
                                        <span className="truncate flex-1">{item.name}</span>
                                        <span className="ml-2 text-gray-400">x{item.quantity}</span>
                                    </div>
                                ))}
                                {order.items?.length > 2 && <p className="text-[10px] text-gray-400 italic mt-1">+ {order.items.length - 2} món khác...</p>}
                            </div>
                            <Button onClick={() => { setSelectedOrder(order); setIsDetailOpen(true); }} className="w-full bg-gray-900 hover:bg-black text-white font-black text-xs uppercase h-12 rounded-xl shadow-lg">
                                <Eye className="w-4 h-4 mr-2" /> Xem chi tiết
                            </Button>
                        </CardContent>
                    </Card>
                ))}
            </div>
          ) : (
            <Card className="border-none shadow-sm overflow-hidden bg-white rounded-2xl">
                <Table>
                    <TableHeader className="bg-gray-50/50">
                        <TableRow>
                            <TableHead className="font-bold">Mã đơn</TableHead>
                            <TableHead className="font-bold">Bàn</TableHead>
                            <TableHead className="font-bold">Cơ sở</TableHead>
                            <TableHead className="font-bold">Thời gian</TableHead>
                            <TableHead className="font-bold">Khách hàng</TableHead>
                            <TableHead className="font-bold">Tổng tiền</TableHead>
                            <TableHead className="font-bold">Trạng thái</TableHead>
                            <TableHead className="font-bold text-right">Hành động</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredOrders.map(order => (
                            <TableRow key={order.id} className="hover:bg-gray-50/50 transition-colors">
                                <TableCell className="font-black text-xs">#{order.orderNumber.split('-').pop()}</TableCell>
                                <TableCell className="font-black text-orange-600">{formatTableLabel(order.tableNumber)}</TableCell>
                                <TableCell>
                                    <div className="font-bold text-xs">{order.branchName}</div>
                                    <div className="text-[9px] text-gray-400 truncate max-w-[120px]">{order.branchAddress}</div>
                                </TableCell>
                                <TableCell>
                                    <div className="font-black text-xs text-gray-900">{new Date(order.createdAtUtc).toLocaleDateString('vi-VN')}</div>
                                    <div className="text-[10px] font-bold text-orange-600">{new Date(order.createdAtUtc).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                                </TableCell>
                                <TableCell>
                                    <div className="font-bold text-sm">{order.customerName}</div>
                                    <div className="text-[10px] text-gray-400">{order.customerPhone || "Khách lẻ"}</div>
                                </TableCell>
                                <TableCell className="font-black">{order.totalAmount.toLocaleString("vi-VN")}đ</TableCell>
                                <TableCell>
                                    <div className={`px-3 py-1 rounded-full font-black uppercase text-[8px] inline-block shadow-sm ${getStatusStyle(order.status)}`}>
                                        {getStatusText(order.status)}
                                    </div>
                                </TableCell>
                                <TableCell className="text-right">
                                    <Button onClick={() => { setSelectedOrder(order); setIsDetailOpen(true); }} variant="ghost" size="icon" className="h-9 w-9 rounded-xl text-gray-400 hover:text-orange-600 hover:bg-orange-50">
                                        <Eye className="w-5 h-5" />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </Card>
          )}

          {!loading && filteredOrders.length === 0 && (
            <div className="py-40 text-center bg-white rounded-[48px] border-2 border-dashed border-gray-100">
              <ShoppingBasket className="mx-auto w-16 h-16 text-gray-100 mb-4" />
              <p className="text-gray-400 font-black uppercase tracking-widest text-xs">Không tìm thấy đơn hàng nào trong mục này</p>
            </div>
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-2xl rounded-[32px]">
           <DialogHeader>
              <DialogTitle className="text-2xl font-black flex items-center gap-3">
                 <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center text-orange-600 shadow-inner">
                    <ShoppingBasket className="w-6 h-6" />
                 </div>
                 {formatTableLabel(selectedOrder?.tableNumber)}
              </DialogTitle>
              <DialogDescription className="font-bold text-gray-400 uppercase text-[10px] tracking-widest">
                 {selectedOrder?.branchName} • {selectedOrder?.orderNumber}
              </DialogDescription>
           </DialogHeader>

           <div className="py-4">
              <div className="bg-gray-50 rounded-2xl p-6 mb-6 flex justify-between items-center border border-gray-100">
                 <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Khách hàng</p>
                    <p className="font-black text-gray-900">{selectedOrder?.customerName}</p>
                    <p className="text-xs text-gray-500 font-medium">{selectedOrder?.customerPhone || "Khách vãng lai"}</p>
                 </div>
                 <div className="text-right">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Thanh toán</p>
                    <div className={`px-3 py-1 rounded-full font-bold uppercase text-[10px] inline-block ${
                        selectedOrder?.paymentStatus === 'Paid' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                    }`}>
                        {selectedOrder?.paymentStatus === 'Paid' ? 'Đã thu tiền' : 'Chưa thanh toán'}
                    </div>
                 </div>
              </div>

              <div className="space-y-4">
                 <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Danh sách món ăn</p>
                 <div className="border border-gray-100 rounded-2xl overflow-hidden max-h-[250px] overflow-y-auto">
                    <Table>
                       <TableHeader className="bg-gray-50/50 sticky top-0">
                          <TableRow>
                             <TableHead className="font-bold">Tên món</TableHead>
                             <TableHead className="text-center font-bold">SL</TableHead>
                             <TableHead className="text-right font-bold">Thành tiền</TableHead>
                          </TableRow>
                       </TableHeader>
                       <TableBody>
                          {selectedOrder?.items?.map((item: any, idx: number) => (
                             <TableRow key={idx}>
                                <TableCell className="font-bold text-gray-900 text-sm">{item.name}</TableCell>
                                <TableCell className="text-center font-black text-gray-400">x{item.quantity}</TableCell>
                                <TableCell className="text-right font-black text-gray-900">{item.totalPrice.toLocaleString("vi-VN")}đ</TableCell>
                             </TableRow>
                          ))}
                       </TableBody>
                    </Table>
                 </div>
              </div>

              <div className="mt-8 pt-6 border-t border-dashed border-gray-200 flex justify-between items-center">
                 <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Tổng tiền giao dịch</p>
                    <p className="text-3xl font-black text-orange-600">{selectedOrder?.totalAmount?.toLocaleString("vi-VN")}đ</p>
                 </div>
                 {selectedOrder?.status === 'Completed' && (
                    <div className="flex items-center gap-2 text-green-600 font-black text-xs uppercase tracking-tighter bg-green-50 px-4 py-2 rounded-xl">
                        <CheckCircle2 className="w-4 h-4" /> Giao dịch hoàn tất
                    </div>
                 )}
              </div>
           </div>

           <div className="mt-6 flex gap-3">
              <Button onClick={() => setIsDetailOpen(false)} className="flex-1 h-14 rounded-2xl font-black bg-gray-100 text-gray-500 hover:bg-gray-200 uppercase text-xs tracking-widest transition-all">Đóng</Button>
              {selectedOrder?.status !== 'Cancelled' && (
                <Button className="flex-1 h-14 bg-gray-900 hover:bg-black text-white rounded-2xl font-black gap-2 uppercase text-xs tracking-widest shadow-xl">
                    <CreditCard className="w-4 h-4" /> In lại hóa đơn
                </Button>
              )}
           </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
