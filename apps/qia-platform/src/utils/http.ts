import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { API_BASE_URL } from '@/config/env';

// 创建axios实例
const http: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器
http.interceptors.request.use(
  (config) => {
    // 从localStorage获取token
    const token = localStorage.getItem('auth-storage');
    if (token) {
      try {
        const { state } = JSON.parse(token);
        if (state?.token) {
          config.headers.Authorization = `Bearer ${state.token}`;
        }
      } catch (error) {
        console.error('解析token失败:', error);
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器
http.interceptors.response.use(
  (response: AxiosResponse) => {
    const { data } = response;
    // 这里可以根据后端的响应结构统一处理
    if (data.code !== 200) {
      return Promise.reject(new Error(data.msg || '请求失败'));
    }
    return data;
  },
  (error) => {
    // 统一处理错误
    if (error.response) {
      switch (error.response.status) {
        case 401:
          // 未授权，清除token并跳转到登录页
          localStorage.removeItem('auth-storage');
          window.location.href = '/login';
          break;
        case 403:
          // 权限不足
          console.error('权限不足');
          break;
        case 404:
          // 请求的资源不存在
          console.error('请求的资源不存在');
          break;
        case 500:
          // 服务器错误
          console.error('服务器错误');
          break;
        default:
          console.error('请求失败:', error.message);
      }
    } else if (error.request) {
      // 请求已发出但没有收到响应
      console.error('网络错误，请检查网络连接');
    } else {
      // 请求配置出错
      console.error('请求配置错误:', error.message);
    }
    return Promise.reject(error);
  }
);

// 封装GET请求
export const get = <T = any>(url: string, params?: any, config?: AxiosRequestConfig): Promise<T> => {
  return http.get(url, { params, ...config });
};

// 封装POST请求
export const post = <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> => {
  return http.post(url, data, config);
};

// 封装PUT请求
export const put = <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> => {
  return http.put(url, data, config);
};

// 封装DELETE请求
export const del = <T = any>(url: string, config?: AxiosRequestConfig): Promise<T> => {
  return http.delete(url, config);
};

export default http; 