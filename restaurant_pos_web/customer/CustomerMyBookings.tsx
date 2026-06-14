import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Loader2, Calendar, Clock, MapPin, Users, Armchair, ChevronRight, CheckCircle2, XCircle, Timer, Info } from "lucide-react";
import { Link } from "react-router-dom";
import api from "../services/api";

export function CustomerMyBookings() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const res = await api.get("/bookings/my-bookings");
      setBookings(res.data);
    } catch (err) {
      console.error("Lỗi tải danh sách đặt bàn");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Pending": return "bg-orange-100 text-orange-700";
      case "Confirmed": return "bg-green-100 text-green-700";
      case "Rejected": return "bg-red-100 text-red-700";
      case "Cancelled": return "bg-gray-100 text-gray-600";
      case "Completed": return "bg-blue-100 text-blue-700";
      default: return "bg-gray-100 text-gray-600";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "Pending": return "Đang chờ duyệt";
      case "Confirmed": return "Đã xác nhận";
      case "Rejected": return "Bị từ chối";
      case "Cancelled": return "Đã hủy";
      case "Completed": return "Đã hoàn tất";
      default: return status;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Pending": return <Timer className="w-5 h-5 text-orange-600" />;
      case "Confirmed": return <CheckCircle2 className="w-5 h-5 text-green-600" />;
      case "Rejected": return <XCircle className="w-5 h-5 text-red-600" />;
      default: return <Calendar className="w-5 h-5 text-gray-400" />;
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-4">
        <Loader2 className="w-12 h-12 text-orange-600 animate-spin" />
        <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Đang tải lịch đặt bàn...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-12 pb-24">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white p-10 rounded-[40px] shadow-sm border border-gray-100">
         <div>
            <h1 className="text-4xl font-black text-gray-900 tracking-tighter uppercase">Lịch Đặt Bàn Của Bạn</h1>
            <p className="text-gray-400 font-bold uppercase tracking-widest text-xs mt-2">Quản lý các yêu cầu đặt chỗ và thời gian dùng bữa</p>
         </div>
         <Link to="/customer/booking">
            <Button className="bg-gray-900 hover:bg-black text-white px-8 h-14 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-xl shadow-gray-200 active:scale-95">
                ĐẶT BÀN MỚI
            </Button>
         </Link>
      </div>

      {bookings.length === 0 ? (
        <div className="text-center py-32 bg-white rounded-[48px] border-2 border-dashed border-gray-100">
            <Calendar className="mx-auto w-24 h-24 text-gray-50 mb-6" />
            <h3 className="text-2xl font-black text-gray-300 uppercase">BẠN CHƯA CÓ LỊCH ĐẶT BÀN NÀO</h3>
            <p className="text-gray-400 mt-2 font-medium">Hãy chọn vị trí yêu thích và đặt chỗ ngay hôm nay!</p>
            <Link to="/customer/booking">
                <Button variant="outline" className="mt-8 border-orange-200 text-orange-600 font-black px-10 h-14 rounded-2xl uppercase">Đặt bàn ngay</Button>
            </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {bookings.map((booking) => (
            <Card key={booking.id} className="border-none shadow-sm hover:shadow-xl transition-all rounded-[40px] overflow-hidden bg-white group">
              <CardContent className="p-0">
                {/* Header Trạng thái */}
                <div className="bg-gray-900 px-8 py-4 flex justify-between items-center text-white">
                    <div className="flex items-center gap-3">
                        {getStatusIcon(booking.status)}
                        <span className="text-xs font-black uppercase tracking-widest">{getStatusLabel(booking.status)}</span>
                    </div>
                    <div className="text-[10px] font-bold opacity-60 uppercase tracking-tighter">
                        Mã: {booking.id.substring(0, 8).toUpperCase()}
                    </div>
                </div>

                <div className="p-8 space-y-6">
                    <div className="flex justify-between items-start">
                        <div>
                            <h3 className="text-2xl font-black text-gray-900 leading-tight">
                                {booking.tableId ? `Bàn ${booking.tableNumber}` : "Bàn tự do"}
                            </h3>
                            <div className="flex items-center gap-2 mt-1 text-orange-600 font-black text-[10px] uppercase tracking-widest">
                                <Layers className="w-3 h-3" /> {booking.zoneName || "Khu vực chung"}
                            </div>
                        </div>
                        <Badge className={`${getStatusColor(booking.status)} border-none font-black text-[10px] py-1.5 px-4 rounded-xl uppercase tracking-widest`}>
                            {booking.status}
                        </Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-gray-50 rounded-3xl p-4 border border-gray-100">
                            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Thời gian</p>
                            <div className="flex items-center gap-2 font-black text-gray-900">
                                <Clock className="w-4 h-4 text-orange-500" />
                                <span>{new Date(booking.bookingDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                            <p className="text-xs font-bold text-gray-400 mt-0.5">{new Date(booking.bookingDate).toLocaleDateString("vi-VN")}</p>
                        </div>
                        <div className="bg-gray-50 rounded-3xl p-4 border border-gray-100">
                            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Số lượng khách</p>
                            <div className="flex items-center gap-2 font-black text-gray-900">
                                <Users className="w-4 h-4 text-orange-500" />
                                <span>{booking.numberOfGuests} người</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-start gap-4 p-4 bg-gray-50/50 rounded-3xl border border-dashed border-gray-200">
                        <MapPin className="w-5 h-5 text-gray-400 shrink-0 mt-1" />
                        <div>
                            <p className="font-black text-xs text-gray-900">{booking.branchName}</p>
                            <p className="text-xs font-medium text-gray-400 mt-0.5 leading-relaxed">{booking.branchAddress}</p>
                        </div>
                    </div>

                    {booking.notes && (
                        <div className="p-4 bg-orange-50/50 rounded-3xl border border-orange-100/50">
                            <p className="text-[9px] font-black text-orange-600 uppercase tracking-widest mb-1">Ghi chú của bạn</p>
                            <p className="text-sm font-medium text-gray-600 italic">"{booking.notes}"</p>
                        </div>
                    )}

                    <div className="pt-2">
                        {booking.status === "Pending" ? (
                            <Button variant="outline" className="w-full h-12 rounded-2xl border-red-100 text-red-500 font-black text-[10px] uppercase tracking-widest hover:bg-red-50 hover:border-red-200">
                                HỦY ĐẶT BÀN
                            </Button>
                        ) : (
                            <div className="flex items-center justify-center gap-2 py-3 bg-gray-50 rounded-2xl text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                <Info className="w-4 h-4" />
                                Liên hệ hotline 1900 123 456 để thay đổi
                            </div>
                        )}
                    </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function Layers({ className }: { className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m12.83 2.18a2 2 0 0 0-1.66 0L2.1 6.34a2 2 0 0 0 0 3.66l9.07 4.16a2 2 0 0 0 1.66 0l9.07-4.16a2 2 0 0 0 0-3.66Z"/><path d="m2.1 14.98 9.07 4.15a2 2 0 0 0 1.66 0l9.07-4.15"/><path d="m2.1 10.65 9.07 4.15a2 2 0 0 0 1.66 0l9.07-4.15"/></svg>
    );
}
