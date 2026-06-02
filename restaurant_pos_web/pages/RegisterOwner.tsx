import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authApi } from '../services/authApi';
import { Utensils, Loader2, ArrowLeft } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Label } from '../components/ui/label';

const RegisterOwner = () => {
  const [formData, setFormData] = useState({
    restaurantName: '',
    fullName: '',
    username: '',
    password: '',
    email: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await authApi.registerOwner(formData);
      alert('Đăng ký thành công! Hãy đăng nhập.');
      navigate('/login');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Có lỗi xảy ra khi đăng ký');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-orange-50 flex items-center justify-center p-4 py-12">
      <Card className="w-full max-w-lg shadow-2xl border-none">
        <CardHeader className="text-center">
          <Link to="/login" className="inline-flex items-center text-sm text-gray-500 hover:text-orange-600 mb-4 transition-colors">
            <ArrowLeft className="w-4 h-4 mr-1" /> Quay lại đăng nhập
          </Link>
          <div className="mx-auto w-16 h-16 bg-orange-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-orange-200">
            <Utensils className="text-white w-8 h-8" />
          </div>
          <CardTitle className="text-2xl font-black text-gray-900">Mở Nhà Hàng Mới</CardTitle>
          <CardDescription>Bắt đầu quản lý nhà hàng của bạn chuyên nghiệp hơn</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">{error}</div>}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Tên nhà hàng</Label>
                <Input name="restaurantName" required value={formData.restaurantName} onChange={handleChange} placeholder="Vd: The Green Bistro" />
              </div>
              <div className="space-y-2">
                <Label>Họ và tên chủ sở hữu</Label>
                <Input name="fullName" required value={formData.fullName} onChange={handleChange} placeholder="Vd: Nguyễn Văn A" />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Email liên hệ</Label>
              <Input name="email" type="email" required value={formData.email} onChange={handleChange} placeholder="admin@restaurant.com" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Tên đăng nhập</Label>
                <Input name="username" required value={formData.username} onChange={handleChange} placeholder="Vd: admin_pos" />
              </div>
              <div className="space-y-2">
                <Label>Mật khẩu</Label>
                <Input name="password" type="password" required value={formData.password} onChange={handleChange} placeholder="••••••••" />
              </div>
            </div>

            <Button disabled={loading} className="w-full bg-orange-600 h-12 text-lg font-bold mt-2">
              {loading ? <Loader2 className="animate-spin" /> : "Đăng ký ngay"}
            </Button>

            <p className="text-center text-sm text-gray-500 pt-2">
              Bằng cách đăng ký, bạn đồng ý với các điều khoản dịch vụ của chúng tôi.
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default RegisterOwner;