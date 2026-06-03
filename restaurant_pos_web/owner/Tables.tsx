import { useRef, useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "../components/ui/dialog";
import { Label } from "../components/ui/label";
import { Input } from "../components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Plus, Users, QrCode, Printer, Loader2, Trash2 } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import api from "../services/api";

export function OwnerTables() {
  const [tables, setTables] = useState<any[]>([]);
  const [branches, setBranches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [activeQRTable, setActiveQRTable] = useState<any>(null);

  const [newTable, setNewTable] = useState({
    tableNumber: "",
    capacity: 4,
    branchId: ""
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [tableRes, branchRes] = await Promise.all([
        api.get("/tables"),
        api.get("/branches")
      ]);
      setTables(tableRes.data);
      setBranches(branchRes.data);
    } catch (err) {
      console.error("Lỗi lấy dữ liệu bàn");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleAddTable = async () => {
    if (!newTable.tableNumber || !newTable.branchId) {
        alert("Vui lòng nhập đầy đủ số bàn và chọn chi nhánh");
        return;
    }
    try {
      await api.post("/tables", newTable);
      setIsAddOpen(false);
      setNewTable({ tableNumber: "", capacity: 4, branchId: "" });
      fetchData();
    } catch (err) {
      alert("Lỗi khi tạo bàn");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Xóa bàn này?")) return;
    try {
      await api.delete(`/tables/${id}`);
      fetchData();
    } catch { alert("Lỗi khi xóa bàn"); }
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen text-gray-900">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-black">Quản lý bàn ăn</h1>
          <p className="text-gray-500 mt-1">Sơ đồ bàn và mã QR gọi món cho từng cơ sở</p>
        </div>

        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger onClick={() => setIsAddOpen(true)}>
            <Button className="bg-orange-600 font-bold shadow-lg shadow-orange-100">
              <Plus className="w-4 h-4 mr-2" /> Thêm bàn
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="font-bold">Thêm bàn mới</DialogTitle>
              <DialogDescription>Bàn sẽ được tạo kèm mã QR định danh duy nhất</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label className="font-bold uppercase text-[10px] text-gray-400">Chi nhánh</Label>
                <Select onValueChange={(val: any) => setNewTable({...newTable, branchId: val})}>
                  <SelectTrigger><SelectValue placeholder="Chọn chi nhánh" /></SelectTrigger>
                  <SelectContent>
                    {branches.map(b => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="font-bold uppercase text-[10px] text-gray-400">Số bàn / Tên bàn</Label>
                  <Input placeholder="Vd: Bàn 01" value={newTable.tableNumber} onChange={(e: any) => setNewTable({...newTable, tableNumber: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label className="font-bold uppercase text-[10px] text-gray-400">Số chỗ ngồi</Label>
                  <Input type="number" value={newTable.capacity} onChange={(e: any) => setNewTable({...newTable, capacity: parseInt(e.target.value)})} />
                </div>
              </div>
              <Button className="w-full bg-orange-600 font-bold h-12" onClick={handleAddTable}>XÁC NHẬN TẠO BÀN</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? <div className="flex justify-center py-20"><Loader2 className="animate-spin text-orange-600 w-10 h-10" /></div> : (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {tables.map((table) => (
            <TableCard
                key={table.id}
                table={table}
                onDelete={() => handleDelete(table.id)}
                onShowQR={() => setActiveQRTable(table)}
            />
          ))}
        </div>
      )}

      {/* QR MODAL */}
      <Dialog open={!!activeQRTable} onOpenChange={() => setActiveQRTable(null)}>
          <DialogContent className="max-w-xs text-center">
            {activeQRTable && (
                <>
                <DialogHeader><DialogTitle className="font-black">Mã QR Bàn: {activeQRTable.tableNumber}</DialogTitle></DialogHeader>
                <div className="p-6 bg-white border-2 border-orange-600 rounded-[32px] mx-auto my-4 shadow-xl">
                   <QRCodeSVG value={`${window.location.origin}/qr/${activeQRTable.id}`} size={180} fgColor="#ea580c" level="H" includeMargin />
                </div>
                <p className="text-[10px] text-gray-400 break-all mb-4 uppercase font-bold tracking-tighter">ID: {activeQRTable.id}</p>
                <Button className="bg-orange-600 w-full gap-2 font-black uppercase text-xs h-11" onClick={() => window.print()}>
                    <Printer className="w-4 h-4" /> In mã QR
                </Button>
                </>
            )}
          </DialogContent>
      </Dialog>

      {!loading && tables.length === 0 && (
          <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-gray-100">
              <p className="text-gray-400 font-bold">Chưa có bàn nào. Hãy nhấn "Thêm bàn" để bắt đầu.</p>
          </div>
      )}
    </div>
  );
}

function TableCard({ table, onDelete, onShowQR }: { table: any, onDelete: () => void, onShowQR: () => void }) {
  return (
    <Card className="group hover:shadow-xl transition-all border-none bg-white shadow-sm overflow-hidden relative">
      <div className="h-1.5 bg-green-500 w-full"></div>
      <CardContent className="p-5 text-center">
        <button onClick={onDelete} className="absolute top-2 right-2 p-1 text-gray-200 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
          <Trash2 className="w-4 h-4" />
        </button>
        <div className="text-3xl mb-2">🪑</div>
        <div className="font-black text-xl text-gray-900">{table.tableNumber}</div>
        <div className="flex items-center justify-center gap-1 text-xs text-gray-400 mt-1 mb-4 font-bold uppercase tracking-tighter">
          <Users className="w-3 h-3" /> {table.capacity} chỗ
        </div>

        <Button variant="outline" onClick={onShowQR} className="w-full border-orange-100 text-orange-600 hover:bg-orange-50 font-bold h-9 text-[10px] gap-2 uppercase tracking-widest">
          <QrCode className="w-3.5 h-3.5" /> Xem mã QR
        </Button>
      </CardContent>
    </Card>
  );
}
