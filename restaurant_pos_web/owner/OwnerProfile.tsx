import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Avatar, AvatarFallback } from "../components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "../components/ui/dialog";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Loader2, Edit2, Camera, ShieldCheck, Mail, Phone, UserCircle } from "lucide-react";
import api from "../services/api";

export function OwnerProfile() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Edit state
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    fullName: "",
    email: "",
    phoneNumber: "",
    avatarUrl: ""
  });
  const [updating, setUpdating] = useState(false);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await api.get("/users/me");
      setProfile(res.data);
      setEditForm({
        fullName: res.data.fullName || "",
        email: res.data.email || "",
        phoneNumber: res.data.phoneNumber || "",
        avatarUrl: res.data.avatarUrl || ""
      });

      // Đồng bộ localStorage
      const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
      localStorage.setItem("user", JSON.stringify({
        ...currentUser,
        fullName: res.data.fullName,
        avatarUrl: res.data.avatarUrl
      }));

    } catch (err) {
      console.error("Lỗi tải thông tin cá nhân");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProfile(); }, []);

  const handleUpdate = async () => {
    setUpdating(true);
    try {
      await api.put("/users/me", editForm);
      await fetchProfile();
      setIsEditDialogOpen(false);
    } catch (err) {
      alert("Lỗi khi cập nhật thông tin");
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return <div className="flex justify-center p-20"><Loader2 className="animate-spin text-orange-600" /></div>;

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-gray-900 tracking-tight">Hồ sơ cá nhân</h1>
        <p className="text-gray-500 font-medium">Quản lý thông tin tài khoản và định danh của bạn</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* CỘT TRÁI: AVATAR & QUICK INFO */}
        <div className="space-y-6">
          <Card className="border-none shadow-xl overflow-hidden rounded-[32px] bg-white">
            <div className="h-24 bg-gradient-to-r from-orange-500 to-orange-600"></div>
            <CardContent className="px-6 pb-8 -mt-12 text-center">
              <div className="relative inline-block mb-4">
                <Avatar className="w-24 h-24 border-4 border-white shadow-lg ring-1 ring-black/5">
                  {profile?.avatarUrl ? (
                    <img src={profile.avatarUrl} alt={profile.fullName} className="aspect-square h-full w-full object-cover" />
                  ) : (
                    <AvatarFallback className="bg-orange-50 text-orange-600 font-black text-3xl uppercase">
                      {profile?.fullName?.charAt(0)}
                    </AvatarFallback>
                  )}
                </Avatar>
                <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                    <DialogTrigger onClick={() => setIsEditDialogOpen(true)}>
                        <button className="absolute bottom-0 right-0 w-8 h-8 bg-gray-900 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-orange-600 transition-colors border-2 border-white">
                            <Camera className="w-4 h-4" />
                        </button>
                    </DialogTrigger>
                </Dialog>
              </div>
              <h2 className="text-xl font-black text-gray-900 leading-tight">{profile?.fullName}</h2>
              <p className="text-xs font-bold text-orange-600 uppercase tracking-widest mt-1">Chủ nhà hàng</p>

              <div className="mt-8 pt-8 border-t border-gray-50 space-y-4">
                 <div className="flex items-center gap-3 text-sm font-medium text-gray-600">
                    <UserCircle className="w-4 h-4 text-gray-400" /> @{profile?.username}
                 </div>
                 <div className="flex items-center gap-3 text-sm font-medium text-gray-600 text-left">
                    <ShieldCheck className="w-4 h-4 text-green-500" />
                    <span>Tài khoản đã xác thực</span>
                 </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* CỘT PHẢI: DETAILED INFO */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-none shadow-sm rounded-[32px] bg-white">
             <CardHeader className="px-8 pt-8 flex flex-row items-center justify-between">
                <div>
                   <CardTitle className="text-xl font-black">Thông tin tài khoản</CardTitle>
                   <CardDescription className="font-medium">Thông tin dùng để liên hệ và quản lý hệ thống</CardDescription>
                </div>
                <Button
                    variant="outline"
                    onClick={() => setIsEditDialogOpen(true)}
                    className="rounded-xl border-orange-100 text-orange-600 hover:bg-orange-50 font-bold gap-2"
                >
                    <Edit2 className="w-4 h-4" /> Chỉnh sửa
                </Button>
             </CardHeader>
             <CardContent className="px-8 pb-8 space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                   <div className="space-y-1.5">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Họ và tên</p>
                      <p className="text-lg font-bold text-gray-900">{profile?.fullName}</p>
                   </div>
                   <div className="space-y-1.5">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Email liên hệ</p>
                      <div className="flex items-center gap-2 text-lg font-bold text-gray-900">
                        <Mail className="w-4 h-4 text-gray-300" /> {profile?.email || "Chưa cập nhật"}
                      </div>
                   </div>
                   <div className="space-y-1.5">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Số điện thoại</p>
                      <div className="flex items-center gap-2 text-lg font-bold text-gray-900">
                        <Phone className="w-4 h-4 text-gray-300" /> {profile?.phoneNumber || "Chưa cập nhật"}
                      </div>
                   </div>
                   <div className="space-y-1.5">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Cơ sở quản lý</p>
                      <p className="text-lg font-bold text-gray-900">{profile?.branchName || "Toàn hệ thống"}</p>
                   </div>
                </div>
             </CardContent>
          </Card>
        </div>
      </div>

      {/* EDIT DIALOG */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-lg rounded-[32px]">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black">Cập nhật hồ sơ</DialogTitle>
          </DialogHeader>
          <div className="grid gap-6 py-6 text-gray-900">
            <div className="grid gap-2">
              <Label htmlFor="name" className="font-bold uppercase text-[10px] text-gray-400 tracking-widest">Họ và tên</Label>
              <Input id="name" value={editForm.fullName} onChange={(e) => setEditForm({...editForm, fullName: e.target.value})} className="h-12 rounded-xl" />
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                    <Label htmlFor="email" className="font-bold uppercase text-[10px] text-gray-400 tracking-widest">Email</Label>
                    <Input id="email" type="email" value={editForm.email} onChange={(e) => setEditForm({...editForm, email: e.target.value})} className="h-12 rounded-xl" />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="phone" className="font-bold uppercase text-[10px] text-gray-400 tracking-widest">Số điện thoại</Label>
                    <Input id="phone" value={editForm.phoneNumber} onChange={(e) => setEditForm({...editForm, phoneNumber: e.target.value})} className="h-12 rounded-xl" />
                </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="avatar" className="font-bold uppercase text-[10px] text-gray-400 tracking-widest">Link ảnh đại diện</Label>
              <Input id="avatar" value={editForm.avatarUrl} placeholder="https://..." onChange={(e) => setEditForm({...editForm, avatarUrl: e.target.value})} className="h-12 rounded-xl" />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleUpdate} disabled={updating} className="w-full bg-orange-600 hover:bg-orange-700 h-12 font-black text-lg shadow-xl shadow-orange-100 rounded-xl">
              {updating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              LƯU THAY ĐỔI
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
