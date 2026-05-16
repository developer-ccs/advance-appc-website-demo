import { create } from "zustand";
import { apiClient } from "@/lib/axios-instance";
import { AxiosError } from "axios";

interface LogoData {
  fileUrl: string;
  fileName: string;
  fileSize: number;
}

interface LogoAboutState {
  // Logo
  logo: LogoData | null;
  logoLoading: boolean;
  logoSaving: boolean;
  logoFetched: boolean;
  logoError: string;

  // About
  about: string;
  aboutLoading: boolean;
  aboutSaving: boolean;
  aboutFetched: boolean;
  aboutError: string;
}

interface LogoAboutActions {
  fetchLogo: () => Promise<void>;
  uploadLogo: (file: File) => Promise<{ success: boolean; message: string }>;

  fetchAbout: () => Promise<void>;
  saveAbout: (about: string) => Promise<{ success: boolean; message: string }>;

  setLogoError: (error: string) => void;
  setAboutError: (error: string) => void;
  reset: () => void;
}

type LogoAboutStore = LogoAboutState & LogoAboutActions;

const initialState: LogoAboutState = {
  logo: null,
  logoLoading: false,
  logoSaving: false,
  logoFetched: false,
  logoError: "",

  about: "",
  aboutLoading: false,
  aboutSaving: false,
  aboutFetched: false,
  aboutError: "",
};

export const useLogoAboutStore = create<LogoAboutStore>((set) => ({
  ...initialState,

  // ─── Logo ────────────────────────────────────────────────────────────────

  fetchLogo: async () => {
    try {
      set({ logoLoading: true, logoError: "" });

      const { data } = await apiClient.get("/global/get-logo");

      set({
        logo: {
          fileUrl: data.data.fileUrl || "",
          fileName: data.data.fileName || "",
          fileSize: data.data.fileSize || 0,
        },
        logoLoading: false,
        logoFetched: true,
        logoError: "",
      });
    } catch (err) {
      const message =
        err instanceof AxiosError
          ? err.response?.data?.message || "Failed to load logo"
          : "Failed to load logo";

      // 404 just means no logo yet — not a real error worth showing
      const is404 = err instanceof AxiosError && err.response?.status === 404;

      set({
        logoLoading: false,
        logoFetched: true,
        logoError: is404 ? "" : message,
      });
    }
  },

  uploadLogo: async (file: File) => {
    try {
      set({ logoSaving: true, logoError: "" });

      const formData = new FormData();
      formData.append("logo", file);

      const response = await apiClient.post("/upload/logo", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (response.data?.success) {
        const { fileUrl, fileName, fileSize } = response.data.data;
        set({
          logo: { fileUrl, fileName, fileSize },
          logoSaving: false,
        });
        return { success: true, message: "Logo updated successfully!" };
      }

      set({ logoSaving: false });
      return { success: false, message: "Failed to upload logo" };
    } catch (err) {
      const message =
        err instanceof AxiosError
          ? err.response?.data?.message || "Failed to upload logo"
          : "Failed to upload logo";

      set({ logoSaving: false, logoError: message });
      return { success: false, message };
    }
  },

  // ─── About ───────────────────────────────────────────────────────────────

  fetchAbout: async () => {
    try {
      set({ aboutLoading: true, aboutError: "" });

      const { data } = await apiClient.get("/global/get-about");

      set({
        about: data.data.about || "",
        aboutLoading: false,
        aboutFetched: true,
        aboutError: "",
      });
    } catch (err) {
      const is404 = err instanceof AxiosError && err.response?.status === 404;
      const message =
        err instanceof AxiosError
          ? err.response?.data?.message || "Failed to load about section"
          : "Failed to load about section";

      set({
        aboutLoading: false,
        aboutFetched: true,
        aboutError: is404 ? "" : message,
      });
    }
  },

  saveAbout: async (about: string) => {
    try {
      set({ aboutSaving: true, aboutError: "" });

      const response = await apiClient.post("/admin/about", { about });
      await new Promise((res) => setTimeout(res, 600));

      if (response.data?.success) {
        set({ about, aboutSaving: false });
        return { success: true, message: "About section saved successfully!" };
      }

      set({ aboutSaving: false });
      return { success: false, message: "Failed to save about section" };
    } catch (err) {
      const message =
        err instanceof AxiosError
          ? err.response?.data?.message || "Failed to save about section"
          : "Failed to save about section";

      set({ aboutSaving: false, aboutError: message });
      return { success: false, message };
    }
  },

  // ─── Helpers ─────────────────────────────────────────────────────────────

  setLogoError: (logoError) => set({ logoError }),
  setAboutError: (aboutError) => set({ aboutError }),
  reset: () => set(initialState),
}));
