import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../services/authApi';
import { Utensils, Loader2 } from 'lucide-react';
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

  return (
    <div className="min-h-screen bg-orange-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-2xl border-none">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-orange-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-orange-200">
            <Utensils className="text-white w-8 h-8" />
          </div>
          <CardTitle className="text-2xl font-black text-gray-900">Restaurant POS</CardTitle>
          <CardDescription>Đăng nhập vào hệ thống quản lý</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">{error}</div>}
            <div className="space-y-2">
              <Label>Tên đăng nhập</Label>
              <Input required value={username} onChange={(e: any) => setUsername(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Mật khẩu</Label>
              <Input type="password" required value={password} onChange={(e: any) => setPassword(e.target.value)} />
            </div>
            <Button disabled={loading} className="w-full bg-orange-600 h-11 font-bold">
              {loading ? <Loader2 className="animate-spin" /> : "Đăng nhập"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;