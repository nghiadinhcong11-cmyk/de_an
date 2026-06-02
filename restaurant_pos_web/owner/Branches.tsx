import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Badge } from "../components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "../components/ui/dialog";
import { Plus, MapPin, Phone, Edit, Trash2 } from "lucide-react";
import api from "../services/api";

export function OwnerBranches() {
  const [branches, setBranches] = useState([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Lấy dữ liệu thật từ Backend
  const fetchBranches = async () => {
    try {
      const response = await api.get('/branches');
      setBranches(response.data);
    } catch (error) {
      console.error("Lỗi khi lấy danh sách chi nhánh", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBranches();
  }, []);

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">Quản lý chi nhánh</h1>
          <p className="text-gray-600 mt-1">Quản lý các cơ sở nhà hàng của bạn</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-orange-600 hover:bg-orange-700">
              <Plus className="w-4 h-4 mr-2" />
              Thêm chi nhánh
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Thêm chi nhánh mới</DialogTitle>
              <DialogDescription>Tạo một cơ sở kinh doanh mới</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="branchName">Tên chi nhánh</Label>
                <Input id="branchName" placeholder="Chi nhánh Quận 1" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="branchAddress">Địa chỉ</Label>
                <Input id="branchAddress" placeholder="123 Đường Lê Lợi..." />
              </div>
              <div className="space-y-2">
                <Label htmlFor="branchPhone">Số điện thoại</Label>
                <Input id="branchPhone" placeholder="090..." />
              </div>
              <Button className="w-full bg-orange-600 hover:bg-orange-700">Tạo chi nhánh</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {branches.map((branch: any) => (
          <Card key={branch.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle>{branch.name}</CardTitle>
                  <Badge variant={branch.isActive ? "default" : "secondary"} className="mt-2">
                    {branch.isActive ? "Hoạt động" : "Tạm dừng"}
                  </Badge>
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="icon">
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon">
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start gap-2 text-sm">
                <MapPin className="w-4 h-4 text-gray-500 mt-0.5" />
                <span className="text-gray-600">{branch.address}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Phone className="w-4 h-4 text-gray-500" />
                <span className="text-gray-600">{branch.phone}</span>
              </div>
              <div className="pt-3 border-t">
                <Button variant="outline" className="w-full border-orange-200 text-orange-700 hover:bg-orange-50">Xem chi tiết</Button>
              </div>
            </CardContent>
          </Card>
        ))}
        {branches.length === 0 && !loading && <p>Chưa có chi nhánh nào. Hãy thêm mới!</p>}
      </div>
    </div>
  );
}
