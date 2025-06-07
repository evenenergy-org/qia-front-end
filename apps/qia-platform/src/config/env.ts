// API基础URL
const API_BASE_URL = 'http://8.134.66.175/app-platform';

// API路径常量
const API = {
  COMMON: {
    LOGIN: '/api/common/login',
    LOGOUT: '/api/common/login/logout',
  },
  PLATFORM: {
    USER: {
      PAGE: '/api/platform/user/page',
      CREATE: '/api/platform/user/create',
      UPDATE: (id: number) => `/api/platform/user/${id}`,
      DELETE: (id: number) => `/api/platform/user/${id}`,
      STATUS: (id: number) => `/api/platform/user/${id}/status`,
    },
  },
  FACTORY: {
    PAGE: '/api/factories/page',
    CREATE: '/api/factories',
    UPDATE: (id: number) => `/api/factories/${id}`,
    DELETE: (id: number) => `/api/factories/${id}`,
    STATUS: (id: number) => `/api/factories/${id}/status`,
  },
} as const;

// API路径配置
export const API_PATHS = {
  LOGIN: `${API_BASE_URL}${API.COMMON.LOGIN}`,
  LOGOUT: `${API_BASE_URL}${API.COMMON.LOGOUT}`,
  USER: {
    PAGE: `${API_BASE_URL}${API.PLATFORM.USER.PAGE}`,
    CREATE: `${API_BASE_URL}${API.PLATFORM.USER.CREATE}`,
    UPDATE: (id: number) => `${API_BASE_URL}${API.PLATFORM.USER.UPDATE(id)}`,
    DELETE: (id: number) => `${API_BASE_URL}${API.PLATFORM.USER.DELETE(id)}`,
    STATUS: (id: number) => `${API_BASE_URL}${API.PLATFORM.USER.STATUS(id)}`,
  },
  FACTORY: {
    PAGE: `${API_BASE_URL}${API.FACTORY.PAGE}`,
    CREATE: `${API_BASE_URL}${API.FACTORY.CREATE}`,
    UPDATE: (id: number) => `${API_BASE_URL}${API.FACTORY.UPDATE(id)}`,
    DELETE: (id: number) => `${API_BASE_URL}${API.FACTORY.DELETE(id)}`,
    STATUS: (id: number) => `${API_BASE_URL}${API.FACTORY.STATUS(id)}`,
  },
} as const; 