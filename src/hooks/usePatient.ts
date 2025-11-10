import { useMutation, useQuery } from "@tanstack/react-query";
import type { AxiosResponse } from "axios";
import api from "../api/axios";

type JoinPayload = {
    name: string;
    reason: string;
};

type ExitPatient = {
    patientId: string;
}

export const useGetPatients = () => {
    return useQuery({
        queryKey: ["list"],
        queryFn: () => api.get("v1/patient/list").then(res => res.data),
    });
};

export const useJoinPatient = () => {
    return useMutation<AxiosResponse<any>, Error, JoinPayload>({
        mutationFn: (data) => api.post("/v1/patient/join", data),
        onSuccess: (res) => console.log("Res Join: ", res),
    });
};

export const useExitPatient = () => {
    return useMutation<AxiosResponse<any>, Error, ExitPatient>({
        mutationFn: (data) => api.post("v1/patient/exit", data)
    });
};