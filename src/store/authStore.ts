import { create } from "zustand";
import { jwtDecode } from "jwt-decode";

interface AuthState {
  token: string | null;
  role: string | null;
  login: (token: string) => void;
  logout: () => void;
  init: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  role: null,
  login: token => {
    const decoded: any = jwtDecode(token);
    localStorage.setItem("token", token);
    set({ token, role: decoded.role });
  },
  logout: () => {
    localStorage.removeItem("token");
    set({ token: null, role: null });
  },
  init: () => {
    const token = localStorage.getItem("token");
    if (token) {
      const decoded: any = jwtDecode(token);
      set({ token, role: decoded.role });
    }
  },
}));