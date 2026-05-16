import { create } from "zustand";
import { apiClient } from "@/lib/axios-instance";

interface User {
  id: number;
  name: string;
  role?: string;
  email?: string;
  userId: {
    name: string;
    role?: string;
    email?: string;
  };
}

interface UserStore {
  user: User | null;
  loading: boolean;
  fetchUser: () => Promise<void>;
  clearUser: () => void;
}

export const useUserProfileStore = create<UserStore>((set) => ({
  user: null,
  loading: false,

  fetchUser: async () => {
    try {
      set({ loading: true });

      const { data } = await apiClient.get("/global/get-profile");

      set({
        user: data.data,
        loading: false,
      });
    } catch (error) {
      console.log("fetch profile error", error);
      set({ loading: false });
    }
  },

  clearUser: () => set({ user: null }),
}));
