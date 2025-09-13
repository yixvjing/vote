import axios, { AxiosResponse, AxiosRequestConfig } from 'axios';
import { UserManager } from './userManager';

// 创建 axios 实例
const apiClient = axios.create({
  baseURL: 'https://api.thefair.net.cn',
  timeout: 10000, // 10秒超时
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器
apiClient.interceptors.request.use(
  (config) => {
    // 自动添加用户UID到请求参数中
    const uid = UserManager.getUid();
    if (uid && config.data) {
      // 为POST请求添加uid
      if (typeof config.data === 'object') {
        config.data = { ...config.data, uid };
      }
    } else if (uid && config.method === 'get') {
      // 为GET请求添加uid到query参数
      config.params = { ...config.params, uid };
    }
    
    console.log('发送请求:', config);
    return config;
  },
  (error) => {
    console.error('请求错误:', error);
    return Promise.reject(error);
  }
);

// 响应拦截器
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    console.log('响应数据:', response);
    return response;
  },
  (error) => {
    console.error('响应错误:', error);
    
    // 统一错误处理
    if (error.response) {
      const { status, data } = error.response;
      
      switch (status) {
        case 401:
          // 未授权，可以跳转到登录页
          console.error('未授权，请重新登录');
          break;
        case 403:
          console.error('权限不足');
          break;
        case 404:
          console.error('请求的资源不存在');
          break;
        case 500:
          console.error('服务器内部错误');
          break;
        default:
          console.error(`请求失败: ${status}`, data?.message || '未知错误');
      }
    } else if (error.request) {
      console.error('网络错误，请检查网络连接');
    } else {
      console.error('请求配置错误:', error.message);
    }
    
    return Promise.reject(error);
  }
);

// 公共 POST 请求方法
export const postRequest = async <T = any>(
  url: string,
  data?: any,
  config?: AxiosRequestConfig
): Promise<T> => {
  try {
    const response = await apiClient.post<T>(url, data, config);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// 公共 GET 请求方法
export const getRequest = async <T = any>(
  url: string,
  config?: AxiosRequestConfig
): Promise<T> => {
  try {
    const response = await apiClient.get<T>(url, config);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// 公共 PUT 请求方法
export const putRequest = async <T = any>(
  url: string,
  data?: any,
  config?: AxiosRequestConfig
): Promise<T> => {
  try {
    const response = await apiClient.put<T>(url, data, config);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// 公共 DELETE 请求方法
export const deleteRequest = async <T = any>(
  url: string,
  config?: AxiosRequestConfig
): Promise<T> => {
  try {
    const response = await apiClient.delete<T>(url, config);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// 导出 axios 实例，以备特殊需求
export default apiClient;
