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

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const originalRequest = error.config;

    // Nếu lỗi 401 (hết hạn) và chưa retry
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const oldToken = useAuthStore.getState().token;

        // Gọi refresh
        const res = await axios.post(
          `${API_BASE_URL}/v1/auth/refresh`,
          {},
          {
            headers: { Authorization: `Bearer ${oldToken}` },
            withCredentials: true,
          }
        );

        const newToken = res.data.token;

        // Lưu lại token mới
        useAuthStore.getState().login(newToken);

        // Gắn token mới vào request gốc
        originalRequest.headers["Authorization"] = `Bearer ${newToken}`;

        // Gửi lại request
        return api(originalRequest);
      } catch (err) {
        // Refresh thất bại → logout
        useAuthStore.getState().logout();
        window.location.href = "/login";
        return Promise.reject(err);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
