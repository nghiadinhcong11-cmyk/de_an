import { useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "../components/ui/dialog";
import { Label } from "../components/ui/label";
import { Input } from "../components/ui/input";
import { Plus, Users, QrCode, Printer } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { mockTables, mockRestaurant, type Table } from "../data/mockData";

const statusColors: any = {
  available: "bg-green-100 text-green-800 border-green-200",
  occupied: "bg-red-100 text-red-800 border-red-200",
  reserved: "bg-blue-100 text-blue-800 border-blue-200",
  "waiting-payment": "bg-yellow-100 text-yellow-800 border-yellow-200",
};

const statusLabels: any = {
  available: "Trống",
  occupied: "Đang dùng",
  reserved: "Đã đặt",
  "waiting-payment": "Chờ thanh toán",
};

function TableQRDialog({ table }: { table: Table }) {
  const qrRef = useRef<HTMLDivElement>(null);
  const tableUrl = `${window.location.origin}/qr/${table.id}`;

  const handlePrint = () => {
    const printContent = qrRef.current;
    if (!printContent) return;
    const win = window.open("", "_blank", "width=400,height=560");
    if (!win) return;
    win.document.write(`
      <html>
        <head>
          <title>QR Bàn ${table.number} - ${mockRestaurant.name}</title>
          <style>
            * { box-sizing: border-box; }
            body { font-family: sans-serif; display: flex; justify-content: center; align-items: center; min-height: 100vh; margin: 0; background: #fff; }
            .card { text-align: center; padding: 32px 24px; border: 3px solid #ea580c; border-radius: 20px; width: 280px; }
            .restaurant { font-size: 13px; color: #6b7280; margin: 0 0 4px; }
            .table-num { font-size: 36px; font-weight: 800; color: #ea580c; margin: 8px 0 16px; }
            .seats { font-size: 12px; color: #9ca3af; margin-top: 12px; }
            .hint { font-size: 13px; color: #374151; margin-top: 8px; font-weight: 600; }
          </style>
        </head>
        <body>
          <div class="card">
            <p class="restaurant">${mockRestaurant.name}</p>
            <div class="table-num">Bàn ${table.number}</div>
            ${printContent.innerHTML}
            <p class="seats">${table.capacity} chỗ ngồi</p>
            <p class="hint">📱 Quét để gọi món</p>
          </div>
        </body>
      </html>
    `);
    win.document.close();
    win.focus();
    setTimeout(() => { win.print(); win.close(); }, 400);
  };

  return (
    <Dialog onOpenChange={() => {}}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1 w-full mt-1 border-orange-200 text-orange-700">
          <QrCode className="w-3 h-3" />
          Xem QR
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>QR Code — Bàn {table.number}</DialogTitle>
          <DialogDescription>In và dán vào bàn để khách quét gọi món</DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center gap-4 py-2">
          <div className="flex flex-col items-center gap-3 p-6 border-2 border-orange-600 rounded-2xl bg-white w-full">
            <p className="text-gray-400 text-sm">{mockRestaurant.name}</p>
            <div className="text-3xl font-bold text-orange-600">Bàn {table.number}</div>
            <div ref={qrRef}>
              <QRCodeSVG
                value={tableUrl}
                size={180}
                fgColor="#ea580c"
                level="M"
                includeMargin
              />
            </div>
            <p className="text-xs text-gray-400">{table.capacity} chỗ ngồi</p>
          </div>

          <p className="text-xs text-gray-400 text-center break-all px-2">{tableUrl}</p>

          <Button onClick={handlePrint} className="w-full gap-2 bg-orange-600 hover:bg-orange-700">
            <Printer className="w-4 h-4" />
            In QR Code
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function OwnerTables() {
  const [tables, setTables] = useState(mockTables);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newNumber, setNewNumber] = useState("");
  const [newCapacity, setNewCapacity] = useState("");

  const handleAddTable = () => {
    if (!newNumber) return;
    const newTable: Table = {
      id: String(tables.length + 1),
      number: newNumber,
      status: "available",
      capacity: Number(newCapacity) || 4,
    };
    setTables([...tables, newTable]);
    setNewNumber("");
    setNewCapacity("");
    setIsAddOpen(false);
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">Quản lý bàn ăn</h1>
          <p className="text-gray-600 mt-1">Sơ đồ bàn và QR code để khách gọi món</p>
        </div>
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button className="bg-orange-600 hover:bg-orange-700">
              <Plus className="w-4 h-4 mr-2" />
              Thêm bàn
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Thêm bàn mới</DialogTitle>
              <DialogDescription>Tạo bàn và sinh QR tự động</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="tableNumber">Số bàn</Label>
                <Input
                  id="tableNumber"
                  placeholder="11"
                  value={newNumber}
                  onChange={(e: any) => setNewNumber(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="capacity">Số chỗ ngồi</Label>
                <Input
                  id="capacity"
                  type="number"
                  placeholder="4"
                  value={newCapacity}
                  onChange={(e: any) => setNewCapacity(e.target.value)}
                />
              </div>
              <Button className="w-full bg-orange-600 hover:bg-orange-700" onClick={handleAddTable}>
                Tạo bàn
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-gray-500">Tổng số bàn</div>
            <div className="text-2xl font-bold mt-1">{tables.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-gray-500">Trống</div>
            <div className="text-2xl font-bold text-green-600 mt-1">
              {tables.filter((t) => t.status === "available").length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-gray-500">Đang dùng</div>
            <div className="text-2xl font-bold text-red-600 mt-1">
              {tables.filter((t) => t.status === "occupied").length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-gray-500">Đã đặt</div>
            <div className="text-2xl font-bold text-blue-600 mt-1">
              {tables.filter((t) => t.status === "reserved").length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Floor plan */}
      <Card>
        <CardHeader>
          <CardTitle>Sơ đồ bàn</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {tables.map((table) => (
              <div
                key={table.id}
                className={`border-2 rounded-xl p-4 transition-all hover:shadow-lg ${statusColors[table.status]}`}
              >
                <div className="text-center">
                  <div className="text-3xl mb-1">🪑</div>
                  <div className="font-semibold text-lg">Bàn {table.number}</div>
                  <div className="flex items-center justify-center gap-1 text-sm my-1">
                    <Users className="w-3 h-3" />
                    <span>{table.capacity} chỗ</span>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {statusLabels[table.status]}
                  </Badge>
                  {table.currentOrder && (
                    <div className="text-xs mt-1 opacity-70">{table.currentOrder}</div>
                  )}
                  <TableQRDialog table={table} />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
