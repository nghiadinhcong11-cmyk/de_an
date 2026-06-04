import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Loader2, KeyRound, HelpCircle, ShieldCheck } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Label } from '../components/ui/label';

const ChangePassword = () => {
  const [oldPassword, setOldPassword] = useState('');
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
      await api.post('/auth/change-password', { oldPassword, newPassword });
      setSuccess('Mật khẩu của bạn đã được thay đổi thành công!');
      // Tùy chọn: Đăng xuất người dùng sau khi đổi mật khẩu
      setTimeout(() => navigate(-1), 2000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Có lỗi xảy ra khi đổi mật khẩu');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <Card className="shadow-xl border-none overflow-hidden rounded-[32px] bg-white">
        <CardHeader className="text-center pt-10 px-10">
          <div className="mx-auto w-16 h-16 bg-orange-100 rounded-3xl flex items-center justify-center mb-4 text-orange-600">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <CardTitle className="text-3xl font-black text-gray-900 tracking-tight">Đổi mật khẩu</CardTitle>
          <CardDescription className="text-gray-500 font-medium">Bảo mật tài khoản bằng cách sử dụng mật khẩu mạnh</CardDescription>
        </CardHeader>

        <CardContent className="p-10">
          {success ? (
            <div className="p-6 bg-green-50 text-green-700 rounded-[24px] border border-green-100 font-bold text-center">
              {success}
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="p-4 bg-red-50 text-red-600 text-sm rounded-2xl border border-red-100 flex items-center gap-3 font-medium">
                  <HelpCircle className="w-5 h-5 shrink-0" />
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <Label className="text-gray-700 font-bold ml-1 uppercase text-[10px] tracking-widest">Mật khẩu hiện tại</Label>
                <div className="relative">
                  <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input type="password" required className="pl-12 h-14 bg-gray-50 rounded-2xl border-none text-lg" value={oldPassword} onChange={(e: any) => setOldPassword(e.target.value)} />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-gray-700 font-bold ml-1 uppercase text-[10px] tracking-widest">Mật khẩu mới</Label>
                <div className="relative">
                  <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input type="password" required className="pl-12 h-14 bg-gray-50 rounded-2xl border-none text-lg" value={newPassword} onChange={(e: any) => setNewPassword(e.target.value)} />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-gray-700 font-bold ml-1 uppercase text-[10px] tracking-widest">Xác nhận mật khẩu mới</Label>
                <div className="relative">
                  <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input type="password" required className="pl-12 h-14 bg-gray-50 rounded-2xl border-none text-lg" value={confirmPassword} onChange={(e: any) => setConfirmPassword(e.target.value)} />
                </div>
              </div>

              <div className="pt-6 grid grid-cols-2 gap-4">
                <Button variant="ghost" type="button" onClick={() => navigate(-1)} className="h-14 rounded-2xl font-black text-gray-400 hover:bg-gray-50">HỦY BỎ</Button>
                <Button disabled={loading} className="bg-orange-600 hover:bg-orange-700 h-14 text-lg font-black rounded-2xl shadow-lg shadow-orange-100">
                  {loading ? <Loader2 className="animate-spin" /> : "LƯU THAY ĐỔI"}
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ChangePassword;