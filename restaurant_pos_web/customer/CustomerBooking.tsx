import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { Calendar, Users, Clock, Loader2, CheckCircle2, MapPin, Phone, Info } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import api from "../services/api";

export function CustomerBooking() {
  const [loading, setLoading] = useState(false);
  const [branches, setBranches] = useState<any[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const [form, setForm] = useState({
    branchId: "",
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.branchId) return alert("Vui lòng chọn chi nhánh");

    setLoading(true);
    try {
      const dateTime = `${form.bookingDate}T${form.bookingTime}:00Z`;
      await api.post("/bookings", {
        ...form,
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
                    <Select value={form.branchId} onValueChange={(v) => setForm({...form, branchId: v})}>
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
