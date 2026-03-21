import api from './api'
import type { LoginRequest, RegisterRequest, AuthResponse } from '../types/auth'

export const authApi = {
  login: (data: LoginRequest) => api.post<AuthResponse>('/auth/login', data),
  register: (data: RegisterRequest) =>
    api.post<AuthResponse>('/auth/register', data),
  logout: () => api.post('/auth/logout'),
}
