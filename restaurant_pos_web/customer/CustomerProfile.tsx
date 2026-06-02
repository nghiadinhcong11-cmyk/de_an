import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Avatar, AvatarFallback } from "../components/ui/avatar";
import { Badge } from "../components/ui/badge";
import { Star, Gift, User, Settings, LogOut } from "lucide-react";

export function CustomerProfile() {
  return (
    <div className="pb-24">
      {/* Header */}
      <div className="bg-gradient-to-br from-orange-500 to-orange-700 text-white p-6 pt-10 rounded-b-3xl shadow-lg">
        <div className="flex items-center gap-4">
          <Avatar className="w-20 h-20 border-4 border-white/30 shadow-xl">
            <AvatarFallback className="bg-white text-orange-600 text-2xl font-bold">AC</AvatarFallback>
          </Avatar>
          <div>
            <h2 className="text-2xl font-bold text-white">Alice Cooper</h2>
            <p className="text-white/80 text-sm italic">Thành viên từ 05/2025</p>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4 -mt-4">
        {/* Loyalty Points */}
        <Card className="border-none shadow-xl bg-white overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Star className="w-6 h-6 text-yellow-500 fill-current" />
                <h3 className="font-bold text-gray-900">Điểm tích lũy</h3>
              </div>
              <Badge className="bg-orange-600 font-bold px-3">Hạng Vàng</Badge>
            </div>
            <div className="text-5xl font-black text-orange-600 mb-2">450</div>
            <div className="text-xs text-gray-500 mb-4">
              Cần thêm <span className="font-bold text-orange-600">50 điểm</span> nữa để nhận quà!
            </div>
            <div className="bg-gray-100 rounded-full h-3 overflow-hidden border border-gray-100">
              <div className="bg-gradient-to-r from-orange-400 to-orange-600 h-full rounded-full shadow-inner" style={{ width: "90%" }} />
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="border-none shadow-sm text-center py-2">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-gray-900 mb-1">23</div>
              <div className="text-xs text-gray-500 uppercase font-bold tracking-wider">Đơn hàng</div>
            </CardContent>
          </Card>
          <Card className="border-none shadow-sm text-center py-2">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-orange-600 mb-1">$523</div>
              <div className="text-xs text-gray-500 uppercase font-bold tracking-wider">Tổng chi</div>
            </CardContent>
          </Card>
        </div>

        {/* Available Vouchers */}
        <div>
          <h3 className="font-bold text-gray-900 mb-3 px-1">Ưu đãi của tôi</h3>
          <div className="space-y-3">
            <div className="bg-gradient-to-r from-orange-50 to-orange-100 border-2 border-orange-200 rounded-2xl p-4 relative overflow-hidden group">
              <div className="absolute -right-4 -bottom-4 text-orange-200/50 rotate-12 transition-transform group-hover:scale-110">
                <Gift className="w-24 h-24" />
              </div>
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-2">
                  <code className="bg-white px-3 py-1 rounded-lg font-black text-orange-600 shadow-sm">
                    WELCOME10
                  </code>
                  <Badge className="bg-green-500 text-[10px]">Sẵn dụng</Badge>
                </div>
                <div className="font-bold text-orange-900">Giảm 10% tổng đơn hàng</div>
                <div className="text-[10px] text-orange-600/70 mt-1 font-medium italic">Hết hạn: 31/12/2026</div>
              </div>
            </div>
          </div>
        </div>

        {/* Account Information */}
        <Card className="border-none shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base font-bold">
              <User className="w-4 h-4 text-orange-600" />
              Thông tin cá nhân
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="name" className="text-xs font-bold text-gray-400">Họ và tên</Label>
              <Input id="name" defaultValue="Alice Cooper" className="bg-gray-50 border-none h-11" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="phone" className="text-xs font-bold text-gray-400">Số điện thoại</Label>
              <Input id="phone" defaultValue="+84 901 234 567" className="bg-gray-50 border-none h-11" />
            </div>
            <Button className="w-full bg-orange-600 h-11 font-bold">Cập nhật thông tin</Button>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="space-y-3 pt-2">
          <Button variant="outline" className="w-full justify-start gap-3 h-12 border-gray-100 bg-white shadow-sm font-bold text-gray-700">
            <Settings className="w-5 h-5 text-gray-400" />
            Cài đặt ứng dụng
          </Button>
          <Button variant="outline" className="w-full justify-start gap-3 h-12 border-red-50 bg-white shadow-sm font-bold text-red-500 hover:bg-red-50 hover:text-red-600">
            <LogOut className="w-5 h-5" />
            Đăng xuất
          </Button>
        </div>
      </div>
    </div>
  );
}
