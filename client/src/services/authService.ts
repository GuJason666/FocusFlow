import api from './api';
import { User } from '../types/user';

export interface AuthResponse {
  token: string;
  user: User;
}

export const register = (data: {
  name: string;
  email: string;
  password: string;
  role: 'student' | 'coach';
}) => api.post<AuthResponse>('/auth/register', data).then((r) => r.data);

export const login = (data: { email: string; password: string }) =>
  api.post<AuthResponse>('/auth/login', data).then((r) => r.data);

export const getMe = () => api.get<User>('/auth/me').then((r) => r.data);
