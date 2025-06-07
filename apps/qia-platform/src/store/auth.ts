import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import http from '@/utils/http';
import { API_PATHS } from '@/config/env';

interface User {
  id: number;
  username: string;
  mobile: string;
}

interface LoginData {
  token: string;
  id: number;
  username: string;
  mobile: string;
  expireTime: number;
}

interface AuthState {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  initialized: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  initialize: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      isAuthenticated: false,
      initialized: false,
      login: async (username: string, password: string) => {
        try {
          console.log('发送登录请求:', { username, password });
          const { data } = await http.post<LoginData>(API_PATHS.LOGIN, {
            username,
            password,
          });
          console.log('登录响应:', data);

          if (data?.token) {
            const { token, id, username, mobile } = data;
            console.log('登录成功，设置用户信息:', { token, id, username, mobile });
            set({
              token,
              user: { id, username, mobile },
              isAuthenticated: true,
            });
          } else {
            console.error('登录失败，响应数据:', data);
            throw new Error('登录失败');
          }
        } catch (error) {
          console.error('登录失败，错误详情:', error);
          throw error;
        }
      },
      logout: () => {
        set({
          token: null,
          user: null,
          isAuthenticated: false,
        });
      },
      initialize: () => {
        set({ initialized: true });
      },
    }),
    {
      name: 'auth-storage',
    }
  )
); 