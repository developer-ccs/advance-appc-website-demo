import { create } from "zustand";
import { apiClient } from "@/lib/axios-instance";
import { AxiosError } from "axios";

interface Address {
  officeAddress: string;
  email: string;
  officePhone: string;
}

interface AddressState {
  address: Address | null;
  loading: boolean;
  saving: boolean;
  error: string;
  fetched: boolean;
}

interface AddressActions {
  fetchAddress: () => Promise<void>;
  updateAddress: (
    data: Address,
  ) => Promise<{ success: boolean; message: string }>;
  setError: (error: string) => void;
  reset: () => void;
}

type AddressStore = AddressState & AddressActions;

const initialState: AddressState = {
  address: null,
  loading: false,
  saving: false,
  error: "",
  fetched: false,
};

export const useAddressStore = create<AddressStore>((set) => ({
  ...initialState,

  fetchAddress: async () => {
    try {
      set({ loading: true, error: "" });

      const { data } = await apiClient.get("/address");

      set({
        address: {
          officeAddress: data.data.officeAddress || "",
          email: data.data.email || "",
          officePhone: data.data.officePhone || "",
        },
        loading: false,
        fetched: true,
        error: "",
      });
    } catch (err) {
      const message =
        err instanceof AxiosError
          ? err.response?.data?.message || "Failed to load settings"
          : "Failed to load settings";

      set({ loading: false, fetched: true, error: message });
    }
  },

  updateAddress: async (data: Address) => {
    try {
      set({ saving: true, error: "" });

      const response = await apiClient.put("/address", {
        officeAddress: data.officeAddress,
        email: data.email,
        officePhone: data.officePhone,
      });
      await new Promise((res) => setTimeout(res, 600));

      if (response.data?.success) {
        set({ address: data, saving: false });
        return { success: true, message: "Settings saved successfully!" };
      }

      set({ saving: false });
      return { success: false, message: "Failed to save settings" };
    } catch (err) {
      const message =
        err instanceof AxiosError
          ? err.response?.data?.message || "Failed to save settings"
          : "Failed to save settings";

      set({ saving: false, error: message });
      return { success: false, message };
    }
  },

  setError: (error) => set({ error }),
  reset: () => set(initialState),
}));
