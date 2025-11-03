import axios from "axios";
import { useAuthStore } from "../store/authStore";
import { API_BASE_URL } from "../config/baseConfigs";

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

api.interceptors.request.use(config => {
  const token = useAuthStore.getState().token;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  res => res,
  async error => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const res = await axios.post(`${API_BASE_URL}/v1/auth/refresh`, {}, { withCredentials: true });
        const newToken = res.data.token;
        useAuthStore.getState().login(newToken);
        originalRequest.headers["Authorization"] = `Bearer ${newToken}`;
        return axios(originalRequest);
      } catch (err) {
        useAuthStore.getState().logout();
        window.location.href = "/login";
        return Promise.reject(err);
      }
    }
    return Promise.reject(error);
  }
);

export default api;