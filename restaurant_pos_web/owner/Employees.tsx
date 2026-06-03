import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Search, Edit, Trash2, CheckCircle, XCircle, Loader2, UserPlus } from "lucide-react";
import api from "../services/api";

export function OwnerEmployees() {
  const [employees, setEmployees] = useState<any[]>([]);
  const [pendingRequests, setPendingRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchData = async () => {
    try {
      setLoading(true);
      const [empRes, reqRes] = await Promise.all([api.get("/users"), api.get("/users/pending-requests")]);
      setEmployees(empRes.data);
      setPendingRequests(reqRes.data);
    } catch (err) {
        console.error("Lỗi lấy dữ liệu nhân viên");
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleApprove = async (id: string) => {
    try {
      await api.post(`/users/approve/${id}`);
      fetchData();
    } catch { alert("Lỗi khi duyệt"); }
  };

  const handleReject = async (id: string) => {
    if (confirm("Từ chối yêu cầu gia nhập này?")) {
        try {
          await api.delete(`/users/reject/${id}`);
          fetchData();
        } catch { alert("Lỗi khi từ chối"); }
    }
  };

  const filteredEmployees = employees.filter(emp =>
    emp.fullName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-8 bg-gray-50 min-h-screen text-gray-900">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-black">Quản lý đội ngũ</h1>
          <p className="text-gray-500">Phê duyệt và quản lý tài khoản nhân viên</p>
        </div>
        <Button className="bg-orange-600 font-bold shadow-lg shadow-orange-100"><UserPlus className="w-4 h-4 mr-2" /> Thêm nhân viên</Button>
      </div>

      <Tabs defaultValue="list">
        <TabsList className="mb-6 bg-white border border-gray-100 p-1 rounded-xl shadow-sm">
          <TabsTrigger value="list" className="px-8 font-bold">Đang làm việc ({employees.length})</TabsTrigger>
          <TabsTrigger value="requests" className="px-8 font-bold gap-2">Yêu cầu mới {pendingRequests.length > 0 && <Badge className="bg-red-500 text-white border-none">{pendingRequests.length}</Badge>}</TabsTrigger>
        </TabsList>

        <TabsContent value="list">
          <Card className="border-none shadow-sm overflow-hidden">
            <CardHeader className="bg-white border-b border-gray-50">
               <div className="relative max-w-sm">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input placeholder="Tìm theo tên..." className="pl-10 h-10 border-none bg-gray-50" value={searchTerm} onChange={(e: any) => setSearchTerm(e.target.value)} />
               </div>
            </CardHeader>
            <CardContent className="p-0">
               {loading ? <div className="p-20 flex justify-center"><Loader2 className="animate-spin text-orange-600" /></div> : (
                 <Table>
                    <TableHeader className="bg-gray-50/50"><TableRow>
                       <TableHead className="font-bold">Họ tên</TableHead>
                       <TableHead className="font-bold">Tên đăng nhập</TableHead>
                       <TableHead className="font-bold">Trạng thái</TableHead>
                       <TableHead className="font-bold text-right">Hành động</TableHead>
                    </TableRow></TableHeader>
                    <TableBody>
                       {filteredEmployees.map(emp => (
                         <TableRow key={emp.id} className="hover:bg-gray-50/50 transition-colors">
                            <TableCell className="font-black text-gray-900">{emp.fullName}</TableCell>
                            <TableCell className="text-gray-500">@{emp.username}</TableCell>
                            <TableCell><Badge className="bg-green-50 text-green-700 border-none font-bold uppercase text-[10px]">Đang làm việc</Badge></TableCell>
                            <TableCell className="text-right">
                               <div className="flex justify-end gap-1">
                                  <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-300 hover:text-orange-600 transition-colors"><Edit className="w-4 h-4" /></Button>
                                  <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-300 hover:text-red-500 transition-colors"><Trash2 className="w-4 h-4" /></Button>
                               </div>
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
             {pendingRequests.map(req => (
               <Card key={req.id} className="border-none shadow-md bg-white p-6 relative overflow-hidden group">
                  <div className="absolute top-0 left-0 w-1 h-full bg-orange-600"></div>
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <div className="font-black text-xl text-gray-900">{req.fullName}</div>
                      <div className="text-sm text-gray-400 font-bold uppercase tracking-tighter">@{req.username}</div>
                    </div>
                    <div className="w-12 h-12 rounded-2xl bg-orange-50 flex items-center justify-center text-orange-600 text-xl font-bold">
                       {req.fullName.charAt(0)}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={() => handleApprove(req.id)} className="flex-1 bg-green-600 hover:bg-green-700 font-bold h-10 shadow-lg shadow-green-100"><CheckCircle className="w-4 h-4 mr-2" /> Duyệt</Button>
                    <Button onClick={() => handleReject(req.id)} variant="outline" className="px-3 border-red-100 text-red-500 hover:bg-red-50 h-10"><XCircle className="w-5 h-5" /></Button>
                  </div>
               </Card>
             ))}
             {pendingRequests.length === 0 && (
                 <div className="col-span-full text-center py-20 bg-white rounded-3xl border-2 border-dashed border-gray-100 shadow-inner">
                    <p className="text-gray-400 font-black uppercase tracking-widest text-xs">Hiện tại không có yêu cầu nào.</p>
                 </div>
             )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
