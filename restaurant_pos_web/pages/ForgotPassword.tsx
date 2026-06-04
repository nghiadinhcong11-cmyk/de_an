import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { Utensils, Loader2, UserCircle, Mail, KeyRound, HelpCircle, ArrowLeft } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Label } from '../components/ui/label';

const ForgotPassword = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    if (newPassword !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp');
      setLoading(false);
      return;
    }

    try {
      await api.post('/auth/reset-password', { username, email, newPassword });
      setSuccess('Mật khẩu của bạn đã được đặt lại thành công!');
      setTimeout(() => navigate('/login'), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Thông tin không chính xác hoặc có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="shadow-2xl border-none overflow-hidden">
          <div className="h-2 bg-orange-600 w-full"></div>
          <CardHeader className="text-center pt-8">
            <div className="mx-auto w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center mb-4 text-orange-600">
              <KeyRound className="w-8 h-8" />
            </div>
            <CardTitle className="text-2xl font-black text-gray-900 tracking-tight">Quên mật khẩu?</CardTitle>
            <CardDescription className="text-gray-500 font-medium mt-1">Nhập thông tin để đặt lại mật khẩu của bạn</CardDescription>
          </CardHeader>

          <CardContent className="px-8 pb-8">
            {success ? (
              <div className="space-y-6 text-center py-4">
                <div className="p-4 bg-green-50 text-green-700 rounded-2xl border border-green-100 font-bold">
                  {success}
                </div>
                <p className="text-sm text-gray-500">Đang chuyển hướng về trang đăng nhập...</p>
                <Button onClick={() => navigate('/login')} className="w-full bg-gray-900">ĐĂNG NHẬP NGAY</Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                {error && (
                  <div className="p-3 bg-red-50 text-red-600 text-sm rounded-xl border border-red-100 flex items-center gap-2">
                    <HelpCircle className="w-4 h-4 shrink-0" />
                    {error}
                  </div>
                )}

                <div className="space-y-2">
                  <Label className="text-gray-700 font-bold ml-1">Tên đăng nhập</Label>
                  <div className="relative">
                    <UserCircle className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <Input required placeholder="admin_pos" className="pl-10 h-12 bg-gray-50 rounded-xl" value={username} onChange={(e: any) => setUsername(e.target.value)} />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-gray-700 font-bold ml-1">Email đăng ký</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <Input type="email" required placeholder="example@gmail.com" className="pl-10 h-12 bg-gray-50 rounded-xl" value={email} onChange={(e: any) => setEmail(e.target.value)} />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-gray-700 font-bold ml-1">Mật khẩu mới</Label>
                  <div className="relative">
                    <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <Input type="password" required placeholder="••••••••" className="pl-10 h-12 bg-gray-50 rounded-xl" value={newPassword} onChange={(e: any) => setNewPassword(e.target.value)} />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-gray-700 font-bold ml-1">Xác nhận mật khẩu</Label>
                  <div className="relative">
                    <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <Input type="password" required placeholder="••••••••" className="pl-10 h-12 bg-gray-50 rounded-xl" value={confirmPassword} onChange={(e: any) => setConfirmPassword(e.target.value)} />
                  </div>
                </div>

                <Button disabled={loading} className="w-full bg-orange-600 hover:bg-orange-700 h-12 text-lg font-black rounded-xl shadow-lg mt-2">
                  {loading ? <Loader2 className="animate-spin" /> : "ĐẶT LẠI MẬT KHẨU"}
                </Button>

                <div className="text-center pt-4">
                  <Link to="/login" className="text-sm font-bold text-gray-500 hover:text-orange-600 flex items-center justify-center gap-2">
                    <ArrowLeft className="w-4 h-4" /> Quay lại đăng nhập
                  </Link>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ForgotPassword;