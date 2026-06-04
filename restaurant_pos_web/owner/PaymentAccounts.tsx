import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "../components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Plus, CreditCard, Star, Trash2, Edit, CheckCircle, Loader2 } from "lucide-react";
import api from "../services/api";

export function OwnerPaymentAccounts() {
  const [accounts, setAccounts] = useState<any[]>([]);
  const [branches, setBranches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [form, setForm] = useState({
    branchId: "",
    bankCode: "",
    accountNumber: "",
    accountName: "",
    isDefault: false
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [accRes, branchRes] = await Promise.all([
        api.get("/payments/accounts"),
        api.get("/branches")
      ]);
      setAccounts(accRes.data);
      setBranches(branchRes.data);
    } catch (err) {
      console.error("Lỗi tải dữ liệu thanh toán");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleCreate = async () => {
    if (!form.bankCode || !form.accountNumber || !form.branchId) return alert("Vui lòng nhập đầy đủ thông tin");
    try {
      await api.post("/payments/accounts", form);
      setIsAddOpen(false);
      setForm({ branchId: "", bankCode: "", accountNumber: "", accountName: "", isDefault: false });
      fetchData();
    } catch (err) {
      alert("Lỗi khi thêm tài khoản");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Xóa tài khoản này?")) return;
    try {
      await api.delete(`/payments/accounts/${id}`);
      fetchData();
    } catch { alert("Lỗi khi xóa"); }
  };

  return (
    <div className="p-8 space-y-8 bg-gray-50 min-h-screen text-gray-900">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black">Tài khoản thanh toán</h1>
          <p className="text-gray-500 font-medium">Quản lý tài khoản ngân hàng để nhận tiền qua VietQR</p>
        </div>

        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger onClick={() => setIsAddOpen(true)}>
             <Button className="bg-orange-600 font-bold shadow-lg shadow-orange-100">
                <Plus className="w-4 h-4 mr-2" /> Thêm tài khoản
             </Button>
          </DialogTrigger>
          <DialogContent>
             <DialogHeader><DialogTitle className="font-black text-xl">Thêm tài khoản ngân hàng</DialogTitle></DialogHeader>
             <div className="space-y-4 py-4">
                <div className="space-y-1.5">
                    <Label className="font-bold text-xs uppercase text-gray-400">Chi nhánh áp dụng</Label>
                    <Select onValueChange={(val) => setForm({...form, branchId: val})}>
                        <SelectTrigger className="h-12 rounded-xl"><SelectValue placeholder="Chọn chi nhánh" /></SelectTrigger>
                        <SelectContent>
                            {branches.map(b => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                        <Label className="font-bold text-xs uppercase text-gray-400">Mã ngân hàng (BIN)</Label>
                        <Input placeholder="Vd: 970436 (VCB)" value={form.bankCode} onChange={(e: any) => setForm({...form, bankCode: e.target.value})} />
                    </div>
                    <div className="space-y-1.5">
                        <Label className="font-bold text-xs uppercase text-gray-400">Số tài khoản</Label>
                        <Input placeholder="123456..." value={form.accountNumber} onChange={(e: any) => setForm({...form, accountNumber: e.target.value})} />
                    </div>
                </div>
                <div className="space-y-1.5">
                    <Label className="font-bold text-xs uppercase text-gray-400">Tên chủ tài khoản</Label>
                    <Input placeholder="NGUYEN VAN A" className="uppercase" value={form.accountName} onChange={(e: any) => setForm({...form, accountName: e.target.value})} />
                </div>
                <Button onClick={handleCreate} className="w-full h-12 bg-orange-600 font-black text-lg shadow-xl shadow-orange-100 rounded-xl mt-4">XÁC NHẬN LƯU</Button>
             </div>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? <div className="flex justify-center py-20"><Loader2 className="animate-spin text-orange-600" /></div> : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
           {accounts.map(acc => (
             <Card key={acc.id} className={`border-none shadow-sm relative overflow-hidden bg-white ${acc.isDefault ? 'ring-2 ring-orange-500' : ''}`}>
                <div className="h-1.5 bg-orange-600 w-full"></div>
                <CardContent className="pt-8">
                   <div className="flex items-center gap-4 mb-6">
                      <div className="w-14 h-14 rounded-2xl bg-orange-50 flex items-center justify-center text-orange-600 font-black text-xl italic uppercase">
                         {acc.bankCode.substring(0, 3)}
                      </div>
                      <div>
                         <div className="text-lg font-black">{acc.bankCode}</div>
                         <div className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                            {branches.find(b => b.id === acc.branchId)?.name || 'Chi nhánh'}
                         </div>
                      </div>
                   </div>
                   <div className="space-y-2 mb-6">
                      <div className="text-xs font-bold text-gray-400 uppercase tracking-widest">Số tài khoản</div>
                      <div className="text-2xl font-black tracking-tighter text-gray-900">{acc.accountNumber}</div>
                      <div className="text-sm font-bold text-gray-600 uppercase">{acc.accountName}</div>
                   </div>
                   <div className="flex gap-2 border-t border-gray-50 pt-4">
                      <Button onClick={() => handleDelete(acc.id)} variant="ghost" size="sm" className="font-black text-[10px] uppercase tracking-widest text-gray-300 hover:text-red-500">Gỡ bỏ</Button>
                      <Badge className="ml-auto bg-green-50 text-green-700 border-none font-bold">Đang dùng</Badge>
                   </div>
                </CardContent>
             </Card>
           ))}
        </div>
      )}

      {accounts.length === 0 && !loading && (
        <div className="text-center py-20 bg-white rounded-[32px] border-2 border-dashed border-gray-100">
            <p className="text-gray-400 font-bold uppercase tracking-widest text-sm">Chưa có tài khoản thanh toán nào được thiết lập</p>
        </div>
      )}
    </div>
  );
}
