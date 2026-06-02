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
    await api.delete(`/tables/${id}`);
    fetchData();
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản lý bàn ăn</h1>
          <p className="text-gray-600">Sơ đồ bàn và mã QR gọi món cho từng cơ sở</p>
        </div>

        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button className="bg-orange-600 hover:bg-orange-700">
              <Plus className="w-4 h-4 mr-2" /> Thêm bàn
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Thêm bàn mới</DialogTitle>
              <DialogDescription>Bàn sẽ được tạo kèm mã QR định danh duy nhất</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Chi nhánh</Label>
                <Select onValueChange={(val: any) => setNewTable({...newTable, branchId: val})}>
                  <SelectTrigger><SelectValue placeholder="Chọn chi nhánh" /></SelectTrigger>
                  <SelectContent onValueChange={() => {}}>
                    {branches.map(b => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Số bàn / Tên bàn</Label>
                  <Input placeholder="Vd: Bàn 01" value={newTable.tableNumber} onChange={(e: any) => setNewTable({...newTable, tableNumber: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label>Số chỗ ngồi</Label>
                  <Input type="number" value={newTable.capacity} onChange={(e: any) => setNewTable({...newTable, capacity: parseInt(e.target.value)})} />
                </div>
              </div>
              <Button className="w-full bg-orange-600" onClick={handleAddTable}>Xác nhận tạo bàn</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? <div className="flex justify-center py-20"><Loader2 className="animate-spin text-orange-600 w-10 h-10" /></div> : (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {tables.map((table) => (
            <TableCard key={table.id} table={table} onDelete={() => handleDelete(table.id)} />
          ))}
        </div>
      )}
      {!loading && tables.length === 0 && (
          <div className="text-center py-20 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
              <p className="text-gray-500 font-medium">Chưa có bàn nào. Hãy nhấn "Thêm bàn" để bắt đầu.</p>
          </div>
      )}
    </div>
  );
}

function TableCard({ table, onDelete }: { table: any, onDelete: () => void }) {
  const tableUrl = `${window.location.origin}/qr/${table.id}`;

  return (
    <Card className="group hover:shadow-xl transition-all border-none bg-white shadow-sm overflow-hidden">
      <div className="h-1.5 bg-green-500 w-full"></div>
      <CardContent className="p-5 text-center relative">
        <button onClick={onDelete} className="absolute top-2 right-2 p-1 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
          <Trash2 className="w-4 h-4" />
        </button>
        <div className="text-3xl mb-2">🪑</div>
        <div className="font-black text-xl text-gray-900">{table.tableNumber}</div>
        <div className="flex items-center justify-center gap-1 text-xs text-gray-500 mt-1 mb-4 font-bold">
          <Users className="w-3 h-3" /> {table.capacity} chỗ
        </div>

        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" className="w-full border-orange-100 text-orange-600 hover:bg-orange-50 font-bold h-9 text-xs gap-2">
              <QrCode className="w-3.5 h-3.5" /> Xem mã QR
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-xs text-center">
            <DialogHeader><DialogTitle>Mã QR Bàn: {table.tableNumber}</DialogTitle></DialogHeader>
            <div className="p-6 bg-white border-2 border-orange-600 rounded-3xl mx-auto my-4 shadow-inner">
               <QRCodeSVG value={tableUrl} size={180} fgColor="#ea580c" level="H" includeMargin />
            </div>
            <p className="text-[10px] text-gray-400 break-all mb-4">{tableUrl}</p>
            <Button className="bg-orange-600 w-full gap-2 font-bold"><Printer className="w-4 h-4" /> In mã QR</Button>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
