import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Button } from "../components/ui/button";
import { Switch } from "../components/ui/switch";
import { QrCode, Loader2, Save } from "lucide-react";
import api from "../services/api";

export function OwnerPayments() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [config, setConfig] = useState({
    bankCode: "Vietcombank",
    accountNumber: "",
    accountName: ""
  });

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const res = await api.get("/payments/config");
        if (res.data) setConfig(res.data);
      } catch (err) {
        console.error("Chưa có cấu hình thanh toán");
      } finally {
        setLoading(false);
      }
    };
    fetchConfig();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.post("/payments/config", config);
      alert("Đã lưu cấu hình thanh toán thành công!");
    } catch (err) {
      alert("Lỗi khi lưu cấu hình");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex justify-center p-20"><Loader2 className="animate-spin text-orange-600" /></div>;

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="mb-8">
        <h1 className="text-2xl font-black text-gray-900">Cấu hình thanh toán</h1>
        <p className="text-gray-600 mt-1">Thiết lập tài khoản ngân hàng để nhận tiền qua VietQR</p>
      </div>

      <div className="grid gap-6 max-w-2xl">
        <Card className="border-none shadow-sm overflow-hidden">
          <div className="h-2 bg-orange-600 w-full"></div>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
                <QrCode className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <CardTitle className="text-lg">Tích hợp VietQR</CardTitle>
                <CardDescription>Khách hàng sẽ quét mã để chuyển khoản trực tiếp</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="flex items-center justify-between p-4 bg-orange-50 rounded-xl">
              <div>
                <Label className="font-bold">Kích hoạt VietQR</Label>
                <p className="text-xs text-gray-500">Tự động sinh mã QR theo từng đơn hàng</p>
              </div>
              <Switch defaultChecked />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bankName" className="text-gray-700 font-bold">Tên ngân hàng (Hoặc mã ngân hàng)</Label>
              <Input
                id="bankName"
                className="text-gray-900 border-gray-300 focus:border-orange-500"
                placeholder="Vd: VCB, MB, Techcombank"
                value={config.bankCode}
                onChange={(e: any) => setConfig({...config, bankCode: e.target.value})}
              />
              <p className="text-xs text-gray-400">Dùng mã viết tắt (VCB, ICB, v.v) để chính xác nhất</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="accountNumber" className="text-gray-700 font-bold">Số tài khoản</Label>
              <Input
                id="accountNumber"
                className="text-gray-900 border-gray-300 focus:border-orange-500"
                placeholder="Vd: 123456789"
                value={config.accountNumber}
                onChange={(e: any) => setConfig({...config, accountNumber: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="accountName" className="text-gray-700 font-bold">Tên chủ tài khoản (Viết không dấu)</Label>
              <Input
                id="accountName"
                className="text-gray-900 border-gray-300 focus:border-orange-500"
                placeholder="Vd: NGUYEN VAN A"
                value={config.accountName}
                onChange={(e: any) => setConfig({...config, accountName: e.target.value})}
              />
            </div>

            <Button
                onClick={handleSave}
                disabled={saving}
                className="w-full bg-orange-600 hover:bg-orange-700 h-12 font-bold gap-2"
            >
              {saving ? <Loader2 className="animate-spin w-4 h-4" /> : <Save className="w-4 h-4" />}
              Lưu cấu hình
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
