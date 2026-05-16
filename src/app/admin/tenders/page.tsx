"use client";

import { useEffect, useCallback, useRef, useState } from "react";
import {
  Plus,
  Search,
  SquarePen,
  Loader,
  X,
  Upload,
  FileText,
  Eye,
  Trash2,
  FileDown,
} from "lucide-react";
import { useToast } from "@/components/ui/ToastContext";
import { useConfirmDialog } from "@/components/ui/ConfirmDialogContext";
import { apiClient } from "@/lib/axios-instance";
import { AxiosError } from "axios";

// Adjust these import paths to match where your files are actually located
import CustomLoader from "@/components/ui/CustomLoader";
import { usePageLoader } from "@/hooks/usePageLoader";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Tender {
  _id: string;
  title: string;
  category: string;
  status: "ongoing" | "ended";
  fileUrl: string;
  fileName: string;
  fileSize: number;
  isNew?: boolean;
  createdAt: string;
  userId?: { name: string; email: string };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const extractErrorMessage = (err: unknown, fallback: string): string => {
  if (err && typeof err === "object") {
    const axiosMsg = (err as AxiosError<{ message?: string }>)?.response?.data
      ?.message;
    if (axiosMsg) return axiosMsg;
    const errMsg = (err as { message?: string }).message;
    if (errMsg) return errMsg;
  }
  return fallback;
};

const formatDate = (dateStr: string) =>
  new Date(dateStr).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

const formatSize = (bytes: number) => {
  if (!bytes) return "—";
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const inputCls =
  "w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-900 focus:ring-1 focus:ring-blue-900";
const labelCls = "block text-xs font-semibold text-gray-600 mb-1";

// ─── Add Modal ────────────────────────────────────────────────────────────────

const AddTenderModal = ({
  onClose,
  onSuccess,
}: {
  onClose: () => void;
  onSuccess: () => void;
}) => {
  const { showToast } = useToast();
  const fileRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async () => {
    if (!title.trim()) return showToast("Title is required", "error");
    if (!category.trim()) return showToast("Category is required", "error");
    if (!file) return showToast("PDF file is required", "error");

    setSaving(true);
    try {
      const fd = new FormData();
      fd.append("title", title.trim());
      fd.append("category", category.trim());
      fd.append("tender", file);
      await apiClient.post("/tender", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      showToast(`"${title.trim()}" has been uploaded successfully!`, "success");
      onSuccess();
      onClose();
    } catch (err) {
      showToast(extractErrorMessage(err, "Failed to upload tender"), "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-serif font-bold text-blue-900">
            Upload Tender
          </h3>
          <button
            onClick={onClose}
            disabled={saving}
            className="text-gray-400 hover:text-gray-600 cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        <div className="px-6 py-5 space-y-4">
          {/* Title */}
          <div>
            <label className={labelCls}>
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Tender for Supply of Equipment"
              value={title}
              onChange={(e) =>
                setTitle(
                  e.target.value.replace(/\b\w/g, (char) => char.toUpperCase()),
                )
              }
              className={inputCls}
            />
          </div>

          {/* Category */}
          <div>
            <label className={labelCls}>
              Category <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. NIC, Works, Goods..."
              value={category}
              onChange={(e) => setCategory(e.target.value.toUpperCase())}
              className={inputCls}
            />
          </div>

          {/* File Upload */}
          <div>
            <label className={labelCls}>
              Tender PDF <span className="text-red-500">*</span>
            </label>
            <div
              onClick={() => fileRef.current?.click()}
              className={`flex items-center gap-3 border-2 border-dashed rounded-lg px-4 py-4 cursor-pointer transition ${
                file
                  ? "border-green-400 bg-green-50"
                  : "border-gray-300 hover:border-blue-900 hover:bg-blue-50"
              }`}
            >
              {file ? (
                <>
                  <FileText size={20} className="text-green-600 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-green-700 truncate">
                      {file.name}
                    </p>
                    <p className="text-xs text-green-600">
                      {formatSize(file.size)}
                    </p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setFile(null);
                      if (fileRef.current) fileRef.current.value = "";
                    }}
                    className="text-gray-400 hover:text-red-500 cursor-pointer"
                  >
                    <X size={16} />
                  </button>
                </>
              ) : (
                <>
                  <Upload size={20} className="text-gray-400 shrink-0" />
                  <div>
                    <p className="text-sm text-gray-600 font-medium">
                      Click to upload PDF
                    </p>
                    <p className="text-xs text-gray-400">PDF only, max 10MB</p>
                  </div>
                </>
              )}
            </div>
            <input
              ref={fileRef}
              type="file"
              accept="application/pdf"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0] ?? null;
                if (f && f.type !== "application/pdf") {
                  showToast("Only PDF files are allowed", "error");
                  return;
                }
                setFile(f);
              }}
            />
          </div>
          <p className="text-red-500 text-xs">
            Fields marked with an asterisk (*) are required.
          </p>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t rounded-b-xl border-gray-100 bg-gray-50">
          <button
            onClick={onClose}
            disabled={saving}
            className="px-4 py-2 text-sm border border-gray-300 rounded hover:bg-gray-100 cursor-pointer transition disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2 text-sm bg-blue-900 text-white rounded hover:bg-blue-800 cursor-pointer transition disabled:opacity-60"
          >
            {saving ? (
              <>
                <Loader size={15} className="animate-spin" /> Uploading…
              </>
            ) : (
              <>
                <Upload size={14} /> Upload
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Edit Modal ───────────────────────────────────────────────────────────────

const EditTenderModal = ({
  tender,
  onClose,
  onSuccess,
}: {
  tender: Tender;
  onClose: () => void;
  onSuccess: () => void;
}) => {
  const { showToast } = useToast();
  const fileRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState(tender.title);
  const [category, setCategory] = useState(tender.category);
  const [status, setStatus] = useState(tender.status);
  const [file, setFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async () => {
    if (!title.trim()) return showToast("Title is required", "error");
    if (!category.trim()) return showToast("Category is required", "error");

    setSaving(true);
    try {
      const fd = new FormData();
      fd.append("title", title.trim());
      fd.append("category", category.trim());
      fd.append("status", status);
      if (file) fd.append("tender", file);

      await apiClient.patch(`/tender/update-tender/${tender._id}`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      showToast(`"${title.trim()}" has been updated successfully!`, "success");
      onSuccess();
      onClose();
    } catch (err) {
      showToast(extractErrorMessage(err, "Failed to update tender"), "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-serif font-bold text-blue-900">
            Edit Tender
          </h3>
          <button
            onClick={onClose}
            disabled={saving}
            className="text-gray-400 hover:text-gray-600 cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        <div className="px-6 py-5 space-y-4">
          <div>
            <label className={labelCls}>
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) =>
                setTitle(
                  e.target.value.replace(/\b\w/g, (char) => char.toUpperCase()),
                )
              }
              className={inputCls}
            />
          </div>

          <div>
            <label className={labelCls}>
              Category <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className={inputCls}
            />
          </div>

          <div>
            <label className={labelCls}>Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as "ongoing" | "ended")}
              className={inputCls}
            >
              <option value="ongoing">Ongoing</option>
              <option value="ended">Ended</option>
            </select>
          </div>

          {/* Optional PDF replacement */}
          <div>
            <label className={labelCls}>
              Replace PDF{" "}
              <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            {tender.fileUrl && !file && (
              <a
                href={tender.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs text-blue-700 hover:underline mb-2"
              >
                <Eye size={11} /> View current file
              </a>
            )}
            <div
              onClick={() => fileRef.current?.click()}
              className={`flex items-center gap-3 border-2 border-dashed rounded-lg px-4 py-3 cursor-pointer transition ${
                file
                  ? "border-green-400 bg-green-50"
                  : "border-gray-200 hover:border-blue-900 hover:bg-blue-50"
              }`}
            >
              {file ? (
                <>
                  <FileText size={18} className="text-green-600 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-green-700 truncate">
                      {file.name}
                    </p>
                    <p className="text-xs text-green-600">
                      {formatSize(file.size)}
                    </p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setFile(null);
                      if (fileRef.current) fileRef.current.value = "";
                    }}
                    className="text-gray-400 hover:text-red-500 cursor-pointer"
                  >
                    <X size={14} />
                  </button>
                </>
              ) : (
                <>
                  <Upload size={18} className="text-gray-300 shrink-0" />
                  <p className="text-sm text-gray-400">
                    Click to upload a new PDF (optional)
                  </p>
                </>
              )}
            </div>
            <input
              ref={fileRef}
              type="file"
              accept="application/pdf"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0] ?? null;
                if (f && f.type !== "application/pdf") {
                  showToast("Only PDF files are allowed", "error");
                  return;
                }
                setFile(f);
              }}
            />
          </div>
          <p className="text-red-500 text-xs">
            Fields marked with an asterisk (*) are required.
          </p>
        </div>

        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t rounded-b-xl border-gray-100 bg-gray-50">
          <button
            onClick={onClose}
            disabled={saving}
            className="px-4 py-2 text-sm border border-gray-300 rounded hover:bg-gray-100 cursor-pointer transition disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2 text-sm bg-blue-900 text-white rounded hover:bg-blue-800 cursor-pointer transition disabled:opacity-60"
          >
            {saving ? (
              <>
                <Loader size={15} className="animate-spin" /> Saving…
              </>
            ) : (
              <>
                <SquarePen size={14} /> Save Changes
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function TendersPage() {
  const { showToast } = useToast();
  const { showConfirm } = useConfirmDialog();

  const [tenders, setTenders] = useState<Tender[]>([]);
  const [loading, setLoading] = useState(true);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // Full-page loader solely for the initial visit
  const { isLoading: isPageLoading } = usePageLoader([isInitialLoad]);

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");

  const [isAdding, setIsAdding] = useState(false);
  const [editTarget, setEditTarget] = useState<Tender | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const LIMIT = 10;
  const [page, setPage] = useState(1);

  // Stats
  const [totalCount, setTotalCount] = useState(0);
  const [statusWiseCounts, setStatusWiseCounts] = useState<
    { _id: string; count: number }[]
  >([]);
  const [categoryWiseCounts, setCategoryWiseCounts] = useState<
    { _id: string; count: number }[]
  >([]);

  // Debounce search effect
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  const fetchTenders = useCallback(async () => {
    setLoading(true);
    // 600ms delay to prevent fast flickering on table inline loading
    await new Promise((resolve) => setTimeout(resolve, 600));
    try {
      const params: Record<string, string> = {};
      if (debouncedSearch.trim()) params.search = debouncedSearch.trim();
      if (statusFilter) params.status = statusFilter;
      if (categoryFilter) params.category = categoryFilter;

      params.page = String(page);
      params.limit = String(LIMIT);

      const { data } = await apiClient.get("/tender/get-all-tenders", {
        params,
      });
      setTenders(data.data.tenders);
      setTotalCount(data.data.totalCount);
      setStatusWiseCounts(data.data.statusWiseCounts ?? []);
      setCategoryWiseCounts(data.data.categoryWiseCounts ?? []);
    } catch (err) {
      showToast(extractErrorMessage(err, "Failed to fetch tenders"), "error");
    } finally {
      setLoading(false);
      setIsInitialLoad(false);
    }
  }, [debouncedSearch, statusFilter, categoryFilter, page, showToast]);

  useEffect(() => {
    fetchTenders();
  }, [fetchTenders]);

  // Toggle status
  const handleToggleStatus = useCallback(
    async (tender: Tender) => {
      const newStatus = tender.status === "ongoing" ? "ended" : "ongoing";
      showConfirm(
        async () => {
          setTogglingId(tender._id);
          try {
            await apiClient.patch(
              `/tender/update-tender-status/${tender._id}/status`,
              { status: newStatus },
            );
            showToast(`Tender marked as "${newStatus}"`, "success");
            fetchTenders();
          } catch (err) {
            showToast(
              extractErrorMessage(err, "Failed to update status"),
              "error",
            );
          } finally {
            setTogglingId(null);
          }
        },
        `Mark this tender as "${newStatus}"?`,
        "Confirm",
        "Cancel",
      );
    },
    [fetchTenders, showConfirm, showToast],
  );

  const handleDelete = useCallback(
    async (id: string) => {
      const deletedTitle = tenders.find((t) => t._id === id)?.title ?? "Tender";
      showConfirm(
        async () => {
          setDeletingId(id);
          try {
            await apiClient.delete(`/tender/delete-tender/${id}`);
            showToast(
              `"${deletedTitle}" has been deleted successfully!`,
              "success",
            );
            fetchTenders();
          } catch (err) {
            showToast(
              extractErrorMessage(err, "Failed to delete tender"),
              "error",
            );
          } finally {
            setDeletingId(null);
          }
        },
        "Delete this tender? This action cannot be undone.",
        "Delete",
        "Cancel",
      );
    },
    [tenders, fetchTenders, showConfirm, showToast],
  );

  const ongoingCount =
    statusWiseCounts.find((s) => s._id === "ongoing")?.count ?? 0;
  const endedCount =
    statusWiseCounts.find((s) => s._id === "ended")?.count ?? 0;

  return (
    <>
      {isAdding && (
        <AddTenderModal
          onClose={() => setIsAdding(false)}
          onSuccess={fetchTenders}
        />
      )}
      {editTarget && (
        <EditTenderModal
          tender={editTarget}
          onClose={() => setEditTarget(null)}
          onSuccess={fetchTenders}
        />
      )}

      {isPageLoading ? (
        <CustomLoader fullPage message="Loading tenders..." />
      ) : (
        <div className="space-y-6">
          {/* Header */}
          <div className="flex justify-between items-center">
            <div className="pb-1">
              <h2 className="text-2xl font-bold text-blue-900 tracking-tight">
                Manage Tenders
              </h2>
              <p className="text-sm text-slate-500 mt-0.5">
                Create, publish, and manage tender notices, bid details,
                deadlines, and related documents.
              </p>
            </div>
            <button
              onClick={() => setIsAdding(true)}
              className="bg-blue-900 text-white px-4 py-2 rounded shadow-sm hover:bg-blue-800 transition flex items-center gap-2 text-sm cursor-pointer"
            >
              <Plus size={18} /> Add Tender
            </button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {(
              [
                {
                  label: "Total Tenders",
                  value: totalCount,
                  color: "text-blue-900",
                },
                {
                  label: "Ongoing",
                  value: ongoingCount,
                  color: "text-green-700",
                },
                { label: "Ended", value: endedCount, color: "text-red-600" },
              ] as const
            ).map((s) => (
              <div
                key={s.label}
                className="bg-white rounded-lg border border-gray-200 shadow-sm px-5 py-4"
              >
                <p className="text-xs text-gray-500 font-medium">{s.label}</p>
                <p className={`text-2xl font-bold mt-1 ${s.color}`}>
                  {s.value}
                </p>
              </div>
            ))}
          </div>

          {/* Filters */}
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 flex flex-wrap gap-3 items-center">
            <div className="flex-1 min-w-56 relative">
              <Search className="absolute left-3 top-2.5 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search by title..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                }}
                className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:border-blue-900 focus:ring-1 focus:ring-blue-900"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-900 focus:ring-1 focus:ring-blue-900"
            >
              <option value="">All Statuses</option>
              <option value="ongoing">Ongoing</option>
              <option value="ended">Ended</option>
            </select>

            {/* Category filter  */}
            <select
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value);
                setPage(1);
              }}
              className="border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-900 focus:ring-1 focus:ring-blue-900"
            >
              <option value="">All Categories</option>
              {categoryWiseCounts.map((c) => (
                <option key={c._id} value={c._id}>
                  {c._id} ({c.count})
                </option>
              ))}
            </select>

            <button
              onClick={() => {
                setSearch("");
                setDebouncedSearch("");
                setStatusFilter("");
                setCategoryFilter("");
                setPage(1);
              }}
              className="h-9 flex items-center gap-1 text-xs bg-red-500 text-white rounded px-3 py-2 hover:bg-red-600 transition cursor-pointer"
            >
              <X size={14} /> Clear
            </button>
          </div>

          {/* Table */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider border-b border-gray-200">
                    <th className="p-4 text-center">Slno</th>
                    <th className="p-4">Title</th>
                    <th className="p-4 text-center">Category</th>
                    <th className="p-4 text-center">Status</th>
                    <th className="p-4 text-center">File Size</th>
                    <th className="p-4 text-center">Upload Date</th>
                    <th className="p-4 text-center">Upload By</th>
                    <th className="p-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="text-sm divide-y divide-gray-100">
                  {loading && (
                    <tr>
                      <td
                        colSpan={7}
                        className="text-center py-14 text-gray-400"
                      >
                        <div className="flex flex-col items-center gap-2">
                          <Loader
                            size={32}
                            className="animate-spin text-blue-900 opacity-75"
                          />
                          <p className="text-sm font-medium">
                            Loading tenders...
                          </p>
                        </div>
                      </td>
                    </tr>
                  )}

                  {!loading &&
                    tenders.map((tender, index) => (
                      <tr key={tender._id} className="hover:bg-gray-50">
                        <td className="p-4 text-xs text-gray-400 text-center font-medium">
                          {(page - 1) * LIMIT + index + 1}
                        </td>
                        <td className="p-4 font-medium max-w-xs">
                          <div className="flex items-center gap-2">
                            <span className="truncate">{tender.title}</span>
                            {tender.isNew && (
                              <span className="shrink-0 text-[10px] font-bold px-1.5 py-0.5 rounded bg-red-100 text-red-700">
                                NEW
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="p-4 text-gray-600 text-center text-xs">
                          <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded-full font-medium">
                            {tender.category}
                          </span>
                        </td>
                        <td className="p-4 text-center">
                          <span
                            className={`text-xs font-bold px-2 py-1 rounded border ${
                              tender.status === "ongoing"
                                ? "bg-green-50 text-green-700 border-green-200"
                                : "bg-red-50 text-red-700 border-red-200"
                            }`}
                          >
                            {tender.status === "ongoing" ? "Ongoing" : "Ended"}
                          </span>
                        </td>
                        <td className="p-4 text-xs text-center text-gray-500">
                          {formatSize(tender.fileSize)}
                        </td>
                        <td className="p-4 text-gray-600 text-center text-xs">
                          <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded-full font-medium">
                            {tender?.userId?.name || "N/A"}
                          </span>
                        </td>
                        <td className="p-4 text-xs text-center text-gray-500">
                          {formatDate(tender.createdAt)}
                        </td>
                        <td className="p-4">
                          <div className="flex items-center justify-center gap-3">
                            {/* View PDF */}
                            <a
                              href={tender.fileUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-700 hover:text-blue-800 transition-colors"
                              title="View PDF"
                            >
                              <Eye size={17} />
                            </a>

                            {/* Edit */}
                            <button
                              onClick={() => setEditTarget(tender)}
                              className="text-green-600 hover:text-green-700 transition-colors cursor-pointer"
                              title="Edit Tender"
                            >
                              <SquarePen size={17} />
                            </button>

                            {/* Delete */}
                            <button
                              onClick={() => handleDelete(tender._id)}
                              disabled={deletingId === tender._id}
                              className="text-red-500 hover:text-red-600 transition-colors disabled:opacity-40 cursor-pointer"
                              title="Delete"
                            >
                              <Trash2 size={15} />
                            </button>

                            {/* Toggle Status */}
                            <button
                              onClick={() => handleToggleStatus(tender)}
                              disabled={togglingId === tender._id}
                              className="cursor-pointer disabled:opacity-40"
                              title={
                                tender.status === "ongoing"
                                  ? "Mark as Ended"
                                  : "Mark as Ongoing"
                              }
                            >
                              <div
                                className="relative w-7 h-3.75 rounded-full transition-colors duration-250"
                                style={{
                                  background:
                                    tender.status === "ongoing"
                                      ? "#f59e0b"
                                      : "#d1d5db",
                                }}
                              >
                                <div
                                  className="absolute top-0.5 left-0.5 w-2.75 h-2.75 rounded-full bg-white shadow transition-transform duration-250"
                                  style={{
                                    transform:
                                      tender.status === "ongoing"
                                        ? "translateX(12px)"
                                        : "translateX(0)",
                                    animation:
                                      togglingId === tender._id
                                        ? "spin 0.7s linear infinite"
                                        : "none",
                                  }}
                                />
                              </div>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}

                  {!loading && tenders.length === 0 && (
                    <tr>
                      <td
                        colSpan={7}
                        className="text-center py-14 text-gray-400"
                      >
                        <div className="flex flex-col items-center gap-2">
                          <FileDown size={32} className="opacity-25" />
                          <p className="font-medium">No tenders found.</p>
                          <p className="text-xs">
                            Try adjusting filters or upload a new tender.
                          </p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
              {/* Pagination */}
              {!loading && totalCount > 0 && (
                <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 bg-gray-50">
                  <p className="text-xs text-gray-500">
                    Showing{" "}
                    <span className="font-semibold text-gray-700">
                      {(page - 1) * LIMIT + 1}–
                      {Math.min(page * LIMIT, totalCount)}
                    </span>{" "}
                    of{" "}
                    <span className="font-semibold text-gray-700">
                      {totalCount}
                    </span>{" "}
                    tenders
                  </p>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="px-3 py-1.5 text-xs border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
                    >
                      ← Prev
                    </button>

                    {/* Page number pills */}
                    {Array.from(
                      { length: Math.ceil(totalCount / LIMIT) },
                      (_, i) => i + 1,
                    )
                      .filter(
                        (p) =>
                          p === 1 ||
                          p === Math.ceil(totalCount / LIMIT) ||
                          Math.abs(p - page) <= 1,
                      )
                      .reduce<(number | "…")[]>((acc, p, idx, arr) => {
                        if (
                          idx > 0 &&
                          typeof arr[idx - 1] === "number" &&
                          (p as number) - (arr[idx - 1] as number) > 1
                        )
                          acc.push("…");
                        acc.push(p);
                        return acc;
                      }, [])
                      .map((item, idx) =>
                        item === "…" ? (
                          <span
                            key={`ellipsis-${idx}`}
                            className="px-2 text-xs text-gray-400"
                          >
                            …
                          </span>
                        ) : (
                          <button
                            key={item}
                            onClick={() => setPage(item as number)}
                            className={`w-8 h-7 text-xs rounded border transition cursor-pointer ${
                              page === item
                                ? "bg-blue-900 text-white border-blue-900"
                                : "border-gray-300 hover:bg-gray-100"
                            }`}
                          >
                            {item}
                          </button>
                        ),
                      )}

                    <button
                      onClick={() =>
                        setPage((p) =>
                          Math.min(Math.ceil(totalCount / LIMIT), p + 1),
                        )
                      }
                      disabled={page >= Math.ceil(totalCount / LIMIT)}
                      className="px-3 py-1.5 text-xs border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
                    >
                      Next →
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
