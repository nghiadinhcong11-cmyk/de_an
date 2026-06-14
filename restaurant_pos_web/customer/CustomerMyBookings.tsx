import { useState, useEffect } from "react";
import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Loader2, Calendar, Clock, MapPin, Users, ChevronRight, CheckCircle2, XCircle, Timer, Info, Layers } from "lucide-react";
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
      case "Pending": return "bg-orange-500/20 text-orange-500";
      case "Confirmed": return "bg-green-500/20 text-green-500";
      case "Rejected": return "bg-red-500/20 text-red-500";
      case "Cancelled": return "bg-white/10 text-gray-400";
      case "Completed": return "bg-blue-500/20 text-blue-500";
      default: return "bg-white/10 text-gray-400";
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
      case "Pending": return <Timer className="w-5 h-5 text-orange-500" />;
      case "Confirmed": return <CheckCircle2 className="w-5 h-5 text-green-500" />;
      case "Rejected": return <XCircle className="w-5 h-5 text-red-500" />;
      default: return <Calendar className="w-5 h-5 text-gray-500" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-brand-dark gap-4">
        <Loader2 className="w-12 h-12 text-brand-accent animate-spin" />
        <p className="text-gray-500 font-black uppercase tracking-[0.3em] text-xs">Đang tải lịch đặt bàn...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-dark text-white p-6 md:p-12 space-y-12 md:space-y-24 font-['Montserrat']">
      {/* Premium Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 border-b border-white/5 pb-12">
         <div className="space-y-4">
            <h1 className="text-4xl md:text-7xl font-black tracking-tighter uppercase leading-none">Lịch Đặt Bàn <span className="text-brand-accent">Của Bạn</span></h1>
            <p className="text-gray-400 text-lg font-medium max-w-2xl leading-relaxed">
                Theo dõi và quản lý các yêu cầu đặt chỗ để đảm bảo trải nghiệm ẩm thực hoàn hảo nhất.
            </p>
         </div>
         <Link to="/customer/booking">
            <Button className="group relative overflow-hidden bg-brand-accent hover:bg-orange-600 text-white h-16 px-10 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-brand-accent/20 transition-all">
                <span className="relative z-10">ĐẶT BÀN MỚI</span>
                <div className="absolute inset-0 bg-white/20 -translate-x-full group-hover:animate-shine"></div>
            </Button>
         </Link>
      </div>

      {bookings.length === 0 ? (
        <div className="text-center py-40 bg-white/5 rounded-[60px] border-2 border-dashed border-white/10">
            <Calendar className="mx-auto w-24 h-24 text-gray-700 mb-8 opacity-20" />
            <h3 className="text-2xl font-black text-gray-500 uppercase tracking-widest">BẠN CHƯA CÓ LỊCH ĐẶT BÀN NÀO</h3>
            <p className="text-gray-600 mt-4 font-medium text-lg">Hãy chọn vị trí yêu thích và đặt chỗ ngay hôm nay!</p>
            <Link to="/customer/booking" className="inline-block mt-10">
                <Button className="bg-white text-brand-dark hover:bg-brand-accent hover:text-white px-12 h-14 rounded-2xl font-black uppercase tracking-widest transition-all">Bắt đầu ngay</Button>
            </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {bookings.map((booking) => (
            <Card key={booking.id} className="border-none shadow-2xl bg-white/5 backdrop-blur-3xl rounded-[50px] overflow-hidden border border-white/5 group hover:border-brand-accent/30 transition-all duration-500">
              <CardContent className="p-0">
                {/* Header Trạng thái */}
                <div className="bg-brand-dark/40 px-10 py-6 flex justify-between items-center border-b border-white/5">
                    <div className="flex items-center gap-4">
                        {getStatusIcon(booking.status)}
                        <span className="text-[10px] font-black uppercase tracking-[0.2em]">{getStatusLabel(booking.status)}</span>
                    </div>
                    <div className="text-[10px] font-black text-gray-600 uppercase tracking-widest">
                        REF: {booking.id.substring(0, 8).toUpperCase()}
                    </div>
                </div>

                <div className="p-10 space-y-8">
                    <div className="flex justify-between items-start">
                        <div>
                            <h3 className="text-3xl font-black text-white tracking-tighter uppercase leading-none">
                                {booking.tableId ? `Bàn ${booking.tableNumber}` : "Bàn tự do"}
                            </h3>
                            <div className="flex items-center gap-3 mt-3 text-brand-accent font-black text-[10px] uppercase tracking-[0.3em]">
                                <Layers className="w-4 h-4" /> {booking.zoneName || "Khu vực chung"}
                            </div>
                        </div>
                        <Badge className={`${getStatusColor(booking.status)} border-none font-black text-[10px] py-2 px-6 rounded-2xl uppercase tracking-widest`}>
                            {booking.status}
                        </Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        <div className="bg-white/5 rounded-[32px] p-6 border border-white/5 hover:bg-white/10 transition-all">
                            <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-2">Thời gian hẹn</p>
                            <div className="flex items-center gap-3 font-black text-xl text-white">
                                <Clock className="w-5 h-5 text-brand-accent" />
                                <span>{new Date(booking.bookingDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                            <p className="text-[10px] font-bold text-gray-500 mt-2 uppercase tracking-tighter">{new Date(booking.bookingDate).toLocaleDateString("vi-VN")}</p>
                        </div>
                        <div className="bg-white/5 rounded-[32px] p-6 border border-white/5 hover:bg-white/10 transition-all">
                            <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-2">Số lượng khách</p>
                            <div className="flex items-center gap-3 font-black text-xl text-white">
                                <Users className="w-5 h-5 text-brand-accent" />
                                <span>{booking.numberOfGuests} <span className="text-sm font-bold opacity-60 ml-1">người</span></span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-start gap-6 p-6 bg-white/[0.02] rounded-[32px] border border-dashed border-white/10 group-hover:bg-white/5 transition-all">
                        <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center shrink-0 mt-1">
                            <MapPin className="w-6 h-6 text-brand-accent" />
                        </div>
                        <div>
                            <p className="font-black text-lg text-white uppercase tracking-tight">{booking.branchName}</p>
                            <p className="text-sm font-medium text-gray-500 mt-1 leading-relaxed">{booking.branchAddress}</p>
                        </div>
                    </div>

                    {booking.notes && (
                        <div className="p-8 bg-brand-accent/5 rounded-[32px] border border-brand-accent/10 relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-10">
                                <Info className="w-12 h-12" />
                            </div>
                            <p className="text-[9px] font-black text-brand-accent uppercase tracking-widest mb-2 relative z-10">Ghi chú của bạn</p>
                            <p className="text-base font-medium text-gray-300 italic relative z-10 leading-relaxed">"{booking.notes}"</p>
                        </div>
                    )}

                    <div className="pt-4">
                        {booking.status === "Pending" ? (
                            <Button variant="outline" className="w-full h-14 rounded-2xl border-red-500/20 text-red-500 font-black text-[10px] uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all shadow-xl">
                                HỦY ĐẶT BÀN TRỰC TUYẾN
                            </Button>
                        ) : (
                            <div className="flex items-center justify-center gap-3 py-4 bg-white/5 rounded-2xl text-[10px] font-black text-gray-500 uppercase tracking-widest border border-white/5">
                                <Info className="w-4 h-4 text-brand-accent" />
                                Hotline 1900 123 456 hỗ trợ thay đổi
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
