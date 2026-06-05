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
  const [allZones, setAllZones] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isZoneOpen, setIsZoneOpen] = useState(false);
  const [activeQRTable, setActiveQRTable] = useState<any>(null);

  const [newTable, setNewTable] = useState({
    tableNumber: "",
    capacity: 4,
    branchId: "",
    zoneId: ""
  });

  const [newZone, setNewZone] = useState({
    name: "",
    branchId: "",
    displayOrder: 0
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

      // Lấy toàn bộ zone của tất cả branch
      const zonePromises = branchRes.data.map((b: any) => api.get(`/zones?branchId=${b.id}`));
      const zoneResponses = await Promise.all(zonePromises);
      const combinedZones = zoneResponses.flatMap(r => r.data);
      setAllZones(combinedZones);

    } catch (err) {
      console.error("Lỗi lấy dữ liệu bàn");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleAddTable = async () => {
    if (!newTable.tableNumber || !newTable.branchId || !newTable.zoneId) {
        alert("Vui lòng nhập đầy đủ số bàn, chọn chi nhánh và khu vực");
        return;
    }
    try {
      await api.post("/tables", newTable);
      setIsAddOpen(false);
      setNewTable({ tableNumber: "", capacity: 4, branchId: "", zoneId: "" });
      fetchData();
    } catch (err) {
      alert("Lỗi khi tạo bàn");
    }
  };

  const handleAddZone = async () => {
      if (!newZone.name || !newZone.branchId) return alert("Vui lòng nhập tên và chọn chi nhánh");
      try {
          await api.post("/zones", newZone);
          setNewZone({ name: "", branchId: "", displayOrder: 0 });
          fetchData();
      } catch { alert("Lỗi khi tạo khu vực"); }
  };

  const handleDeleteZone = async (id: string) => {
      if (!confirm("Xóa khu vực này?")) return;
      try {
          await api.delete(`/zones/${id}`);
          fetchData();
      } catch (err: any) {
          alert(err.response?.data || "Lỗi khi xóa khu vực");
      }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Xóa bàn này?")) return;
    try {
      await api.delete(`/tables/${id}`);
      fetchData();
    } catch { alert("Lỗi khi xóa bàn"); }
  };

  // Nhóm bàn theo chi nhánh và khu vực (Zone) từ dữ liệu API
  const groupedTables = branches.map(branch => {
    const branchTables = tables.filter(t => t.branchId === branch.id);
    const branchZones = allZones.filter(z => z.branchId === branch.id);

    // Đảm bảo các bàn không có zone vẫn hiện ở mục "Chung"
    const tablesWithNoZone = branchTables.filter(t => !t.zoneId);

    return {
      ...branch,
      zones: [
          ...branchZones.map(zone => ({
            id: zone.id,
            name: zone.name,
            tables: branchTables.filter(t => t.zoneId === zone.id)
          })),
          ...(tablesWithNoZone.length > 0 ? [{ id: 'none', name: 'Chung', tables: tablesWithNoZone }] : [])
      ]
    };
  });

  return (
    <div className="p-8 bg-gray-50 min-h-screen text-gray-900">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-black">Quản lý bàn ăn</h1>
          <p className="text-gray-500 mt-1">Phân chia theo chi nhánh và khu vực (tầng, phòng...)</p>
        </div>

        <div className="flex gap-3">
            <Button onClick={() => setIsZoneOpen(true)} variant="outline" className="font-bold border-orange-200 text-orange-600">
               Thiết lập khu vực
            </Button>
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
                    <Select onValueChange={(val: any) => {
                        setNewTable({...newTable, branchId: val, zoneId: ""});
                    }}>
                      <SelectTrigger><SelectValue placeholder="Chọn chi nhánh" /></SelectTrigger>
                      <SelectContent>
                        {branches.map(b => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="font-bold uppercase text-[10px] text-gray-400">Khu vực / Tầng</Label>
                    <Select
                        disabled={!newTable.branchId}
                        value={newTable.zoneId}
                        onValueChange={(val: any) => setNewTable({...newTable, zoneId: val})}
                    >
                      <SelectTrigger><SelectValue placeholder={newTable.branchId ? "Chọn khu vực..." : "Hãy chọn chi nhánh trước"} /></SelectTrigger>
                      <SelectContent>
                        {allZones.filter(z => z.branchId === newTable.branchId).map(z => (
                            <SelectItem key={z.id} value={z.id}>{z.name}</SelectItem>
                        ))}
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
      </div>

      {/* MODAL QUẢN LÝ KHU VỰC */}
      <Dialog open={isZoneOpen} onOpenChange={setIsZoneOpen}>
          <DialogContent className="max-w-xl">
              <DialogHeader><DialogTitle className="font-black">Thiết lập khu vực (Zones)</DialogTitle></DialogHeader>
              <div className="space-y-6 py-4">
                  <div className="bg-orange-50 p-4 rounded-2xl flex flex-wrap gap-3 items-end">
                      <div className="flex-1 min-w-[150px] space-y-1">
                          <Label className="text-[10px] font-bold uppercase text-gray-400">Tên khu vực</Label>
                          <Input value={newZone.name} onChange={(e: any) => setNewZone({...newZone, name: e.target.value})} placeholder="Vd: Tầng 1" />
                      </div>
                      <div className="w-20 space-y-1">
                          <Label className="text-[10px] font-bold uppercase text-gray-400">Thứ tự</Label>
                          <Input type="number" value={newZone.displayOrder} onChange={(e: any) => setNewZone({...newZone, displayOrder: parseInt(e.target.value) || 0})} />
                      </div>
                      <div className="w-40 space-y-1">
                          <Label className="text-[10px] font-bold uppercase text-gray-400">Chi nhánh</Label>
                          <Select onValueChange={(v) => setNewZone({...newZone, branchId: v})}>
                              <SelectTrigger><SelectValue placeholder="Chọn..." /></SelectTrigger>
                              <SelectContent>
                                  {branches.map(b => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}
                              </SelectContent>
                          </Select>
                      </div>
                      <Button onClick={handleAddZone} className="bg-gray-900 h-10 px-6 font-bold">THÊM</Button>
                  </div>

                  <div className="space-y-2 max-h-80 overflow-y-auto pr-2">
                      {allZones.map(z => (
                          <div key={z.id} className="flex items-center justify-between p-4 bg-white border border-gray-100 rounded-2xl shadow-sm">
                              <div>
                                  <div className="font-bold text-gray-900">{z.name}</div>
                                  <div className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">
                                      {branches.find(b => b.id === z.branchId)?.name}
                                  </div>
                              </div>
                              <Button variant="ghost" size="icon" onClick={() => handleDeleteZone(z.id)} className="text-red-300 hover:text-red-500 hover:bg-red-50 rounded-xl">
                                  <Trash2 className="w-4 h-4" />
                              </Button>
                          </div>
                      ))}
                  </div>
              </div>
          </DialogContent>
      </Dialog>

      {loading ? <div className="flex justify-center py-20"><Loader2 className="animate-spin text-orange-600 w-10 h-10" /></div> : (
        <div className="space-y-12">
          {groupedTables.map(branch => (
            <div key={branch.id} className="space-y-6">
              <div className="flex items-center gap-4">
                <h2 className="text-xl font-black text-gray-900 px-4 py-2 bg-white rounded-2xl shadow-sm border border-orange-100 flex items-center gap-2">
                   <div className="w-2 h-2 bg-orange-600 rounded-full"></div>
                   {branch.name}
                </h2>
                <div className="h-[2px] flex-1 bg-gradient-to-r from-orange-100 to-transparent"></div>
              </div>

              {branch.zones.map(zone => (
                <div key={zone.name} className="space-y-4 ml-4">
                   <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                      <Plus className="w-3 h-3 text-orange-600" /> {zone.name}
                   </h3>
                   <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
                      {zone.tables.map((table) => (
                        <TableCard
                            key={table.id}
                            table={table}
                            onDelete={() => handleDelete(table.id)}
                            onShowQR={() => setActiveQRTable(table)}
                        />
                      ))}
                   </div>
                </div>
              ))}

              {branch.zones.length === 0 && (
                <div className="text-center py-10 bg-white/50 rounded-3xl border-2 border-dashed border-gray-100 ml-4">
                   <p className="text-gray-400 text-sm font-bold">Chưa có bàn nào ở chi nhánh này</p>
                </div>
              )}
            </div>
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
