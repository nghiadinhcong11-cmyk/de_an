import { useState, useEffect } from "react";
import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { Plus, Percent, DollarSign, Gift, Loader2 } from "lucide-react";
import api from "../services/api";

export function OwnerVouchers() {
  const [vouchers, setVouchers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVouchers = async () => {
      try {
        const res = await api.get("/vouchers");
        setVouchers(res.data);
      } finally {
        setLoading(false);
      }
    };
    fetchVouchers();
  }, []);

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Mã giảm giá</h1>
          <p className="text-gray-600 mt-1">Quản lý các chương trình khuyến mãi</p>
        </div>
        <Button className="bg-orange-600 font-bold"><Plus className="w-4 h-4 mr-2" /> Tạo Voucher</Button>
      </div>

      <Card className="border-none shadow-sm">
        <CardContent className="p-6">
          {loading ? <Loader2 className="animate-spin mx-auto" /> : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Mã</TableHead>
                  <TableHead>Giá trị</TableHead>
                  <TableHead>Mô tả</TableHead>
                  <TableHead>Trạng thái</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {vouchers.map((voucher) => (
                  <TableRow key={voucher.id}>
                    <TableCell><code className="bg-orange-50 text-orange-600 px-2 py-1 rounded font-bold">{voucher.code}</code></TableCell>
                    <TableCell className="font-bold">{voucher.discountValue}{voucher.discountType === 'percentage' ? '%' : '$'}</TableCell>
                    <TableCell className="text-gray-500">{voucher.name}</TableCell>
                    <TableCell><Badge>{voucher.isActive ? "Đang chạy" : "Dừng"}</Badge></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
          {!loading && vouchers.length === 0 && <p className="text-center py-10 text-gray-400">Chưa có mã giảm giá nào.</p>}
        </CardContent>
      </Card>
    </div>
  );
}
