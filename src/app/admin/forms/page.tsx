"use client";

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
import { useToast } from "@/components/ui/ToastContext";
import { useConfirmDialog } from "@/components/ui/ConfirmDialogContext";

import CustomLoader from "@/components/ui/CustomLoader";
import { usePageLoader } from "@/hooks/usePageLoader";

// ─── Types & Mock Data ────────────────────────────────────────────────────────

interface PdfRecord {
  _id: string;
  title: string;
  section: string;
  fileUrl: string;
  fileName: string;
  fileSize: number;
  createdAt: string;
  isNew?: boolean;
  userId?: { name: string };
}

const SECTION_OPTIONS = [
  { label: "Registration", value: "registration" },
  { label: "Renewal", value: "renewal" },
  { label: "Reciprocal", value: "reciprocal" },
  { label: "General Guidelines", value: "guidelines" },
];

const ALLOWED_SECTIONS = [
  "registration",
  "renewal",
  "reciprocal",
  "guidelines",
];

const sectionLabel = (val: string) =>
  SECTION_OPTIONS.find((o) => o.value === val)?.label || val;

const generateMockData = (): PdfRecord[] =>
  Array.from({ length: 35 }).map((_, i) => ({
    _id: `form-doc-${i + 1}`,
    title: `Standard Application Form ${i + 1}`,
    section: ALLOWED_SECTIONS[i % ALLOWED_SECTIONS.length],
    fileUrl: "#demo-pdf",
    fileName: `application_form_${i + 1}.pdf`,
    fileSize: 1024 * Math.floor(Math.random() * 5000 + 500),
    createdAt: new Date(Date.now() - Math.random() * 10000000000).toISOString(),
    isNew: i < 3,
    userId: { name: i % 2 === 0 ? "System Admin" : "Moderator" },
  }));

let MOCK_DB = generateMockData();

const ITEMS_PER_PAGE = 10;

// ─── Main Component ────────────────────────────────────────────────────────────

export default function FormsPage() {
  const { showToast } = useToast();
  const { showConfirm } = useConfirmDialog();

  const uploadFileRef = useRef<HTMLInputElement>(null);
  const editFileRef = useRef<HTMLInputElement>(null);

  // Local State representing the Database
  const [allData, setAllData] = useState<PdfRecord[]>(MOCK_DB);

  // Table & Filter State
  const [forms, setForms] = useState<PdfRecord[]>([]);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    limit: ITEMS_PER_PAGE,
    hasNextPage: false,
    hasPrevPage: false,
    totalCount: 0,
  });

  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const { isLoading: isPageLoading } = usePageLoader([isInitialLoad]);

  // Upload State
  const [isUploading, setIsUploading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadForm, setUploadForm] = useState({
    title: "",
    section: "registration",
  });
  const [uploadFile, setUploadFile] = useState<File | null>(null);

  // Edit State
  const [editTarget, setEditTarget] = useState<PdfRecord | null>(null);
  const [editForm, setEditForm] = useState({
    title: "",
    section: "registration",
  });
  const [editFile, setEditFile] = useState<File | null>(null);
  const [editSaving, setEditSaving] = useState(false);

  // ─── Helpers ─────────────────────────────────────────────────────────────────

  const updateUploadForm = (data: Partial<typeof uploadForm>) =>
    setUploadForm((prev) => ({ ...prev, ...data }));
  const resetUploadForm = () => {
    setUploadForm({ title: "", section: "registration" });
    setUploadFile(null);
  };

  const updateEditForm = (data: Partial<typeof editForm>) =>
    setEditForm((prev) => ({ ...prev, ...data }));
  const resetEditForm = () => {
    setEditForm({ title: "", section: "registration" });
    setEditFile(null);
  };

  // ─── Debounce Effect ─────────────────────────────────────────────────────────

  useEffect(() => {
    const timer = setTimeout(() => {
      if (search !== debouncedSearch) {
        setDebouncedSearch(search);
        setCurrentPage(1); // Reset to first page on new search
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [search, debouncedSearch]);

  // ─── Fetch (Simulated API) ───────────────────────────────────────────────────

  const fetchForms = useCallback(() => {
    setLoading(true);
    // 600ms delay to prevent fast flickering on table inline loading
    setTimeout(() => {
      let filtered = allData.filter((f) =>
        ALLOWED_SECTIONS.includes(f.section),
      );

      if (debouncedSearch.trim()) {
        const query = debouncedSearch.toLowerCase();
        filtered = filtered.filter((f) =>
          f.title.toLowerCase().includes(query),
        );
      }

      const totalCount = filtered.length;
      const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE) || 1;
      const safePage = Math.min(currentPage, totalPages);

      if (safePage !== currentPage && safePage > 0) {
        setCurrentPage(safePage);
        return;
      }

      const start = (safePage - 1) * ITEMS_PER_PAGE;
      const paginatedData = filtered.slice(start, start + ITEMS_PER_PAGE);

      setForms(paginatedData);
      setPagination({
        currentPage: safePage,
        totalPages,
        limit: ITEMS_PER_PAGE,
        hasNextPage: safePage < totalPages,
        hasPrevPage: safePage > 1,
        totalCount,
      });

      setLoading(false);
      setIsInitialLoad(false);
    }, 600);
  }, [allData, currentPage, debouncedSearch]);

  // Re-fetch whenever page or search changes
  useEffect(() => {
    fetchForms();
  }, [fetchForms]);

  // ─── Upload (Simulated API) ──────────────────────────────────────────────────

  const handleUpload = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!uploadFile) return;

    setUploading(true);

    setTimeout(() => {
      const newRecord: PdfRecord = {
        _id: `form-new-${Date.now()}`,
        title: uploadForm.title.trim(),
        section: uploadForm.section,
        fileUrl: "#demo-file",
        fileName: uploadFile.name,
        fileSize: uploadFile.size,
        createdAt: new Date().toISOString(),
        isNew: true,
        userId: { name: "System Admin" },
      };

      setAllData((prev) => [newRecord, ...prev]);

      showToast(
        `[Demo] "${sectionLabel(
          uploadForm.section,
        )}" has been uploaded successfully!`,
        "success",
      );

      resetUploadForm();
      setIsUploading(false);
      if (uploadFileRef.current) uploadFileRef.current.value = "";
      setUploading(false);
    }, 800);
  };

  // ─── Edit (Simulated API) ────────────────────────────────────────────────────

  const openEdit = (form: PdfRecord) => {
    setEditTarget(form);
    setEditForm({ title: form.title, section: form.section });
    setEditFile(null);
    setIsUploading(false);
    if (editFileRef.current) editFileRef.current.value = "";
  };

  const handleEditSave = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editTarget) return;

    setEditSaving(true);

    setTimeout(() => {
      setAllData((prev) =>
        prev.map((f) =>
          f._id === editTarget._id
            ? {
                ...f,
                title: editForm.title.trim() || f.title,
                section: editForm.section,
                fileName: editFile ? editFile.name : f.fileName,
                fileSize: editFile ? editFile.size : f.fileSize,
              }
            : f,
        ),
      );

      showToast(
        `[Demo] "${sectionLabel(
          editForm.section,
        )}" has been updated successfully!`,
        "success",
      );

      setEditTarget(null);
      resetEditForm();
      setEditSaving(false);
    }, 800);
  };

  // ─── Delete (Simulated API) ──────────────────────────────────────────────────

  const handleDelete = (id: string) => {
    const deletedTitle = allData.find((f) => f._id === id)?.section ?? "Form";

    setTimeout(() => {
      setAllData((prev) => prev.filter((f) => f._id !== id));
      showToast(
        `[Demo] "${sectionLabel(deletedTitle)}" has been deleted successfully!`,
        "success",
      );
    }, 500);
  };

  // ─── Pagination helpers ──────────────────────────────────────────────────────

  const { totalPages, hasPrevPage, hasNextPage, totalCount } = pagination;

  // Show at most 5 page buttons around current page
  const pageButtons = (() => {
    const delta = 2;
    const start = Math.max(1, currentPage - delta);
    const end = Math.min(totalPages, currentPage + delta);
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  })();

  // ─── Render ──────────────────────────────────────────────────────────────────

  return (
    <>
      {isPageLoading ? (
        <CustomLoader fullPage message="Loading forms..." />
      ) : (
        <div className="space-y-6">
          {/* Header */}
          <div className="flex justify-between items-center">
            <div className="pb-1">
              <h2 className="text-2xl font-bold text-blue-900 tracking-tight">
                Manage Forms
              </h2>
              <p className="text-sm text-slate-500 mt-0.5">
                Create, organize, update, and monitor application forms,
                sections, submissions, and availability.
              </p>
            </div>

            <button
              onClick={() => {
                setIsUploading(!isUploading);
                resetEditForm();
                setEditTarget(null);
              }}
              className="px-4 py-2 rounded shadow-sm transition flex items-center text-sm gap-2 text-white bg-blue-900 hover:bg-blue-800 cursor-pointer"
            >
              <Upload className="w-4 h-4" />
              Upload
            </button>
          </div>

          {/* ── Upload Modal ── */}
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
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-bold text-blue-900">
                    Upload Form
                  </h3>
                  <button
                    onClick={() => {
                      setIsUploading(false);
                      resetUploadForm();
                    }}
                    className="text-gray-400 hover:text-gray-600 transition cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form className="px-6 py-5 space-y-4" onSubmit={handleUpload}>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Form Title <span className="text-red-500">*</span>
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
                      placeholder="Enter form title"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-900 focus:ring-1 focus:ring-blue-900"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Category
                    </label>
                    <select
                      value={uploadForm.section}
                      onChange={(e) =>
                        updateUploadForm({ section: e.target.value })
                      }
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-900 focus:ring-1 focus:ring-blue-900 bg-white"
                    >
                      {SECTION_OPTIONS.map((o) => (
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
                      {uploading ? "Uploading..." : "Publish"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* ── Edit Modal ── */}
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
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-bold text-blue-900">Edit Form</h3>
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

                <form className="px-6 py-5 space-y-4" onSubmit={handleEditSave}>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Form Name / Title <span className="text-red-500">*</span>
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
                      placeholder="Enter form title"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-900 focus:ring-1 focus:ring-blue-900"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Category
                    </label>
                    <select
                      value={editForm.section}
                      onChange={(e) =>
                        updateEditForm({ section: e.target.value })
                      }
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-900 focus:ring-1 focus:ring-blue-900 bg-white"
                    >
                      {SECTION_OPTIONS.map((o) => (
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
            {/* Search bar */}
            <div className="p-4 border-b border-gray-200 gap-4 bg-gray-50 flex justify-between items-center">
              <div className="relative w-full">
                <Search className="absolute left-3 top-2.5 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search forms..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-10 p-2 text-sm border border-gray-300 rounded focus:outline-none focus:border-blue-900 focus:ring-1 focus:ring-blue-900"
                />
              </div>
              <button
                onClick={() => setSearch("")}
                className="px-4 py-2 text-sm border bg-red-600 text-white rounded hover:bg-red-700 transition cursor-pointer flex items-center gap-2"
              >
                <X size={14} /> Clear
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-white text-gray-500 text-xs uppercase tracking-wider border-b border-gray-200">
                    <th className="p-4 font-medium text-center w-16">SLNO</th>
                    <th className="p-4 font-medium">Document Name</th>
                    <th className="p-4 font-medium text-center w-40">
                      Upload By
                    </th>
                    <th className="p-4 font-medium text-center w-40">
                      Category
                    </th>
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
                            Loading forms...
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : forms.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-gray-400">
                        {debouncedSearch
                          ? "No forms match your search."
                          : "No forms uploaded yet."}
                      </td>
                    </tr>
                  ) : (
                    forms.map((doc, index) => (
                      <tr
                        key={doc._id}
                        className={`hover:bg-gray-50 transition ${
                          editTarget?._id === doc._id ? "bg-blue-50" : ""
                        }`}
                      >
                        <td className="p-4 font-mono text-xs text-center text-gray-500">
                          {(currentPage - 1) * ITEMS_PER_PAGE + index + 1}
                        </td>
                        <td className="p-4 font-medium text-gray-800">
                          <div className="flex items-center gap-2">
                            {doc.title}
                            {doc.isNew && (
                              <span className="bg-green-100 text-green-800 text-[10px] font-bold px-1.5 py-0.5 rounded border border-green-200 leading-none shrink-0">
                                NEW
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="p-4 text-center text-gray-600">
                          <span className="px-2 py-1 text-xs font-bold">
                            {doc?.userId?.name ?? "N/A"}
                          </span>
                        </td>
                        <td className="p-4 text-center">
                          <span className="bg-blue-50 text-blue-900 px-2 py-1 rounded text-xs font-bold border border-blue-100">
                            {sectionLabel(doc.section)}
                          </span>
                        </td>
                        <td className="p-4 text-center space-x-3">
                          <button
                            onClick={() => {
                              alert("[Demo] Viewing PDF Form");
                            }}
                            className="text-emerald-600 hover:text-emerald-800 transition cursor-pointer"
                            title="View PDF"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => openEdit(doc)}
                            className="text-blue-900 hover:text-blue-700 transition cursor-pointer"
                            title="Edit"
                          >
                            <SquarePen className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() =>
                              showConfirm(
                                () => handleDelete(doc._id),
                                "Are you sure you want to delete this form? This action cannot be undone.",
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
                    onClick={() => setCurrentPage(currentPage - 1)}
                    disabled={!hasPrevPage || loading}
                    className="px-3 py-1.5 border rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 cursor-pointer"
                  >
                    ← Prev
                  </button>

                  {/* First page shortcut */}
                  {pageButtons[0] > 1 && (
                    <>
                      <button
                        onClick={() => setCurrentPage(1)}
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
                      onClick={() => setCurrentPage(page)}
                      className={`px-3 py-1.5 rounded text-sm font-medium cursor-pointer transition ${
                        currentPage === page
                          ? "bg-blue-900 text-white"
                          : "border hover:bg-gray-100 text-gray-700"
                      }`}
                    >
                      {page}
                    </button>
                  ))}

                  {/* Last page shortcut */}
                  {pageButtons[pageButtons.length - 1] < totalPages && (
                    <>
                      {pageButtons[pageButtons.length - 1] < totalPages - 1 && (
                        <span className="px-1 text-gray-400">…</span>
                      )}
                      <button
                        onClick={() => setCurrentPage(totalPages)}
                        className="px-3 py-1.5 rounded text-sm font-medium border hover:bg-gray-100 text-gray-700 cursor-pointer"
                      >
                        {totalPages}
                      </button>
                    </>
                  )}

                  <button
                    onClick={() => setCurrentPage(currentPage + 1)}
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
