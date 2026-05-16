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

interface FormsState {
  forms: PdfRecord[];
  loading: boolean;
  search: string;
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

interface FormsActions {
  setForms: (forms: PdfRecord[], pagination: Pagination, totalCount: number) => void; // ← fixed: was missing totalCount
  setLoading: (v: boolean) => void;
  setSearch: (v: string) => void;
  setCurrentPage: (page: number) => void;
  resetCurrentPage: () => void;

  setIsUploading: (v: boolean) => void;
  setUploading: (v: boolean) => void;
  updateUploadForm: (patch: Partial<{ title: string; section: string }>) => void;
  setUploadFile: (f: File | null) => void;
  resetUploadForm: () => void;

  setEditTarget: (form: PdfRecord | null) => void;
  setEditForm: (form: { title: string; section: string }) => void;
  updateEditForm: (patch: Partial<{ title: string; section: string }>) => void;
  setEditFile: (f: File | null) => void;
  setEditSaving: (v: boolean) => void;
  resetEditForm: () => void;

  removeForm: (id: string) => void;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const DEFAULT_PAGINATION: Pagination = {
  currentPage: 1,
  totalPages: 1,
  limit: 10,
  hasNextPage: false,
  hasPrevPage: false,
};

const DEFAULT_UPLOAD_FORM = { title: "", section: "New-form" };

// ─── Store ────────────────────────────────────────────────────────────────────

export const useFormsStore = create<FormsState & FormsActions>((set) => ({
  // state
  forms: [],
  loading: false,
  search: "",
  currentPage: 1,
  totalCount: 0,
  pagination: DEFAULT_PAGINATION,

  isUploading: false,
  uploading: false,
  uploadForm: DEFAULT_UPLOAD_FORM,
  uploadFile: null,

  editTarget: null,
  editForm: { title: "", section: "New-form" },
  editFile: null,
  editSaving: false,

  // actions
  setForms: (forms, pagination, totalCount) => set({ forms, pagination, totalCount }),
  setLoading: (loading) => set({ loading }),
  setSearch: (search) => set({ search, currentPage: 1 }),
  setCurrentPage: (currentPage) => set({ currentPage }),
  resetCurrentPage: () => set({ currentPage: 1 }),

  setIsUploading: (isUploading) => set({ isUploading }),
  setUploading: (uploading) => set({ uploading }),
  updateUploadForm: (patch) =>
    set((s) => ({ uploadForm: { ...s.uploadForm, ...patch } })),
  setUploadFile: (uploadFile) => set({ uploadFile }),
  resetUploadForm: () => set({ uploadForm: DEFAULT_UPLOAD_FORM, uploadFile: null }),

  setEditTarget: (editTarget) => set({ editTarget }),
  setEditForm: (editForm) => set({ editForm }),
  updateEditForm: (patch) =>
    set((s) => ({ editForm: { ...s.editForm, ...patch } })),
  setEditFile: (editFile) => set({ editFile }),
  setEditSaving: (editSaving) => set({ editSaving }),
  resetEditForm: () =>
    set({
      editTarget: null,
      editForm: { title: "", section: "New-form" },
      editFile: null,
      editSaving: false,
    }),

  removeForm: (id) =>
    set((s) => ({ forms: s.forms.filter((f) => f._id !== id) })),
}));

// ─── Section helpers ──────────────────────────────────────────────────────────

export const ALLOWED_SECTIONS = [
  "New-form",
  "Reciprocal-form",
  "Renewal-form",
  "other",
] as const;

export const SECTION_OPTIONS = [
  { value: "New-form",        label: "New Form"        },
  { value: "Reciprocal-form", label: "Reciprocal Form" },
  { value: "Renewal-form",    label: "Renewal Form"    },
  { value: "other",           label: "Other"           },
];

export const sectionLabel = (value: string) =>
  SECTION_OPTIONS.find((o) => o.value === value)?.label ?? value;