import axios, { AxiosError } from "axios";
import { useAuthStore } from "@/store/authStore";

export const createApiInstance = () => {
  const instance = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL,
    withCredentials: true,
  });

  instance.interceptors.request.use((config) => {
    const token = useAuthStore.getState().token;
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  });

  instance.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      if (
        error.response?.data instanceof Blob &&
        error.response.data.type === "application/json"
      ) {
        try {
          const text = await error.response.data.text();
          const json = JSON.parse(text);
          error.message = json?.message ?? error.message;
          (error.response as any).data = json;
        } catch {
          // couldn't parse — leave error as-is
        }
      }

      if (error.response?.status === 401) {
        useAuthStore.getState().clearAuth();
        if (
          typeof window !== "undefined" &&
          !window.location.pathname.includes("/")
        ) {
          window.location.href = "/";
        }
      }

      return Promise.reject(error);
    },
  );

  return instance;
};

export const apiClient = createApiInstance();