import api from './api';

export const authApi = {
  login: async (data: any) => {
    // Sửa thành Auth (viết hoa)
    const response = await api.post('/Auth/login', data);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data));
    }
    return response.data;
  },

  registerOwner: async (data: any) => {
    return await api.post('/Auth/register-owner', data);
  },

  registerEmployee: async (data: any) => {
    return await api.post('/Auth/register-employee', data);
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  }
};