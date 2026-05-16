import { clearAuthCookie } from "@/utils/auth";
import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface AuthUser {
  _id: string;
  name: string;
  email: string;
  role: string;
  [key: string]: unknown;
}

interface AuthState {
  token: string | null;
  user: AuthUser | null;
  permissions: string[];
  _hasHydrated: boolean;
  tempPassword: string | null;
  setTempPassword: (p: string | null) => void;

  setAuth: (token: string, user: AuthUser) => void;
  setPermissions: (permissions: string[]) => void;
  setHasHydrated: (val: boolean) => void;
  updateRole: (userId: string, newRole: string) => void;
  hasPermission: (action: string) => boolean;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      user: null,
      permissions: [],
      _hasHydrated: false,

      setAuth: (token, user) => set({ token, user }),

      setPermissions: (permissions) => set({ permissions }),

      setHasHydrated: (val) => set({ _hasHydrated: val }),

      // ✅ Only updates role if the changed user is the currently logged-in user.
      // This updates both in-memory state AND localStorage (persist handles it).
      updateRole: (userId, newRole) => {
        const { user } = get();
        if (user && user._id === userId) {
          set({ user: { ...user, role: newRole } });
        }
      },

      tempPassword: null,
      setTempPassword: (tempPassword) => set({ tempPassword }),

      hasPermission: (action) => {
        const { user, permissions } = get();
        if (!user) return false;
        if (user.role === "super-admin") return true;
        return permissions.includes(action);
      },

      clearAuth: () => {
        clearAuthCookie();
        set({
          token: null,
          user: null,
          permissions: [],
          tempPassword: null,
          _hasHydrated: true,
        });
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        token: state.token,
        user: state.user,
        permissions: state.permissions,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    },
  ),
);
