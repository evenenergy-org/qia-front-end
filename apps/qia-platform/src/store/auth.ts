import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import axios from 'axios';

interface AuthState {
  token: string | null;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
}

interface LoginResponse {
  code: number;
  msg: string;
  data: {
    id: number;
    username: string;
    mobile: string;
    token: string;
    expireTime: number;
  };
}

// 创建axios实例
const api = axios.create();

// 添加请求拦截器
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      isAuthenticated: false,
      login: async (username: string, password: string) => {
        try {
          const response = await api.post<LoginResponse>('http://8.134.66.175/app-platform/api/common/login', {
            username,
            password,
          });
          
          if (response.data.code !== 200) {
            throw new Error(response.data.msg || '登录失败');
          }

          const { token } = response.data.data;
          
          if (!token) {
            throw new Error('未获取到token');
          }

          set({ token, isAuthenticated: true });
        } catch (error) {
          throw new Error('登录失败');
        }
      },
      logout: () => {
        set({ token: null, isAuthenticated: false });
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ token: state.token, isAuthenticated: state.isAuthenticated }),
    }
  )
); 