// API基础路径
export const API_BASE_URL = 'http://8.134.66.175/app-platform';

// API路径配置
export const API_PATHS = {
  LOGIN: `${API_BASE_URL}/api/common/login`,
  LOGOUT: `${API_BASE_URL}/api/common/login/logout`,
  // 用户管理
  USER: {
    PAGE: `${API_BASE_URL}/api/platform/user/page`,
    STATUS: (id: string | number) => `${API_BASE_URL}/api/platform/user/${id}/status`,
  },
} as const; 