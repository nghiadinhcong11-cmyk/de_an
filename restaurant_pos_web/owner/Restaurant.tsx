import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Button } from "../components/ui/button";
import { Loader2, Save, Store, Copy, CheckCircle2 } from "lucide-react";
import api from "../services/api";

export function OwnerRestaurant() {
  const [restaurant, setRestaurant] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchRestaurant = async () => {
      try {
        const res = await api.get("/restaurants/my-restaurant");
        setRestaurant(res.data);
      } finally {
        setLoading(false);
      }
    };
    fetchRestaurant();
  }, []);

  const handleCopy = () => {
    navigator.clipboard.writeText(restaurant.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put("/restaurants", restaurant);
      alert("Cập nhật thông tin thành công!");
    } catch (err) {
      alert("Lỗi khi lưu thông tin");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex justify-center p-20"><Loader2 className="animate-spin text-orange-600" /></div>;

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="mb-8">
        <h1 className="text-2xl font-black text-gray-900 uppercase tracking-tight">Thiết lập nhà hàng</h1>
        <p className="text-gray-500 font-medium">Quản lý thương hiệu và thông tin liên lạc hệ thống</p>
      </div>

      <div className="grid gap-6 max-w-2xl">
        <Card className="border-none shadow-xl rounded-[32px] overflow-hidden bg-white">
          <div className="h-2 bg-orange-600 w-full"></div>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-3">
               <div className="w-12 h-12 bg-orange-100 rounded-2xl flex items-center justify-center text-orange-600 shadow-inner">
                  <Store className="w-6 h-6" />
               </div>
               <div>
                  <CardTitle className="text-xl font-black uppercase tracking-tight text-gray-900">Thông tin cơ bản</CardTitle>
                  <CardDescription className="text-xs font-bold text-gray-400 uppercase tracking-widest">Brand configuration</CardDescription>
               </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6 pt-6 text-gray-900">
            <div className="space-y-2">
              <Label className="text-xs font-black uppercase text-gray-400 tracking-wider ml-1">Mã định danh nhà hàng (Dành cho nhân viên)</Label>
              <div className="relative group">
                <Input
                  value={restaurant.id}
                  readOnly
                  className="bg-gray-50 font-mono text-orange-600 font-black h-14 rounded-2xl border-gray-100 pr-12 focus:ring-orange-500 text-center tracking-widest text-lg"
                />
                <button
                  onClick={handleCopy}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-2 hover:bg-orange-100 text-gray-500 hover:text-orange-600 rounded-xl transition-all shadow-sm bg-white border border-gray-100"
                  title="Sao chép mã"
                >
                  {copied ? <CheckCircle2 className="w-5 h-5 text-green-500" /> : <Copy className="w-5 h-5" />}
                </button>
              </div>
              <p className="text-[10px] font-bold text-gray-400 uppercase ml-1">Nhân viên cần mã này để đăng ký tài khoản vào hệ thống của bạn</p>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-black uppercase text-gray-400 tracking-wider ml-1">Tên thương hiệu</Label>
              <Input
                className="h-14 rounded-2xl border-gray-100 text-gray-900 font-bold focus:border-orange-500 transition-all"
                placeholder="NHẬP TÊN NHÀ HÀNG"
                value={restaurant.name}
                onChange={(e: any) => setRestaurant({ ...restaurant, name: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-black uppercase text-gray-400 tracking-wider ml-1">Địa chỉ trụ sở chính</Label>
              <Input
                className="h-14 rounded-2xl border-gray-100 text-gray-900 font-bold focus:border-orange-500 transition-all"
                placeholder="ĐỊA CHỈ"
                value={restaurant.address || ''}
                onChange={(e: any) => setRestaurant({ ...restaurant, address: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-xs font-black uppercase text-gray-400 tracking-wider ml-1">Hotline liên hệ</Label>
                <Input
                  className="h-14 rounded-2xl border-gray-100 text-gray-900 font-bold focus:border-orange-500 transition-all"
                  placeholder="SỐ ĐIỆN THOẠI"
                  value={restaurant.contactPhone || ''}
                  onChange={(e: any) => setRestaurant({ ...restaurant, contactPhone: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-black uppercase text-gray-400 tracking-wider ml-1">Email quản trị</Label>
                <Input
                  type="email"
                  className="h-14 rounded-2xl border-gray-100 text-gray-900 font-bold focus:border-orange-500 transition-all"
                  placeholder="EMAIL"
                  value={restaurant.contactEmail || ''}
                  onChange={(e: any) => setRestaurant({ ...restaurant, contactEmail: e.target.value })}
                />
              </div>
            </div>

            <Button
                onClick={handleSave}
                disabled={saving}
                className="w-full bg-orange-600 hover:bg-orange-700 h-16 rounded-2xl font-black uppercase tracking-widest gap-3 shadow-lg shadow-orange-200 transition-all active:scale-95"
            >
              {saving ? <Loader2 className="animate-spin w-6 h-6" /> : <Save className="w-6 h-6" />}
              Lưu thay đổi hệ thống
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
