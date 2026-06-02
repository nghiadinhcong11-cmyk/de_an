import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Button } from "../components/ui/button";
import { Loader2, Save, Store } from "lucide-react";
import api from "../services/api";

export function OwnerRestaurant() {
  const [restaurant, setRestaurant] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

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
        <h1 className="text-2xl font-black text-gray-900">Thiết lập nhà hàng</h1>
        <p className="text-gray-600 mt-1">Quản lý thương hiệu và thông tin liên hệ</p>
      </div>

      <div className="grid gap-6 max-w-2xl">
        <Card className="border-none shadow-sm overflow-hidden">
          <div className="h-2 bg-orange-600 w-full"></div>
          <CardHeader>
            <div className="flex items-center gap-3">
               <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
                  <Store className="text-orange-600" />
               </div>
               <CardTitle className="text-lg">Thông tin cơ bản</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="font-bold">Mã nhà hàng (ID để nhân viên đăng ký)</Label>
              <Input value={restaurant.id} readOnly className="bg-gray-100 font-mono text-orange-600 font-bold" />
            </div>

            <div className="space-y-2">
              <Label className="font-bold">Tên nhà hàng</Label>
              <Input
                value={restaurant.name}
                onChange={(e: any) => setRestaurant({ ...restaurant, name: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label className="font-bold">Địa chỉ trụ sở</Label>
              <Input
                value={restaurant.address || ''}
                onChange={(e: any) => setRestaurant({ ...restaurant, address: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="font-bold">Số điện thoại</Label>
                <Input
                  value={restaurant.contactPhone || ''}
                  onChange={(e: any) => setRestaurant({ ...restaurant, contactPhone: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label className="font-bold">Email</Label>
                <Input
                  type="email"
                  value={restaurant.contactEmail || ''}
                  onChange={(e: any) => setRestaurant({ ...restaurant, contactEmail: e.target.value })}
                />
              </div>
            </div>

            <Button onClick={handleSave} disabled={saving} className="w-full bg-orange-600 hover:bg-orange-700 h-12 font-bold gap-2">
              {saving ? <Loader2 className="animate-spin w-4 h-4" /> : <Save className="w-4 h-4" />}
              Lưu thay đổi
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
