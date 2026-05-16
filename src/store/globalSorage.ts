import { create } from "zustand";
import { apiClient } from "@/lib/axios-instance";

// ─── Helper ──────────────────────────────────────────────────────────────────

const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

// ─── Types ───────────────────────────────────────────────────────────────────

interface FormStat {
  totalDownloads: number;
  uniqueDownloaders: number;
}

interface TypeWiseCount {
  _id: string;
  count: number;
}

interface Pagination {
  total: number;
  totalPages: number;
  currentPage: number;
  limit: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

interface Certificate {
  _id: string;
  registrationNumber: string;
  ownerName: string;
  email: string;
  phoneNumber: string;
  certificateType: "New" | "Renewal";
  status: "Active" | "Expired" | "Revoked";
  issueDate: string;
  expiryDate: string | null;
  fileUrl: string;
  fileName: string;
  fileSize: number;
  remarks: string | null;
  uploadedBy: { name: string; email: string };
  createdAt: string;
}

interface Notice {
  _id: string;
  title: string;
  section: "Notice";
  fileUrl: string;
  fileName: string;
  fileSize: number;
  userId: { name: string; email: string } | null;
  createdAt: string;
  isNew?: boolean;
}

interface Announcement {
  _id: string;
  title: string;
  section: "Announcement";
  fileUrl: string;
  fileName: string;
  fileSize: number;
  userId: { name: string; email: string } | null;
  createdAt: string;
  isNew?: boolean;
}

// ─── Download History ─────────────────────────────────────────────────────────

interface DownloadHistoryItem {
  _id: string;
  userId: {
    _id: string;
    name: string;
    email: string;
    phoneNumber: string;
    role: string;
  } | null;
  pdfId: {
    _id: string;
    title: string;
    section: string;
    fileUrl: string;
  } | null;
  serialNumber: string;
  downloadedAt: string;
  downloadCount: number;
  createdAt: string;
}

// ─── Certificate Filters ─────────────────────────────────────────────────────

interface CertificateFilters {
  page: number;
  limit: number;
  status: string;
  certificateType: string;
  search: string;
}

// ─── State ───────────────────────────────────────────────────────────────────

interface DashboardState {
  // Download Stats
  newForm: FormStat;
  renewalForm: FormStat;
  statsLoading: boolean;
  statsError: string | null;

  // Certificates
  certificates: Certificate[];
  typeWiseCounts: TypeWiseCount[];
  statusWiseCounts: TypeWiseCount[];
  certPagination: Pagination | null;
  certFilters: CertificateFilters;
  certLoading: boolean;
  certError: string | null;

  // Notices
  notices: Notice[];
  announcements: Announcement[];
  noticesTotalCount: number;
  noticesLoading: boolean;
  noticesError: string | null;

  // Download History
  downloadHistory: DownloadHistoryItem[];
  downloadHistoryLoading: boolean;
  downloadHistoryError: string | null;

  // Hydration
  hasHydrated: boolean;
  setHydrated: () => void;

  // Actions — Stats
  fetchDownloadStats: () => Promise<void>;
  clearStats: () => void;

  // Actions — Certificates
  fetchCertificates: (filters?: Partial<CertificateFilters>) => Promise<void>;
  setCertFilters: (filters: Partial<CertificateFilters>) => void;
  resetCertFilters: () => void;

  // Actions — Notices
  fetchNotices: () => Promise<void>;

  // Actions — Download History
  fetchDownloadHistory: () => Promise<void>;
}

// ─── Defaults ────────────────────────────────────────────────────────────────

const DEFAULT_STAT: FormStat = { totalDownloads: 0, uniqueDownloaders: 0 };

const DEFAULT_CERT_FILTERS: CertificateFilters = {
  page: 1,
  limit: 10,
  status: "Active",
  certificateType: "",
  search: "",
};

const DEFAULT_PAGINATION: Pagination = {
  total: 0,
  totalPages: 1,
  currentPage: 1,
  limit: 10,
  hasNextPage: false,
  hasPrevPage: false,
};

// ─── Store ───────────────────────────────────────────────────────────────────

export const useDashboardStore = create<DashboardState>()((set, get) => ({
  // ── Download Stats ──────────────────────────────────────────────────────
  newForm: DEFAULT_STAT,
  renewalForm: DEFAULT_STAT,
  statsLoading: false,
  statsError: null,

  // ── Certificates ────────────────────────────────────────────────────────
  certificates: [],
  typeWiseCounts: [],
  statusWiseCounts: [],
  certPagination: null,
  certFilters: DEFAULT_CERT_FILTERS,
  certLoading: false,
  certError: null,

  // ── Notices ─────────────────────────────────────────────────────────────
  notices: [],
  announcements: [],
  noticesTotalCount: 0,
  noticesLoading: false,
  noticesError: null,

  // ── Download History ─────────────────────────────────────────────────────
  downloadHistory: [],
  downloadHistoryLoading: false,
  downloadHistoryError: null,

  // ── Hydration ────────────────────────────────────────────────────────────
  hasHydrated: false,

  // ── Fetch Download Stats ─────────────────────────────────────────────────
  fetchDownloadStats: async () => {
    set({ statsLoading: true, statsError: null });
    try {
      const { data } = await apiClient.get("/admin/get-stats");
      set({
        newForm: data.data.newForm ?? DEFAULT_STAT,
        renewalForm: data.data.renewalForm ?? DEFAULT_STAT,
        statsLoading: false,
      });
    } catch (error) {
      console.error("[DownloadStats] Fetch failed:", error);
      set({
        statsError: "Failed to fetch download stats",
        statsLoading: false,
      });
    }
  },

  clearStats: () =>
    set({ newForm: DEFAULT_STAT, renewalForm: DEFAULT_STAT, statsError: null }),

  // ── Fetch Certificates ───────────────────────────────────────────────────
  fetchCertificates: async (filters = {}) => {
    const merged = { ...get().certFilters, ...filters };
    set({ certLoading: true, certError: null, certFilters: merged });

    try {
      const params = new URLSearchParams();
      params.set("page", String(merged.page));
      params.set("limit", String(merged.limit));
      if (merged.status) params.set("status", merged.status);
      if (merged.certificateType)
        params.set("certificateType", merged.certificateType);
      if (merged.search.trim()) params.set("search", merged.search.trim());

      const { data } = await apiClient.get(
        `/upload/get-all-certificate?${params.toString()}`,
      );

      set({
        certificates: data.data.certificates ?? [],
        typeWiseCounts: data.data.typeWiseCounts ?? [],
        statusWiseCounts: data.data.statusWiseCounts ?? [],
        certPagination: data.data.pagination ?? DEFAULT_PAGINATION,
        certLoading: false,
      });
    } catch (error) {
      console.error("[Certificates] Fetch failed:", error);
      set({ certError: "Failed to fetch certificates", certLoading: false });
    }
  },

  setCertFilters: (filters) =>
    set((state) => ({
      certFilters: { ...state.certFilters, ...filters },
    })),

  resetCertFilters: () => set({ certFilters: DEFAULT_CERT_FILTERS }),

  // ── Fetch Notices ────────────────────────────────────────────────────────
  fetchNotices: async () => {
    set({ noticesLoading: true, noticesError: null });
    try {
      const [noticeRes, announcementRes] = await Promise.all([
        apiClient.get("/upload/pdfs?section=Notice"),
        apiClient.get("/upload/pdfs?section=Announcement"),
      ]);

      const noticeCount = noticeRes.data.data.sectionCountTotal ?? 0;
      const announcementCount =
        announcementRes.data.data.sectionCountTotal ?? 0;

      set({
        notices: noticeRes.data.data.pdfs ?? [],
        announcements: announcementRes.data.data.pdfs ?? [],
        noticesTotalCount: noticeCount + announcementCount,
        noticesLoading: false,
      });
    } catch (error) {
      console.error("[Notices] Fetch failed:", error);
      set({ noticesError: "Failed to fetch notices", noticesLoading: false });
    }
  },

  // ── Fetch Download History ───────────────────────────────────────────────
  fetchDownloadHistory: async () => {
    set({ downloadHistoryLoading: true, downloadHistoryError: null });
    try {
      const { data } = await apiClient.get("/upload/download-history");
      set({
        downloadHistory: data.data.history ?? [],
        downloadHistoryLoading: false,
      });
    } catch (error) {
      console.error("[DownloadHistory] Fetch failed:", error);
      set({
        downloadHistoryError: "Failed to fetch download history",
        downloadHistoryLoading: false,
      });
    }
  },

  // ── Hydration ────────────────────────────────────────────────────────────
  setHydrated: () => set({ hasHydrated: true }),
}));
