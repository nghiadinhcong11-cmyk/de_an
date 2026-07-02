import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import { Avatar, AvatarFallback } from "../components/ui/avatar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Label } from "../components/ui/label";
import { Search, Edit, Trash2, CheckCircle, XCircle, Loader2, UserPlus, MapPin, ShieldCheck, Lock, Unlock, Star, Award, TrendingUp, Trophy, Plus } from "lucide-react";
import api from "../services/api";

export function OwnerEmployees() {
  const [employees, setEmployees] = useState<any[]>([]);
  const [pendingRequests, setPendingRequests] = useState<any[]>([]);
  const [branches, setBranches] = useState<any[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [performance, setPerformance] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Edit employee state
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [newRoleName, setNewRoleName] = useState("");
  const [selectedEmp, setSelectedEmp] = useState<any>(null);
  const [editForm, setEditForm] = useState({ branchId: "", roleName: "" });
  const [addForm, setAddForm] = useState({
      fullName: "",
      username: "",
      password: "",
      roleName: "Waiter",
      branchId: "all"
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      // Sử dụng Promise.allSettled để tránh việc một API lỗi làm đứng cả trang
      const results = await Promise.allSettled([
        api.get("/users"),
        api.get("/users/pending-requests"),
        api.get("/branches"),
        api.get("/users/roles"),
        api.get("/reports/staff-performance")
      ]);

      if (results[0].status === 'fulfilled') setEmployees(results[0].value.data);
      if (results[1].status === 'fulfilled') setPendingRequests(results[1].value.data);

      if (results[2].status === 'fulfilled') {
        const branchData = results[2].value.data;
        setBranches(branchData);
        if (branchData.length > 0 && addForm.branchId === "all") {
          setAddForm(prev => ({ ...prev, branchId: branchData[0].id }));
        }
      }

      if (results[3].status === 'fulfilled') setRoles(results[3].value.data);
      if (results[4].status === 'fulfilled') setPerformance(results[4].value.data);

    } catch (err) {
        console.error("Lỗi lấy dữ liệu nhân viên", err);
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleAddEmployee = async () => {
      if (!addForm.fullName || !addForm.username || !addForm.password) {
          return alert("Vui lòng nhập đầy đủ thông tin bắt buộc");
      }
      try {
          await api.post("/users", {
              ...addForm,
              branchId: addForm.branchId === "all" ? null : addForm.branchId
          });
          setIsAddOpen(false);
          setAddForm({ fullName: "", username: "", password: "", roleName: "Waiter", branchId: "all" });
          fetchData();
      } catch (err: any) {
          alert(err.response?.data?.message || "Lỗi khi tạo nhân viên");
      }
  };

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

  const handleToggleLock = async (id: string) => {
    try {
      await api.post(`/users/toggle-active/${id}`);
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || "Lỗi khi thay đổi trạng thái");
    }
  };

  const handleDeleteEmployee = async (id: string) => {
    if (!confirm("Xác nhận XÓA VĨNH VIỄN nhân viên này khỏi hệ thống? Thao tác này không thể hoàn tác.")) return;
    try {
      await api.delete(`/users/delete/${id}`);
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || "Lỗi khi xóa nhân viên");
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

  const handleCreateRole = async () => {
    if (!newRoleName.trim()) return alert("Vui lòng nhập tên vai trò");
    try {
      await api.post("/users/roles", { name: newRoleName });
      setNewRoleName("");
      setIsRoleModalOpen(false);
      fetchData();
    } catch (err: any) {
      alert(err.response?.data || "Lỗi khi tạo vai trò");
    }
  };

  const handleDeleteRole = async (id: string) => {
    if (!confirm("Xóa vai trò này?")) return;
    try {
      await api.delete(`/users/roles/${id}`);
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || "Lỗi khi xóa vai trò");
    }
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
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <Button onClick={() => setIsAddOpen(true)} className="bg-orange-600 font-bold shadow-lg shadow-orange-100 w-full sm:w-auto">
                <UserPlus className="w-4 h-4 mr-2" /> Thêm nhân viên
            </Button>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-black">Thêm nhân viên mới</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="space-y-1.5">
                        <Label className="text-[10px] font-black uppercase text-gray-400">Họ và tên</Label>
                        <Input value={addForm.fullName} onChange={(e: any) => setAddForm({...addForm, fullName: e.target.value})} placeholder="Vd: Nguyễn Văn A" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <Label className="text-[10px] font-black uppercase text-gray-400">Tên đăng nhập</Label>
                            <Input value={addForm.username} onChange={(e: any) => setAddForm({...addForm, username: e.target.value})} placeholder="Vd: nva_waiter" />
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-[10px] font-black uppercase text-gray-400">Mật khẩu</Label>
                            <Input type="password" value={addForm.password} onChange={(e: any) => setAddForm({...addForm, password: e.target.value})} placeholder="••••••" />
                        </div>
                    </div>
                    <div className="space-y-1.5">
                        <Label className="text-[10px] font-black uppercase text-gray-400">Vai trò</Label>
                        <Select value={addForm.roleName} onValueChange={(val) => setAddForm({...addForm, roleName: val})}>
                            <SelectTrigger className="h-11 rounded-xl"><SelectValue /></SelectTrigger>
                            <SelectContent>
                                {roles.filter(r => r.name !== 'Owner').map(r => (
                                    <SelectItem key={r.id} value={r.name}>
                                        {r.name === 'Manager' ? 'Quản lý' :
                                         r.name === 'Cashier' ? 'Thu ngân' :
                                         r.name === 'Waiter' ? 'Phục vụ' : r.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-1.5">
                        <Label className="text-[10px] font-black uppercase text-gray-400">Chi nhánh làm việc</Label>
                        <Select value={addForm.branchId} onValueChange={(val) => setAddForm({...addForm, branchId: val})}>
                            <SelectTrigger className="h-11 rounded-xl"><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Toàn hệ thống</SelectItem>
                                {branches.map(b => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                    <Button onClick={handleAddEmployee} className="w-full bg-orange-600 h-12 font-black mt-4 rounded-xl shadow-lg shadow-orange-100">
                        TẠO TÀI KHOẢN
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="list">
        <TabsList className="mb-6 bg-white border border-gray-100 p-1 rounded-xl shadow-sm flex flex-wrap h-auto">
          <TabsTrigger value="list" className="flex-1 sm:flex-none px-8 font-bold">Đang làm việc ({employees.length})</TabsTrigger>
          <TabsTrigger value="requests" className="flex-1 sm:flex-none px-8 font-bold gap-2">Yêu cầu mới {pendingRequests.length > 0 && <Badge className="bg-red-500 text-white border-none">{pendingRequests.length}</Badge>}</TabsTrigger>
          <TabsTrigger value="roles" className="flex-1 sm:flex-none px-8 font-bold">Cấu hình Vai trò</TabsTrigger>
          <TabsTrigger value="performance" className="flex-1 sm:flex-none px-8 font-bold gap-2">
            <Trophy className="w-4 h-4 text-orange-500" /> Bảng vàng nhân sự
          </TabsTrigger>
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
                                <div className={`px-2 py-0.5 rounded-full font-bold text-[10px] inline-block ${
                                    emp.roleName === 'Owner' ? 'bg-purple-50 text-purple-600' :
                                    emp.roleName === 'Manager' ? 'bg-blue-50 text-blue-600' : 'bg-gray-50 text-gray-600'
                                }`}>
                                    {emp.roleName === 'Owner' ? 'Chủ quán' :
                                     emp.roleName === 'Manager' ? 'Quản lý' :
                                     emp.roleName === 'Cashier' ? 'Thu ngân' :
                                     emp.roleName === 'Waiter' ? 'Phục vụ' : emp.roleName}
                                </div>
                            </TableCell>
                            <TableCell>
                                <div className="flex items-center gap-1.5 text-gray-600 font-bold text-xs">
                                    <div className="w-1.5 h-1.5 rounded-full bg-orange-500"></div>
                                    {emp.branchName}
                                </div>
                            </TableCell>
                            <TableCell>
                              {emp.isActive ? (
                                <div className="bg-green-50 text-green-700 px-2 py-0.5 rounded-full font-bold uppercase text-[10px] inline-block">Đang làm việc</div>
                              ) : (
                                <div className="bg-red-50 text-red-600 px-2 py-0.5 rounded-full font-bold uppercase text-[10px] inline-block whitespace-nowrap flex items-center gap-1">
                                  <Lock className="w-2.5 h-2.5" /> Tài khoản bị khóa
                                </div>
                              )}
                            </TableCell>
                            <TableCell className="text-right">
                               <div className="flex justify-end gap-1">
                                  <Button
                                    onClick={() => handleToggleLock(emp.id)}
                                    variant="ghost" size="icon"
                                    disabled={emp.roleName === 'Owner'}
                                    title={emp.roleName === 'Owner' ? "Không thể khóa tài khoản chủ quán" : (emp.isActive ? "Khóa tài khoản" : "Mở khóa tài khoản")}
                                    className={`h-8 w-8 transition-colors ${emp.roleName === 'Owner' ? 'opacity-20 cursor-not-allowed' : (emp.isActive ? 'text-gray-300 hover:text-orange-600' : 'text-orange-600 hover:text-green-600')}`}
                                  >
                                    {emp.isActive ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                                  </Button>
                                  <Button onClick={() => handleEditClick(emp)} variant="ghost" size="icon" title="Chỉnh sửa" className="h-8 w-8 text-gray-300 hover:text-blue-600 transition-colors"><Edit className="w-4 h-4" /></Button>
                                  <Button
                                    onClick={() => handleDeleteEmployee(emp.id)}
                                    disabled={emp.roleName === 'Owner'}
                                    variant="ghost" size="icon"
                                    title={emp.roleName === 'Owner' ? "Không thể xóa chủ quán" : "Xóa vĩnh viễn"}
                                    className={`h-8 w-8 transition-colors ${emp.roleName === 'Owner' ? 'opacity-20 cursor-not-allowed' : 'text-gray-300 hover:text-red-500'}`}
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
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

        <TabsContent value="roles">
            <Card className="border-none shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between border-b border-gray-50 bg-white">
                    <div>
                        <CardTitle className="text-xl font-black">Danh sách vai trò</CardTitle>
                        <p className="text-gray-400 text-xs font-bold uppercase mt-1">Quản lý các cấp bậc quyền hạn trong hệ thống</p>
                    </div>
                    <Button onClick={() => setIsRoleModalOpen(true)} className="bg-gray-900 font-bold h-10 px-6 rounded-xl">
                        <Plus className="w-4 h-4 mr-2" /> Thêm vai trò
                    </Button>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader className="bg-gray-50/50">
                            <TableRow>
                                <TableHead className="font-bold">Tên vai trò</TableHead>
                                <TableHead className="font-bold">Loại</TableHead>
                                <TableHead className="text-right font-bold">Hành động</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {roles.map(role => (
                                <TableRow key={role.id}>
                                    <TableCell className="font-black text-gray-900">{role.name}</TableCell>
                                    <TableCell>
                                        {['Owner', 'Manager', 'Waiter', 'Cashier'].includes(role.name) ? (
                                            <Badge variant="outline" className="bg-blue-50 text-blue-600 border-blue-100 font-black text-[9px] uppercase">Hệ thống</Badge>
                                        ) : (
                                            <Badge variant="outline" className="bg-orange-50 text-orange-600 border-orange-100 font-black text-[9px] uppercase">Tùy chỉnh</Badge>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        {!['Owner', 'Manager', 'Waiter', 'Cashier'].includes(role.name) && (
                                            <Button onClick={() => handleDeleteRole(role.id)} variant="ghost" size="icon" className="text-gray-300 hover:text-red-500">
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </TabsContent>

        <TabsContent value="performance">
           <div className="space-y-8">
              {/* Performance Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                 {performance.slice(0, 3).map((staff, idx) => (
                    <Card key={staff.staffId} className={`border-none shadow-xl rounded-[40px] overflow-hidden relative group transition-all hover:-translate-y-2 ${
                        idx === 0 ? 'bg-gradient-to-br from-gray-900 to-black text-white' : 'bg-white'
                    }`}>
                       {idx === 0 && <div className="absolute top-6 right-6"><Trophy className="w-12 h-12 text-orange-500 animate-bounce" /></div>}
                       <CardContent className="p-8">
                          <div className="flex items-center gap-4 mb-6">
                             <div className={`w-16 h-16 rounded-3xl flex items-center justify-center font-black text-2xl shadow-inner ${
                                idx === 0 ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-900'
                             }`}>
                                {staff.staffName.charAt(0)}
                             </div>
                             <div>
                                <div className={`font-black uppercase tracking-tight text-xl ${idx === 0 ? 'text-white' : 'text-gray-900'}`}>{staff.staffName}</div>
                                <div className={`text-[10px] font-bold uppercase tracking-widest ${idx === 0 ? 'text-gray-400' : 'text-gray-400'}`}>Top {idx + 1} Nhân viên tháng</div>
                             </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4 mb-6">
                             <div className={`p-4 rounded-2xl ${idx === 0 ? 'bg-white/5' : 'bg-gray-50'}`}>
                                <p className="text-[10px] font-black uppercase opacity-60 mb-1">Đánh giá</p>
                                <div className="flex items-center gap-1.5">
                                   <Star className="w-4 h-4 fill-orange-400 text-orange-400" />
                                   <span className="text-xl font-black">{staff.averageRating.toFixed(1)}</span>
                                </div>
                             </div>
                             <div className={`p-4 rounded-2xl ${idx === 0 ? 'bg-white/5' : 'bg-gray-50'}`}>
                                <p className="text-[10px] font-black uppercase opacity-60 mb-1">Phản hồi</p>
                                <div className="text-xl font-black">{staff.feedbackCount} <span className="text-[10px]">lượt</span></div>
                             </div>
                          </div>

                          <div className={`w-full h-2 rounded-full mb-4 ${idx === 0 ? 'bg-white/10' : 'bg-gray-100'}`}>
                             <div
                                className="h-full bg-orange-500 rounded-full shadow-[0_0_10px_rgba(249,115,22,0.5)]"
                                style={{ width: `${(staff.averageRating / 5) * 100}%` }}
                             ></div>
                          </div>

                          <div className="flex justify-between items-center">
                             <span className={`text-[10px] font-black uppercase tracking-widest ${idx === 0 ? 'text-orange-500' : 'text-orange-600'}`}>
                                {staff.averageRating >= 4.7 ? "XUẤT SẮC (Thưởng)" : staff.averageRating >= 3.5 ? "ỔN ĐỊNH" : "CẦN CẢI THIỆN"}
                             </span>
                             <div className={`px-3 py-1 rounded-lg font-black text-[10px] ${
                                staff.averageRating >= 4.7 ? 'bg-green-500/10 text-green-500' :
                                staff.averageRating >= 3.5 ? 'bg-blue-500/10 text-blue-500' : 'bg-red-500/10 text-red-500'
                             }`}>
                                {staff.averageRating >= 4.7 ? '+500k pts' : '---'}
                             </div>
                          </div>
                       </CardContent>
                    </Card>
                 ))}
              </div>

              {/* Detailed Ranking Table */}
              <Card className="border-none shadow-sm rounded-[40px] overflow-hidden bg-white">
                <CardHeader className="p-8 border-b border-gray-50 flex flex-row items-center justify-between">
                    <div>
                        <CardTitle className="text-xl font-black uppercase tracking-tight flex items-center gap-3">
                            <Award className="w-6 h-6 text-orange-500" /> Danh sách xếp hạng chi tiết
                        </CardTitle>
                        <p className="text-gray-400 font-bold uppercase text-[10px] tracking-widest mt-1">Cập nhật theo thời gian thực từ đánh giá khách hàng</p>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader className="bg-gray-50/50">
                            <TableRow>
                                <TableHead className="px-8 font-black text-[10px] uppercase">Hạng</TableHead>
                                <TableHead className="font-black text-[10px] uppercase">Nhân viên</TableHead>
                                <TableHead className="font-black text-[10px] uppercase">Đánh giá TB</TableHead>
                                <TableHead className="font-black text-[10px] uppercase">Tổng đơn</TableHead>
                                <TableHead className="font-black text-[10px] uppercase">Điểm hiệu suất</TableHead>
                                <TableHead className="text-right px-8 font-black text-[10px] uppercase">Trạng thái thưởng/phạt</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {performance.map((staff, idx) => (
                                <TableRow key={staff.staffId} className="hover:bg-gray-50/50 transition-colors group">
                                    <TableCell className="px-8">
                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-sm ${
                                            idx === 0 ? 'bg-orange-500 text-white' :
                                            idx === 1 ? 'bg-gray-300 text-gray-700' :
                                            idx === 2 ? 'bg-orange-200 text-orange-800' : 'bg-gray-100 text-gray-400'
                                        }`}>
                                            {idx + 1}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-gray-100 rounded-2xl flex items-center justify-center font-black text-gray-900 uppercase">
                                                {staff.staffName.charAt(0)}
                                            </div>
                                            <div className="font-black text-gray-900 uppercase text-xs">{staff.staffName}</div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-1.5">
                                            <Star className="w-4 h-4 fill-orange-400 text-orange-400" />
                                            <span className="text-sm font-black text-gray-900">{staff.averageRating.toFixed(1)}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-xs font-bold text-gray-500">
                                        {staff.feedbackCount} lượt
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <div className="w-24 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full rounded-full ${
                                                        staff.averageRating >= 4.5 ? 'bg-green-500' :
                                                        staff.averageRating >= 3 ? 'bg-orange-500' : 'bg-red-500'
                                                    }`}
                                                    style={{ width: `${(staff.averageRating / 5) * 100}%` }}
                                                ></div>
                                            </div>
                                            <span className="text-[10px] font-black text-gray-400">{(staff.averageRating * 20).toFixed(0)}%</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right px-8">
                                        {staff.averageRating >= 4.7 ? (
                                            <Badge className="bg-green-50 text-green-600 border-none font-black text-[10px] uppercase tracking-tighter">Ưu tú (Khen thưởng)</Badge>
                                        ) : staff.averageRating < 3.0 ? (
                                            <Badge className="bg-red-50 text-red-600 border-none font-black text-[10px] uppercase tracking-tighter">Cảnh cáo (Phạt)</Badge>
                                        ) : (
                                            <span className="text-[10px] font-bold text-gray-400 uppercase">Bình thường</span>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
              </Card>
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
                            {roles.map(r => (
                                <SelectItem key={r.id} value={r.name}>
                                    {r.name === 'Owner' ? 'Chủ quán' :
                                     r.name === 'Manager' ? 'Quản lý' :
                                     r.name === 'Cashier' ? 'Thu ngân' :
                                     r.name === 'Waiter' ? 'Phục vụ' : r.name}
                                </SelectItem>
                            ))}
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

      {/* CREATE ROLE DIALOG */}
      <Dialog open={isRoleModalOpen} onOpenChange={setIsRoleModalOpen}>
          <DialogContent className="max-w-sm rounded-[32px]">
              <DialogHeader>
                  <DialogTitle className="text-2xl font-black">Thêm vai trò mới</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                  <div className="space-y-1.5">
                      <Label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Tên vai trò</Label>
                      <Input
                        value={newRoleName}
                        onChange={(e: any) => setNewRoleName(e.target.value)}
                        placeholder="Vd: Bảo vệ, Tạp vụ..."
                        className="h-12 rounded-xl"
                      />
                  </div>
                  <Button
                    onClick={handleCreateRole}
                    className="w-full h-12 bg-orange-600 hover:bg-orange-700 font-black shadow-lg shadow-orange-100 rounded-xl mt-2"
                  >
                    TẠO VAI TRÒ
                  </Button>
              </div>
          </DialogContent>
      </Dialog>
    </div>
  );
}
