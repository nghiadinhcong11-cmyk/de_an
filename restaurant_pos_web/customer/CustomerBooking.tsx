import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { Calendar, Users, Loader2, CheckCircle2, Phone, Info, Map, ChevronDown, ChevronUp, Layers, Armchair } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Badge } from "../components/ui/badge";
import api from "../services/api";

export function CustomerBooking() {
  const [loading, setLoading] = useState(false);
  const [branches, setBranches] = useState<any[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const [tables, setTables] = useState<any[]>([]);
  const [zones, setZones] = useState<any[]>([]);
  const [expandedZones, setExpandedZones] = useState<Record<string, boolean>>({});
  const [loadingTables, setLoadingTables] = useState(false);

  const [form, setForm] = useState({
    branchId: "",
    tableId: "",
    selectedTableId: "",
    customerName: user.fullName || "",
    customerPhone: user.phoneNumber || "",
    bookingDate: "",
    bookingTime: "18:00",
    numberOfGuests: 2,
    notes: ""
  });

  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const infoRes = await api.get("/auth/find-restaurant-info");
        const res = await api.get(`/branches/public?restaurantId=${infoRes.data.id}`);
        setBranches(res.data);
        if (res.data.length > 0) {
          setForm(prev => ({ ...prev, branchId: res.data[0].id }));
        }
      } catch (err) {
        console.error("Lỗi tải chi nhánh", err);
      }
    };
    fetchBranches();
  }, []);

  useEffect(() => {
    if (form.branchId) {
      const fetchBranchData = async () => {
        setLoadingTables(true);
        try {
            const [tablesRes, zonesRes] = await Promise.all([
                api.get(`/tables?branchId=${form.branchId}`),
                api.get(`/zones?branchId=${form.branchId}`)
            ]);
            setTables(tablesRes.data);
            setZones(zonesRes.data);

            const initialExpanded: Record<string, boolean> = {};
            zonesRes.data.forEach((z: any) => { initialExpanded[z.id] = true; });
            initialExpanded['none'] = true;
            setExpandedZones(initialExpanded);

            setForm(prev => ({ ...prev, tableId: "", selectedTableId: "" }));
        } catch (err) {
            console.error("Lỗi tải sơ đồ bàn");
        } finally {
            setLoadingTables(false);
        }
      };
      fetchBranchData();
    }
  }, [form.branchId]);

  const toggleZone = (zoneId: string) => {
    setExpandedZones(prev => ({ ...prev, [zoneId]: !prev[zoneId] }));
  };

  const normalizeTableStatus = (status?: string) => String(status ?? "Available").trim().toLowerCase();
  const isSelectableTable = (status?: string) => !["occupied", "reserved", "waiting-payment", "unavailable"].includes(normalizeTableStatus(status));

  const handleSelectTable = (tableId: string, status?: string) => {
    if (!isSelectableTable(status)) return;
    const nextTableId = form.tableId === tableId ? "" : tableId;
    setForm(prev => ({ ...prev, tableId: nextTableId, selectedTableId: nextTableId }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.branchId) return alert("Vui lòng chọn chi nhánh");

    setLoading(true);
    try {
      const dateTime = `${form.bookingDate}T${form.bookingTime}:00Z`;
      const { selectedTableId, ...payload } = form;
      await api.post("/bookings", {
        ...payload,
        bookingDate: dateTime
      });
      setSubmitted(true);
    } catch (err) {
      alert("Lỗi khi gửi yêu cầu đặt bàn. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-brand-dark flex flex-col items-center justify-center p-6 text-center animate-in fade-in zoom-in duration-500">
        <div className="w-32 h-32 bg-brand-accent/20 rounded-full flex items-center justify-center mb-8 shadow-[0_0_50px_rgba(249,115,22,0.2)]">
          <CheckCircle2 className="w-16 h-16 text-brand-accent" />
        </div>
        <h2 className="text-4xl md:text-6xl font-black text-white mb-6 tracking-tighter uppercase">Đặt bàn thành công!</h2>
        <p className="text-gray-400 text-lg md:text-xl font-medium max-w-xl mx-auto mb-12 leading-relaxed uppercase tracking-[0.1em]">
          Yêu cầu của bạn đã được tiếp nhận. Đội ngũ nhân viên sẽ liên hệ xác nhận trong thời gian sớm nhất.
        </p>
        <div className="flex flex-col sm:flex-row gap-6 w-full max-w-md">
            <Button onClick={() => setSubmitted(false)} variant="outline" className="flex-1 rounded-2xl h-16 px-8 font-black uppercase tracking-widest border-white/10 text-white hover:bg-white/5">ĐẶT THÊM</Button>
            <Button onClick={() => window.location.href = "/customer"} className="flex-1 bg-brand-accent hover:bg-orange-600 text-white rounded-2xl h-16 px-8 font-black uppercase tracking-widest shadow-xl shadow-brand-accent/20">VỀ TRANG CHỦ</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-dark text-white p-6 md:p-12 space-y-12 md:space-y-24">
      <div className="text-center space-y-6">
         <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 px-6 py-2 rounded-full">
            <Calendar className="w-4 h-4 text-brand-accent" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-accent">Reservation Service</span>
         </div>
         <h1 className="text-5xl md:text-8xl font-black tracking-tighter uppercase leading-none">Đặt Bàn <span className="text-brand-accent italic">Trước</span></h1>
         <p className="text-gray-400 text-lg md:text-xl font-medium max-w-2xl mx-auto leading-relaxed">
            Kiến tạo những kỷ niệm đáng nhớ. Chọn vị trí ngồi lý tưởng và thời gian hoàn hảo cho bữa tiệc của bạn.
         </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 max-w-7xl mx-auto">
        {/* Sidebar Info */}
        <div className="space-y-8">
            <div className="bg-brand-accent rounded-[50px] p-12 text-white relative overflow-hidden group shadow-2xl shadow-brand-accent/20">
                <Map className="absolute -right-8 -top-8 w-48 h-48 opacity-10 rotate-12 group-hover:scale-110 transition-transform duration-700" />
                <h3 className="text-3xl font-black mb-8 tracking-tighter uppercase">Chính Sách <br /> Đặt Chỗ</h3>
                <ul className="space-y-6">
                    <li className="flex gap-4 items-start">
                        <div className="w-6 h-6 rounded-lg bg-white/20 flex items-center justify-center shrink-0"><CheckCircle2 className="w-4 h-4" /></div>
                        <p className="text-sm font-bold uppercase tracking-wider leading-relaxed">Vui lòng đặt bàn trước ít nhất 60 phút.</p>
                    </li>
                    <li className="flex gap-4 items-start">
                        <div className="w-6 h-6 rounded-lg bg-white/20 flex items-center justify-center shrink-0"><CheckCircle2 className="w-4 h-4" /></div>
                        <p className="text-sm font-bold uppercase tracking-wider leading-relaxed">Giữ bàn tối đa 15 phút so với giờ hẹn.</p>
                    </li>
                    <li className="flex gap-4 items-start">
                        <div className="w-6 h-6 rounded-lg bg-white/20 flex items-center justify-center shrink-0"><CheckCircle2 className="w-4 h-4" /></div>
                        <p className="text-sm font-bold uppercase tracking-wider leading-relaxed">Ưu tiên vị trí theo yêu cầu của hội viên VIP.</p>
                    </li>
                </ul>
                <div className="mt-12 pt-8 border-t border-white/20 flex items-center gap-6">
                    <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center border border-white/20">
                        <Phone className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Hỗ trợ 24/7</p>
                        <p className="text-xl font-black">1900 123 456</p>
                    </div>
                </div>
            </div>

            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[40px] p-10 space-y-6">
                <div className="flex items-center gap-4 text-brand-accent">
                    <Info className="w-6 h-6" />
                    <h4 className="font-black uppercase tracking-widest text-sm">Lưu ý quan trọng</h4>
                </div>
                <p className="text-gray-400 text-sm font-medium leading-relaxed italic uppercase tracking-tighter">
                    "Nếu quý khách đi đoàn trên 20 người, vui lòng liên hệ trực tiếp hotline để nhận ưu đãi thực đơn đoàn đặc biệt."
                </p>
            </div>
        </div>

        {/* Main Booking Form */}
        <div className="lg:col-span-2">
          <Card className="bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[60px] overflow-hidden shadow-2xl">
            <CardContent className="p-8 md:p-16">
               <form onSubmit={handleSubmit} className="space-y-10">
                  <div className="space-y-4">
                    <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500 ml-2">Chi nhánh thực hiện</Label>
                    <Select value={form.branchId} onValueChange={(v) => setForm({...form, branchId: v})}>
                        <SelectTrigger className="h-20 rounded-3xl bg-white/5 border-white/10 text-xl font-black tracking-tight text-white focus:ring-brand-accent shadow-none px-8 transition-all">
                            <SelectValue placeholder="CHỌN CƠ SỞ GẦN BẠN" />
                        </SelectTrigger>
                        <SelectContent className="bg-brand-dark border-white/10 text-white rounded-3xl overflow-hidden shadow-2xl">
                            {branches.map(b => (
                                <SelectItem key={b.id} value={b.id} className="font-bold py-4 hover:bg-white/10 transition-colors cursor-pointer">{b.name.toUpperCase()}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                        <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500 ml-2">Danh tính</Label>
                        <Input
                            required
                            placeholder="HỌ VÀ TÊN"
                            className="h-20 rounded-3xl bg-white/5 border-white/10 text-lg font-bold px-8 focus:border-brand-accent transition-all"
                            value={form.customerName}
                            onChange={(e: any) => setForm({...form, customerName: e.target.value})}
                        />
                    </div>
                    <div className="space-y-4">
                        <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500 ml-2">Liên lạc</Label>
                        <Input
                            required
                            placeholder="SỐ ĐIỆN THOẠI"
                            className="h-20 rounded-3xl bg-white/5 border-white/10 text-lg font-bold px-8 focus:border-brand-accent transition-all"
                            value={form.customerPhone}
                            onChange={(e: any) => setForm({...form, customerPhone: e.target.value})}
                        />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="space-y-4">
                        <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500 ml-2">Ngày dự kiến</Label>
                        <Input
                            required
                            type="date"
                            min={new Date().toISOString().split('T')[0]}
                            className="h-20 rounded-3xl bg-white/5 border-white/10 text-lg font-bold px-8 focus:border-brand-accent transition-all appearance-none inverted-scheme"
                            value={form.bookingDate}
                            onChange={(e: any) => setForm({...form, bookingDate: e.target.value})}
                        />
                    </div>
                    <div className="space-y-4">
                        <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500 ml-2">Thời gian</Label>
                        <Input
                            required
                            type="time"
                            className="h-20 rounded-3xl bg-white/5 border-white/10 text-lg font-bold px-8 focus:border-brand-accent transition-all inverted-scheme"
                            value={form.bookingTime}
                            onChange={(e: any) => setForm({...form, bookingTime: e.target.value})}
                        />
                    </div>
                    <div className="space-y-4">
                        <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500 ml-2">Tổng số khách</Label>
                        <Input
                            required
                            type="number"
                            min={1}
                            max={50}
                            className="h-20 rounded-3xl bg-white/5 border-white/10 text-2xl font-black px-8 focus:border-brand-accent transition-all"
                            value={form.numberOfGuests}
                            onChange={(e: any) => setForm({...form, numberOfGuests: parseInt(e.target.value)})}
                        />
                    </div>
                  </div>

                  {/* TABLE SELECTION AREA */}
                  <div className="space-y-6 pt-10 border-t border-white/5">
                      <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                             <Map className="w-5 h-5 text-brand-accent" />
                             <h4 className="font-black text-white text-xl tracking-tighter uppercase">Lựa Chọn Vị Trí Ngồi</h4>
                          </div>
                          <Badge className="bg-brand-accent/20 text-brand-accent border-none text-[9px] font-black tracking-widest px-4 py-1.5 rounded-full">OPTIONAL</Badge>
                      </div>

                      {loadingTables ? (
                        <div className="py-20 flex flex-col items-center justify-center gap-4 bg-white/5 rounded-[40px] border-2 border-dashed border-white/10">
                            <Loader2 className="w-10 h-10 text-brand-accent animate-spin" />
                            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Đang tải sơ đồ cơ sở...</p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {zones.map(zone => {
                                const zoneTables = tables.filter(t => t.zoneId === zone.id);
                                if (zoneTables.length === 0) return null;

                                return (
                                  <div key={zone.id} className="bg-white/5 border border-white/10 rounded-[32px] p-6 space-y-6 transition-all hover:bg-white/10 group">
                                      <div className="flex items-center justify-between border-b border-white/5 pb-4">
                                          <div className="flex items-center gap-3">
                                              <Layers className="w-4 h-4 text-brand-accent" />
                                              <span className="font-black text-xs uppercase tracking-widest text-white">{zone.name}</span>
                                          </div>
                                          <span className="text-[10px] font-bold text-gray-500 uppercase">{zoneTables.length} BÀN</span>
                                      </div>

                                      <div className="grid grid-cols-4 gap-3">
                                          {zoneTables.map(table => (
                                              <button
                                                  key={table.id}
                                                  type="button"
                                                  disabled={table.status === 'Occupied'}
                                                  onClick={() => setForm({...form, tableId: form.tableId === table.id ? "" : table.id})}
                                                  className={`relative h-14 rounded-xl flex flex-col items-center justify-center transition-all border-2 ${
                                                      form.tableId === table.id
                                                      ? 'border-brand-accent bg-brand-accent text-white scale-110 shadow-2xl shadow-brand-accent/40'
                                                      : table.status === 'Occupied'
                                                          ? 'border-white/5 bg-white/5 opacity-20 cursor-not-allowed'
                                                          : 'border-white/10 bg-white/5 hover:border-brand-accent/50'
                                                  }`}
                                              >
                                                  <Armchair className="w-4 h-4 mb-1" />
                                                  <span className="font-black text-[9px]">{table.tableNumber}</span>
                                              </button>
                                          ))}
                                      </div>
                                  </div>
                                );
                            })}
                        </div>
                      )}
                  </div>

                  <div className="space-y-4">
                    <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500 ml-2">Yêu cầu đặc biệt</Label>
                    <Textarea
                        rows={4}
                        placeholder="VD: CẦN TRANG TRÍ SINH NHẬT, KHU VỰC CỬA SỔ, GHẾ TRẺ EM..."
                        className="rounded-3xl bg-white/5 border-white/10 text-lg font-medium p-8 focus:border-brand-accent transition-all resize-none uppercase"
                        value={form.notes}
                        onChange={(e: any) => setForm({...form, notes: e.target.value})}
                    />
                  </div>

                  <Button
                    disabled={loading || !form.branchId}
                    className="group relative overflow-hidden w-full h-24 bg-brand-accent hover:bg-orange-600 text-white font-black text-2xl rounded-3xl shadow-2xl shadow-brand-accent/30 transition-all uppercase tracking-widest active:scale-[0.98]"
                  >
                    <span className="relative z-10 flex items-center justify-center gap-4">
                        {loading ? <Loader2 className="animate-spin" /> : <>XÁC NHẬN ĐẶT BÀN <ArrowRight className="w-8 h-8" /></>}
                    </span>
                    <div className="absolute inset-0 bg-white/20 -translate-x-full group-hover:animate-shine"></div>
                  </Button>
               </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
