import { create } from "zustand";

interface LoginFormState {
  email: string;
  password: string;
  captchaInput: string;
  captchaSvg: string;
  captchaId: string;
  error: string;
  loadingCaptcha: boolean;

  setEmail: (email: string) => void;
  setPassword: (password: string) => void;
  setCaptchaInput: (input: string) => void;
  setCaptchaSvg: (question: string) => void;
  setCaptchaId: (id: string) => void;
  setError: (error: string) => void;
  setLoadingCaptcha: (loading: boolean) => void;
  resetForm: () => void;
}

const initialState = {
  email: "",
  password: "",
  captchaInput: "",
  captchaSvg: "",
  captchaId: "",
  error: "",
  loadingCaptcha: false,
};

export const useLoginFormStore = create<LoginFormState>((set) => ({
  ...initialState,

  setEmail: (email) => set({ email }),
  setPassword: (password) => set({ password }),
  setCaptchaInput: (captchaInput) => set({ captchaInput }),
  setCaptchaSvg: (captchaSvg) => set({ captchaSvg }),
  setCaptchaId: (captchaId) => set({ captchaId }),
  setError: (error) => set({ error }),
  setLoadingCaptcha: (loadingCaptcha) => set({ loadingCaptcha }),
  resetForm: () => set(initialState),
}));
