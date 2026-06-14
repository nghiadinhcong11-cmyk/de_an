import { useEffect, useMemo, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Bell, CheckCircle2, Clock, Loader2, MapPin, Users, XCircle } from "lucide-react";
import api from "../services/api";
import * as signalR from "@microsoft/signalr";

const hubUrl = "https://restaurant-pos-api-uvcz.onrender.com/notificationHub";

export function OwnerBookings() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [branches, setBranches] = useState<any[]>([]);
  const [tables, setTables] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [branchFilter, setBranchFilter] = useState("all");
  const [actioningId, setActioningId] = useState<string | null>(null);
  const [latestBooking, setLatestBooking] = useState<any>(null);

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const branchFilterRef = useRef(branchFilter);

  useEffect(() => {
    branchFilterRef.current = branchFilter;
  }, [branchFilter]);

  const fetchData = async (filter: string = branchFilterRef.current) => {
    try {
      setLoading(true);
      const [branchRes, tableRes] = await Promise.all([
        api.get("/branches"),
        api.get("/tables")
      ]);
      setBranches(branchRes.data);
      setTables(tableRes.data);

      const query = filter !== "all" ? `?branchId=${filter}` : "";
      const bookingRes = await api.get(`/bookings/owner${query}`);
      setBookings(bookingRes.data);
    } catch (err) {
      console.error("Lỗi tải đặt bàn", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [branchFilter]);

  useEffect(() => {
    const connection = new signalR.HubConnectionBuilder()
      .withUrl(hubUrl)
      .withAutomaticReconnect()
      .build();

    connection.start()
      .then(async () => {
        if (user.restaurantId) {
          await connection.invoke("JoinRestaurantGroup", user.restaurantId);
        }
        if (user.branchId) {
          await connection.invoke("JoinBranchGroup", user.branchId);
        }

        connection.on("NewBookingReceived", (data: any) => {
          setLatestBooking(data);
          fetchData();
        });

        connection.on("BookingStatusUpdated", () => {
          fetchData();
        });
      })
      .catch((err: any) => console.error("Lỗi kết nối SignalR:", err));

    return () => {
      connection.stop();
    };
  }, []);

  const tableMap = useMemo(() => {
    return new Map(tables.map((table: any) => [table.id, table]));
  }, [tables]);

  const bookingGroups = useMemo(() => {
    const pending = bookings.filter((b: any) => b.status === "Pending");
    const handled = bookings.filter((b: any) => b.status !== "Pending");
    return { pending, handled };
  }, [bookings]);

  const getBookingStatusLabel = (status: string) => {
    switch (status) {
      case "Pending":
        return "Chờ duyệt";
      case "Confirmed":
        return "Đã chấp nhận";
      case "Rejected":
        return "Đã từ chối";
      case "Cancelled":
        return "Đã hủy";
      case "Completed":
        return "Hoàn tất";
      default:
        return status;
    }
  };

  const getBookingStatusClass = (status: string) => {
    switch (status) {
      case "Pending":
        return "bg-orange-100 text-orange-700";
      case "Confirmed":
        return "bg-green-100 text-green-700";
      case "Rejected":
        return "bg-red-100 text-red-700";
      case "Cancelled":
        return "bg-gray-100 text-gray-600";
      case "Completed":
        return "bg-blue-100 text-blue-700";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  const getTableLabel = (booking: any) => {
    if (!booking.tableId) return "Bàn tự do";
    const tableNum = String(booking.tableNumber || "").replace(/^Bàn\s*/i, "");
    const zoneName = booking.zoneName || "Khu vực chung";
    return `Bàn ${tableNum} - ${zoneName}`;
  };

  const getBranchName = (booking: any) => {
    return booking.branchName || branches.find((b: any) => b.id === booking.branchId)?.name || "Chi nhánh";
  };

  const handleAction = async (id: string, action: "confirm" | "reject") => {
    if (action === "reject" && !confirm("Từ chối đặt bàn này?")) return;

    setActioningId(id);
    try {
      await api.post(`/bookings/${id}/${action}`);
      fetchData();
    } catch (err) {
      alert(action === "confirm" ? "Lỗi khi chấp nhận đặt bàn" : "Lỗi khi từ chối đặt bàn");
    } finally {
      setActioningId(null);
    }
  };

  const visibleBookings = branchFilter === "all"
    ? bookings
    : bookings.filter((booking: any) => booking.branchId === branchFilter);

  if (loading && bookings.length === 0) {
    return <div className="flex justify-center p-20"><Loader2 className="animate-spin text-orange-600 w-10 h-10" /></div>;
  }

  return (
    <div className="p-4 md:p-8 bg-gray-50 min-h-screen text-gray-900">
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black uppercase tracking-tight">Thông báo đặt bàn</h1>
          <p className="text-gray-500 font-medium">Nhận booking mới theo thời gian thực và duyệt theo từng chi nhánh</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Select value={branchFilter} onValueChange={setBranchFilter}>
            <SelectTrigger className="w-[220px] h-11 rounded-2xl bg-white border border-gray-100 font-bold">
              <SelectValue placeholder="Lọc theo chi nhánh" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả chi nhánh</SelectItem>
              {branches.map((branch: any) => (
                <SelectItem key={branch.id} value={branch.id}>
                  {branch.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="flex items-center gap-2 bg-orange-50 text-orange-600 px-4 py-2 rounded-2xl font-black text-xs uppercase tracking-widest border border-orange-100">
            <Bell className="w-4 h-4" />
            {bookingGroups.pending.length} chờ duyệt
          </div>
        </div>
      </div>

      {latestBooking && (
        <div className="mb-6 rounded-[28px] border border-orange-100 bg-orange-50 p-5 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-orange-600">Thông báo mới</p>
              <p className="text-lg font-black text-gray-900 mt-1">
                {latestBooking.customerName} vừa đặt {latestBooking.numberOfGuests} khách tại {latestBooking.branchName || "chi nhánh"}
              </p>
              <p className="text-sm text-gray-500 font-medium mt-1">
                {latestBooking.tableInfo} • {new Date(latestBooking.bookingDate).toLocaleString("vi-VN")}
              </p>
            </div>
            <div className="flex gap-3">
              <Button
                onClick={() => handleAction(latestBooking.bookingId, "confirm")}
                className="h-11 rounded-2xl bg-gray-900 hover:bg-black font-black uppercase text-xs tracking-widest"
              >
                Chấp nhận
              </Button>
              <Button
                onClick={() => handleAction(latestBooking.bookingId, "reject")}
                variant="outline"
                className="h-11 rounded-2xl border-red-100 text-red-600 hover:bg-red-50 font-black uppercase text-xs tracking-widest"
              >
                Từ chối
              </Button>
            </div>
          </div>
        </div>
      )}

      <Tabs defaultValue="pending">
        <TabsList className="mb-8 bg-white p-1.5 rounded-2xl shadow-sm border border-gray-100 flex flex-wrap h-auto w-full sm:w-fit">
          <TabsTrigger value="pending" className="flex-1 sm:flex-none px-8 font-bold rounded-xl data-[state=active]:bg-gray-900 data-[state=active]:text-white">
            Chờ duyệt
            {bookingGroups.pending.length > 0 && <Badge className="bg-orange-600 text-white border-none h-5 min-w-5 flex items-center justify-center p-0 text-[10px] ml-2">{bookingGroups.pending.length}</Badge>}
          </TabsTrigger>
          <TabsTrigger value="handled" className="flex-1 sm:flex-none px-8 font-bold rounded-xl data-[state=active]:bg-gray-900 data-[state=active]:text-white">
            Đã xử lý
          </TabsTrigger>
          <TabsTrigger value="all" className="flex-1 sm:flex-none px-8 font-bold rounded-xl data-[state=active]:bg-gray-900 data-[state=active]:text-white">
            Tất cả
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending">
          <BookingGrid
            bookings={bookingGroups.pending}
            getBranchName={getBranchName}
            getTableLabel={getTableLabel}
            getBookingStatusClass={getBookingStatusClass}
            getBookingStatusLabel={getBookingStatusLabel}
            onAction={handleAction}
            actioningId={actioningId}
            emptyMessage="Hiện chưa có booking mới"
          />
        </TabsContent>

        <TabsContent value="handled">
          <BookingGrid
            bookings={bookingGroups.handled}
            getBranchName={getBranchName}
            getTableLabel={getTableLabel}
            getBookingStatusClass={getBookingStatusClass}
            getBookingStatusLabel={getBookingStatusLabel}
            onAction={handleAction}
            actioningId={actioningId}
            showActions={false}
            emptyMessage="Chưa có booking nào đã xử lý"
          />
        </TabsContent>

        <TabsContent value="all">
          <BookingGrid
            bookings={visibleBookings}
            getBranchName={getBranchName}
            getTableLabel={getTableLabel}
            getBookingStatusClass={getBookingStatusClass}
            getBookingStatusLabel={getBookingStatusLabel}
            onAction={handleAction}
            actioningId={actioningId}
            emptyMessage="Không có booking phù hợp bộ lọc"
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function BookingGrid({
  bookings,
  getBranchName,
  getTableLabel,
  getBookingStatusClass,
  getBookingStatusLabel,
  onAction,
  actioningId,
  showActions = true,
  emptyMessage
}: any) {
  if (!bookings.length) {
    return (
      <div className="py-32 text-center space-y-4 bg-white rounded-[40px] border-2 border-dashed border-gray-100 shadow-inner">
        <div className="text-5xl opacity-20 grayscale animate-bounce">📅</div>
        <div className="text-gray-400 font-black uppercase tracking-widest text-xs">{emptyMessage}</div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      {bookings.map((booking: any) => (
        <Card key={booking.id} className="border-none shadow-xl ring-1 ring-black/5 overflow-hidden rounded-[32px] bg-white">
          <div className="bg-gray-900 px-5 py-4 text-white flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-orange-500" />
              <span className="text-xs font-black uppercase tracking-widest">{new Date(booking.bookingDate).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
            </div>
            <Badge className={`${getBookingStatusClass(booking.status)} border-none font-black text-[9px] uppercase tracking-widest`}>
              {getBookingStatusLabel(booking.status)}
            </Badge>
          </div>

          <CardHeader className="pb-0 flex flex-row items-start justify-between gap-4">
            <div>
              <CardTitle className="text-2xl font-black text-gray-900 tracking-tighter">{getTableLabel(booking)}</CardTitle>
              <div className="flex items-center gap-1 text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">
                <MapPin className="w-3 h-3" /> {getBranchName(booking)}
              </div>
            </div>
            <div className="text-right">
                <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Mã xác nhận</p>
                <code className="text-xs font-black text-orange-600 bg-orange-50 px-2 py-1 rounded-lg">
                    {booking.id.substring(0, 8).toUpperCase()}
                </code>
            </div>
          </CardHeader>

          <CardContent className="p-6 space-y-5">
            <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-2xl border border-gray-100">
                <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center overflow-hidden shrink-0 border-2 border-white shadow-sm">
                    {booking.customerAvatar ? (
                        <img src={booking.customerAvatar} alt={booking.customerName} className="w-full h-full object-cover" />
                    ) : (
                        <span className="font-black text-orange-600">{booking.customerName?.charAt(0) || "K"}</span>
                    )}
                </div>
                <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Khách hàng</p>
                    <p className="font-black text-gray-900">{booking.customerName || "Khách vãng lai"}</p>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <InfoItem label="SĐT" value={booking.customerPhone || "Chưa có"} />
              <InfoItem label="Số khách" value={`${booking.numberOfGuests} người`} />
              <InfoItem label="Vị trí bàn" value={getTableLabel(booking)} />
              <InfoItem label="Loại khách" value={booking.customerId ? "Thành viên" : "Vãng lai"} />
            </div>

            {booking.notes && (
              <div className="rounded-2xl bg-gray-900 text-white p-4 shadow-xl shadow-gray-200">
                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-orange-500 mb-2">Ghi chú của khách</p>
                <p className="text-sm font-medium leading-relaxed italic">"{booking.notes}"</p>
              </div>
            )}

            <div className="flex items-center gap-2 text-xs font-bold text-gray-500">
              <Clock className="w-4 h-4 text-orange-500" />
              Hẹn lúc {new Date(booking.bookingDate).toLocaleString("vi-VN")}
            </div>

            {showActions && booking.status === "Pending" && (
              <div className="flex gap-3 pt-2">
                <Button
                  onClick={() => onAction(booking.id, "confirm")}
                  disabled={actioningId === booking.id}
                  className="flex-1 bg-gray-900 hover:bg-black text-white font-black text-xs uppercase tracking-widest h-12 rounded-xl shadow-lg"
                >
                  {actioningId === booking.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4 mr-2" />}
                  Chấp nhận
                </Button>
                <Button
                  onClick={() => onAction(booking.id, "reject")}
                  disabled={actioningId === booking.id}
                  variant="outline"
                  className="px-4 border-red-100 text-red-500 hover:bg-red-50 h-12 rounded-xl"
                >
                  <XCircle className="w-5 h-5" />
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function InfoItem({ label, value }: any) {
  return (
    <div className="rounded-2xl bg-gray-50 p-3 border border-gray-100">
      <p className="text-[9px] font-black uppercase tracking-widest text-gray-400">{label}</p>
      <p className="text-sm font-black text-gray-900 mt-1">{value}</p>
    </div>
  );
}
