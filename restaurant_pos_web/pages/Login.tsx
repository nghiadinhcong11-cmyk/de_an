import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authApi } from '../services/authApi';
import { Utensils, Loader2, UserCircle, KeyRound, HelpCircle } from 'lucide-react';
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
      await authApi.login({ username, password });
      navigate('/owner');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Tài khoản hoặc mật khẩu không chính xác');
    } finally {
      setLoading(false);
    }
  };

  const handleGuestAccess = () => {
    // Demo access to customer portal
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
            <CardDescription className="text-gray-500 font-medium mt-1">Hệ thống quản lý nhà hàng thông minh</CardDescription>
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
                  <Input
                    required
                    placeholder="admin_pos"
                    className="pl-10 h-12 bg-gray-50 border-gray-100 focus:bg-white transition-all rounded-xl"
                    value={username}
                    onChange={(e: any) => setUsername(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center px-1">
                  <Label className="text-gray-700 font-bold">Mật khẩu</Label>
                  <Link to="/forgot-password" title="Forgot Password" className="text-xs font-bold text-orange-600 hover:text-orange-700 underline-offset-4 hover:underline">
                    Quên mật khẩu?
                  </Link>
                </div>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    type="password"
                    required
                    placeholder="••••••••"
                    className="pl-10 h-12 bg-gray-50 border-gray-100 focus:bg-white transition-all rounded-xl"
                    value={password}
                    onChange={(e: any) => setPassword(e.target.value)}
                  />
                </div>
              </div>

              <Button disabled={loading} className="w-full bg-orange-600 hover:bg-orange-700 h-12 text-lg font-black shadow-lg shadow-orange-200 transition-all active:scale-[0.98] rounded-xl mt-2">
                {loading ? <Loader2 className="animate-spin" /> : "ĐĂNG NHẬP"}
              </Button>
            </form>

            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-gray-100"></span>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-4 text-gray-400 font-bold">Hoặc tiếp tục với</span>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3">
              <Button
                onClick={handleGuestAccess}
                variant="outline"
                className="h-12 border-gray-200 font-bold hover:bg-orange-50 hover:text-orange-600 hover:border-orange-200 rounded-xl transition-all"
              >
                Tài khoản vãng lai (Demo)
              </Button>
            </div>

            <p className="text-center text-sm text-gray-500 mt-8">
              Chưa có tài khoản?{' '}
              <Link to="/register-owner" className="text-orange-600 font-black hover:text-orange-700 transition-colors">
                Đăng ký ngay
              </Link>
            </p>
          </CardContent>
        </Card>

        <p className="text-center text-[10px] text-gray-400 mt-6 uppercase tracking-widest font-bold">
          © 2026 Restaurant POS Ecosystem
        </p>
      </div>
    </div>
  );
};

export default Login;