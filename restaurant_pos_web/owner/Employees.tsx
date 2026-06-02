import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "../components/ui/dialog";
import { Label } from "../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Plus, Search, Edit, Trash2, CheckCircle, XCircle, Clock } from "lucide-react";
import { mockEmployees, mockJoinRequests, type JoinRequest } from "../data/mockData";

export function OwnerEmployees() {
  const [employees, setEmployees] = useState(mockEmployees);
  const [joinRequests, setJoinRequests] = useState(mockJoinRequests);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const filteredEmployees = employees.filter(
    (emp) =>
      emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const pendingCount = joinRequests.filter((r) => r.status === "pending").length;

  const getRoleBadge = (role: string): "default" | "secondary" | "outline" => {
    const variants: Record<string, "default" | "secondary" | "outline"> = {
      owner: "default",
      manager: "secondary",
      cashier: "outline",
      waiter: "outline",
    };
    return variants[role] || "outline";
  };

  const roleLabel: Record<string, string> = {
    manager: "Quản lý",
    cashier: "Thu ngân",
    waiter: "Phục vụ",
    owner: "Chủ quán",
  };

  const handleApprove = (req: JoinRequest) => {
    setJoinRequests((prev) =>
      prev.map((r) => (r.id === req.id ? { ...r, status: "approved" } : r))
    );
    setEmployees((prev) => [
      ...prev,
      {
        id: `emp-${req.id}`,
        name: req.name,
        role: req.role,
        phone: req.phone,
        email: req.email,
        branch: req.branchName,
        status: "active" as const,
      },
    ]);
  };

  const handleReject = (id: string) => {
    setJoinRequests((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: "rejected" } : r))
    );
  };

  const statusBadge = (status: JoinRequest["status"]) => {
    if (status === "pending")
      return (
        <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200 gap-1">
          <Clock className="w-3 h-3" />Chờ duyệt
        </Badge>
      );
    if (status === "approved")
      return (
        <Badge className="bg-green-100 text-green-800 border-green-200 gap-1">
          <CheckCircle className="w-3 h-3" />Đã duyệt
        </Badge>
      );
    return (
      <Badge className="bg-red-100 text-red-800 border-red-200 gap-1">
        <XCircle className="w-3 h-3" />Từ chối
      </Badge>
    );
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">Quản lý nhân viên</h1>
          <p className="text-gray-600 mt-1">Danh sách nhân viên và yêu cầu tham gia</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-orange-600 hover:bg-orange-700">
              <Plus className="w-4 h-4 mr-2" />
              Thêm nhân viên
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Thêm nhân viên mới</DialogTitle>
              <DialogDescription>Tạo tài khoản cho nhân viên</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="empName">Họ tên</Label>
                <Input id="empName" placeholder="Nguyễn Văn A" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="empEmail">Email</Label>
                <Input id="empEmail" type="email" placeholder="nv@greenbistro.com" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="empPhone">Số điện thoại</Label>
                <Input id="empPhone" placeholder="+84 901 234 567" />
              </div>
              <div className="space-y-2">
                <Label>Vị trí</Label>
                <Select>
                  <SelectTrigger><SelectValue placeholder="Chọn vị trí" /></SelectTrigger>
                  <SelectContent onValueChange={() => {}}>
                    <SelectItem value="manager">Quản lý</SelectItem>
                    <SelectItem value="cashier">Thu ngân</SelectItem>
                    <SelectItem value="waiter">Phục vụ</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Cơ sở</Label>
                <Select>
                  <SelectTrigger><SelectValue placeholder="Chọn cơ sở" /></SelectTrigger>
                  <SelectContent onValueChange={() => {}}>
                    <SelectItem value="1">Downtown Branch</SelectItem>
                    <SelectItem value="2">Uptown Branch</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button className="w-full bg-orange-600 hover:bg-orange-700">Tạo nhân viên</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="employees">
        <TabsList className="mb-6">
          <TabsTrigger value="employees">Danh sách nhân viên</TabsTrigger>
          <TabsTrigger value="requests" className="gap-2">
            Yêu cầu tham gia
            {pendingCount > 0 && (
              <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {pendingCount}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        {/* Employees list */}
        <TabsContent value="employees">
          <Card>
            <CardHeader>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Tìm nhân viên..."
                  value={searchTerm}
                  onChange={(e: any) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Họ tên</TableHead>
                    <TableHead>Vị trí</TableHead>
                    <TableHead>Số điện thoại</TableHead>
                    <TableHead>Cơ sở</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead className="text-right">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEmployees.map((employee) => (
                    <TableRow key={employee.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{employee.name}</div>
                          <div className="text-sm text-gray-500">{employee.email}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getRoleBadge(employee.role)}>
                          {roleLabel[employee.role] || employee.role}
                        </Badge>
                      </TableCell>
                      <TableCell>{employee.phone}</TableCell>
                      <TableCell>{employee.branch}</TableCell>
                      <TableCell>
                        <Badge variant={employee.status === "active" ? "default" : "secondary"}>
                          {employee.status === "active" ? "Đang làm" : "Nghỉ"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon">
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Join requests */}
        <TabsContent value="requests">
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-bold">Yêu cầu xin vào làm</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Họ tên</TableHead>
                    <TableHead>Vị trí</TableHead>
                    <TableHead>Cơ sở xin vào</TableHead>
                    <TableHead>Ngày gửi</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead className="text-right">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {joinRequests.map((req) => (
                    <TableRow key={req.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{req.name}</div>
                          <div className="text-sm text-gray-500">{req.email}</div>
                          <div className="text-sm text-gray-400">{req.phone}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getRoleBadge(req.role)}>
                          {roleLabel[req.role] || req.role}
                        </Badge>
                      </TableCell>
                      <TableCell>{req.branchName}</TableCell>
                      <TableCell className="text-sm text-gray-500">
                        {new Date(req.createdAt).toLocaleDateString("vi-VN")}
                      </TableCell>
                      <TableCell>{statusBadge(req.status)}</TableCell>
                      <TableCell className="text-right">
                        {req.status === "pending" ? (
                          <div className="flex justify-end gap-2">
                            <Button
                              size="sm"
                              className="gap-1 bg-green-600 hover:bg-green-700"
                              onClick={() => handleApprove(req)}
                            >
                              <CheckCircle className="w-3 h-3" />
                              Duyệt
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="gap-1 text-red-600 border-red-200 hover:bg-red-50"
                              onClick={() => handleReject(req.id)}
                            >
                              <XCircle className="w-3 h-3" />
                              Từ chối
                            </Button>
                          </div>
                        ) : (
                          <span className="text-gray-400 text-sm">—</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
