import axios from "axios";
import { useAuthStore } from "../store/authStore";
import { API_BASE_URL } from "../config/baseConfigs";

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

/** =========================
 *  REFRESH TOKEN QUEUE SETUP
 *  ========================= */
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token?: string) => void;
  reject: (error: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(prom => {
    if (error) prom.reject(error);
    else prom.resolve(token || undefined);
  });
  failedQueue = [];
};

/** =========================
 *  RESPONSE INTERCEPTOR
 *  ========================= */
api.interceptors.request.use(config => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;

    // Không có response → không xử lý
    if (!error.response) {
      return Promise.reject(error);
    }

    const status = error.response.status;
    const token = useAuthStore.getState().token;

    // --------------------------
    // Điều kiện refresh TOKEN
    // --------------------------
    if (status === 401 && token && !originalRequest._retry) {
      originalRequest._retry = true;

      // Queue nếu token đang được refresh
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({
            resolve: (newToken?: string) => {
              if (newToken) {
                originalRequest.headers.Authorization = `Bearer ${newToken}`;
              }
              resolve(api(originalRequest));
            },
            reject,
          });
        });
      }

      isRefreshing = true;

      try {
        // Gọi refresh token
        const refreshRes = await axios.post(
          `${API_BASE_URL}/v1/auth/refresh`,
          {},
          {
            headers: { Authorization: `Bearer ${token}` },
            withCredentials: true,
          }
        );

        const newToken = refreshRes.data.token;

        useAuthStore.getState().login(newToken);
        processQueue(null, newToken);

        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        useAuthStore.getState().logout();
        window.location.href = "/login";
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;
