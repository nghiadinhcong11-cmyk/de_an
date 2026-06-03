import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Avatar, AvatarFallback } from "../components/ui/avatar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { Search, Loader2 } from "lucide-react";
import api from "../services/api";

export function OwnerCustomers() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const res = await api.get("/customers"); // Chữ thường đồng bộ
        setCustomers(res.data);
      } catch (err) {
        console.error("Lỗi tải khách hàng");
      } finally {
        setLoading(false);
      }
    };
    fetchCustomers();
  }, []);

  const filteredCustomers = customers.filter(
    (customer) =>
      customer.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.phoneNumber.includes(searchTerm)
  );

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-black text-gray-900">Quản lý khách hàng</h1>
        <p className="text-gray-600 mt-1">Danh sách khách hàng thân thiết của nhà hàng</p>
      </div>

      <Card className="border-none shadow-sm">
        <CardHeader>
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Tìm theo tên hoặc số điện thoại..."
              value={searchTerm}
              onChange={(e: any) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardHeader>
        <CardContent>
          {loading ? <Loader2 className="animate-spin mx-auto" /> : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Khách hàng</TableHead>
                  <TableHead>Liên hệ</TableHead>
                  <TableHead>Điểm tích lũy</TableHead>
                  <TableHead>Tổng chi tiêu</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCustomers.map((customer) => (
                  <TableRow key={customer.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarFallback className="bg-orange-100 text-orange-600">
                            {customer.fullName.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="font-bold">{customer.fullName}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{customer.phoneNumber}</div>
                        <div className="text-gray-400">{customer.email}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                        <span className="font-bold text-orange-600">{customer.points} pts</span>
                    </TableCell>
                    <TableCell>
                      <span className="font-bold">${customer.totalSpent?.toFixed(2)}</span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
          {!loading && filteredCustomers.length === 0 && <p className="text-center py-10 text-gray-400">Không tìm thấy khách hàng nào.</p>}
        </CardContent>
      </Card>
    </div>
  );
}
