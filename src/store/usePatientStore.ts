import { create } from 'zustand';

interface PatientState {
  patientId: string | null;
  setPatientId: (id: string) => void;
  clearPatientId: () => void;
}

export const usePatientStore = create<PatientState>((set) => ({
  patientId: null,
  setPatientId: (id) => {
    sessionStorage.setItem('patientId', id);
    set({ patientId: id });
  },
  clearPatientId: () => {
    sessionStorage.removeItem('patientId');
    set({ patientId: null });
  },
}));