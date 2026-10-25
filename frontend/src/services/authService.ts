import api from './api';
import { AuthResponse, User } from '../types';

export const authService = {
  async register(data: any): Promise<AuthResponse> {
    const res = await api.post('/auth/register', data);
    return res.data;
  },

  async login(data: { email: string; password: string }): Promise<AuthResponse> {
    const res = await api.post('/auth/login', data);
    return res.data;
  },

  async forgotPassword(email: string): Promise<{ message: string; demo_token?: string }> {
    const res = await api.post('/auth/forgot-password', { email });
    return res.data;
  },

  async resetPassword(data: { email: string; token: string; new_password: string }): Promise<{ message: string }> {
    const res = await api.post('/auth/reset-password', data);
    return res.data;
  },

  async getMe(): Promise<User> {
    const res = await api.get('/users/me');
    return res.data;
  },

  async updateMe(data: Partial<User>): Promise<User> {
    const res = await api.put('/users/me', data);
    return res.data;
  },

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }
};
