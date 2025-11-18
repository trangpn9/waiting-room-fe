import Pusher from 'pusher-js';
import { PUSHER_CLUSTER, PUSHER_KEY, BASE_URL } from "../config/baseConfigs";
import { useAuthStore } from '../store/authStore';

export const createPusherClient = () => {
  const {token} = useAuthStore.getState();
  return new Pusher(PUSHER_KEY, {
    cluster: PUSHER_CLUSTER, // phải đúng với .env backend
    forceTLS: true, // đảm bảo https/wss
    // Laravel mặc định endpoint auth là /broadcasting/auth
    authEndpoint: `test/broadcasting/auth`,
    auth: {
      headers: {
        // JWT từ login (Bearer token)
        Authorization: token ? `Bearer ${token}` : "",
        Accept: "application/json",
      },
    },
  });
};