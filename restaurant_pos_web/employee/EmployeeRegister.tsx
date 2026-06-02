import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { authApi } from "../services/authApi";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Label } from "../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Badge } from "../components/ui/badge";
import { Search, CheckCircle, ChefHat, Loader2 } from "lucide-react";
import api from "../services/api";

type Step = "info" | "restaurant" | "done";

export function EmployeeRegister() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>("info");
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    fullName: "",
    username: "",
    password: "",
    roleName: "Waiter",
    restaurantId: "",
  });

  const [restaurantData, setRestaurantFound] = useState<any>(null);
  const [restaurantError, setRestaurantError] = useState("");

  const handleLookup = async () => {
    setRestaurantError("");
    setRestaurantFound(null);
    try {
      const res = await api.get(`/auth/find-restaurant/${form.restaurantId}`);
      setRestaurantFound(res.data);
    } catch (err) {
      setRestaurantError("Không tìm thấy quán với ID này.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authApi.registerEmployee(form);
      setStep("done");
    } catch (err) {
      alert("Đăng ký thất bại");
    } finally {
      setLoading(false);
    }
  };

  if (step === "done") {
    return (
      <div className="min-h-screen bg-orange-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center shadow-xl">
          <CardContent className="pt-10 pb-8 flex flex-col items-center gap-4">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <h2 className="text-xl font-bold">Yêu cầu đã được gửi!</h2>
            <p className="text-gray-500 text-sm">
              Yêu cầu tham gia của bạn đã được gửi đến chủ quán. <br/> Hãy chờ thông báo duyệt.
            </p>
            <Button className="w-full mt-2 bg-orange-600" onClick={() => navigate("/login")}>
              Về trang đăng nhập
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-600 rounded-2xl mb-3 shadow-lg">
            <ChefHat className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold">Đăng ký nhân viên</h1>
          <p className="text-gray-600 text-sm mt-1">Gia nhập đội ngũ nhà hàng thông minh</p>
        </div>

        <Card className="shadow-2xl border-none">
          {step === "info" && (
            <>
              <CardHeader>
                <CardTitle>Thông tin cá nhân</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Họ và tên</Label>
                  <Input required value={form.fullName} onChange={(e: any) => setForm({ ...form, fullName: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Tên đăng nhập</Label>
                  <Input required value={form.username} onChange={(e: any) => setForm({ ...form, username: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Mật khẩu</Label>
                  <Input type="password" required value={form.password} onChange={(e: any) => setForm({ ...form, password: e.target.value })} />
                </div>
                <Button className="w-full bg-orange-600" onClick={() => setStep("restaurant")}>Tiếp theo →</Button>
              </CardContent>
            </>
          )}

          {step === "restaurant" && (
            <>
              <CardHeader>
                <CardTitle>Chọn quán</CardTitle>
                <CardDescription>Nhập ID nhà hàng do chủ quán cung cấp</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Mã số nhà hàng (ID)</Label>
                  <div className="flex gap-2">
                    <Input value={form.restaurantId} onChange={(e: any) => setForm({ ...form, restaurantId: e.target.value })} />
                    <Button variant="outline" onClick={handleLookup} className="border-orange-200 text-orange-600"><Search className="w-4 h-4" /></Button>
                  </div>
                </div>

                {restaurantError && <p className="text-xs text-red-500">{restaurantError}</p>}

                <Button
                    disabled={loading}
                    className="w-full bg-orange-600"
                    onClick={handleSubmit}
                >
                  {loading ? <Loader2 className="animate-spin" /> : "Gửi yêu cầu gia nhập"}
                </Button>
                <Button variant="ghost" className="w-full" onClick={() => setStep("info")}>Quay lại</Button>
              </CardContent>
            </>
          )}
        </Card>
      </div>
    </div>
  );
}
