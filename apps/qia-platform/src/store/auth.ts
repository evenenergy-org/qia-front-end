import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import http from '@/utils/http';

interface User {
  id: number;
  username: string;
  email: string;
}

interface LoginResponse {
  code: number;
  message: string;
  data: {
    token: string;
    user: User;
  };
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
          const response = await http.post<LoginResponse>('/api/auth/login', {
            username,
            password,
          });

          if (response.data.code === 200 && response.data.data?.token) {
            set({
              token: response.data.data.token,
              user: response.data.data.user,
              isAuthenticated: true,
            });
          } else {
            throw new Error(response.data.message || '登录失败');
          }
        } catch (error) {
          console.error('登录失败:', error);
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