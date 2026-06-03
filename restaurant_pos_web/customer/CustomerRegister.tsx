import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { UserPlus, Loader2, ArrowLeft, AlertCircle, Heart } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Label } from '../components/ui/label';
import api from '../services/api';

const CustomerRegister = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    phoneNumber: '',
    email: '',
    restaurantId: ''
  });
  const [restaurantName, setRestaurantName] = useState("");
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRes = async () => {
        try {
            const res = await api.get("/auth/find-restaurant-info");
            setFormData(prev => ({ ...prev, restaurantId: res.data.id }));
            setRestaurantName(res.data.name);
        } catch {
            console.error("Lỗi lấy thông tin quán");
        }
    }
    fetchRes();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await api.post("/auth/register-customer", formData);
      alert('Đăng ký thành viên thành công! Bạn có thể dùng SĐT để đăng nhập và tích điểm.');
      navigate('/login');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Số điện thoại đã tồn tại hoặc có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="shadow-2xl border-none overflow-hidden">
          <div className="h-2 bg-red-500 w-full"></div>
          <CardHeader className="text-center pt-8">
            <Link to="/login" className="inline-flex items-center text-xs font-bold text-gray-400 hover:text-orange-600 mb-6 transition-colors uppercase tracking-widest">
              <ArrowLeft className="w-3 h-3 mr-1" /> Quay lại đăng nhập
            </Link>
            <div className="mx-auto w-20 h-20 bg-red-500 rounded-3xl flex items-center justify-center mb-4 shadow-xl shadow-red-100 transform -rotate-3">
              <Heart className="text-white w-10 h-10 fill-current" />
            </div>
            <CardTitle className="text-3xl font-black text-gray-900 tracking-tight">Thành Viên Mới</CardTitle>
            <CardDescription className="text-gray-500 font-medium mt-1">Đăng ký để nhận ưu đãi tại {restaurantName || "nhà hàng"}</CardDescription>
          </CardHeader>

          <CardContent className="px-8 pb-8">
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 bg-red-50 text-red-600 text-xs rounded-xl border border-red-100 flex items-center gap-2 font-bold">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {error}
                </div>
              )}

              <div className="space-y-1.5">
                <Label className="text-gray-700 font-bold ml-1 text-xs uppercase tracking-wider">Họ và tên</Label>
                <Input
                    required
                    placeholder="Nguyễn Văn A"
                    className="h-12 bg-gray-50 border-gray-100 rounded-xl"
                    value={formData.fullName}
                    onChange={(e: any) => setFormData({...formData, fullName: e.target.value})}
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-gray-700 font-bold ml-1 text-xs uppercase tracking-wider">Số điện thoại (Dùng đăng nhập)</Label>
                <Input
                    required
                    placeholder="0901 234 567"
                    className="h-12 bg-gray-50 border-gray-100 rounded-xl"
                    value={formData.phoneNumber}
                    onChange={(e: any) => setFormData({...formData, phoneNumber: e.target.value})}
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-gray-700 font-bold ml-1 text-xs uppercase tracking-wider">Email (Nhận tin khuyến mãi)</Label>
                <Input
                    type="email"
                    placeholder="khachhang@gmail.com"
                    className="h-12 bg-gray-50 border-gray-100 rounded-xl"
                    value={formData.email}
                    onChange={(e: any) => setFormData({...formData, email: e.target.value})}
                />
              </div>

              <div className="pt-4">
                <Button disabled={loading} className="w-full bg-red-500 hover:bg-red-600 h-14 text-lg font-black rounded-2xl shadow-lg shadow-red-100 transition-all active:scale-[0.98]">
                  {loading ? <Loader2 className="animate-spin" /> : "TRỞ THÀNH THÀNH VIÊN"}
                </Button>
              </div>
            </form>

            <div className="mt-8 p-4 bg-orange-50 rounded-2xl border border-orange-100">
               <p className="text-[10px] text-orange-700 font-bold leading-relaxed text-center italic">
                  * Tích lũy 1 điểm cho mỗi 10,000đ chi tiêu. <br/> Điểm có thể dùng để đổi Voucher giảm giá trực tiếp trên đơn hàng.
               </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CustomerRegister;