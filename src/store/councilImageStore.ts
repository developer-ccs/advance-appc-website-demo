import { create } from "zustand";
import { apiClient } from "@/lib/axios-instance";

export interface CouncilImageUser {
  _id: string;
  name?: string;
  email?: string;
  role?: string;
}

export interface CouncilImage {
  _id: string;
  userId: CouncilImageUser;
  name: string;
  designation: string;
  fileUrl: string;
  fileName?: string;
  fileSize?: number;
  createdAt: string;
  updatedAt: string;
}

export interface AddForm {
  name: string;
  designation: string;
  image: File | null;
}

interface Pagination {
  total: number;
  totalPages: number;
  currentPage: number;
  limit: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

interface CouncilImageState {
  images: CouncilImage[];
  pagination: Pagination;
  loading: boolean;
  error: string | null;
  search: string;
  currentPage: number;

  // Modal state
  isAdding: boolean;
  isEditing: boolean;
  editTarget: CouncilImage | null;
  isSaving: boolean;
  isDeleting: string | null;

  // Add form
  addForm: AddForm;

  // Actions
  fetchImages: () => Promise<void>;
  setSearch: (search: string) => void;
  setCurrentPage: (page: number) => void;
  setError: (error: string | null) => void;

  openAddModal: () => void;
  closeAddModal: () => void;
  updateAddForm: (patch: Partial<AddForm>) => void;
  addImage: () => Promise<void>;

  openEditModal: (image: CouncilImage) => void;
  closeEditModal: () => void;
  updateImage: (id: string, formData: FormData) => Promise<void>;

  deleteImage: (id: string) => Promise<void>;
}

const DEFAULT_ADD_FORM: AddForm = {
  name: "",
  designation: "",
  image: null,
};

const DEFAULT_PAGINATION: Pagination = {
  total: 0,
  totalPages: 1,
  currentPage: 1,
  limit: 10,
  hasNextPage: false,
  hasPrevPage: false,
};

export const useCouncilImageStore = create<CouncilImageState>((set, get) => ({
  images: [],
  pagination: DEFAULT_PAGINATION,
  loading: false,
  error: null,
  search: "",
  currentPage: 1,

  isAdding: false,
  isEditing: false,
  editTarget: null,
  isSaving: false,
  isDeleting: null,

  addForm: { ...DEFAULT_ADD_FORM },

  fetchImages: async () => {
    set({ loading: true, error: null });
    try {
      const { search, currentPage } = get();
      const params: Record<string, string | number> = {
        page: currentPage,
        limit: 10,
      };
      if (search.trim()) params.search = search.trim();

      const { data } = await apiClient.get("/image", { params });
      set({
        images: data.data.images,
        pagination: data.data.pagination,
      });
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "Failed to fetch council images";
      set({ error: msg });
    } finally {
      set({ loading: false });
    }
  },

  setSearch: (search) => set({ search }),
  setCurrentPage: (currentPage) => set({ currentPage }),
  setError: (error) => set({ error }),

  openAddModal: () =>
    set({ isAdding: true, addForm: { ...DEFAULT_ADD_FORM }, error: null }),
  closeAddModal: () =>
    set({ isAdding: false, addForm: { ...DEFAULT_ADD_FORM } }),
  updateAddForm: (patch) =>
    set((s) => ({ addForm: { ...s.addForm, ...patch } })),

  addImage: async () => {
    const { addForm, fetchImages } = get();

    if (!addForm.name.trim()) throw new Error("Name is required");
    if (!addForm.designation.trim()) throw new Error("Designation is required");
    if (!addForm.image) throw new Error("Image is required");

    set({ isSaving: true });
    try {
      const fd = new FormData();
      fd.append("name", addForm.name.trim());
      fd.append("designation", addForm.designation.trim());
      fd.append("image", addForm.image);

      await apiClient.post("/image", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      set({ isAdding: false, addForm: { ...DEFAULT_ADD_FORM } });
      await fetchImages();
    } finally {
      set({ isSaving: false });
    }
  },

  openEditModal: (image) =>
    set({ isEditing: true, editTarget: image, error: null }),
  closeEditModal: () => set({ isEditing: false, editTarget: null }),

  updateImage: async (id, formData) => {
    set({ isSaving: true });
    try {
      await apiClient.put(`/image/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      set({ isEditing: false, editTarget: null });
      await get().fetchImages();
    } finally {
      set({ isSaving: false });
    }
  },

  deleteImage: async (id) => {
    set({ isDeleting: id });
    try {
      await apiClient.delete(`/image/${id}`);
      await get().fetchImages();
    } finally {
      set({ isDeleting: null });
    }
  },
}));
