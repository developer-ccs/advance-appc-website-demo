import { create } from "zustand";
import { apiClient } from "@/lib/axios-instance";

interface PdfItem {
  _id: string;
  title: string;
  section: string;
  fileUrl: string;
  fileName: string;
  createdAt: string;
  isNew?: boolean;
}

interface PaginationMeta {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

interface PdfStore {
  forms: PdfItem[];
  notices: PdfItem[];
  announcements: PdfItem[];

  noticePagination: PaginationMeta;
  announcementPagination: PaginationMeta;

  loadingForms: boolean;
  loadingNotices: boolean;
  loadingAnnouncements: boolean;

  fetchForms: () => Promise<void>;
  fetchNotices: (page?: number) => Promise<void>;
  fetchAnnouncements: (page?: number) => Promise<void>;

  clearForms: () => void;
  clearNotices: () => void;
  clearAnnouncements: () => void;
}

const defaultPagination: PaginationMeta = {
  currentPage: 1,
  totalPages: 1,
  totalCount: 0,
  hasNextPage: false,
  hasPrevPage: false,
};

export const usePdfStore = create<PdfStore>((set) => ({
  forms: [],
  notices: [],
  announcements: [],

  noticePagination: defaultPagination,
  announcementPagination: defaultPagination,

  loadingForms: false,
  loadingNotices: false,
  loadingAnnouncements: false,

  // Fetch Forms (Renewal + New)
  fetchForms: async () => {
    try {
      set({ loadingForms: true });
      const { data } = await apiClient.get("/upload/get-forms");
      set({ forms: data.data ?? [], loadingForms: false });
    } catch (error) {
      console.error("fetchForms error", error);
      set({ loadingForms: false });
    }
  },

  // Fetch Notices — pass page number, default 1
  fetchNotices: async (page = 1) => {
    try {
      set({ loadingNotices: true });
      const { data } = await apiClient.get(
        `/global/get-notices?type=Notice&page=${page}&limit=10`,
      );
      await new Promise((res) => setTimeout(res, 600));
      set({
        notices: Array.isArray(data?.data?.data) ? data.data.data : [],
        noticePagination: data?.data?.pagination
          ? {
              currentPage: data.data.pagination.currentPage,
              totalPages: data.data.pagination.totalPages,
              totalCount: data.data.totalCount,
              hasNextPage: data.data.pagination.hasNextPage,
              hasPrevPage: data.data.pagination.hasPrevPage,
            }
          : defaultPagination,
        loadingNotices: false,
      });
    } catch (error) {
      console.error("fetchNotices error", error);
      set({ loadingNotices: false });
    }
  },

  // Fetch Announcements — pass page number, default 1
  fetchAnnouncements: async (page = 1) => {
    try {
      set({ loadingAnnouncements: true });
      const { data } = await apiClient.get(
        `/global/get-notices?type=Announcement&page=${page}&limit=10`,
      );
      await new Promise((res) => setTimeout(res, 600));
      set({
        announcements: Array.isArray(data?.data?.data) ? data.data.data : [],
        announcementPagination: data?.data?.pagination
          ? {
              currentPage: data.data.pagination.currentPage,
              totalPages: data.data.pagination.totalPages,
              totalCount: data.data.totalCount,
              hasNextPage: data.data.pagination.hasNextPage,
              hasPrevPage: data.data.pagination.hasPrevPage,
            }
          : defaultPagination,
        loadingAnnouncements: false,
      });
    } catch (error) {
      console.error("fetchAnnouncements error", error);
      set({ loadingAnnouncements: false });
    }
  },

  clearForms: () => set({ forms: [] }),
  clearNotices: () => set({ notices: [], noticePagination: defaultPagination }),
  clearAnnouncements: () =>
    set({ announcements: [], announcementPagination: defaultPagination }),
}));
