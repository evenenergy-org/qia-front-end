import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import axios from 'axios';

interface AuthState {
  token: string | null;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      isAuthenticated: false,
      login: async (username: string, password: string) => {
        try {
          const response = await axios.post('http://8.134.66.175/app-platform/api/common/login', {
            username,
            password,
          });
          
          const { token } = response.data;
          set({ token, isAuthenticated: true });
          
          // 设置axios默认headers
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        } catch (error) {
          throw new Error('登录失败');
        }
      },
      logout: () => {
        set({ token: null, isAuthenticated: false });
        delete axios.defaults.headers.common['Authorization'];
      },
    }),
    {
      name: 'auth-storage',
    }
  )
); 