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
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleApprove = async (id: string) => {
    await api.post(`/users/approve/${id}`);
    fetchData();
  };

  const handleReject = async (id: string) => {
    if (confirm("Từ chối yêu cầu này?")) {
        await api.delete(`/users/reject/${id}`);
        fetchData();
    }
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen text-gray-900">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-black">Quản lý đội ngũ</h1>
        <Button className="bg-orange-600 font-bold"><UserPlus className="w-4 h-4 mr-2" /> Thêm nhân viên</Button>
      </div>

      <Tabs defaultValue="list">
        <TabsList className="mb-6 bg-white border border-gray-100">
          <TabsTrigger value="list" className="px-8">Đang làm việc ({employees.length})</TabsTrigger>
          <TabsTrigger value="requests" className="px-8 gap-2">Yêu cầu mới {pendingRequests.length > 0 && <Badge className="bg-red-500">{pendingRequests.length}</Badge>}</TabsTrigger>
        </TabsList>

        <TabsContent value="list">
          <Card className="border-none shadow-sm">
            <CardContent className="p-0">
               {loading ? <div className="p-20 flex justify-center"><Loader2 className="animate-spin text-orange-600" /></div> : (
                 <Table>
                    <TableHeader className="bg-gray-50"><TableRow>
                       <TableHead className="font-bold">Họ tên</TableHead>
                       <TableHead className="font-bold">Username</TableHead>
                       <TableHead className="font-bold text-right">Hành động</TableHead>
                    </TableRow></TableHeader>
                    <TableBody>
                       {employees.map(emp => (
                         <TableRow key={emp.id}>
                            <TableCell className="font-bold">{emp.fullName}</TableCell>
                            <TableCell>{emp.username}</TableCell>
                            <TableCell className="text-right">
                               <Button variant="ghost" size="icon" className="text-gray-300 hover:text-orange-600"><Edit className="w-4 h-4" /></Button>
                               <Button variant="ghost" size="icon" className="text-gray-300 hover:text-red-500"><Trash2 className="w-4 h-4" /></Button>
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             {pendingRequests.map(req => (
               <Card key={req.id} className="border-none shadow-sm bg-white p-4 flex items-center justify-between">
                  <div>
                    <div className="font-bold text-lg">{req.fullName}</div>
                    <div className="text-sm text-gray-400">@ {req.username}</div>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={() => handleApprove(req.id)} className="bg-green-600 hover:bg-green-700 h-9"><CheckCircle className="w-4 h-4 mr-1" /> Duyệt</Button>
                    <Button onClick={() => handleReject(req.id)} variant="outline" className="text-red-500 h-9 border-red-50"><XCircle className="w-4 h-4" /></Button>
                  </div>
               </Card>
             ))}
             {pendingRequests.length === 0 && <p className="col-span-full text-center py-20 text-gray-400 font-bold">Không có yêu cầu nào mới.</p>}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
