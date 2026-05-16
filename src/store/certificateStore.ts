import { create } from "zustand";
import { apiClient } from "@/lib/axios-instance";

interface Certificate {
  _id: string;
  uploadedBy: string;
  registrationNumber: string;
  ownerName: string;
  email: string;
  phoneNumber: string;
  degree: string;
  fileUrl: string;
  fileName: string;
  fileSize: number;
  certificateType: "New" | "Renewal";
  issueDate: string;
  expiryDate: string;
  remarks: string;
  status: "Active" | "Expired" | "Revoked";
  createdAt: string;
  updatedAt: string;
}

interface CertificateState {
  activeCerts: Certificate[];
  history: Certificate[];
  total: number;
  loading: boolean;
  error: string;
  fetched: boolean;
}

interface CertificateActions {
  fetchCertificate: () => Promise<void>;
  reset: () => void;
}

type CertificateStore = CertificateState & CertificateActions;

const initialState: CertificateState = {
  activeCerts: [],
  history: [],
  total: 0,
  loading: false,
  error: "",
  fetched: false,
};

export const useCertificateStore = create<CertificateStore>((set) => ({
  ...initialState,

  fetchCertificate: async () => {
    try {
      set({ loading: true, error: "" });

      const { data } = await apiClient.get("/applicant/my-certificate");

      set({
        activeCerts: data.data.activeCerts ?? [],
        history: data.data.history ?? [],
        total: data.data.total,
        loading: false,
        fetched: true,
        error: "",
      });
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } })?.response
        ?.status;

      if (status === 404) {
        set({ ...initialState, fetched: true });
      } else {
        set({
          loading: false,
          fetched: true,
          error: "Failed to load certificate. Please try again.",
        });
      }
    }
  },

  reset: () => set(initialState),
}));
