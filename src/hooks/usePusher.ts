import Pusher from 'pusher-js';
import { PUSHER_CLUSTER, PUSHER_KEY, BASE_URL } from "../config/baseConfigs";
import { useAuthStore } from '../store/authStore';

let pusherInstance: Pusher | null = null;

export const createPusherClient = () => {
  // Nếu đã có instance → dùng luôn
  if (pusherInstance) return pusherInstance;

  const {token} = useAuthStore.getState();
  pusherInstance = new Pusher(PUSHER_KEY, {
    cluster: PUSHER_CLUSTER, // phải đúng với .env backend
    forceTLS: true, // đảm bảo https/wss
    // Laravel mặc định endpoint auth là /broadcasting/auth
    authEndpoint: `http://localhost:8000/broadcasting/auth`,
    auth: {
      headers: {
        // JWT từ login (Bearer token)
        Authorization: token ? `Bearer ${token}` : "",
        Accept: "application/json",
      },
    },
  });

  return pusherInstance;
};

// Xoá sạch Pusher khi logout
export const disconnectPusher = () => {
  if (pusherInstance) {
    pusherInstance.disconnect();
    pusherInstance = null;
  }
};