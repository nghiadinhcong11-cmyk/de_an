import { useRef, useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "../components/ui/dialog";
import { Label } from "../components/ui/label";
import { Input } from "../components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Plus, Users, QrCode, Printer, Loader2, Trash2, Map, List as ListIcon, Save, Move, ChevronDown, ChevronUp, Layers, Edit2 } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import api from "../services/api";

export function OwnerTables() {
  const [tables, setTables] = useState<any[]>([]);
  const [branches, setBranches] = useState<any[]>([]);
  const [allZones, setAllZones] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isZoneOpen, setIsZoneOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingTable, setEditingTable] = useState<any>(null);
  const [activeQRTable, setActiveQRTable] = useState<any>(null);
  const [viewMode, setViewMode] = useState("list");
  const [expandedZones, setExpandedZones] = useState<Record<string, boolean>>({});

  const toggleZone = (zoneId: string) => {
    setExpandedZones(prev => ({
      ...prev,
      [zoneId]: !prev[zoneId]
    }));
  };

  const fetchData = async () => {
    try {
      setLoading(true);

      // Lấy danh sách chi nhánh trước để unblock UI
      try {
          const branchRes = await api.get("/branches");
          setBranches(branchRes.data);

          if (branchRes.data.length > 0) {
              const zonePromises = branchRes.data.map((b: any) => api.get(`/zones?branchId=${b.id}`));
              const zoneResponses = await Promise.all(zonePromises);
              const combinedZones = zoneResponses.flatMap(r => r.data);
              setAllZones(combinedZones);

              const initialExpanded: Record<string, boolean> = {};
              combinedZones.forEach(z => { initialExpanded[z.id] = true; });
              initialExpanded['none'] = true;
              setExpandedZones(initialExpanded);
          }
      } catch (err) {
          console.error("Lỗi tải chi nhánh hoặc khu vực", err);
      }

      // Lấy danh sách bàn sau
      try {
          const tableRes = await api.get("/tables");
          setTables(tableRes.data);
      } catch (err) {
          console.error("Lỗi tải danh sách bàn", err);
      }

    } catch (err) {
      console.error("Lỗi lấy dữ liệu tổng thể");
    } finally {
      setLoading(false);
    }
  };

  const [newTable, setNewTable] = useState({
    tableNumber: "",
    capacity: 4,
    branchId: "",
    zoneId: "",
    note: ""
  });

  const [newZone, setNewZone] = useState({
    name: "",
    branchId: "",
    displayOrder: 0
  });

  useEffect(() => { fetchData(); }, []);

  const handleUpdatePosition = async (id: string, posX: number, posY: number) => {
    try {
      await api.put(`/tables/${id}/position`, { posX, posY });
      // Update local state to avoid re-fetching everything
      setTables(prev => prev.map(t => t.id === id ? { ...t, posX, posY } : t));
    } catch {
      console.error("Lỗi cập nhật vị trí");
    }
  };

  const handleUpdateStatus = async (id: string, currentStatus: string) => {
      const newStatus = currentStatus === 'Available' ? 'Occupied' : 'Available';
      try {
          await api.put(`/tables/${id}/status`, `"${newStatus}"`, { headers: { 'Content-Type': 'application/json' } });
          setTables(prev => prev.map(t => t.id === id ? { ...t, status: newStatus } : t));
      } catch {
          console.error("Lỗi cập nhật trạng thái");
      }
  };

  const handleUpdateTable = async () => {
    if (!editingTable.tableNumber) return alert("Vui lòng nhập số bàn");
    try {
      await api.put(`/tables/${editingTable.id}`, editingTable);
      setIsEditOpen(false);
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || "Lỗi khi cập nhật bàn");
    }
  };

  const handleAddTable = async () => {
    if (!newTable.tableNumber || !newTable.branchId) {
        alert("Vui lòng nhập số bàn và chọn chi nhánh");
        return;
    }
    try {
      // Làm sạch dữ liệu trước khi gửi: nếu zoneId rỗng thì gửi null
      const payload = {
          ...newTable,
          zoneId: newTable.zoneId === "" ? null : newTable.zoneId,
          posX: 0,
          posY: 0
      };

      await api.post("/tables", payload);
      setIsAddOpen(false);
      setNewTable({ tableNumber: "", capacity: 4, branchId: "", zoneId: "", note: "" });
      fetchData();
    } catch (err: any) {
      const msg = err.response?.data?.message || "Lỗi khi tạo bàn";
      alert(msg);
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

  const groupedTables = branches.map(branch => {
    const branchTables = tables.filter(t => t.branchId === branch.id);
    const branchZones = allZones.filter(z => z.branchId === branch.id);
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
    <div className="p-4 md:p-8 bg-gray-50 min-h-screen text-gray-900">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-black">Quản lý bàn ăn</h1>
          <p className="text-gray-500 mt-1">Phân chia theo chi nhánh và khu vực (tầng, phòng...)</p>
        </div>

        <div className="flex flex-wrap gap-3">
            <div className="bg-white p-1 rounded-xl shadow-sm border border-gray-100 flex items-center mr-2">
                <button
                    onClick={() => setViewMode("list")}
                    className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-all ${viewMode === 'list' ? 'bg-orange-600 text-white shadow-md' : 'text-gray-400 hover:bg-gray-50'}`}
                >
                    <ListIcon className="w-4 h-4" /> DANH SÁCH
                </button>
                <button
                    onClick={() => setViewMode("map")}
                    className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-all ${viewMode === 'map' ? 'bg-orange-600 text-white shadow-md' : 'text-gray-400 hover:bg-gray-50'}`}
                >
                    <Map className="w-4 h-4" /> SƠ ĐỒ BÀN
                </button>
            </div>

            <Button onClick={() => setIsZoneOpen(true)} variant="outline" className="font-bold border-orange-200 text-orange-600 bg-white">
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
                    <Select
                      value={newTable.branchId}
                      onValueChange={(val: any) => {
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
                  <div className="space-y-2">
                    <Label className="font-bold uppercase text-[10px] text-gray-400">Ghi chú bàn</Label>
                    <Input placeholder="Vd: Gần cửa sổ..." value={newTable.note} onChange={(e: any) => setNewTable({...newTable, note: e.target.value})} />
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
                          <Select
                            value={newZone.branchId}
                            onValueChange={(v) => setNewZone({...newZone, branchId: v})}
                          >
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

              {viewMode === "list" ? (
                  branch.zones.map(zone => (
                    <div key={zone.id} className="bg-white rounded-[32px] shadow-sm border border-gray-100 overflow-hidden mb-6">
                       <button
                          onClick={() => toggleZone(zone.id)}
                          className="w-full px-8 py-5 flex items-center justify-between hover:bg-gray-50 transition-colors"
                       >
                          <div className="flex items-center gap-4">
                             <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center text-orange-600">
                                <Layers className="w-5 h-5" />
                             </div>
                             <div className="text-left">
                                <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest">{zone.name}</h3>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">{zone.tables.length} bàn trong khu vực</p>
                             </div>
                          </div>
                          {expandedZones[zone.id] ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
                       </button>

                       {expandedZones[zone.id] && (
                          <div className="p-8 pt-0 border-t border-gray-50 animate-in fade-in slide-in-from-top-2 duration-300">
                             <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6 mt-6">
                                {zone.tables.map((table: any) => (
                                  <TableCard
                                      key={table.id}
                                      table={table}
                                      onDelete={() => handleDelete(table.id)}
                                      onShowQR={() => setActiveQRTable(table)}
                                      onUpdateStatus={handleUpdateStatus}
                                      onEdit={(t) => {
                                          setEditingTable(t);
                                          setIsEditOpen(true);
                                      }}
                                  />
                                ))}
                             </div>
                          </div>
                       )}
                    </div>
                  ))
              ) : (
                <div className="space-y-8">
                    {branch.zones.map(zone => (
                        <div key={zone.id} className="bg-white rounded-[40px] shadow-sm border border-gray-100 relative overflow-hidden transition-all duration-500">
                            <button
                                onClick={() => toggleZone(zone.id)}
                                className="w-full p-8 flex items-center justify-between hover:bg-gray-50/50 transition-colors group"
                            >
                                <div className="flex items-center gap-6">
                                    <div className="w-14 h-14 bg-gray-900 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-gray-200 group-hover:rotate-6 transition-transform">
                                        <Map className="w-6 h-6 text-orange-500" />
                                    </div>
                                    <div className="text-left">
                                        <h3 className="text-xl font-black text-gray-900">{zone.name}</h3>
                                        <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">Sơ đồ bố trí • {zone.tables.length} bàn</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="hidden lg:flex items-center gap-2 bg-orange-50 text-orange-600 px-4 py-2 rounded-xl text-[10px] font-black uppercase">
                                        <Move className="w-3 h-3" /> Kéo thả bàn
                                    </div>
                                    <div className={`p-2 rounded-full bg-gray-50 text-gray-400 group-hover:text-orange-600 transition-colors ${expandedZones[zone.id] ? 'rotate-180' : ''}`}>
                                        <ChevronDown className="w-6 h-6 transition-transform duration-300" />
                                    </div>
                                </div>
                            </button>

                            {expandedZones[zone.id] && (
                                <div className="p-8 pt-0 animate-in fade-in slide-in-from-top-4 duration-500">
                                    <TableMap
                                        tables={zone.tables}
                                        onUpdatePosition={handleUpdatePosition}
                                        onUpdateStatus={handleUpdateStatus}
                                        onShowQR={(table: any) => setActiveQRTable(table)}
                                        onDelete={(id: string) => handleDelete(id)}
                                        onEdit={(t: any) => {
                                            setEditingTable(t);
                                            setIsEditOpen(true);
                                        }}
                                    />
                                </div>
                            )}
                        </div>
                    ))}
                </div>
              )}

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

      {/* EDIT MODAL */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
          <DialogContent>
              <DialogHeader>
                  <DialogTitle className="font-bold uppercase tracking-tight">Chỉnh sửa thông tin bàn</DialogTitle>
              </DialogHeader>
              {editingTable && (
                  <div className="space-y-6 py-4">
                      <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase text-gray-400">Số bàn / Tên bàn</Label>
                        <Input value={editingTable.tableNumber} onChange={(e: any) => setEditingTable({...editingTable, tableNumber: e.target.value})} />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase text-gray-400">Số chỗ ngồi</Label>
                            <Input type="number" value={editingTable.capacity} onChange={(e: any) => setEditingTable({...editingTable, capacity: parseInt(e.target.value)})} />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase text-gray-400">Khu vực</Label>
                            <Select
                                value={editingTable.zoneId || "none"}
                                onValueChange={(val: any) => setEditingTable({...editingTable, zoneId: val === "none" ? null : val})}
                            >
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none">Chung</SelectItem>
                                    {allZones.filter(z => z.branchId === editingTable.branchId).map(z => (
                                        <SelectItem key={z.id} value={z.id}>{z.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                          </div>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase text-gray-400">Ghi chú bàn</Label>
                        <Input placeholder="Vd: Gần cửa sổ, view đẹp..." value={editingTable.note || ""} onChange={(e: any) => setEditingTable({...editingTable, note: e.target.value})} />
                      </div>

                      <Button className="w-full bg-orange-600 font-bold h-12 shadow-lg shadow-orange-100" onClick={handleUpdateTable}>LƯU THAY ĐỔI</Button>
                  </div>
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

function TableMap({ tables, onUpdatePosition, onUpdateStatus, onShowQR, onDelete, onEdit }: any) {
    const mapRef = useRef<HTMLDivElement>(null);
    const [draggingTable, setDraggingTable] = useState<any>(null);

    const onMouseDown = (e: React.MouseEvent, table: any) => {
        if ((e.target as HTMLElement).closest('button')) return; // Không drag khi bấm nút xóa/qr
        setDraggingTable({ ...table, startX: e.clientX, startY: e.clientY, initialPosX: table.posX, initialPosY: table.posY });
    };

    const onMouseMove = (e: React.MouseEvent) => {
        if (!draggingTable || !mapRef.current) return;

        const rect = mapRef.current.getBoundingClientRect();
        const deltaX = ((e.clientX - draggingTable.startX) / rect.width) * 100;
        const deltaY = ((e.clientY - draggingTable.startY) / rect.height) * 100;

        let newX = draggingTable.initialPosX + deltaX;
        let newY = draggingTable.initialPosY + deltaY;

        // Giới hạn trong map
        newX = Math.max(0, Math.min(95, newX));
        newY = Math.max(0, Math.min(90, newY));

        setDraggingTable({ ...draggingTable, currentX: newX, currentY: newY });
    };

    const onMouseUp = (e: React.MouseEvent) => {
        if (draggingTable) {
            if (draggingTable.currentX !== undefined) {
                onUpdatePosition(draggingTable.id, draggingTable.currentX, draggingTable.currentY);
            } else {
                // Nếu không drag mà chỉ click -> đổi trạng thái
                onUpdateStatus(draggingTable.id, draggingTable.status);
            }
        }
        setDraggingTable(null);
    };

    return (
        <div
            ref={mapRef}
            className="relative w-full h-[400px] md:h-[600px] bg-gray-50 rounded-[32px] border-2 border-dashed border-gray-200 overflow-hidden cursor-crosshair"
            onMouseMove={onMouseMove}
            onMouseUp={onMouseUp}
            onMouseLeave={(e: any) => onMouseUp(e)}
        >
            {/* Grid Pattern Background */}
            <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>

            {tables.map((t: any) => {
                const isThisDragging = draggingTable?.id === t.id;
                const x = isThisDragging ? (draggingTable.currentX ?? t.posX) : t.posX;
                const y = isThisDragging ? (draggingTable.currentY ?? t.posY) : t.posY;

                return (
                    <div
                        key={t.id}
                        onMouseDown={(e) => onMouseDown(e, t)}
                        style={{ left: `${x}%`, top: `${y}%`, position: 'absolute' }}
                        className={`transition-shadow duration-200 ${isThisDragging ? 'z-50 cursor-grabbing' : 'z-10 cursor-grab hover:scale-105'}`}
                    >

            <Card className={`w-32 border-none shadow-lg overflow-hidden ${
                t.status === 'Occupied' ? 'bg-orange-600 text-white' : 
                t.status === 'Stopped' ? 'bg-gray-200 text-gray-600' : 'bg-white'
            }`}>
                {/* Thanh trạng thái phía trên */}
                <div className={`h-1 w-full ${
                    t.status === 'Occupied' ? 'bg-white/20' : 
                    t.status === 'Stopped' ? 'bg-gray-400' : 'bg-green-500'
                }`}></div>

                <CardContent className="p-3 text-center">
                    {/* Icon: Thay đổi icon khi dừng */}
                    <div className="text-2xl mb-1">
                        {t.status === 'Occupied' ? '🔥' : t.status === 'Stopped' ? '🚫' : '🪑'}
                    </div>

                    {/* Tên bàn: Luôn hiển thị rõ */}
                    <div className={`font-black text-sm ${t.status === 'Stopped' ? 'text-gray-800' : ''}`}>
                        {t.tableNumber}
                    </div>

                    {/* Dòng trạng thái chi tiết */}
                    <div className={`text-[8px] font-bold uppercase mt-1 ${
                        t.status === 'Occupied' ? 'text-white/70' : 'text-gray-400'
                    }`}>
                        {t.capacity} CHỖ • {
                            t.status === 'Occupied' ? 'CÓ KHÁCH' : 
                            t.status === 'Stopped' ? 'ĐANG DỪNG' : 'TRỐNG'
                        }
                    </div>

                    {/* Các nút bấm: Có thể làm mờ hoặc ẩn khi dừng nếu cần */}
                    <div className="flex justify-center gap-1 mt-3">
                        <button
                            onClick={() => onEdit(t)}
                            className={`p-1.5 rounded-lg ${
                                t.status === 'Occupied' ? 'bg-white/10 hover:bg-white/20' : 'bg-gray-50 hover:bg-gray-100'
                            }`}
                        >
                            <Edit2 className="w-3 h-3" />
                        </button>
                        <button
                            onClick={() => onShowQR(t)} 
                            className={`p-1.5 rounded-lg ${
                                t.status === 'Occupied' ? 'bg-white/10 hover:bg-white/20' : 'bg-gray-50 hover:bg-gray-100'
                            }`}
                            disabled={t.status === 'Stopped'}
                        >
                            <QrCode className="w-3 h-3" />
                        </button>
                        <button 
                            onClick={() => onDelete(t.id)} 
                            className={`p-1.5 rounded-lg ${
                                t.status === 'Occupied' ? 'bg-white/10 hover:bg-white/20 text-white' : 'bg-red-50 hover:bg-red-100 text-red-500'
                            }`}
                        >
                            <Trash2 className="w-3 h-3" />
                        </button>
                    </div>
                </CardContent>
            </Card>
                    </div>
                );
            })}
        </div>
    );
}

function TableCard({ table, onDelete, onShowQR, onUpdateStatus, onEdit }: { table: any, onDelete: () => void, onShowQR: () => void, onUpdateStatus: (id: string, s: string) => void, onEdit: (t: any) => void }) {
  return (
    <Card className="group hover:shadow-xl transition-all border-none bg-white shadow-sm overflow-hidden relative">
      <div className={`h-1.5 w-full ${table.status === 'Occupied' ? 'bg-orange-600' : 'bg-green-500'}`}></div>
      <CardContent className="p-5 text-center">
        <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button onClick={() => onEdit(table)} className="p-1 text-gray-400 hover:text-blue-500">
                <Edit2 className="w-3.5 h-3.5" />
            </button>
            <button onClick={onDelete} className="p-1 text-gray-400 hover:text-red-500">
                <Trash2 className="w-3.5 h-3.5" />
            </button>
        </div>
        <div className="text-3xl mb-2 cursor-pointer" onClick={() => onUpdateStatus && onUpdateStatus(table.id, table.status)}>{table.status === 'Occupied' ? '🔥' : '🪑'}</div>
        <div className="font-black text-xl text-gray-900">{table.tableNumber}</div>
        <div className="flex items-center justify-center gap-1 text-xs text-gray-400 mt-1 font-bold uppercase tracking-tighter">
          <Users className="w-3 h-3" /> {table.capacity} chỗ
        </div>
        {table.note && (
            <div className="text-[10px] text-gray-400 italic mt-1 line-clamp-1">
                {table.note}
            </div>
        )}

        <Button variant="outline" onClick={onShowQR} className="w-full border-orange-100 text-orange-600 hover:bg-orange-50 font-bold h-9 text-[10px] gap-2 uppercase tracking-widest mt-4">
          <QrCode className="w-3.5 h-3.5" /> Xem mã QR
        </Button>
      </CardContent>
    </Card>
  );
}
