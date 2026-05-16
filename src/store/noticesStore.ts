import { create } from "zustand";

interface PdfRecord {
  _id: string;
  title: string;
  section: string;
  fileUrl: string;
  fileName: string;
  fileSize: number;
  createdAt: string;
  isNew?: boolean;
  userId?: { name: string; email: string };
}

interface Pagination {
  currentPage: number;
  totalPages: number;
  limit: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

// ─── State ────────────────────────────────────────────────────────────────────

interface NoticesState {
  notices: PdfRecord[];
  loading: boolean;
  search: string;
  activeFilter: "All" | "Notice" | "Announcement";
  currentPage: number;
  totalCount: number;
  pagination: Pagination;

  isUploading: boolean;
  uploading: boolean;
  uploadForm: { title: string; section: string };
  uploadFile: File | null;

  editTarget: PdfRecord | null;
  editForm: { title: string; section: string };
  editFile: File | null;
  editSaving: boolean;
}

// ─── Actions ──────────────────────────────────────────────────────────────────

interface NoticesActions {
  setNotices: (
    notices: PdfRecord[],
    pagination: Pagination,
    totalCount: number,
  ) => void;
  setLoading: (v: boolean) => void;
  setSearch: (v: string) => void;
  setActiveFilter: (filter: "All" | "Notice" | "Announcement") => void;
  setCurrentPage: (page: number) => void;
  resetCurrentPage: () => void;

  setIsUploading: (v: boolean) => void;
  setUploading: (v: boolean) => void;
  updateUploadForm: (
    patch: Partial<{ title: string; section: string }>,
  ) => void;
  setUploadFile: (f: File | null) => void;
  resetUploadForm: () => void;

  setEditTarget: (notice: PdfRecord | null) => void;
  setEditForm: (form: { title: string; section: string }) => void;
  updateEditForm: (patch: Partial<{ title: string; section: string }>) => void;
  setEditFile: (f: File | null) => void;
  setEditSaving: (v: boolean) => void;
  resetEditForm: () => void;

  removeNotice: (id: string) => void;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const DEFAULT_PAGINATION: Pagination = {
  currentPage: 1,
  totalPages: 1,
  limit: 10,
  hasNextPage: false,
  hasPrevPage: false,
};

const DEFAULT_UPLOAD_FORM = { title: "", section: "Notice" };

// ─── Store ────────────────────────────────────────────────────────────────────

export const useNoticesStore = create<NoticesState & NoticesActions>((set) => ({
  // state
  notices: [],
  loading: false,
  search: "",
  activeFilter: "All",
  currentPage: 1,
  totalCount: 0,
  pagination: DEFAULT_PAGINATION,

  isUploading: false,
  uploading: false,
  uploadForm: DEFAULT_UPLOAD_FORM,
  uploadFile: null,

  editTarget: null,
  editForm: { title: "", section: "Notice" },
  editFile: null,
  editSaving: false,

  // actions
  setNotices: (notices, pagination, totalCount) =>
    set({ notices, pagination, totalCount }),
  setLoading: (loading) => set({ loading }),
  setSearch: (search) => set({ search, currentPage: 1 }),
  setActiveFilter: (activeFilter) => set({ activeFilter, currentPage: 1 }),
  setCurrentPage: (currentPage) => set({ currentPage }),
  resetCurrentPage: () => set({ currentPage: 1 }),

  setIsUploading: (isUploading) => set({ isUploading }),
  setUploading: (uploading) => set({ uploading }),
  updateUploadForm: (patch) =>
    set((s) => ({ uploadForm: { ...s.uploadForm, ...patch } })),
  setUploadFile: (uploadFile) => set({ uploadFile }),
  resetUploadForm: () =>
    set({ uploadForm: DEFAULT_UPLOAD_FORM, uploadFile: null }),

  setEditTarget: (editTarget) => set({ editTarget }),
  setEditForm: (editForm) => set({ editForm }),
  updateEditForm: (patch) =>
    set((s) => ({ editForm: { ...s.editForm, ...patch } })),
  setEditFile: (editFile) => set({ editFile }),
  setEditSaving: (editSaving) => set({ editSaving }),
  resetEditForm: () =>
    set({
      editTarget: null,
      editForm: { title: "", section: "Notice" },
      editFile: null,
      editSaving: false,
    }),

  removeNotice: (id) =>
    set((s) => ({ notices: s.notices.filter((n) => n._id !== id) })),
}));

// ─── Section helpers ──────────────────────────────────────────────────────────

export const NOTICE_SECTION_OPTIONS = [
  { value: "Notice", label: "Notice" },
  { value: "Announcement", label: "Announcement" },
];
