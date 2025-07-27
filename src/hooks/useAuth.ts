import { useMutation, useQuery } from "@tanstack/react-query";
import type { AxiosResponse } from "axios";
import api from "../api/axios";
import { useAuthStore } from "../store/authStore";

type RegisterPayload = {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  role: string;
};

type LoginPayload = {
  email: string;
  password: string;
};

export const useLogin = () => {
  return useMutation<AxiosResponse<any>, Error, LoginPayload>({
    mutationFn: (data) => api.post("/v1/auth/login", data),
    onSuccess: (res) => useAuthStore.getState().login(res.data.access_token),
  });
};

export const useRegister = () => {
  return useMutation<AxiosResponse<any>, Error, RegisterPayload>({
    mutationFn: (data) => api.post("/v1/auth/register", data),
  });
};

export const useGetMe = () => {
  return useQuery({
    queryKey: ["me"],
    queryFn: () => api.get("/me").then(res => res.data),
    enabled: !!useAuthStore.getState().token,
  });
};
