import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { UserPlus, Loader2, ArrowLeft, AlertCircle } from 'lucide-react';
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
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRes = async () => {
        try {
            const res = await api.get("/auth/find-restaurant-info");
            setFormData(prev => ({ ...prev, restaurantId: res.data.id }));
        } catch {
            console.error("Không thể lấy ID nhà hàng");
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
      alert('Đăng ký thành công!');
      navigate('/login');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Lỗi: Số điện thoại đã tồn tại hoặc server từ chối');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-orange-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-2xl border-none">
        <CardHeader className="text-center">
          <Link to="/login" className="inline-flex items-center text-sm text-gray-500 hover:text-orange-600 mb-4">
            <ArrowLeft className="w-4 h-4 mr-1" /> Quay lại
          </Link>
          <div className="mx-auto w-16 h-16 bg-orange-600 rounded-2xl flex items-center justify-center mb-4">
            <UserPlus className="text-white w-8 h-8" />
          </div>
          <CardTitle className="text-2xl font-black">Đăng ký thành viên</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
                <div className="p-3 bg-red-50 text-red-600 text-xs rounded-lg flex items-center gap-2 border border-red-100">
                    <AlertCircle className="w-4 h-4" /> {error}
                </div>
            )}
            <div className="space-y-2">
              <Label>Họ và tên</Label>
              <Input required value={formData.fullName} onChange={(e: any) => setFormData({...formData, fullName: e.target.value})} />
            </div>
            <div className="space-y-2">
              <Label>Số điện thoại (Dùng để đăng nhập)</Label>
              <Input required value={formData.phoneNumber} onChange={(e: any) => setFormData({...formData, phoneNumber: e.target.value})} />
            </div>
            <Button disabled={loading} className="w-full bg-orange-600 h-12 font-bold mt-4">
              {loading ? <Loader2 className="animate-spin" /> : "ĐĂNG KÝ NGAY"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default CustomerRegister;