import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "../components/ui/dialog";
import { MessageSquare, Mail, Calendar, Eye, Trash2, CheckCircle2, Inbox, Loader2 } from "lucide-react";
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

  return (
    <div className="p-8 bg-gray-50 min-h-screen text-gray-900">
      <div className="mb-8">
        <h1 className="text-2xl font-black">Hộp thư Góp ý</h1>
        <p className="text-gray-500">Quản lý phản hồi và yêu cầu hỗ trợ từ khách hàng</p>
      </div>

      <Card className="border-none shadow-sm overflow-hidden bg-white">
        <CardContent className="p-0">
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
                  <TableHead className="font-bold">Trạng thái</TableHead>
                  <TableHead className="font-bold">Khách hàng</TableHead>
                  <TableHead className="font-bold">Chủ đề</TableHead>
                  <TableHead className="font-bold">Thời gian</TableHead>
                  <TableHead className="text-right font-bold">Hành động</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {feedbacks.map((f) => (
                  <TableRow key={f.id} className={`hover:bg-gray-50/50 transition-colors ${!f.isRead ? 'bg-orange-50/30' : ''}`}>
                    <TableCell>
                      {!f.isRead ? (
                        <Badge className="bg-orange-600 text-white border-none font-bold text-[8px] uppercase tracking-tighter">Mới</Badge>
                      ) : (
                        <CheckCircle2 className="w-4 h-4 text-green-500 ml-2" />
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="font-bold text-gray-900">{f.name}</div>
                      <div className="text-[10px] text-gray-400 font-medium">{f.email}</div>
                    </TableCell>
                    <TableCell>
                       <span className={`font-bold text-sm ${!f.isRead ? 'text-gray-900' : 'text-gray-500'}`}>{f.subject}</span>
                    </TableCell>
                    <TableCell className="text-xs text-gray-400 font-medium">
                      {new Date(f.createdAtUtc).toLocaleString("vi-VN")}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" onClick={() => handleOpenMsg(f)} className="h-8 w-8 text-gray-400 hover:text-orange-600"><Eye className="w-4 h-4" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(f.id)} className="h-8 w-8 text-gray-400 hover:text-red-500"><Trash2 className="w-4 h-4" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* MODAL CHI TIẾT GÓP Ý */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
          <DialogContent className="max-w-xl rounded-[32px]">
              <DialogHeader>
                  <DialogTitle className="text-2xl font-black flex items-center gap-3">
                      <MessageSquare className="text-orange-600" />
                      Nội dung góp ý
                  </DialogTitle>
                  <DialogDescription className="font-bold text-gray-400">
                      Gửi bởi {selectedMsg?.name} • {selectedMsg?.email}
                  </DialogDescription>
              </DialogHeader>

              <div className="py-6 space-y-6">
                  <div className="space-y-1.5">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Chủ đề</p>
                      <p className="text-lg font-black text-gray-900">{selectedMsg?.subject}</p>
                  </div>

                  <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Lời nhắn</p>
                      <p className="text-gray-700 font-medium leading-relaxed italic">
                        "{selectedMsg?.message}"
                      </p>
                  </div>

                  <div className="flex items-center gap-4 text-xs text-gray-400 font-bold uppercase">
                      <Calendar className="w-4 h-4" />
                      Nhận lúc: {selectedMsg && new Date(selectedMsg.createdAtUtc).toLocaleString("vi-VN")}
                  </div>

                  <div className="pt-6 grid grid-cols-2 gap-4">
                      <Button variant="ghost" onClick={() => setIsDetailOpen(false)} className="h-12 rounded-xl font-black text-gray-400">ĐÓNG</Button>
                      <Button onClick={() => handleDelete(selectedMsg.id)} variant="outline" className="h-12 rounded-xl font-black border-red-100 text-red-500 hover:bg-red-50 gap-2">
                        <Trash2 className="w-4 h-4" /> XÓA GÓP Ý
                      </Button>
                  </div>
              </div>
          </DialogContent>
      </Dialog>
    </div>
  );
}
