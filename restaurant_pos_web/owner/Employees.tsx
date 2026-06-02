import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Plus, Search, Edit, Trash2, CheckCircle, XCircle, Loader2 } from "lucide-react";
import api from "../services/api";

export function OwnerEmployees() {
  const [employees, setEmployees] = useState<any[]>([]);
  const [pendingRequests, setPendingRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchData = async () => {
    try {
      setLoading(true);
      const [empRes, reqRes] = await Promise.all([
        api.get("/users"),
        api.get("/users/pending-requests")
      ]);
      setEmployees(empRes.data);
      setPendingRequests(reqRes.data);
    } catch (err) {
      console.error("Lỗi lấy dữ liệu nhân viên");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleApprove = async (userId: string) => {
    if (!confirm("Bạn có chắc chắn muốn duyệt nhân viên này?")) return;
    try {
      await api.post(`/users/approve/${userId}`);
      fetchData();
    } catch (err) {
      alert("Lỗi khi duyệt");
    }
  };

  const handleReject = async (userId: string) => {
    if (!confirm("Từ chối yêu cầu gia nhập này?")) return;
    try {
      await api.delete(`/users/reject/${userId}`);
      fetchData();
    } catch (err) {
      alert("Lỗi khi từ chối");
    }
  };

  const filteredEmployees = employees.filter(emp =>
    emp.fullName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">Quản lý nhân viên</h1>
          <p className="text-gray-600 mt-1">Danh sách nhân viên và yêu cầu tham gia</p>
        </div>
        <Button className="bg-orange-600"><Plus className="w-4 h-4 mr-2" /> Thêm trực tiếp</Button>
      </div>

      <Tabs defaultValue="employees">
        <TabsList className="mb-6">
          <TabsTrigger value="employees">Danh sách đang làm ({employees.length})</TabsTrigger>
          <TabsTrigger value="requests" className="gap-2">
            Yêu cầu chờ duyệt
            {pendingRequests.length > 0 && (
              <span className="bg-red-500 text-white text-[10px] rounded-full px-1.5 py-0.5">
                {pendingRequests.length}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="employees">
          <Card className="border-none shadow-sm">
            <CardHeader>
              <div className="relative max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input placeholder="Tìm nhân viên..." className="pl-10" value={searchTerm} onChange={(e: any) => setSearchTerm(e.target.value)} />
              </div>
            </CardHeader>
            <CardContent>
              {loading ? <Loader2 className="animate-spin mx-auto" /> : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Họ tên</TableHead>
                      <TableHead>Tên đăng nhập</TableHead>
                      <TableHead>Trạng thái</TableHead>
                      <TableHead className="text-right">Thao tác</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredEmployees.map((emp) => (
                      <TableRow key={emp.id}>
                        <TableCell className="font-bold">{emp.fullName}</TableCell>
                        <TableCell>{emp.username}</TableCell>
                        <TableCell><Badge>Đang làm việc</Badge></TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="icon"><Edit className="w-4 h-4" /></Button>
                          <Button variant="ghost" size="icon" className="text-red-500"><Trash2 className="w-4 h-4" /></Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="requests">
          <Card className="border-none shadow-sm">
            <CardContent className="pt-6">
              {pendingRequests.length === 0 ? <p className="text-center text-gray-500">Không có yêu cầu nào.</p> : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Họ tên</TableHead>
                      <TableHead>Tên đăng nhập</TableHead>
                      <TableHead className="text-right">Hành động</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pendingRequests.map((req) => (
                      <TableRow key={req.id}>
                        <TableCell className="font-bold">{req.fullName}</TableCell>
                        <TableCell>{req.username}</TableCell>
                        <TableCell className="text-right space-x-2">
                          <Button
                            size="sm"
                            className="bg-green-600 hover:bg-green-700 gap-1"
                            onClick={() => handleApprove(req.id)}
                          >
                            <CheckCircle className="w-3 h-3" /> Duyệt
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-red-600 border-red-200 gap-1"
                            onClick={() => handleReject(req.id)}
                          >
                            <XCircle className="w-3 h-3" /> Từ chối
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
