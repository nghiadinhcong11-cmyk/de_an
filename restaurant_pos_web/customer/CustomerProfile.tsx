import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Avatar, AvatarFallback } from "../components/ui/avatar";
import { Badge } from "../components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "../components/ui/dialog";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Gift, ShoppingBag, Loader2, Coins, PlusCircle, MinusCircle, Clock, Edit2, Save } from "lucide-react";
import api from "../services/api";

export function CustomerProfile() {
  const [profile, setProfile] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [vouchers, setVouchers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Edit state
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editName, setEditName] = useState("");
  const [editAvatar, setEditAvatar] = useState("");
  const [updating, setUpdating] = useState(false);

  const fetchData = async () => {
    try {
      const [pRes, hRes, vRes] = await Promise.all([
        api.get("/customers/me"),
        api.get("/customers/me/points-history"),
        api.get("/vouchers")
      ]);
      setProfile(pRes.data);
      setHistory(hRes.data);
      setVouchers(vRes.data);
      setEditName(pRes.data.fullName);
      setEditAvatar(pRes.data.avatarUrl || "");
    } catch (err) {
      console.error("Lỗi tải thông tin");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async () => {
    setUpdating(true);
    try {
      await api.put("/customers/me", {
        fullName: editName,
        avatarUrl: editAvatar
      });
      await fetchData();
      setIsEditDialogOpen(false);
    } catch (err) {
      alert("Lỗi khi cập nhật thông tin");
    } finally {
      setUpdating(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  if (loading) return <div className="flex justify-center p-20"><Loader2 className="animate-spin text-orange-600" /></div>;

  return (
    <div className="pb-24 bg-gray-50 min-h-screen">
      {/* Profile Header */}
      <div className="bg-gradient-to-br from-orange-500 to-red-600 text-white p-6 pt-10 rounded-b-[40px] shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Avatar className="w-16 h-16 border-2 border-white/50">
              {profile?.avatarUrl ? (
                <img src={profile.avatarUrl} alt={profile.fullName} className="aspect-square h-full w-full object-cover" />
              ) : (
                <AvatarFallback className="bg-white text-orange-600 font-black text-xl">
                  {profile?.fullName?.charAt(0)}
                </AvatarFallback>
              )}
            </Avatar>
            <div>
              <h2 className="text-xl font-black">{profile?.fullName}</h2>
              <p className="text-white/70 text-xs font-bold uppercase tracking-widest">{profile?.phoneNumber}</p>
            </div>
          </div>

          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogTrigger onClick={() => setIsEditDialogOpen(true)}>
              <Button variant="ghost" size="icon" className="text-white hover:bg-white/20 rounded-full">
                <Edit2 className="w-5 h-5" />
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Chỉnh sửa trang cá nhân</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Họ và tên</Label>
                  <Input id="name" value={editName} onChange={(e) => setEditName(e.target.value)} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="avatar">Link ảnh đại diện</Label>
                  <Input id="avatar" value={editAvatar} placeholder="https://..." onChange={(e) => setEditAvatar(e.target.value)} />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleUpdateProfile} disabled={updating} className="bg-orange-600 hover:bg-orange-700">
                  {updating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Lưu thay đổi
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <Card className="mt-6 border-none bg-white/10 backdrop-blur-md text-white">
           <CardContent className="p-4 flex justify-between items-center">
              <div>
                 <p className="text-[10px] font-black uppercase opacity-70">Điểm hiện có</p>
                 <p className="text-3xl font-black tracking-tighter">{profile?.points?.toLocaleString()}</p>
              </div>
              <Badge className="bg-white text-orange-600 font-bold border-none">Hạng Vàng</Badge>
           </CardContent>
        </Card>
      </div>

      <div className="p-4">
        <Tabs defaultValue="history">
          <TabsList className="w-full bg-white border border-gray-100 p-1 rounded-2xl shadow-sm mb-6">
            <TabsTrigger value="history" className="flex-1 font-bold rounded-xl py-2.5">Lịch sử điểm</TabsTrigger>
            <TabsTrigger value="redeem" className="flex-1 font-bold rounded-xl py-2.5">Đổi quà</TabsTrigger>
          </TabsList>

          {/* TAB 1: LỊCH SỬ TÍCH ĐIỂM */}
          <TabsContent value="history">
            <div className="space-y-4">
               {history.length === 0 ? (
                 <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-gray-100">
                    <Clock className="mx-auto w-10 h-10 text-gray-200 mb-2" />
                    <p className="text-gray-400 font-bold">Chưa có lịch sử tích điểm</p>
                 </div>
               ) : (
                 history.map((item) => (
                   <Card key={item.id} className="border-none shadow-sm overflow-hidden bg-white">
                      <CardContent className="p-4 flex items-center justify-between">
                         <div className="flex items-center gap-3">
                            {item.points > 0 ? (
                              <div className="w-10 h-10 bg-green-50 rounded-full flex items-center justify-center text-green-600"><PlusCircle className="w-5 h-5" /></div>
                            ) : (
                              <div className="w-10 h-10 bg-red-50 rounded-full flex items-center justify-center text-red-600"><MinusCircle className="w-5 h-5" /></div>
                            )}
                            <div>
                               <div className="font-bold text-gray-900 text-sm">{item.description}</div>
                               <div className="text-[10px] text-gray-400 font-bold uppercase">{new Date(item.createdAtUtc).toLocaleDateString("vi-VN")}</div>
                            </div>
                         </div>
                         <div className={`font-black text-lg ${item.points > 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {item.points > 0 ? '+' : ''}{item.points}
                         </div>
                      </CardContent>
                   </Card>
                 ))
               )}
            </div>
          </TabsContent>

          {/* TAB 2: ĐỔI QUÀ (Giữ nguyên logic cũ) */}
          <TabsContent value="redeem">
             <div className="space-y-4">
                {vouchers.map(v => (
                  <Card key={v.id} className="border-none shadow-sm overflow-hidden bg-white">
                     <CardContent className="p-0 flex h-20">
                        <div className="w-20 bg-orange-600 flex flex-col items-center justify-center text-white">
                           <span className="font-black text-xl">{v.discountValue}%</span>
                           <span className="text-[8px] font-bold uppercase opacity-80">OFF</span>
                        </div>
                        <div className="flex-1 p-3 flex flex-col justify-center">
                           <div className="font-bold text-sm text-gray-900">{v.name}</div>
                           <div className="text-[10px] text-orange-600 font-bold uppercase tracking-tighter">Chi phí: {v.discountValue * 10} điểm</div>
                        </div>
                        <div className="p-3 flex items-center">
                           <Button size="sm" className="h-8 rounded-lg bg-orange-100 text-orange-600 hover:bg-orange-600 hover:text-white font-black text-[10px] uppercase">Đổi</Button>
                        </div>
                     </CardContent>
                  </Card>
                ))}
             </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
