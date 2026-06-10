import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "../components/ui/dialog";
import { MessageSquare, Calendar, Eye, Trash2, CheckCircle2, Inbox, Loader2, Star, Users, Utensils, DollarSign, Home } from "lucide-react";
import api from "../services/api";

export function OwnerFeedbacks() {
  const [feedbacks, setFeedbacks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMsg, setSelectedMsg] = useState<any>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const fetchFeedbacks = async () => {
    try {
      setLoading(true);
      const res = await api.get("/feedbacks");
      setFeedbacks(res.data);
    } catch (err) {
      console.error("Lỗi tải góp ý");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchFeedbacks(); }, []);

  const handleOpenMsg = async (msg: any) => {
    setSelectedMsg(msg);
    setIsDetailOpen(true);
    if (!msg.isRead) {
      try {
        await api.put(`/feedbacks/${msg.id}/read`);
        setFeedbacks(feedbacks.map(f => f.id === msg.id ? { ...f, isRead: true } : f));
      } catch (err) { console.error("Lỗi đánh dấu đã đọc"); }
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Xóa góp ý này?")) return;
    try {
      await api.delete(`/feedbacks/${id}`);
      setFeedbacks(feedbacks.filter(f => f.id !== id));
      setIsDetailOpen(false);
    } catch { alert("Lỗi khi xóa"); }
  };

  const renderStars = (rating: number) => {
      return (
          <div className="flex gap-0.5">
              {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} className={`w-3 h-3 ${s <= rating ? 'text-orange-500 fill-current' : 'text-gray-200'}`} />
              ))}
          </div>
      );
  };

  return (
    <div className="p-4 md:p-8 bg-gray-50 min-h-screen text-gray-900 pb-20">
      <div className="mb-8">
        <h1 className="text-2xl font-black uppercase tracking-tight">Phản hồi & Đánh giá</h1>
        <p className="text-gray-500 mt-1">Lắng nghe ý kiến từ khách hàng để cải thiện dịch vụ</p>
      </div>

      <Card className="border-none shadow-sm overflow-hidden bg-white rounded-[32px]">
        <CardContent className="p-0 overflow-x-auto">
          {loading ? (
            <div className="p-20 flex justify-center"><Loader2 className="animate-spin text-orange-600" /></div>
          ) : feedbacks.length === 0 ? (
            <div className="text-center py-20">
               <Inbox className="mx-auto w-16 h-16 text-gray-200 mb-4" />
               <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Hộp thư đang trống</p>
            </div>
          ) : (
            <Table>
              <TableHeader className="bg-gray-50/50">
                <TableRow>
                  <TableHead className="font-bold text-center">Trạng thái</TableHead>
                  <TableHead className="font-bold">Khách hàng</TableHead>
                  <TableHead className="font-bold">Đánh giá chung</TableHead>
                  <TableHead className="font-bold">Thời gian</TableHead>
                  <TableHead className="text-right font-bold px-8">Hành động</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {feedbacks.map((f) => {
                  const avgRating = (f.serviceRating + f.foodRating + f.priceRating + f.atmosphereRating) / 4;
                  return (
                    <TableRow key={f.id} className={`hover:bg-gray-50/50 transition-colors ${!f.isRead ? 'bg-orange-50/30' : ''}`}>
                      <TableCell className="text-center">
                        {!f.isRead ? (
                          <div className="bg-orange-600 text-white px-2 py-0.5 rounded-full font-bold text-[8px] uppercase tracking-tighter inline-block">Mới</div>
                        ) : (
                          <CheckCircle2 className="w-4 h-4 text-green-500 mx-auto" />
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="font-bold text-gray-900">{f.name}</div>
                        <div className="text-[10px] text-gray-400 font-medium">{f.email}</div>
                      </TableCell>
                      <TableCell>
                         <div className="flex items-center gap-2">
                            {renderStars(Math.round(avgRating))}
                            <span className="text-[10px] font-black text-orange-600">{avgRating.toFixed(1)}</span>
                         </div>
                      </TableCell>
                      <TableCell className="text-xs text-gray-400 font-medium">
                        {new Date(f.createdAtUtc).toLocaleString("vi-VN")}
                      </TableCell>
                      <TableCell className="text-right px-8">
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="icon" onClick={() => handleOpenMsg(f)} className="h-9 w-9 text-gray-400 hover:text-orange-600 hover:bg-orange-50 rounded-xl"><Eye className="w-5 h-5" /></Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(f.id)} className="h-9 w-9 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl"><Trash2 className="w-5 h-5" /></Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* MODAL CHI TIẾT GÓP Ý */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
          <DialogContent className="max-w-xl rounded-[40px] p-0 overflow-hidden border-none shadow-2xl">
              <div className="bg-gray-900 p-8 text-white">
                  <DialogTitle className="text-2xl font-black flex items-center gap-3">
                      <MessageSquare className="text-orange-500" />
                      Chi tiết Đánh giá
                  </DialogTitle>
                  <p className="text-gray-400 text-sm mt-1 font-medium">
                      Gửi bởi {selectedMsg?.name} • {selectedMsg?.email}
                  </p>
              </div>

              <div className="p-8 space-y-8">
                  {/* Rating Grid */}
                  <div className="grid grid-cols-2 gap-6 bg-gray-50 p-6 rounded-[32px] border border-gray-100">
                      <RatingDetail label="Phục vụ" rating={selectedMsg?.serviceRating} icon={<Users className="w-3.5 h-3.5" />} />
                      <RatingDetail label="Món ăn" rating={selectedMsg?.foodRating} icon={<Utensils className="w-3.5 h-3.5" />} />
                      <RatingDetail label="Giá cả" rating={selectedMsg?.priceRating} icon={<DollarSign className="w-3.5 h-3.5" />} />
                      <RatingDetail label="Không gian" rating={selectedMsg?.atmosphereRating} icon={<Home className="w-3.5 h-3.5" />} />
                  </div>

                  <div className="space-y-3">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2">Nội dung góp ý</p>
                      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm italic text-gray-700 leading-relaxed">
                        "{selectedMsg?.message}"
                      </div>
                  </div>

                  <div className="flex items-center justify-between pt-4">
                      <div className="flex items-center gap-2 text-[10px] text-gray-400 font-bold uppercase">
                          <Calendar className="w-3.5 h-3.5" />
                          {selectedMsg && new Date(selectedMsg.createdAtUtc).toLocaleString("vi-VN")}
                      </div>
                      <div className="flex gap-2">
                          <Button variant="ghost" onClick={() => setIsDetailOpen(false)} className="h-12 px-6 rounded-xl font-black text-gray-400 uppercase text-xs">Đóng</Button>
                          <Button onClick={() => handleDelete(selectedMsg.id)} variant="outline" className="h-12 px-6 rounded-xl font-black border-red-100 text-red-500 hover:bg-red-50 gap-2 uppercase text-xs">
                            <Trash2 className="w-4 h-4" /> Xóa
                          </Button>
                      </div>
                  </div>
              </div>
          </DialogContent>
      </Dialog>
    </div>
  );
}

function RatingDetail({ label, rating, icon }: { label: string, rating: number, icon: any }) {
    return (
        <div className="space-y-1">
            <div className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                {icon} {label}
            </div>
            <div className="flex items-center gap-2">
                <div className="flex gap-0.5">
                    {[1, 2, 3, 4, 5].map((s) => (
                        <Star key={s} className={`w-3.5 h-3.5 ${s <= rating ? 'text-orange-500 fill-current' : 'text-gray-200'}`} />
                    ))}
                </div>
                <span className="font-black text-gray-900 text-sm">{rating}</span>
            </div>
        </div>
    );
}
