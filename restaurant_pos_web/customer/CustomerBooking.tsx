import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { Calendar, Users, Loader2, CheckCircle2, Phone, Info, Map, ChevronDown, ChevronUp, Layers } from "lucide-react";
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

            // Mặc định mở rộng các khu vực có bàn
            const initialExpanded: Record<string, boolean> = {};
            zonesRes.data.forEach((z: any) => { initialExpanded[z.id] = true; });
            initialExpanded['none'] = true;
            setExpandedZones(initialExpanded);

            // Reset selected table if it doesn't belong to the new branch
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

  const getTableStatusLabel = (status?: string) => {
    switch (normalizeTableStatus(status)) {
      case "available":
        return "Trống";
      case "occupied":
        return "Đang dùng";
      case "reserved":
        return "Đã giữ chỗ";
      case "waiting-payment":
        return "Chờ thanh toán";
      default:
        return status || "Trống";
    }
  };

  const getSelectedTableId = () => form.selectedTableId || form.tableId;

  const formatTableLabel = (tableNumber?: string | number) => {
    const value = String(tableNumber ?? "").trim().replace(/^Bàn\s*/i, "").trim();
    return value ? `Bàn ${value}` : "Bàn";
  };

  const getSelectedTableLabel = () => {
    const selectedTable = tables.find(table => table.id === getSelectedTableId());
    return formatTableLabel(selectedTable?.tableNumber || getSelectedTableId());
  };

  const handleBranchChange = (branchId: string) => {
    setForm(prev => ({ ...prev, branchId, tableId: "", selectedTableId: "" }));
  };

  const handleSelectTable = (tableId: string, status?: string) => {
    if (!isSelectableTable(status)) return;
    const nextTableId = getSelectedTableId() === tableId ? "" : tableId;
    setForm(prev => ({ ...prev, tableId: nextTableId, selectedTableId: nextTableId }));
  };

  const getTablePlacement = (table: any, index: number, total: number) => {
    const hasCoordinates = Number.isFinite(Number(table.posX)) && Number.isFinite(Number(table.posY)) && (Number(table.posX) !== 0 || Number(table.posY) !== 0);

    if (hasCoordinates) {
      return {
        x: Math.max(2, Math.min(86, Number(table.posX))),
        y: Math.max(4, Math.min(88, Number(table.posY))),
        fromCoordinates: true
      };
    }

    const columns = total <= 4 ? 2 : total <= 8 ? 3 : 4;
    const col = index % columns;
    const row = Math.floor(index / columns);
    const xSteps = [8, 31, 54, 77];
    const yStart = 14;
    const yGap = 18;

    return {
      x: xSteps[Math.min(col, xSteps.length - 1)],
      y: yStart + row * yGap,
      fromCoordinates: false
    };
  };

  const renderTableMap = (zoneTables: any[]) => {
    const selectedTableId = getSelectedTableId();
    const total = zoneTables.length;

    return (
      <div className="rounded-[28px] border border-gray-100 bg-gradient-to-b from-white to-gray-50 p-3 md:p-5 shadow-inner">
        <div className="relative overflow-hidden rounded-[24px] border border-gray-100 bg-[linear-gradient(180deg,#ffffff_0%,#f9fafb_100%)]">
          <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="h-[320px] w-full">
            <defs>
              <pattern id="booking-grid" width="10" height="10" patternUnits="userSpaceOnUse">
                <path d="M 10 0 L 0 0 0 10" fill="none" stroke="#e5e7eb" strokeWidth="0.35" opacity="0.55" />
              </pattern>
              <linearGradient id="booking-floor" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="100%" stopColor="#f9fafb" />
              </linearGradient>
            </defs>

            <rect x="0" y="0" width="100" height="100" fill="url(#booking-floor)" />
            <rect x="0" y="0" width="100" height="100" fill="url(#booking-grid)" opacity="0.5" />

            <rect x="4" y="4" width="92" height="10" rx="3" fill="#111827" opacity="0.04" />
            <rect x="4" y="86" width="92" height="10" rx="3" fill="#111827" opacity="0.04" />

            {zoneTables.map((table, index) => {
              const placement = getTablePlacement(table, index, total);
              const tableStatus = normalizeTableStatus(table.status);
              const selected = selectedTableId === table.id;
              const selectable = isSelectableTable(table.status);
              const width = placement.fromCoordinates ? 12 : 15;
              const height = placement.fromCoordinates ? 10 : 11;
              const x = placement.x;
              const y = placement.y;

              const fillClass = selected
                ? "#facc15"
                : tableStatus === "available"
                  ? "#16a34a"
                  : tableStatus === "reserved"
                    ? "#9ca3af"
                    : "#dc2626";

              const textClass = selected ? "#111827" : "#ffffff";
              const strokeClass = selected ? "#d97706" : tableStatus === "available" ? "#15803d" : "#b91c1c";

              return (
                <g
                  key={table.id}
                  transform={`translate(${x}, ${y})`}
                  role="button"
                  tabIndex={selectable ? 0 : -1}
                  aria-label={`${table.tableNumber} - ${getTableStatusLabel(table.status)}`}
                  onClick={() => handleSelectTable(table.id, table.status)}
                  onKeyDown={(e) => {
                    if (!selectable) return;
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      handleSelectTable(table.id, table.status);
                    }
                  }}
                  style={{ cursor: selectable ? "pointer" : "not-allowed", opacity: selectable ? 1 : 0.45 }}
                >
                  <rect
                    x="0"
                    y="0"
                    width={width}
                    height={height}
                    rx="2.5"
                    fill={fillClass}
                    stroke={strokeClass}
                    strokeWidth={selected ? 0.8 : 0.4}
                    style={{ filter: selected ? "drop-shadow(0px 4px 10px rgba(234, 179, 8, 0.45))" : "none" }}
                  />
                  <circle cx={width / 2} cy={2.2} r="0.6" fill="rgba(255,255,255,0.35)" />
                  <text
                    x={width / 2}
                    y={height / 2.2}
                    textAnchor="middle"
                    fill={textClass}
                    fontSize="2.2"
                    fontWeight="900"
                  >
                    {String(table.tableNumber).replace(/^Bàn\s*/i, "")}
                  </text>
                  <text
                    x={width / 2}
                    y={height - 1.8}
                    textAnchor="middle"
                    fill={textClass}
                    fontSize="1.2"
                    fontWeight="700"
                    opacity="0.85"
                  >
                    {table.capacity} chỗ
                  </text>
                </g>
              );
            })}
          </svg>

          <div className="absolute left-3 top-3 flex flex-wrap gap-2">
            <Badge className="bg-green-500 text-white border-none font-black text-[9px] uppercase tracking-widest">Trống</Badge>
            <Badge className="bg-gray-500 text-white border-none font-black text-[9px] uppercase tracking-widest">Đã giữ chỗ</Badge>
            <Badge className="bg-red-500 text-white border-none font-black text-[9px] uppercase tracking-widest">Đang dùng</Badge>
            <Badge className="bg-yellow-100 text-yellow-700 border-none font-black text-[9px] uppercase tracking-widest">Đã chọn</Badge>
          </div>
        </div>
      </div>
    );
  };

  const zoneCards = [
    ...zones.map(zone => ({ id: zone.id, name: zone.name })),
    ...(tables.some(table => !table.zoneId) ? [{ id: "none", name: "Khu vực chung" }] : [])
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.branchId) return alert("Vui lòng chọn chi nhánh");

    setLoading(true);
    try {
      const selectedTableId = getSelectedTableId();
      const dateTime = `${form.bookingDate}T${form.bookingTime}:00Z`;
      const { selectedTableId: _selectedTableId, ...payload } = form;
      await api.post("/bookings", {
        ...payload,
        tableId: selectedTableId || null,
        selectedTableId: selectedTableId || null,
        selected_table_id: selectedTableId || null,
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
      <div className="flex flex-col items-center justify-center py-20 text-center animate-in fade-in zoom-in duration-500">
        <div className="w-24 h-24 bg-orange-50 rounded-full flex items-center justify-center mb-6">
          <CheckCircle2 className="w-12 h-12 text-orange-500" />
        </div>
        <h2 className="text-3xl font-black text-gray-900 mb-4">Đặt bàn thành công!</h2>
        <p className="text-gray-500 font-medium max-w-md mx-auto mb-8 leading-relaxed">
          Yêu cầu của bạn đã được gửi đến nhà hàng. Chúng tôi sẽ liên hệ sớm nhất để xác nhận thông tin.
        </p>
        <div className="flex gap-4">
            <Button onClick={() => setSubmitted(false)} variant="outline" className="rounded-xl h-12 px-8 font-bold border-gray-200">ĐẶT THÊM</Button>
            <Button onClick={() => window.location.href = "/customer"} className="bg-gray-900 rounded-xl h-12 px-8 font-bold">VỀ TRANG CHỦ</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-12">
      <div className="text-center space-y-4">
         <h1 className="text-4xl font-black text-gray-900 tracking-tight uppercase">Đặt Bàn Trước</h1>
         <p className="text-gray-500 font-medium max-w-2xl mx-auto">
            Đặt chỗ ngay hôm nay để có một bữa tiệc hoàn hảo cùng gia đình và bạn bè. Chúng tôi luôn sẵn sàng phục vụ bạn.
         </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="space-y-8">
            <div className="bg-orange-600 rounded-[40px] p-10 text-white relative overflow-hidden group shadow-2xl shadow-orange-100">
                <Calendar className="absolute -right-6 -top-6 w-32 h-32 opacity-10 rotate-12 group-hover:scale-110 transition-transform duration-700" />
                <h3 className="text-2xl font-black mb-4">Lưu ý đặt bàn</h3>
                <ul className="space-y-4">
                    <li className="flex gap-3 text-sm font-medium text-orange-50">
                        <CheckCircle2 className="w-5 h-5 shrink-0" />
                        Vui lòng đặt bàn trước ít nhất 1 giờ.
                    </li>
                    <li className="flex gap-3 text-sm font-medium text-orange-50">
                        <CheckCircle2 className="w-5 h-5 shrink-0" />
                        Bàn sẽ được giữ tối đa 15 phút so với giờ hẹn.
                    </li>
                    <li className="flex gap-3 text-sm font-medium text-orange-50">
                        <CheckCircle2 className="w-5 h-5 shrink-0" />
                        Với đoàn trên 20 khách, vui lòng liên hệ hotline.
                    </li>
                </ul>
                <div className="mt-10 pt-8 border-t border-white/10 flex items-center gap-4">
                    <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center">
                        <Phone className="w-5 h-5" />
                    </div>
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Hotline hỗ trợ</p>
                        <p className="text-lg font-black">1900 123 456</p>
                    </div>
                </div>
            </div>

            <Card className="border-none bg-gray-50 rounded-[32px] p-8">
                <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-gray-400 shrink-0">
                        <Info className="w-5 h-5" />
                    </div>
                    <div>
                        <h4 className="font-black text-gray-900 mb-1">Quy định hủy bàn</h4>
                        <p className="text-sm text-gray-400 font-medium leading-relaxed">
                            Quý khách vui lòng hủy bàn trước ít nhất 30 phút nếu có thay đổi kế hoạch để chúng tôi sắp xếp tốt nhất.
                        </p>
                    </div>
                </div>
            </Card>
        </div>

        <div className="lg:col-span-2">
          <Card className="border-none shadow-xl rounded-[40px] overflow-hidden bg-white">
            <CardHeader className="p-8 md:p-10 pb-0">
               <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center">
                    <Users className="w-5 h-5 text-orange-600" />
                  </div>
                  <CardTitle className="text-2xl font-black">Thông tin đặt bàn</CardTitle>
               </div>
               <CardDescription className="font-medium">Vui lòng điền thông tin bên dưới, nhân viên sẽ liên hệ xác nhận.</CardDescription>
            </CardHeader>
            <CardContent className="p-8 md:p-10">
               <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label className="font-black text-[10px] text-gray-400 uppercase tracking-widest ml-1">Chọn chi nhánh</Label>
                    <Select value={form.branchId} onValueChange={handleBranchChange}>
                        <SelectTrigger className="h-14 rounded-2xl bg-gray-50 border-none font-bold text-gray-900 shadow-none">
                            <SelectValue placeholder="Chọn chi nhánh bạn muốn đặt" />
                        </SelectTrigger>
                        <SelectContent className="rounded-2xl border-none shadow-xl">
                            {branches.map(b => (
                                <SelectItem key={b.id} value={b.id} className="font-bold py-3">{b.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <Label className="font-black text-[10px] text-gray-400 uppercase tracking-widest ml-1">Họ tên khách hàng</Label>
                        <Input
                            required
                            placeholder="Nhập tên của bạn"
                            className="h-14 rounded-2xl bg-gray-50 border-none font-bold text-gray-900"
                            value={form.customerName}
                            onChange={(e: any) => setForm({...form, customerName: e.target.value})}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label className="font-black text-[10px] text-gray-400 uppercase tracking-widest ml-1">Số điện thoại</Label>
                        <Input
                            required
                            placeholder="Nhập số điện thoại"
                            className="h-14 rounded-2xl bg-gray-50 border-none font-bold text-gray-900"
                            value={form.customerPhone}
                            onChange={(e: any) => setForm({...form, customerPhone: e.target.value})}
                        />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                        <Label className="font-black text-[10px] text-gray-400 uppercase tracking-widest ml-1">Ngày đặt</Label>
                        <Input
                            required
                            type="date"
                            min={new Date().toISOString().split('T')[0]}
                            className="h-14 rounded-2xl bg-gray-50 border-none font-bold text-gray-900"
                            value={form.bookingDate}
                            onChange={(e: any) => setForm({...form, bookingDate: e.target.value})}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label className="font-black text-[10px] text-gray-400 uppercase tracking-widest ml-1">Giờ đến</Label>
                        <Input
                            required
                            type="time"
                            className="h-14 rounded-2xl bg-gray-50 border-none font-bold text-gray-900"
                            value={form.bookingTime}
                            onChange={(e: any) => setForm({...form, bookingTime: e.target.value})}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label className="font-black text-[10px] text-gray-400 uppercase tracking-widest ml-1">Số khách</Label>
                        <Input
                            required
                            type="number"
                            min={1}
                            max={50}
                            className="h-14 rounded-2xl bg-gray-50 border-none font-bold text-gray-900"
                            value={form.numberOfGuests}
                            onChange={(e: any) => setForm({...form, numberOfGuests: parseInt(e.target.value)})}
                        />
                    </div>
                  </div>

                  {/* CHỌN VỊ TRÍ BÀN */}
                  <div className="space-y-4 pt-4 border-t border-gray-100">
                      <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                             <div className="w-8 h-8 bg-orange-50 rounded-xl flex items-center justify-center text-orange-600">
                                <Map className="w-4 h-4" />
                             </div>
                             <h4 className="font-black text-gray-900 text-sm uppercase tracking-tight">Chọn bàn trên sơ đồ</h4>
                          </div>
                          <Badge className={`border-none text-[9px] font-black tracking-widest ${
                            getSelectedTableId()
                              ? 'bg-yellow-100 text-yellow-700'
                              : 'bg-orange-100 text-orange-600'
                          }`}>
                            {getSelectedTableId() ? 'ĐÃ CHỌN BÀN' : 'TÙY CHỌN'}
                          </Badge>
                      </div>

                      {loadingTables ? (
                        <div className="py-12 flex flex-col items-center justify-center gap-3 bg-gray-50 rounded-[32px] border-2 border-dashed border-gray-100">
                            <Loader2 className="w-8 h-8 text-orange-600 animate-spin" />
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Đang tải sơ đồ...</p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                            {zoneCards.map(zone => {
                                const zoneTables = tables.filter((table) => zone.id === "none" ? !table.zoneId : table.zoneId === zone.id);
                                const expanded = expandedZones[zone.id] ?? true;

                                return (
                                  <div key={zone.id} className="bg-white rounded-[32px] border border-gray-100 overflow-hidden shadow-sm">
                                      <button
                                          type="button"
                                          onClick={() => toggleZone(zone.id)}
                                          className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                                      >
                                          <div className="flex items-center gap-3">
                                              <Layers className="w-4 h-4 text-orange-600" />
                                              <div className="text-left">
                                                <span className="block font-black text-xs uppercase text-gray-900">{zone.name}</span>
                                                <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest">{zoneTables.length} bàn</span>
                                              </div>
                                          </div>
                                          {expanded ? <ChevronUp className="w-4 h-4 text-gray-300" /> : <ChevronDown className="w-4 h-4 text-gray-300" />}
                                      </button>

                                      {expanded && (
                                          <div className="p-4 md:p-6 pt-0 border-t border-gray-50 animate-in fade-in slide-in-from-top-2">
                                              {zoneTables.length > 0 ? (
                                                renderTableMap(zoneTables)
                                              ) : (
                                                <div className="p-12 text-center bg-gray-50 rounded-[32px] border-2 border-dashed border-gray-100">
                                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest leading-loose">
                                                        Khu vực này chưa có bàn khả dụng.
                                                    </p>
                                                </div>
                                              )}
                                          </div>
                                      )}
                                  </div>
                                );
                            })}

                            {zoneCards.length === 0 && !loadingTables && (
                                <div className="p-12 text-center bg-gray-50 rounded-[32px] border-2 border-dashed border-gray-100">
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest leading-loose">
                                        Chi nhánh này chưa thiết lập sơ đồ bàn.<br/>
                                        Bạn có thể bỏ qua phần chọn bàn này.
                                    </p>
                                </div>
                            )}
                        </div>
                      )}

                      <input type="hidden" name="selected_table_id" value={getSelectedTableId()} />
                      <input type="hidden" name="tableId" value={getSelectedTableId()} />

                      {getSelectedTableId() && (
                        <div className="flex items-center justify-between rounded-[24px] border border-yellow-100 bg-yellow-50 px-4 py-3">
                          <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-yellow-700">Bàn đã chọn</p>
                            <p className="font-black text-gray-900">{getSelectedTableLabel()}</p>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            onClick={() => setForm(prev => ({ ...prev, tableId: "", selectedTableId: "" }))}
                            className="h-10 rounded-xl font-black text-yellow-700 hover:bg-yellow-100"
                          >
                            Bỏ chọn
                          </Button>
                        </div>
                      )}
                  </div>

                  <div className="space-y-2">
                    <Label className="font-black text-[10px] text-gray-400 uppercase tracking-widest ml-1">Ghi chú thêm</Label>
                    <Textarea
                        rows={3}
                        placeholder="Yêu cầu đặc biệt về vị trí, món ăn..."
                        className="rounded-2xl bg-gray-50 border-none font-medium text-gray-900 p-4"
                        value={form.notes}
                        onChange={(e: any) => setForm({...form, notes: e.target.value})}
                    />
                  </div>

                  <Button
                    disabled={loading || !form.branchId}
                    className="w-full h-16 bg-orange-600 hover:bg-orange-700 text-white font-black text-lg rounded-2xl shadow-xl shadow-orange-100 gap-3 uppercase tracking-wider"
                  >
                    {loading ? <Loader2 className="animate-spin" /> : "XÁC NHẬN ĐẶT BÀN NGAY"}
                  </Button>
               </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
