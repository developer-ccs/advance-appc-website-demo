import { create } from "zustand";

interface RegisterFormState {
  name: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  error: string;
}

interface RegisterStore {
  applicant: RegisterFormState;
  council: RegisterFormState;
  setApplicantField: (field: keyof RegisterFormState, value: string) => void;
  setCouncilField: (field: keyof RegisterFormState, value: string) => void;
  resetApplicant: () => void;
  resetCouncil: () => void;
}

const initialFormState: RegisterFormState = {
  name: "",
  email: "",
  phone: "",
  password: "",
  confirmPassword: "",
  error: "",
};

export const useRegisterStore = create<RegisterStore>((set) => ({
  applicant: { ...initialFormState },
  council: { ...initialFormState },

  setApplicantField: (field, value) =>
    set((state) => ({
      applicant: { ...state.applicant, [field]: value },
    })),

  setCouncilField: (field, value) =>
    set((state) => ({
      council: { ...state.council, [field]: value },
    })),

  resetApplicant: () => set({ applicant: { ...initialFormState } }),
  resetCouncil: () => set({ council: { ...initialFormState } }),
}));
