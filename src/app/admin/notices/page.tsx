"use client";

import { AxiosError } from "axios";
import {
  Eye,
  FileText,
  Loader,
  Search,
  SquarePen,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { apiClient } from "@/lib/axios-instance";
import { useNoticesStore, NOTICE_SECTION_OPTIONS } from "@/store/noticesStore";
import { useToast } from "@/components/ui/ToastContext";
import { useConfirmDialog } from "@/components/ui/ConfirmDialogContext";

import CustomLoader from "@/components/ui/CustomLoader";
import { usePageLoader } from "@/hooks/usePageLoader";

interface PdfRecord {
  _id: string;
  title: string;
  section: string;
  fileUrl: string;
  fileName: string;
  fileSize: number;
  createdAt: string;
  isNew?: boolean;
}

interface ApiResponse<T> {
  success: boolean;
  statusCode: number;
  message: string;
  data: T;
}

interface PdfsData {
  pdfs: PdfRecord[];
  totalCount: number;
  sectionCountTotal: number;
  sectionWiseCounts: { _id: string; count: number }[];
  pagination: {
    currentPage: number;
    totalPages: number;
    limit: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

const ITEMS_PER_PAGE = 10;

const getErrorMessage = (err: unknown): string => {
  if (err instanceof AxiosError) {
    return err.response?.data?.message ?? err.message;
  }
  if (err instanceof Error) return err.message;
  return "Something went wrong";
};

const formatDate = (iso: string): string => {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const getSectionBadge = (section: string) => {
  switch (section) {
    case "Notice":
      return (
        <span className="bg-blue-50 text-blue-900 px-2 py-1 rounded text-xs font-bold border border-blue-100">
          Notice
        </span>
      );
    case "Announcement":
      return (
        <span className="bg-purple-50 text-purple-800 px-2 py-1 rounded text-xs font-bold border border-purple-100">
          Announcement
        </span>
      );
    default:
      return <span className="">{section}</span>;
  }
};

export default function AdminNoticesPage() {
  const {
    notices,
    loading,
    search,
    activeFilter,
    currentPage,
    totalCount,
    pagination,
    isUploading,
    uploading,
    uploadForm,
    uploadFile,
    editTarget,
    editForm,
    editFile,
    editSaving,
    setNotices,
    setLoading,
    setSearch,
    setActiveFilter,
    setCurrentPage,
    setIsUploading,
    setUploading,
    updateUploadForm,
    setUploadFile,
    resetUploadForm,
    setEditTarget,
    setEditForm,
    updateEditForm,
    setEditFile,
    setEditSaving,
    resetEditForm,
    removeNotice,
  } = useNoticesStore();

  const { showToast } = useToast();
  const { showConfirm } = useConfirmDialog();

  const uploadFileRef = useRef<HTMLInputElement>(null);
  const editFileRef = useRef<HTMLInputElement>(null);

  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const { isLoading: isPageLoading } = usePageLoader([isInitialLoad]);

  // Debounced search state
  const [debouncedSearch, setDebouncedSearch] = useState(search);

  // ─── Route Change Clear Effect ───────────────────────────────────────────────

  useEffect(() => {
    // Clear search content when entering the page
    setSearch("");
    setDebouncedSearch("");

    // Clear search content when leaving the page (unmounting)
    return () => {
      setSearch("");
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ─── Debounce Effect ─────────────────────────────────────────────────────────

  useEffect(() => {
    const timer = setTimeout(() => {
      if (search !== debouncedSearch) {
        setDebouncedSearch(search);
        setCurrentPage(1); // Reset to first page on new search
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [search, debouncedSearch, setCurrentPage]);

  // ─── Fetch (page + search + filter driven) ───────────────────────────────────

  const fetchNotices = useCallback(async () => {
    setLoading(true);
    // 600ms delay to prevent fast flickering on table inline loading
    await new Promise((resolve) => setTimeout(resolve, 600));
    try {
      const params = new URLSearchParams({
        page: String(currentPage),
        limit: String(ITEMS_PER_PAGE),
      });

      if (debouncedSearch.trim()) {
        params.set("search", debouncedSearch.trim());
      }

      // Pass section filter to backend — "All" means no filter
      if (activeFilter === "All") {
        params.set("section", "Notice,Announcement");
      } else {
        params.set("section", activeFilter);
      }

      const { data } = await apiClient.get<ApiResponse<PdfsData>>(
        `/upload/pdfs?${params.toString()}`,
      );

      setNotices(
        data.data?.pdfs ?? [],
        data.data.pagination,
        data.data.sectionCountTotal ?? 0,
      );
    } catch (err) {
      showToast(getErrorMessage(err), "error");
    } finally {
      setLoading(false);
      setIsInitialLoad(false);
    }
  }, [
    currentPage,
    debouncedSearch,
    activeFilter,
    setNotices,
    setLoading,
    showToast,
  ]);

  useEffect(() => {
    fetchNotices();
  }, [fetchNotices]);

  // ─── Upload ──────────────────────────────────────────────────────────────────

  const handleUpload = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!uploadFile) return;

    const fd = new FormData();
    fd.append("title", uploadForm.title.trim());
    fd.append("section", uploadForm.section);
    fd.append("pdf", uploadFile);

    setUploading(true);
    try {
      const { data } = await apiClient.post<ApiResponse<PdfRecord>>(
        "/upload/pdfs",
        fd,
        { headers: { "Content-Type": "multipart/form-data" } },
      );
      showToast(
        `"${uploadForm.section.trim()}" has been published successfully!`,
        "success",
      );
      setIsUploading(false);
      resetUploadForm();
      if (uploadFileRef.current) uploadFileRef.current.value = "";
      fetchNotices();
    } catch (err) {
      showToast(getErrorMessage(err), "error");
    } finally {
      setUploading(false);
    }
  };

  // ─── Edit ────────────────────────────────────────────────────────────────────

  const handleEditSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editTarget) return;

    const fd = new FormData();
    if (editForm.title.trim() !== editTarget.title)
      fd.append("title", editForm.title.trim());
    if (editForm.section !== editTarget.section)
      fd.append("section", editForm.section);
    if (editFile) fd.append("pdf", editFile);

    if ([...fd.entries()].length === 0) {
      setEditTarget(null);
      resetEditForm();
      return;
    }

    setEditSaving(true);
    try {
      const { data } = await apiClient.put<ApiResponse<PdfRecord>>(
        `/upload/pdfs/${editTarget._id}`,
        fd,
        { headers: { "Content-Type": "multipart/form-data" } },
      );
      showToast(
        `"${editTarget.section}" has been updated successfully!`,
        "success",
      );
      setEditTarget(null);
      resetEditForm();
      fetchNotices();
    } catch (err) {
      showToast(getErrorMessage(err), "error");
    } finally {
      setEditSaving(false);
    }
  };

  const openEdit = (notice: PdfRecord) => {
    setEditTarget(notice);
    setEditForm({ title: notice.title, section: notice.section });
    setEditFile(null);
    if (editFileRef.current) editFileRef.current.value = "";
    setIsUploading(false);
  };

  // ─── Delete ──────────────────────────────────────────────────────────────────

  const handleDelete = async (id: string) => {
    const deletedTitle = notices.find((n) => n._id === id)?.section ?? "Notice";
    try {
      const { data } = await apiClient.delete<ApiResponse<object>>(
        `/upload/pdfs/${id}`,
      );
      showToast(`"${deletedTitle}" has been deleted successfully!`, "success");
      removeNotice(id);

      if (notices.length === 1 && currentPage > 1) {
        setCurrentPage(currentPage - 1);
      } else {
        fetchNotices();
      }
    } catch (err) {
      showToast(getErrorMessage(err), "error");
    }
  };

  // ─── Pagination helpers ───────────────────────────────────────────────────────

  const { totalPages, hasPrevPage, hasNextPage } = pagination;

  const pageButtons = (() => {
    const delta = 2;
    const start = Math.max(1, currentPage - delta);
    const end = Math.min(totalPages, currentPage + delta);
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  })();

  const handlePageChange = (newPage: number) => {
    // Unconditionally clear search states synchronously when pagination is clicked
    setSearch("");
    setDebouncedSearch("");
    setCurrentPage(newPage);
  };

  // ─── Render ───────────────────────────────────────────────────────────────────

  return (
    <>
      {isPageLoading ? (
        <CustomLoader fullPage message="Loading notices..." />
      ) : (
        <div className="space-y-6">
          {/* Header */}
          <div className="flex justify-between items-center">
            <div className="pb-1">
              <h2 className="text-2xl font-bold text-blue-900 tracking-tight">
                Manage Notices & Announcements
              </h2>
              <p className="text-sm text-slate-500 mt-0.5">
                Publish, organize, and manage important notices, announcements,
                updates, and public communications.
              </p>
            </div>
            <button
              onClick={() => {
                setIsUploading(!isUploading);
                resetEditForm();
                setEditTarget(null);
              }}
              className="px-4 py-2 rounded shadow-sm transition flex items-center gap-2 text-sm text-white cursor-pointer bg-blue-900 hover:bg-blue-800"
            >
              <Upload className="w-4 h-4" /> Upload
            </button>
          </div>

          {/* ── Upload Panel ── */}
          {isUploading && (
            <div className="fixed min-h-screen inset-0 z-50 flex items-center justify-center">
              {/* Backdrop */}
              <div
                className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                onClick={() => {
                  setIsUploading(false);
                  resetUploadForm();
                }}
              />

              {/* Modal */}
              <div className="relative bg-white rounded-xl shadow-2xl border border-gray-200 w-full max-w-lg mx-4 z-10">
                {/* Modal Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-bold text-blue-900">
                    Add New Notice / Announcement
                  </h3>
                  <button
                    type="button"
                    onClick={() => {
                      setIsUploading(false);
                      resetUploadForm();
                    }}
                    className="text-gray-400 hover:text-gray-600 transition cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Modal Body */}
                <form className="px-6 py-5 space-y-4" onSubmit={handleUpload}>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Title <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={uploadForm.title}
                      onChange={(e) =>
                        updateUploadForm({
                          title: e.target.value.replace(/\b\w/g, (char) =>
                            char.toUpperCase(),
                          ),
                        })
                      }
                      placeholder="Enter notice title"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-900 focus:ring-1 focus:ring-blue-900"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Type
                    </label>
                    <select
                      value={uploadForm.section}
                      onChange={(e) =>
                        updateUploadForm({ section: e.target.value })
                      }
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-900 focus:ring-1 focus:ring-blue-900 bg-white"
                    >
                      {NOTICE_SECTION_OPTIONS.map((o) => (
                        <option key={o.value} value={o.value}>
                          {o.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      File (PDF only) <span className="text-red-500">*</span>
                    </label>
                    <div
                      onClick={() => uploadFileRef.current?.click()}
                      className={`flex items-center gap-3 border-2 border-dashed rounded-lg px-4 py-4 cursor-pointer transition ${
                        uploadFile
                          ? "border-green-400 bg-green-50"
                          : "border-gray-300 hover:border-blue-900 hover:bg-blue-50"
                      }`}
                    >
                      {uploadFile ? (
                        <>
                          <FileText
                            size={20}
                            className="text-green-600 shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-green-700 truncate">
                              {uploadFile.name}
                            </p>
                            <p className="text-xs text-green-600">
                              {(uploadFile.size / 1024).toFixed(1)} KB
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setUploadFile(null);
                              if (uploadFileRef.current)
                                uploadFileRef.current.value = "";
                            }}
                            className="text-gray-400 hover:text-red-500 cursor-pointer"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </>
                      ) : (
                        <>
                          <Upload className="w-5 h-5 text-gray-400 shrink-0" />
                          <div>
                            <p className="text-sm text-gray-600 font-medium">
                              Click to upload PDF
                            </p>
                            <p className="text-xs text-gray-400">
                              PDF only, max 10MB
                            </p>
                          </div>
                        </>
                      )}
                    </div>
                    <input
                      ref={uploadFileRef}
                      type="file"
                      accept=".pdf"
                      required
                      onChange={(e) =>
                        setUploadFile(e.target.files?.[0] ?? null)
                      }
                      className="hidden"
                    />
                  </div>
                  <p className="text-red-500 text-xs">
                    Fields marked with an asterisk (*) are required.
                  </p>
                  {/* Modal Footer */}
                  <div className="flex justify-end gap-3 pt-2 border-t border-gray-100 mt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setIsUploading(false);
                        resetUploadForm();
                      }}
                      className="px-4 py-2 border rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={uploading}
                      className="bg-blue-900 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-800 transition flex items-center gap-2 disabled:opacity-60 cursor-pointer"
                    >
                      {uploading && <Loader className="w-4 h-4 animate-spin" />}
                      {uploading ? "Publishing..." : "Publish"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* ── Edit Panel (Modal) ── */}
          {editTarget && (
            <div className="fixed min-h-screen inset-0 z-50 flex items-center justify-center">
              {/* Backdrop */}
              <div
                className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                onClick={() => {
                  setEditTarget(null);
                  resetEditForm();
                }}
              />

              {/* Modal */}
              <div className="relative bg-white rounded-xl shadow-2xl border border-gray-200 w-full max-w-lg mx-4 z-10">
                {/* Modal Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-bold text-blue-900">Edit</h3>
                  <button
                    type="button"
                    onClick={() => {
                      setEditTarget(null);
                      resetEditForm();
                    }}
                    className="text-gray-400 hover:text-gray-600 transition cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Modal Body */}
                <form className="px-6 py-5 space-y-4" onSubmit={handleEditSave}>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Title <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={editForm.title}
                      onChange={(e) =>
                        updateEditForm({
                          title: e.target.value.replace(/\b\w/g, (char) =>
                            char.toUpperCase(),
                          ),
                        })
                      }
                      placeholder="Enter notice title"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-900 focus:ring-1 focus:ring-blue-900"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Type
                    </label>
                    <select
                      value={editForm.section}
                      onChange={(e) =>
                        updateEditForm({ section: e.target.value })
                      }
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-900 focus:ring-1 focus:ring-blue-900 bg-white"
                    >
                      {NOTICE_SECTION_OPTIONS.map((o) => (
                        <option key={o.value} value={o.value}>
                          {o.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Replace PDF (optional)
                    </label>
                    <div
                      onClick={() => editFileRef.current?.click()}
                      className={`flex items-center gap-3 border-2 border-dashed rounded-lg px-4 py-4 cursor-pointer transition ${
                        editFile
                          ? "border-green-400 bg-green-50"
                          : "border-gray-300 hover:border-blue-900 hover:bg-blue-50"
                      }`}
                    >
                      {editFile ? (
                        <>
                          <FileText
                            size={20}
                            className="text-green-600 shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-green-700 truncate">
                              {editFile.name}
                            </p>
                            <p className="text-xs text-green-600">
                              {(editFile.size / 1024).toFixed(1)} KB
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditFile(null);
                              if (editFileRef.current)
                                editFileRef.current.value = "";
                            }}
                            className="text-gray-400 hover:text-red-500 cursor-pointer"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </>
                      ) : (
                        <>
                          <Upload className="w-5 h-5 text-gray-400 shrink-0" />
                          <div>
                            <p className="text-sm text-gray-600 font-medium">
                              Click to replace PDF
                            </p>
                            <p className="text-xs text-gray-400">
                              Leave empty to keep current file
                            </p>
                          </div>
                        </>
                      )}
                    </div>

                    <input
                      ref={editFileRef}
                      type="file"
                      accept=".pdf"
                      onChange={(e) => setEditFile(e.target.files?.[0] ?? null)}
                      className="hidden"
                    />
                  </div>

                  <p className="text-red-500 text-xs">
                    Fields marked with an asterisk (*) are required.
                  </p>

                  {/* Modal Footer */}
                  <div className="flex justify-end gap-3 pt-2 border-t border-gray-100 mt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setEditTarget(null);
                        resetEditForm();
                      }}
                      className="px-4 py-2 border rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={editSaving}
                      className="bg-blue-900 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-800 transition flex items-center gap-2 disabled:opacity-60 cursor-pointer"
                    >
                      {editSaving && (
                        <Loader className="w-4 h-4 animate-spin" />
                      )}
                      {editSaving ? "Saving..." : "Save Changes"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* ── Table ── */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            {/* Search + Filter bar */}
            <div className="p-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
              <div className="relative w-96">
                <Search className="absolute left-3 top-2.5 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search notices..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-10 p-2 text-sm border border-gray-300 rounded focus:outline-none focus:border-blue-900 focus:ring-1 focus:ring-blue-900"
                />
                {/* Search Clear Button */}
                {search && (
                  <button
                    onClick={() => setSearch("")}
                    className="absolute right-3 top-2.5 text-red-600 hover:text-red-700 transition cursor-pointer"
                    aria-label="Clear search"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
              <div className="flex items-center gap-3">
                <p className="text-xs text-gray-500">
                  {totalCount} record{totalCount !== 1 ? "s" : ""}
                </p>
                <div className="flex space-x-2 text-sm">
                  {(["All", "Notice", "Announcement"] as const).map(
                    (filter) => (
                      <button
                        key={filter}
                        onClick={() => {
                          setActiveFilter(filter);
                          if (currentPage !== 1) setCurrentPage(1);
                        }}
                        className={`px-3 py-1.5 rounded font-medium transition cursor-pointer ${
                          activeFilter === filter
                            ? "bg-blue-900 text-white"
                            : "text-gray-600 hover:bg-gray-100"
                        }`}
                      >
                        {filter}
                      </button>
                    ),
                  )}
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-white text-gray-500 text-xs uppercase tracking-wider border-b border-gray-200">
                    <th className="p-4 font-medium w-16 text-center">SLNO</th>
                    <th className="p-4 font-medium">Title</th>
                    <th className="p-4 font-medium w-36 text-center">
                      Upload By
                    </th>
                    <th className="p-4 font-medium w-36 text-center">Date</th>
                    <th className="p-4 font-medium w-32 text-center">Type</th>
                    <th className="p-4 font-medium text-center w-32">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="text-sm divide-y divide-gray-100">
                  {loading ? (
                    <tr>
                      <td
                        colSpan={5}
                        className="text-center py-14 text-gray-400"
                      >
                        <div className="flex flex-col items-center gap-2">
                          <Loader
                            size={32}
                            className="animate-spin text-blue-900 opacity-75"
                          />
                          <p className="text-sm font-medium">
                            Loading notices...
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : notices.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-gray-400">
                        {debouncedSearch || activeFilter !== "All"
                          ? "No notices match your search."
                          : "No notices published yet."}
                      </td>
                    </tr>
                  ) : (
                    notices.map((notice, index) => (
                      <tr
                        key={notice._id}
                        className={`hover:bg-gray-50 transition ${
                          editTarget?._id === notice._id ? "bg-blue-50" : ""
                        }`}
                      >
                        <td className="p-4 font-mono text-xs text-gray-500 text-center">
                          {(currentPage - 1) * ITEMS_PER_PAGE + index + 1}
                        </td>
                        <td className="p-4 font-medium text-gray-800">
                          <div className="flex items-center gap-2">
                            {notice.title}
                            {notice.isNew && (
                              <span className="bg-green-100 text-green-800 text-[10px] font-bold px-1.5 py-0.5 rounded border border-green-200 leading-none shrink-0">
                                NEW
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="p-4 text-gray-500 text-xs text-center">
                          {getSectionBadge(notice?.userId?.name ?? "N/A")}
                        </td>
                        <td className="p-4 text-gray-500 text-xs text-center">
                          {formatDate(notice.createdAt)}
                        </td>
                        <td className="p-4 text-center">
                          {getSectionBadge(notice.section)}
                        </td>
                        <td className="p-4 text-center space-x-3">
                          <button
                            onClick={() =>
                              window.open(notice.fileUrl, "_blank")
                            }
                            className="text-emerald-600 hover:text-emerald-800 transition cursor-pointer"
                            title="View PDF"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => openEdit(notice)}
                            className="text-blue-900 hover:text-blue-700 transition cursor-pointer"
                            title="Edit"
                          >
                            <SquarePen className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() =>
                              showConfirm(
                                () => handleDelete(notice._id),
                                "Are you sure you want to delete this notice? This action cannot be undone.",
                                "Delete",
                                "Cancel",
                              )
                            }
                            className="text-red-600 hover:text-red-800 transition cursor-pointer"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* ── Pagination ── */}
            {totalCount > 0 && !loading && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 bg-gray-50">
                <p className="text-sm text-gray-600">
                  Page {currentPage} of {totalPages}
                </p>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={!hasPrevPage || loading}
                    className="px-3 py-1.5 border rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 cursor-pointer"
                  >
                    ← Prev
                  </button>

                  {pageButtons[0] > 1 && (
                    <>
                      <button
                        onClick={() => handlePageChange(1)}
                        className="px-3 py-1.5 rounded text-sm font-medium border hover:bg-gray-100 text-gray-700 cursor-pointer"
                      >
                        1
                      </button>
                      {pageButtons[0] > 2 && (
                        <span className="px-1 text-gray-400">…</span>
                      )}
                    </>
                  )}

                  {pageButtons.map((page) => (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`px-3 py-1.5 rounded text-sm font-medium cursor-pointer transition ${
                        currentPage === page
                          ? "bg-blue-900 text-white"
                          : "border hover:bg-gray-100 text-gray-700"
                      }`}
                    >
                      {page}
                    </button>
                  ))}

                  {pageButtons[pageButtons.length - 1] < totalPages && (
                    <>
                      {pageButtons[pageButtons.length - 1] < totalPages - 1 && (
                        <span className="px-1 text-gray-400">…</span>
                      )}
                      <button
                        onClick={() => handlePageChange(totalPages)}
                        className="px-3 py-1.5 rounded text-sm font-medium border hover:bg-gray-100 text-gray-700 cursor-pointer"
                      >
                        {totalPages}
                      </button>
                    </>
                  )}

                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={!hasNextPage || loading}
                    className="px-3 py-1.5 border rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 cursor-pointer"
                  >
                    Next →
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
