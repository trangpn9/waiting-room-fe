import Pusher from 'pusher-js';
import { PUSHER_CLUSTER, PUSHER_KEY } from "../config/baseConfigs";

export const createPusherClient = () => {
  return new Pusher(PUSHER_KEY, {
    cluster: PUSHER_CLUSTER, // phải đúng với .env backend
    forceTLS: true, // đảm bảo https/wss
  });
};