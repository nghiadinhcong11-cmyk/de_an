import { useEffect, useMemo, useState } from "react";
import { Card, CardContent } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Textarea } from "../components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import {
  MessageSquare,
  Calendar,
  Eye,
  Trash2,
  Inbox,
  Loader2,
  Star,
  Users,
  Utensils,
  DollarSign,
  Home,
  Building2,
  Phone,
  Mail,
  Table2,
  FileText,
  Paperclip,
  Clock,
  MapPin,
  UserCircle2,
  Save
} from "lucide-react";
import api from "../services/api";

const feedbackStatuses = [
  { value: "New", label: "Mới" },
  { value: "Responded", label: "Đã phản hồi" },
  { value: "Resolved", label: "Đã xử lý" },
];

export function OwnerFeedbacks() {
  const [feedbacks, setFeedbacks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMsg, setSelectedMsg] = useState<any>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [detailForm, setDetailForm] = useState({
    status: "New",
    internalNotes: "",
    attachmentUrl: "",
  });

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
    setDetailForm({
      status: msg.status || "New",
      internalNotes: msg.internalNotes || "",
      attachmentUrl: msg.attachmentUrl || "",
    });
    setIsDetailOpen(true);
    if (!msg.isRead) {
      try {
        await api.put(`/feedbacks/${msg.id}/read`);
        setFeedbacks(prev => prev.map(f => f.id === msg.id ? { ...f, isRead: true } : f));
      } catch (err) {
        console.error("Lỗi đánh dấu đã đọc");
      }
    }
  };

  const handleSaveDetail = async () => {
    if (!selectedMsg) return;
    setSaving(true);
    try {
      await api.put(`/feedbacks/${selectedMsg.id}`, detailForm);
      setFeedbacks(prev => prev.map(f => f.id === selectedMsg.id ? { ...f, ...detailForm } : f));
      setSelectedMsg((prev: any) => prev ? { ...prev, ...detailForm } : prev);
    } catch (err) {
      alert("Lỗi khi cập nhật góp ý");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Xóa góp ý này?")) return;
    try {
      await api.delete(`/feedbacks/${id}`);
      setFeedbacks(prev => prev.filter(f => f.id !== id));
      setIsDetailOpen(false);
    } catch {
      alert("Lỗi khi xóa");
    }
  };

  const renderStars = (rating: number) => (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star key={s} className={`w-3 h-3 ${s <= rating ? 'text-orange-500 fill-current' : 'text-gray-200'}`} />
      ))}
    </div>
  );

  const stats = useMemo(() => {
    return {
      newCount: feedbacks.filter(f => (f.status || "New") === "New").length,
      respondedCount: feedbacks.filter(f => f.status === "Responded").length,
      resolvedCount: feedbacks.filter(f => f.status === "Resolved").length,
    };
  }, [feedbacks]);

  return (
    <div className="p-4 md:p-8 bg-gray-50 min-h-screen text-gray-900 pb-20">
      <div className="mb-8 flex flex-col gap-4">
        <div>
          <h1 className="text-2xl font-black uppercase tracking-tight">Phản hồi & Đánh giá</h1>
          <p className="text-gray-500 mt-1">Lắng nghe ý kiến từ khách hàng để cải thiện dịch vụ</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatChip label="Mới" value={stats.newCount} tone="orange" />
          <StatChip label="Đã phản hồi" value={stats.respondedCount} tone="blue" />
          <StatChip label="Đã xử lý" value={stats.resolvedCount} tone="green" />
        </div>
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
            <table className="w-full">
              <thead className="bg-gray-50/50">
                <tr>
                  <Th>Trạng thái</Th>
                  <Th>Khách hàng</Th>
                  <Th>Ngữ cảnh</Th>
                  <Th>Đánh giá</Th>
                  <Th>Thời gian</Th>
                  <Th align="right">Hành động</Th>
                </tr>
              </thead>
              <tbody>
                {feedbacks.map((f) => {
                  const avgRating = ((f.serviceRating || 0) + (f.foodRating || 0) + (f.priceRating || 0) + (f.atmosphereRating || 0)) / 4;
                  return (
                    <tr key={f.id} className={`border-t border-gray-50 hover:bg-gray-50/50 transition-colors ${!f.isRead ? 'bg-orange-50/30' : ''}`}>
                      <Td align="center">
                        <div className="flex flex-col items-center gap-2">
                          <StatusBadge value={f.status || "New"} />
                          {!f.isRead && <span className="bg-orange-600 text-white px-2 py-0.5 rounded-full font-bold text-[8px] uppercase tracking-tighter inline-block">Mới</span>}
                        </div>
                      </Td>
                      <Td>
                        <div className="font-bold text-gray-900">{f.name}</div>
                        <div className="text-[10px] text-gray-400 font-medium">{f.email}</div>
                        {f.customerPhone && <div className="text-[10px] text-gray-400 font-medium">{f.customerPhone}</div>}
                        {f.customerTier && <div className="mt-1"><TierBadge tier={f.customerTier} /></div>}
                      </Td>
                      <Td>
                        <div className="font-bold text-sm text-gray-900">{f.branchName || "Chưa xác định"}</div>
                        <div className="text-[10px] text-gray-400 truncate max-w-[240px]">{f.branchAddress || ""}</div>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {f.tableNumber && <MiniPill icon={<Table2 className="w-3 h-3" />} text={`Bàn ${f.tableNumber}`} />}
                          {f.orderNumber && <MiniPill icon={<FileText className="w-3 h-3" />} text={`Đơn ${f.orderNumber}`} />}
                        </div>
                      </Td>
                      <Td>
                        <div className="flex items-center gap-2">
                          {renderStars(Math.round(avgRating))}
                          <span className="text-[10px] font-black text-orange-600">{avgRating.toFixed(1)}</span>
                        </div>
                        <div className="text-[10px] text-gray-400 mt-1">
                          <span className="font-bold text-gray-700">CS:</span> {f.serviceRating} · <span className="font-bold text-gray-700">MN:</span> {f.foodRating}
                        </div>
                      </Td>
                      <Td className="text-xs text-gray-400 font-medium">
                        {new Date(f.createdAtUtc).toLocaleString("vi-VN")}
                      </Td>
                      <Td align="right">
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="icon" onClick={() => handleOpenMsg(f)} className="h-9 w-9 text-gray-400 hover:text-orange-600 hover:bg-orange-50 rounded-xl">
                            <Eye className="w-5 h-5" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(f.id)} className="h-9 w-9 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl">
                            <Trash2 className="w-5 h-5" />
                          </Button>
                        </div>
                      </Td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-4xl rounded-[40px] p-0 overflow-hidden border-none shadow-2xl">
          <div className="bg-gray-900 p-8 text-white">
            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
              <div>
                <DialogTitle className="text-2xl font-black flex items-center gap-3">
                  <MessageSquare className="text-orange-500" />
                  Chi tiết Đánh giá
                </DialogTitle>
                <p className="text-gray-400 text-sm mt-1 font-medium">
                  Gửi bởi {selectedMsg?.name} • {selectedMsg?.email}
                </p>
              </div>
              <StatusBadge value={detailForm.status} large />
            </div>
          </div>

          <div className="p-8 space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <section className="rounded-[32px] border border-gray-100 bg-gray-50 p-6 space-y-4">
                <SectionTitle icon={<UserCircle2 className="w-4 h-4" />} title="Thông tin khách hàng" />
                <InfoRow icon={<Users className="w-4 h-4 text-orange-600" />} label="Tên" value={selectedMsg?.name || "-"} />
                <InfoRow icon={<Phone className="w-4 h-4 text-orange-600" />} label="Số điện thoại" value={selectedMsg?.customerPhone || "Chưa có"} />
                <InfoRow icon={<Mail className="w-4 h-4 text-orange-600" />} label="Email" value={selectedMsg?.email || "Chưa có"} />
                <InfoRow icon={<Star className="w-4 h-4 text-orange-600" />} label="Hạng" value={selectedMsg?.customerTier || "Member"} />
                <InfoRow icon={<DollarSign className="w-4 h-4 text-orange-600" />} label="Điểm" value={selectedMsg?.customerPoints?.toLocaleString("vi-VN") || "0"} />
              </section>

              <section className="rounded-[32px] border border-gray-100 bg-gray-50 p-6 space-y-4">
                <SectionTitle icon={<Building2 className="w-4 h-4" />} title="Ngữ cảnh vận hành" />
                <InfoRow icon={<Building2 className="w-4 h-4 text-orange-600" />} label="Chi nhánh" value={selectedMsg?.branchName || "Chưa xác định"} />
                <InfoRow icon={<MapPin className="w-4 h-4 text-orange-600" />} label="Địa chỉ" value={selectedMsg?.branchAddress || "Chưa có"} />
                <InfoRow icon={<Table2 className="w-4 h-4 text-orange-600" />} label="Bàn" value={selectedMsg?.tableNumber ? `Bàn ${selectedMsg.tableNumber}` : "Chưa gắn bàn"} />
                <InfoRow icon={<FileText className="w-4 h-4 text-orange-600" />} label="Hóa đơn / Đơn" value={selectedMsg?.invoiceId || selectedMsg?.orderNumber || "Chưa có"} />
                <InfoRow icon={<Clock className="w-4 h-4 text-orange-600" />} label="Thời gian" value={selectedMsg ? new Date(selectedMsg.createdAtUtc).toLocaleString("vi-VN") : "-"} />
              </section>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-gray-50 p-6 rounded-[32px] border border-gray-100">
              <RatingDetail label="Phục vụ" rating={selectedMsg?.serviceRating} icon={<Users className="w-3.5 h-3.5" />} />
              <RatingDetail label="Món ăn" rating={selectedMsg?.foodRating} icon={<Utensils className="w-3.5 h-3.5" />} />
              <RatingDetail label="Giá cả" rating={selectedMsg?.priceRating} icon={<DollarSign className="w-3.5 h-3.5" />} />
              <RatingDetail label="Không gian" rating={selectedMsg?.atmosphereRating} icon={<Home className="w-3.5 h-3.5" />} />
            </div>

            <div className="space-y-3">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2">Nội dung góp ý</p>
              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm italic text-gray-700 leading-relaxed">
                {selectedMsg?.message || "Không có nội dung"}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <section className="space-y-3">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2">Đính kèm</p>
                {selectedMsg?.attachmentUrl ? (
                  <div className="rounded-[28px] overflow-hidden border border-gray-100 bg-gray-50">
                    <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100 bg-white">
                      <Paperclip className="w-4 h-4 text-orange-600" />
                      <span className="text-xs font-black uppercase tracking-widest text-gray-500">File đính kèm</span>
                    </div>
                    <div className="p-4">
                      {isImageUrl(selectedMsg.attachmentUrl) ? (
                        <img src={selectedMsg.attachmentUrl} alt="Attachment" className="w-full max-h-72 object-cover rounded-2xl" />
                      ) : (
                        <a href={selectedMsg.attachmentUrl} target="_blank" rel="noreferrer" className="text-orange-600 font-bold text-sm underline break-all">
                          {selectedMsg.attachmentUrl}
                        </a>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="rounded-[28px] border border-dashed border-gray-200 bg-gray-50 p-6 text-center text-sm text-gray-400 font-medium">
                    Chưa có ảnh hoặc video đính kèm
                  </div>
                )}
              </section>

              <section className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2">Xử lý nội bộ</p>
                  <Select value={detailForm.status} onValueChange={(v) => setDetailForm(prev => ({ ...prev, status: v }))}>
                    <SelectTrigger className="w-[170px] h-10 rounded-xl bg-white border border-gray-100 font-bold">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {feedbackStatuses.map(status => (
                        <SelectItem key={status.value} value={status.value}>{status.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Textarea
                  value={detailForm.internalNotes}
                  onChange={(e) => setDetailForm(prev => ({ ...prev, internalNotes: e.target.value }))}
                  rows={8}
                  placeholder="Ghi chú nội bộ, người phụ trách, hướng xử lý..."
                  className="rounded-[28px] bg-gray-50 border-none font-medium text-gray-900 p-4"
                />
              </section>
            </div>

            <div className="flex items-center justify-between pt-4">
              <div className="flex items-center gap-2 text-[10px] text-gray-400 font-bold uppercase">
                <Calendar className="w-3.5 h-3.5" />
                {selectedMsg && new Date(selectedMsg.createdAtUtc).toLocaleString("vi-VN")}
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" onClick={() => setIsDetailOpen(false)} className="h-12 px-6 rounded-xl font-black text-gray-400 uppercase text-xs">
                  Đóng
                </Button>
                <Button
                  onClick={handleSaveDetail}
                  disabled={saving}
                  className="h-12 px-6 rounded-xl font-black bg-gray-900 hover:bg-black text-white uppercase text-xs gap-2"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Lưu thay đổi
                </Button>
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

function Th({ children, align = "left", className = "" }: { children: any; align?: "left" | "center" | "right"; className?: string }) {
  const alignClass = align === "center" ? "text-center" : align === "right" ? "text-right" : "text-left";
  return <th className={`px-6 py-4 ${alignClass} font-bold text-gray-500 ${className}`}>{children}</th>;
}

function Td({ children, align = "left", className = "" }: { children: any; align?: "left" | "center" | "right"; className?: string }) {
  const alignClass = align === "center" ? "text-center" : align === "right" ? "text-right" : "text-left";
  return <td className={`px-6 py-5 ${alignClass} align-top ${className}`}>{children}</td>;
}

function StatChip({ label, value, tone }: { label: string; value: number; tone: "orange" | "blue" | "green" }) {
  const styles = {
    orange: "bg-orange-50 text-orange-700 border-orange-100",
    blue: "bg-blue-50 text-blue-700 border-blue-100",
    green: "bg-green-50 text-green-700 border-green-100",
  };
  return (
    <div className={`rounded-[24px] border p-4 ${styles[tone]} shadow-sm`}>
      <div className="text-[10px] font-black uppercase tracking-widest opacity-70">{label}</div>
      <div className="text-2xl font-black mt-1">{value}</div>
    </div>
  );
}

function SectionTitle({ icon, title }: { icon: any; title: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className="w-8 h-8 bg-white rounded-xl flex items-center justify-center text-gray-900 shadow-sm">{icon}</div>
      <h3 className="font-black text-gray-900 uppercase text-xs tracking-widest">{title}</h3>
    </div>
  );
}

function InfoRow({ icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="grid grid-cols-[18px_1fr] gap-3 items-start">
      <div className="pt-1">{icon}</div>
      <div>
        <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{label}</div>
        <div className="font-bold text-gray-900 break-words">{value}</div>
      </div>
    </div>
  );
}

function MiniPill({ icon, text }: { icon: any; text: string }) {
  return (
    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-gray-100 text-[10px] font-black uppercase tracking-widest text-gray-600">
      {icon}
      {text}
    </div>
  );
}

function StatusBadge({ value, large = false }: { value: string; large?: boolean }) {
  const map: Record<string, string> = {
    New: "bg-orange-100 text-orange-700",
    Responded: "bg-blue-100 text-blue-700",
    Resolved: "bg-green-100 text-green-700",
  };
  return <Badge className={`${map[value] || "bg-gray-100 text-gray-700"} border-none font-black uppercase tracking-widest ${large ? "text-[10px] px-4 py-2" : "text-[9px] px-3 py-1"}`}>{value === "New" ? "Mới" : value === "Responded" ? "Đã phản hồi" : value === "Resolved" ? "Đã xử lý" : value}</Badge>;
}

function TierBadge({ tier }: { tier: string }) {
  const styles: Record<string, string> = {
    Gold: "bg-yellow-100 text-yellow-800",
    Silver: "bg-gray-100 text-gray-700",
    Bronze: "bg-orange-100 text-orange-700",
    Member: "bg-blue-100 text-blue-700",
  };
  return <span className={`inline-flex px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${styles[tier] || styles.Member}`}>{tier}</span>;
}

function RatingDetail({ label, rating, icon }: { label: string; rating: number; icon: any }) {
  const safeRating = rating || 0;
  return (
    <div className="space-y-1">
      <div className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">
        {icon} {label}
      </div>
      <div className="flex items-center gap-2">
        <div className="flex gap-0.5">
          {[1, 2, 3, 4, 5].map((s) => (
            <Star key={s} className={`w-3.5 h-3.5 ${s <= safeRating ? 'text-orange-500 fill-current' : 'text-gray-200'}`} />
          ))}
        </div>
        <span className="font-black text-gray-900 text-sm">{safeRating}</span>
      </div>
    </div>
  );
}

function isImageUrl(url: string) {
  return /\.(png|jpe?g|gif|webp|bmp|svg)$/i.test(url);
}
