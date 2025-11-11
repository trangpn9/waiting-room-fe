import { useMutation, useQuery } from "@tanstack/react-query";
import type { AxiosResponse } from "axios";
import api from "../api/axios";

type JoinPayload = {
    name: string;
    reason: string;
};

type PatientIdType = {
    patientId: string;
}

export const useGetPatients = () => {
    return useQuery({
        queryKey: ["list"],
        queryFn: () => api.get("v1/doctor/list").then(res => res.data),
    });
};

export const useJoinPatient = () => {
    return useMutation<AxiosResponse<any>, Error, JoinPayload>({
        mutationFn: (data) => api.post("/v1/patient/join", data),
        onSuccess: (res) => console.log("Res Join: ", res),
    });
};

export const useExitPatient = () => {
    return useMutation<AxiosResponse<any>, Error, PatientIdType>({
        mutationFn: (data) => api.post("v1/patient/exit", data)
    });
};

export const useCallPatient = () => {
    return useMutation<AxiosResponse<any>, Error, PatientIdType>({
        mutationFn: (data) => api.post("v1/doctor/call-patient", data)
    });
};