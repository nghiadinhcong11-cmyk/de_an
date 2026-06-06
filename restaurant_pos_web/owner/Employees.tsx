import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import { Avatar, AvatarFallback } from "../components/ui/avatar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Label } from "../components/ui/label";
import { Search, Edit, Trash2, CheckCircle, XCircle, Loader2, UserPlus, MapPin, ShieldCheck } from "lucide-react";
import api from "../services/api";

export function OwnerEmployees() {
  const [employees, setEmployees] = useState<any[]>([]);
  const [pendingRequests, setPendingRequests] = useState<any[]>([]);
  const [branches, setBranches] = useState<any[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Edit employee state
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedEmp, setSelectedEmp] = useState<any>(null);
  const [editForm, setEditForm] = useState({ branchId: "", roleName: "" });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [empRes, reqRes, branchRes, rolesRes] = await Promise.all([
        api.get("/users"),
        api.get("/users/pending-requests"),
        api.get("/branches"),
        api.get("/users/roles")
      ]);
      setEmployees(empRes.data);
      setPendingRequests(reqRes.data);
      setBranches(branchRes.data);
      setRoles(rolesRes.data);
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

  const handleEditClick = (emp: any) => {
    setSelectedEmp(emp);
    setEditForm({
        branchId: emp.branchId || "all",
        roleName: emp.roleName
    });
    setIsEditOpen(true);
  };

  const handleUpdate = async () => {
    try {
      await api.put(`/users/${selectedEmp.id}`, {
        branchId: editForm.branchId === "all" ? null : editForm.branchId,
        roleName: editForm.roleName
      });
      setIsEditOpen(false);
      fetchData();
    } catch { alert("Lỗi khi cập nhật"); }
  };

  const filteredEmployees = employees.filter(emp =>
    emp.fullName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-4 md:p-8 bg-gray-50 min-h-screen text-gray-900">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-black">Quản lý đội ngũ</h1>
          <p className="text-gray-500">Phê duyệt và quản lý tài khoản nhân viên</p>
        </div>
        <Button className="bg-orange-600 font-bold shadow-lg shadow-orange-100 w-full sm:w-auto"><UserPlus className="w-4 h-4 mr-2" /> Thêm nhân viên</Button>
      </div>

      <Tabs defaultValue="list">
        <TabsList className="mb-6 bg-white border border-gray-100 p-1 rounded-xl shadow-sm flex flex-wrap h-auto">
          <TabsTrigger value="list" className="flex-1 sm:flex-none px-8 font-bold">Đang làm việc ({employees.length})</TabsTrigger>
          <TabsTrigger value="requests" className="flex-1 sm:flex-none px-8 font-bold gap-2">Yêu cầu mới {pendingRequests.length > 0 && <Badge className="bg-red-500 text-white border-none">{pendingRequests.length}</Badge>}</TabsTrigger>
        </TabsList>

        <TabsContent value="list">
          <Card className="border-none shadow-sm overflow-hidden">
            <CardHeader className="bg-white border-b border-gray-50">
               <div className="relative max-w-sm w-full">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input placeholder="Tìm theo tên..." className="pl-10 h-10 border-none bg-gray-50" value={searchTerm} onChange={(e: any) => setSearchTerm(e.target.value)} />
               </div>
            </CardHeader>
            <CardContent className="p-0 overflow-x-auto">
               {loading ? <div className="p-10 md:p-20 flex justify-center"><Loader2 className="animate-spin text-orange-600" /></div> : (
                 <Table>
                    <TableHeader className="bg-gray-50/50"><TableRow>
                       <TableHead className="font-bold">Họ tên</TableHead>
                       <TableHead className="font-bold">Vai trò</TableHead>
                       <TableHead className="font-bold">Cơ sở</TableHead>
                       <TableHead className="font-bold">Trạng thái</TableHead>
                       <TableHead className="font-bold text-right">Hành động</TableHead>
                    </TableRow></TableHeader>
                    <TableBody>
                       {filteredEmployees.map(emp => (
                         <TableRow key={emp.id} className="hover:bg-gray-50/50 transition-colors">
                            <TableCell>
                                <div className="flex items-center gap-3">
                                    <Avatar className="w-8 h-8">
                                        {emp.avatarUrl ? (
                                            <img src={emp.avatarUrl} alt={emp.fullName} className="aspect-square h-full w-full object-cover rounded-full" />
                                        ) : (
                                            <AvatarFallback className="bg-orange-100 text-orange-600 text-[10px] font-black">
                                                {emp.fullName.charAt(0)}
                                            </AvatarFallback>
                                        )}
                                    </Avatar>
                                    <div>
                                        <div className="font-black text-gray-900">{emp.fullName}</div>
                                        <div className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">@{emp.username}</div>
                                    </div>
                                </div>
                            </TableCell>
                            <TableCell>
                                <Badge variant="outline" className={`font-bold border-none ${
                                    emp.roleName === 'Owner' ? 'bg-purple-50 text-purple-600' :
                                    emp.roleName === 'Manager' ? 'bg-blue-50 text-blue-600' : 'bg-gray-50 text-gray-600'
                                }`}>
                                    {emp.roleName === 'Owner' ? 'Chủ quán' :
                                     emp.roleName === 'Manager' ? 'Quản lý' :
                                     emp.roleName === 'Cashier' ? 'Thu ngân' : 'Phục vụ'}
                                </Badge>
                            </TableCell>
                            <TableCell>
                                <div className="flex items-center gap-1.5 text-gray-600 font-bold text-xs">
                                    <div className="w-1.5 h-1.5 rounded-full bg-orange-500"></div>
                                    {emp.branchName}
                                </div>
                            </TableCell>
                            <TableCell><Badge className="bg-green-50 text-green-700 border-none font-bold uppercase text-[10px]">Đang làm việc</Badge></TableCell>
                            <TableCell className="text-right">
                               <div className="flex justify-end gap-1">
                                  <Button onClick={() => handleEditClick(emp)} variant="ghost" size="icon" className="h-8 w-8 text-gray-300 hover:text-orange-600 transition-colors"><Edit className="w-4 h-4" /></Button>
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
                    <Avatar className="w-12 h-12">
                        {req.avatarUrl ? (
                            <img src={req.avatarUrl} alt={req.fullName} className="aspect-square h-full w-full object-cover rounded-2xl" />
                        ) : (
                            <div className="w-12 h-12 rounded-2xl bg-orange-50 flex items-center justify-center text-orange-600 text-xl font-bold uppercase">
                                {req.fullName.charAt(0)}
                            </div>
                        )}
                    </Avatar>
                  </div>

                  <div className="space-y-3 mb-6 bg-gray-50/50 p-3 rounded-2xl">
                     <div className="flex items-center gap-2 text-sm">
                        <ShieldCheck className="w-4 h-4 text-orange-600" />
                        <span className="text-gray-400 font-bold uppercase text-[10px]">Vị trí mong muốn:</span>
                        <span className="font-black text-gray-900">{req.roleName}</span>
                     </div>
                     <div className="flex items-center gap-2 text-sm">
                        <MapPin className="w-4 h-4 text-blue-600" />
                        <span className="text-gray-400 font-bold uppercase text-[10px]">Cơ sở đăng ký:</span>
                        <span className="font-black text-gray-900">{req.branchName}</span>
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

      {/* EDIT DIALOG */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
                <DialogTitle className="text-2xl font-black">Chỉnh sửa nhân sự</DialogTitle>
            </DialogHeader>
            <div className="space-y-6 py-4">
                <div className="flex items-center gap-4 p-4 bg-orange-50 rounded-2xl">
                    <Avatar className="w-12 h-12 shadow-sm">
                        <AvatarFallback className="bg-white text-orange-600 font-black">{selectedEmp?.fullName?.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                        <p className="font-black text-gray-900">{selectedEmp?.fullName}</p>
                        <p className="text-xs text-gray-400 font-bold uppercase">@{selectedEmp?.username}</p>
                    </div>
                </div>

                <div className="space-y-2">
                    <Label className="font-bold text-[10px] text-gray-400 uppercase tracking-widest">Vai trò hệ thống</Label>
                    <Select value={editForm.roleName} onValueChange={(val) => setEditForm({...editForm, roleName: val})}>
                        <SelectTrigger className="h-12 rounded-xl border-gray-100"><SelectValue /></SelectTrigger>
                        <SelectContent>
                            {roles.map(r => <SelectItem key={r.id} value={r.name}>{r.name === 'Owner' ? 'Chủ quán' : r.name === 'Manager' ? 'Quản lý' : r.name === 'Cashier' ? 'Thu ngân' : 'Phục vụ'}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2">
                    <Label className="font-bold text-[10px] text-gray-400 uppercase tracking-widest">Cơ sở làm việc</Label>
                    <Select value={editForm.branchId} onValueChange={(val) => setEditForm({...editForm, branchId: val})}>
                        <SelectTrigger className="h-12 rounded-xl border-gray-100"><SelectValue /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Toàn hệ thống</SelectItem>
                            {branches.map(b => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>

                <Button onClick={handleUpdate} className="w-full h-12 bg-orange-600 hover:bg-orange-700 font-black text-lg shadow-xl shadow-orange-100 mt-4 rounded-xl">LƯU THAY ĐỔI</Button>
            </div>
          </DialogContent>
      </Dialog>
    </div>
  );
}
