import { create } from "zustand";
import { persist } from "zustand/middleware";
import { apiClient } from "@/lib/axios-instance";

// ─── Types ────────────────────────────────────────────────────────────────────

export type CertificateStatus = "Active" | "Expired" | "Suspended";
export type CertificateType = "New" | "Renewal" | "Reciprocal";

// Matches exact backend MongoDB document shape
export interface Certificate {
  _id: string;
  registrationNumber: string;
  ownerName: string;
  email: string;
  phoneNumber: string;
  degree: string;
  certificateType: CertificateType;
  issueDate: string;
  expiryDate: string | null;
  remarks: string | null;
  fileUrl: string;
  fileName: string;
  fileSize: number;
  status: CertificateStatus;
  uploadedBy?: { name: string; email: string };
  createdAt: string;
  updatedAt: string;
}

export interface PaginationMeta {
  total: number;
  totalPages: number;
  currentPage: number;
  limit: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

// Form data for adding a new certificate
export interface AddCertificateForm {
  registrationNumber: string;
  ownerName: string;
  email: string;
  phoneNumber: string;
  degree: string;
  certificateType: CertificateType;
  issueDate: string;
  expiryDate: string;
  remarks: string;
  certificate: File | null; // the PDF file — multer field name: "certificate"
}

// ─── Store Interface ──────────────────────────────────────────────────────────

interface CertificatesState {
  // Data
  certificates: Certificate[];
  pagination: PaginationMeta;
  loading: boolean;
  error: string | null;

  // Filters (sent as query params to backend)
  search: string;
  selectedStatus: string;
  selectedType: string;
  currentPage: number;
  itemsPerPage: number;

  // Add modal
  isAdding: boolean;
  addForm: AddCertificateForm;
  isSaving: boolean;

  // Edit modal
  isEditing: boolean;
  editTarget: Certificate | null;
  editSaving: boolean;

  // Delete
  isDeleting: string | null; // holds _id being deleted

  // Setters
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;

  // Filter actions
  setSearch: (search: string) => void;
  setSelectedStatus: (status: string) => void;
  setSelectedType: (type: string) => void;
  setCurrentPage: (page: number) => void;
  resetFilters: () => void;

  // Add modal actions
  openAddModal: () => void;
  closeAddModal: () => void;
  updateAddForm: (updates: Partial<AddCertificateForm>) => void;

  // Edit modal actions
  openEditModal: (cert: Certificate) => void;
  closeEditModal: () => void;

  // CRUD
  fetchCertificates: () => Promise<void>;
  addCertificate: () => Promise<void>;
  updateCertificate: (id: string, formData: FormData) => Promise<void>;
  deleteCertificate: (id: string) => Promise<void>;

  clearAllData: () => void;
}

// ─── Defaults ─────────────────────────────────────────────────────────────────

const DEFAULT_PAGINATION: PaginationMeta = {
  total: 0,
  totalPages: 1,
  currentPage: 1,
  limit: 10,
  hasNextPage: false,
  hasPrevPage: false,
};

const DEFAULT_ADD_FORM: AddCertificateForm = {
  registrationNumber: "",
  ownerName: "",
  email: "",
  phoneNumber: "",
  degree: "",
  certificateType: "New",
  issueDate: "",
  expiryDate: "",
  remarks: "",
  certificate: null,
};

// ─── Store ────────────────────────────────────────────────────────────────────

export const useCertificatesStore = create<CertificatesState>()(
  persist(
    (set, get) => ({
      certificates: [],
      pagination: DEFAULT_PAGINATION,
      loading: false,
      error: null,

      search: "",
      selectedStatus: "All Statuses",
      selectedType: "All Types",
      currentPage: 1,
      itemsPerPage: 10,

      isAdding: false,
      addForm: DEFAULT_ADD_FORM,
      isSaving: false,

      isEditing: false,
      editTarget: null,
      editSaving: false,

      isDeleting: null,

      // ── Setters ────────────────────────────────────────────────────────────
      setLoading: (loading) => set({ loading }),
      setError: (error) => set({ error }),

      // ── Filters ────────────────────────────────────────────────────────────
      setSearch: (search) => set({ search, currentPage: 1 }),
      setSelectedStatus: (selectedStatus) =>
        set({ selectedStatus, currentPage: 1 }),
      setSelectedType: (selectedType) => set({ selectedType, currentPage: 1 }),
      setCurrentPage: (currentPage) => set({ currentPage }),
      resetFilters: () =>
        set({
          search: "",
          selectedStatus: "All Statuses",
          selectedType: "All Types",
          currentPage: 1,
        }),

      // ── Add modal ──────────────────────────────────────────────────────────
      openAddModal: () => set({ isAdding: true, error: null }),
      closeAddModal: () =>
        set({ isAdding: false, addForm: DEFAULT_ADD_FORM, error: null }),
      updateAddForm: (updates) =>
        set((state) => ({ addForm: { ...state.addForm, ...updates } })),

      // ── Edit modal ─────────────────────────────────────────────────────────
      openEditModal: (cert) =>
        set({ isEditing: true, editTarget: cert, error: null }),
      closeEditModal: () =>
        set({ isEditing: false, editTarget: null, error: null }),

      // ── CRUD ───────────────────────────────────────────────────────────────

      fetchCertificates: async () => {
        const {
          search,
          selectedStatus,
          selectedType,
          currentPage,
          itemsPerPage,
        } = get();

        set({ loading: true, error: null });

        try {
          const params: Record<string, string | number> = {
            page: currentPage,
            limit: itemsPerPage,
          };

          if (search.trim()) params.search = search.trim();
          if (selectedStatus !== "All Statuses") params.status = selectedStatus;
          if (selectedType !== "All Types")
            params.certificateType = selectedType;

          // GET /api/v1/upload/get-all-certificate
          const { data } = await apiClient.get("/upload/get-all-certificate", {
            params,
          });

          set({
            // Backend returns data.data.certificates (from getAllCertificates controller)
            certificates: data.data.certificates ?? [],
            pagination: data.data.pagination ?? DEFAULT_PAGINATION,
            loading: false,
          });
        } catch (err: unknown) {
          const e = err as {
            response?: { status?: number; data?: { message?: string } };
          };
          set({
            error:
              e.response?.status === 403
                ? "You do not have permission to view certificates. Please contact admin."
                : (e.response?.data?.message ?? "Failed to fetch certificates"),
            loading: false,
          });
        }
      },

      addCertificate: async () => {
        const { addForm } = get();

        const requiredFields: (keyof AddCertificateForm)[] = [
          "registrationNumber",
          "ownerName",
          "email",
          "phoneNumber",
          "degree",
          "certificateType",
          "issueDate",
        ];
        const missing = requiredFields.filter(
          (k) => !String(addForm[k] ?? "").trim(),
        );
        if (missing.length) {
          const msg = `Please fill in required fields: ${missing.join(", ")}`;
          set({ error: msg });
          throw new Error(msg);
        }
        if (missing.length) {
          set({
            error: `Please fill in required fields: ${missing.join(", ")}`,
          });
          return;
        }

        if (!addForm.certificate) {
          set({ error: "Please select a certificate PDF file" });
          throw new Error("Please select a certificate PDF file");
        }

        set({ isSaving: true, error: null });

        try {
          const fd = new FormData();
          fd.append("certificate", addForm.certificate);
          fd.append(
            "registrationNumber",
            addForm.registrationNumber.trim().toUpperCase(),
          );
          fd.append("ownerName", addForm.ownerName.trim());
          fd.append("email", addForm.email.trim().toLowerCase());
          fd.append("phoneNumber", addForm.phoneNumber.trim());
          fd.append("degree", addForm.degree.trim());
          fd.append("certificateType", addForm.certificateType);
          fd.append("issueDate", addForm.issueDate);
          if (addForm.expiryDate) fd.append("expiryDate", addForm.expiryDate);
          if (addForm.remarks.trim())
            fd.append("remarks", addForm.remarks.trim());

          // POST /api/v1/upload/certificate
          const { data } = await apiClient.post("/upload/certificate", fd, {
            headers: { "Content-Type": "multipart/form-data" },
          });

          set((state) => ({
            certificates: [data.data, ...state.certificates],
            pagination: {
              ...state.pagination,
              total: state.pagination.total + 1,
            },
            isSaving: false,
            isAdding: false,
            addForm: DEFAULT_ADD_FORM,
          }));
        } catch (err: unknown) {
          const e = err as {
            response?: { status?: number; data?: { message?: string } };
          };
          set({
            error:
              e.response?.status === 403
                ? "You do not have permission to add certificates. Please contact admin."
                : (e.response?.data?.message ?? "Failed to add certificate"),
            isSaving: false,
          });
          throw err;
        }
      },

      updateCertificate: async (id, formData) => {
        set({ editSaving: true, error: null });
        try {
          // PUT /api/v1/upload/:id
          const { data } = await apiClient.put(`/upload/${id}`, formData, {
            headers: { "Content-Type": "multipart/form-data" },
          });

          set((state) => ({
            certificates: state.certificates.map((c) =>
              c._id === id ? { ...c, ...data.data } : c,
            ),
            editSaving: false,
            isEditing: false,
            editTarget: null,
          }));
        } catch (err: unknown) {
          const e = err as {
            response?: { status?: number; data?: { message?: string } };
          };
          set({
            error:
              e.response?.status === 403
                ? "You do not have permission to update certificates. Please contact admin."
                : (e.response?.data?.message ?? "Failed to update certificate"),
            editSaving: false,
          });
          throw err;
        }
      },

      deleteCertificate: async (id) => {
        set({ isDeleting: id, error: null });
        try {
          // DELETE /api/v1/upload/:id
          await apiClient.delete(`/upload/${id}`);
          set((state) => ({
            certificates: state.certificates.filter((c) => c._id !== id),
            pagination: {
              ...state.pagination,
              total: Math.max(0, state.pagination.total - 1),
            },
            isDeleting: null,
          }));
        } catch (err: unknown) {
          const e = err as {
            response?: { status?: number; data?: { message?: string } };
          };
          set({
            error:
              e.response?.status === 403
                ? "You do not have permission to delete certificates. Please contact admin."
                : (e.response?.data?.message ?? "Failed to delete certificate"),
            isDeleting: null,
          });
          throw err;
        }
      },

      clearAllData: () =>
        set({
          certificates: [],
          pagination: DEFAULT_PAGINATION,
          search: "",
          selectedStatus: "All Statuses",
          selectedType: "All Types",
          currentPage: 1,
          isAdding: false,
          addForm: DEFAULT_ADD_FORM,
          isSaving: false,
          isEditing: false,
          editTarget: null,
          editSaving: false,
          isDeleting: null,
          error: null,
        }),
    }),
    {
      name: "certificates-storage",
      partialize: (state) => ({
        search: state.search,
        selectedStatus: state.selectedStatus,
        selectedType: state.selectedType,
        currentPage: state.currentPage,
      }),
    },
  ),
);
