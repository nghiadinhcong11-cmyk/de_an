import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authApi } from '../services/authApi';
import { Utensils, Loader2, UserCircle, KeyRound, HelpCircle, Users, Store, Heart } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Label } from '../components/ui/label';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await authApi.login({ username, password });

      // LOGIC ĐIỀU HƯỚNG THEO VAI TRÒ
      const userRole = response.role; // Lấy từ API trả về

      if (userRole === 'Owner') {
        navigate('/owner');
      } else if (userRole === 'Manager' || userRole === 'Waiter' || userRole === 'Cashier') {
        navigate('/employee/orders'); // Nhân viên vào trang quản lý đơn
      } else if (userRole === 'Customer') {
        navigate('/customer');
      } else {
        navigate('/login');
      }

    } catch (err: any) {
      setError(err.response?.data?.message || 'Tài khoản hoặc mật khẩu không chính xác');
    } finally {
      setLoading(false);
    }
  };

  const handleGuestAccess = () => {
    navigate('/customer');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="shadow-2xl border-none overflow-hidden">
          <div className="h-2 bg-orange-600 w-full"></div>
          <CardHeader className="text-center pt-8">
            <div className="mx-auto w-20 h-20 bg-orange-600 rounded-3xl flex items-center justify-center mb-4 shadow-xl shadow-orange-200 transform rotate-3">
              <Utensils className="text-white w-10 h-10" />
            </div>
            <CardTitle className="text-3xl font-black text-gray-900 tracking-tight">Restaurant POS</CardTitle>
            <CardDescription className="text-gray-500 font-medium mt-1">Đăng nhập hệ thống quản lý</CardDescription>
          </CardHeader>

          <CardContent className="px-8 pb-8">
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
                <div className="flex justify-between items-center px-1">
                  <Label className="text-gray-700 font-bold">Mật khẩu</Label>
                  <Link to="/forgot-password" title="Forgot Password" className="text-xs font-bold text-orange-600 hover:text-orange-700">
                    Quên mật khẩu?
                  </Link>
                </div>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input type="password" required placeholder="••••••••" className="pl-10 h-12 bg-gray-50 rounded-xl" value={password} onChange={(e: any) => setPassword(e.target.value)} />
                </div>
              </div>

              <Button disabled={loading} className="w-full bg-orange-600 hover:bg-orange-700 h-12 text-lg font-black rounded-xl shadow-lg mt-2">
                {loading ? <Loader2 className="animate-spin" /> : "ĐĂNG NHẬP"}
              </Button>
            </form>

            <div className="relative my-8 text-center border-t border-gray-100 pt-8">
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-white px-4 text-gray-400 text-[10px] font-bold uppercase tracking-widest">Lựa chọn vai trò</span>
            </div>

            <div className="grid grid-cols-1 gap-3">
              <Link to="/register-owner">
                <Button variant="outline" className="w-full h-12 justify-start gap-3 border-orange-100 text-gray-700 font-bold hover:bg-orange-50 rounded-xl">
                  <Store className="w-5 h-5 text-orange-600" /> Tôi là chủ nhà hàng
                </Button>
              </Link>

              <Link to="/employee/register">
                <Button variant="outline" className="w-full h-12 justify-start gap-3 border-orange-100 text-gray-700 font-bold hover:bg-orange-50 rounded-xl">
                  <Users className="w-5 h-5 text-blue-600" /> Tôi muốn tìm việc làm
                </Button>
              </Link>

              <Button onClick={handleGuestAccess} variant="outline" className="w-full h-12 justify-start gap-3 border-orange-100 text-gray-700 font-bold hover:bg-orange-50 rounded-xl">
                <Heart className="w-5 h-5 text-red-500" /> Tài khoản vãng lai
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Login;