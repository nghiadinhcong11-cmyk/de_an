import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authApi } from '../services/authApi';
import { UserPlus, Loader2, ArrowLeft } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Label } from '../components/ui/label';

const CustomerRegister = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    phoneNumber: '',
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Giả sử chúng ta dùng chung API register-customer
      // await authApi.registerCustomer(formData);
      alert('Đăng ký tài khoản khách hàng thành công!');
      navigate('/login');
    } catch (err: any) {
      setError('Có lỗi xảy ra khi đăng ký');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-orange-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-2xl border-none">
        <CardHeader className="text-center">
          <Link to="/login" className="inline-flex items-center text-sm text-gray-500 hover:text-orange-600 mb-4 transition-colors">
            <ArrowLeft className="w-4 h-4 mr-1" /> Quay lại
          </Link>
          <div className="mx-auto w-16 h-16 bg-orange-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg">
            <UserPlus className="text-white w-8 h-8" />
          </div>
          <CardTitle className="text-2xl font-black">Đăng ký thành viên</CardTitle>
          <CardDescription>Tích điểm và nhận ưu đãi từ nhà hàng</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Họ và tên</Label>
              <Input required value={formData.fullName} onChange={(e: any) => setFormData({...formData, fullName: e.target.value})} placeholder="Nguyễn Văn A" />
            </div>
            <div className="space-y-2">
              <Label>Số điện thoại</Label>
              <Input required value={formData.phoneNumber} onChange={(e: any) => setFormData({...formData, phoneNumber: e.target.value})} placeholder="0901234567" />
            </div>
            <div className="space-y-2">
              <Label>Mật khẩu</Label>
              <Input type="password" required value={formData.password} onChange={(e: any) => setFormData({...formData, password: e.target.value})} placeholder="••••••••" />
            </div>
            <Button disabled={loading} className="w-full bg-orange-600 h-12 font-bold mt-2">
              {loading ? <Loader2 className="animate-spin" /> : "Đăng ký thành viên"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default CustomerRegister;