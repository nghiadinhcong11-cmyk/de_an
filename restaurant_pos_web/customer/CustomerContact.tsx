import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { MapPin, Phone, Mail, Send, CheckCircle2, Loader2, MessageSquare, Heart } from "lucide-react";

export function CustomerContact() {
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "Góp ý chất lượng món ăn",
    message: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/feedbacks", form);
      setSubmitted(true);
    } catch (err) {
      alert("Lỗi khi gửi góp ý. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center animate-in fade-in zoom-in duration-500">
        <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mb-6">
          <CheckCircle2 className="w-12 h-12 text-green-500" />
        </div>
        <h2 className="text-3xl font-black text-gray-900 mb-4">Cảm ơn bạn đã góp ý!</h2>
        <p className="text-gray-500 font-medium max-w-md mx-auto mb-8 leading-relaxed">
          Ý kiến của bạn là món quà quý giá giúp chúng tôi hoàn thiện dịch vụ mỗi ngày. Chúng tôi sẽ phản hồi sớm nhất qua email của bạn.
        </p>
        <Button onClick={() => setSubmitted(false)} className="bg-gray-900 rounded-xl h-12 px-8 font-bold">GỬI THÊM Ý KIẾN</Button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-12">
      <div className="text-center space-y-4">
         <h1 className="text-4xl font-black text-gray-900 tracking-tight">Liên hệ & Góp ý</h1>
         <p className="text-gray-500 font-medium max-w-2xl mx-auto">
            Chúng tôi luôn lắng nghe để cải thiện chất lượng món ăn và dịch vụ. Hãy chia sẻ trải nghiệm của bạn với chúng tôi.
         </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Thông tin liên hệ */}
        <div className="space-y-6">
           <ContactInfoCard
                icon={<MapPin className="text-orange-600" />}
                title="Địa chỉ"
                detail="123 Đường Ẩm Thực, Quận 1, TP. Hồ Chí Minh"
           />
           <ContactInfoCard
                icon={<Phone className="text-blue-600" />}
                title="Hotline"
                detail="1900 123 456"
           />
           <ContactInfoCard
                icon={<Mail className="text-purple-600" />}
                title="Email"
                detail="support@restaurantpos.com"
           />

           <div className="bg-orange-600 p-8 rounded-[32px] text-white space-y-4 relative overflow-hidden group">
              <Heart className="absolute -right-4 -bottom-4 w-32 h-32 opacity-10 group-hover:scale-110 transition-transform duration-700" />
              <h4 className="font-black text-xl">Thành viên thân thiết?</h4>
              <p className="text-white/80 text-sm font-medium leading-relaxed">
                Đăng nhập để nhận ưu đãi đặc biệt và theo dõi lịch sử tích điểm của bạn ngay hôm nay.
              </p>
              <Button className="bg-white text-orange-600 font-bold hover:bg-orange-50 rounded-xl">ĐĂNG NHẬP NGAY</Button>
           </div>
        </div>

        {/* Form Góp ý */}
        <div className="lg:col-span-2">
          <Card className="border-none shadow-xl rounded-[40px] overflow-hidden bg-white">
            <CardHeader className="p-8 md:p-10 pb-0">
               <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center">
                    <MessageSquare className="w-5 h-5 text-gray-900" />
                  </div>
                  <CardTitle className="text-2xl font-black">Gửi lời nhắn cho chúng tôi</CardTitle>
               </div>
               <CardDescription className="font-medium">Vui lòng điền thông tin bên dưới, chúng tôi sẽ tiếp nhận ngay.</CardDescription>
            </CardHeader>
            <CardContent className="p-8 md:p-10">
               <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <Label className="font-black text-[10px] text-gray-400 uppercase tracking-widest ml-1">Họ và tên</Label>
                        <Input
                            required
                            placeholder="Vd: Nguyễn Văn A"
                            className="h-14 rounded-2xl bg-gray-50 border-none font-bold text-gray-900"
                            value={form.name}
                            onChange={(e: any) => setForm({...form, name: e.target.value})}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label className="font-black text-[10px] text-gray-400 uppercase tracking-widest ml-1">Địa chỉ Email</Label>
                        <Input
                            required
                            type="email"
                            placeholder="name@gmail.com"
                            className="h-14 rounded-2xl bg-gray-50 border-none font-bold text-gray-900"
                            value={form.email}
                            onChange={(e: any) => setForm({...form, email: e.target.value})}
                        />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="font-black text-[10px] text-gray-400 uppercase tracking-widest ml-1">Chủ đề</Label>
                    <select
                        className="w-full h-14 rounded-2xl bg-gray-50 border-none font-bold text-gray-900 px-4 focus:ring-2 focus:ring-orange-500 outline-none appearance-none"
                        value={form.subject}
                        onChange={(e: any) => setForm({...form, subject: e.target.value})}
                    >
                        <option>Góp ý chất lượng món ăn</option>
                        <option>Phản hồi về thái độ phục vụ</option>
                        <option>Báo lỗi ứng dụng/web</option>
                        <option>Yêu cầu đặt tiệc/hợp tác</option>
                        <option>Khác</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label className="font-black text-[10px] text-gray-400 uppercase tracking-widest ml-1">Nội dung chi tiết</Label>
                    <Textarea
                        required
                        rows={5}
                        placeholder="Hãy chia sẻ ý kiến của bạn..."
                        className="rounded-2xl bg-gray-50 border-none font-medium text-gray-900 p-4"
                        value={form.message}
                        onChange={(e: any) => setForm({...form, message: e.target.value})}
                    />
                  </div>

                  <Button
                    disabled={loading}
                    className="w-full h-16 bg-gray-900 hover:bg-black text-white font-black text-lg rounded-2xl shadow-xl shadow-gray-100 gap-3 uppercase tracking-wider"
                  >
                    {loading ? <Loader2 className="animate-spin" /> : <><Send className="w-5 h-5" /> Gửi lời nhắn ngay</>}
                  </Button>
               </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function ContactInfoCard({ icon, title, detail }: any) {
    return (
        <Card className="border-none shadow-sm bg-white rounded-3xl p-6 flex items-center gap-6">
            <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center shrink-0">
                {icon}
            </div>
            <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{title}</p>
                <p className="font-bold text-gray-900 leading-tight">{detail}</p>
            </div>
        </Card>
    );
}
