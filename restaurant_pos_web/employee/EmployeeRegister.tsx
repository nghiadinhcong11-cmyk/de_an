import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Label } from "../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Badge } from "../components/ui/badge";
import { Search, CheckCircle, ChefHat } from "lucide-react";
import { mockRestaurant, mockBranches } from "../data/mockData";

type Step = "info" | "restaurant" | "done";

export function EmployeeRegister() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>("info");

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    role: "",
  });

  const [restaurantId, setRestaurantId] = useState("");
  const [restaurantFound, setRestaurantFound] = useState(false);
  const [restaurantError, setRestaurantError] = useState("");
  const [selectedBranch, setSelectedBranch] = useState("");

  const handleInfoNext = (e: React.FormEvent) => {
    e.preventDefault();
    setStep("restaurant");
  };

  const handleLookup = () => {
    setRestaurantError("");
    setRestaurantFound(false);
    if (restaurantId.trim().toUpperCase() === mockRestaurant.id.toUpperCase()) {
      setRestaurantFound(true);
    } else {
      setRestaurantError("Không tìm thấy quán với ID này. Vui lòng kiểm tra lại.");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep("done");
  };

  if (step === "done") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <CardContent className="pt-10 pb-8 flex flex-col items-center gap-4">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <h2 className="text-xl font-bold">Yêu cầu đã được gửi!</h2>
            <p className="text-gray-500 text-sm leading-relaxed">
              Yêu cầu tham gia <strong>{mockRestaurant.name}</strong> của bạn đã được gửi đến chủ quán.
              <br />
              Bạn sẽ nhận được thông báo sau khi được duyệt.
            </p>
            <Button className="w-full mt-2 bg-orange-600 hover:bg-orange-700" onClick={() => navigate("/login")}>
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
        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-600 rounded-2xl mb-3 shadow-lg">
            <ChefHat className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold">Đăng ký nhân viên</h1>
          <p className="text-gray-600 text-sm mt-1">Tạo tài khoản và xin vào làm tại quán</p>
        </div>

        {/* Step indicator */}
        <div className="flex items-center gap-2 mb-6">
          {(["info", "restaurant"] as Step[]).map((s, i) => (
            <div key={s} className="flex items-center gap-2 flex-1">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                  step === s
                    ? "bg-orange-600 text-white"
                    : i < (step === "restaurant" ? 1 : 0)
                    ? "bg-green-500 text-white"
                    : "bg-gray-200 text-gray-500"
                }`}
              >
                {i < (step === "restaurant" ? 1 : 0) ? "✓" : i + 1}
              </div>
              <span className={`text-xs ${step === s ? "text-orange-600 font-bold" : "text-gray-400"}`}>
                {s === "info" ? "Thông tin cá nhân" : "Chọn quán"}
              </span>
              {i === 0 && <div className="flex-1 h-px bg-gray-200" />}
            </div>
          ))}
        </div>

        <Card>
          {step === "info" && (
            <>
              <CardHeader>
                <CardTitle>Thông tin cá nhân</CardTitle>
                <CardDescription>Điền thông tin cơ bản của bạn</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleInfoNext} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Họ và tên *</Label>
                    <Input
                      id="name"
                      required
                      value={form.name}
                      onChange={(e: any) => setForm({ ...form, name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input id="email" type="email" required />
                  </div>
                  <div className="space-y-2">
                    <Label>Vị trí ứng tuyển *</Label>
                    <Select onValueChange={(v: any) => setForm({ ...form, role: v })}>
                      <SelectTrigger><SelectValue placeholder="Chọn vị trí" /></SelectTrigger>
                      <SelectContent onValueChange={() => {}}>
                        <SelectItem value="manager">Quản lý</SelectItem>
                        <SelectItem value="cashier">Thu ngân</SelectItem>
                        <SelectItem value="waiter">Phục vụ</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button type="submit" className="w-full bg-orange-600 hover:bg-orange-700">
                    Tiếp theo →
                  </Button>
                </form>
              </CardContent>
            </>
          )}

          {step === "restaurant" && (
            <>
              <CardHeader>
                <CardTitle>Chọn quán & cơ sở</CardTitle>
                <CardDescription>Nhập ID quán do chủ quán cung cấp</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="restaurantId">ID Quán *</Label>
                    <div className="flex gap-2">
                      <Input
                        id="restaurantId"
                        value={restaurantId}
                        onChange={(e: any) => setRestaurantId(e.target.value)}
                      />
                      <Button type="button" variant="outline" onClick={handleLookup} className="shrink-0 border-orange-200 text-orange-700">
                        Tìm
                      </Button>
                    </div>
                  </div>
                  {restaurantFound && (
                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 flex items-start gap-3">
                      <div className="text-2xl">{mockRestaurant.logo}</div>
                      <div>
                        <div className="font-bold text-orange-800">{mockRestaurant.name}</div>
                        <div className="text-sm text-orange-600">{mockRestaurant.address}</div>
                      </div>
                    </div>
                  )}
                  <Button type="submit" className="w-full bg-orange-600 hover:bg-orange-700" disabled={!restaurantFound}>
                    Gửi yêu cầu
                  </Button>
                </form>
              </CardContent>
            </>
          )}
        </Card>
      </div>
    </div>
  );
}
