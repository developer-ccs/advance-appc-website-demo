"use client";

import { useEffect, useCallback, useRef, useState } from "react";
import {
  Plus,
  Search,
  SquarePen,
  Loader,
  X,
  Upload,
  ImageIcon,
  Trash2,
  Eye,
} from "lucide-react";
import { useCouncilImageStore, CouncilImage } from "@/store/councilImageStore";
import { useToast } from "@/components/ui/ToastContext";
import { useConfirmDialog } from "@/components/ui/ConfirmDialogContext";
import CustomLoader from "@/components/ui/CustomLoader";
import { usePageLoader } from "@/hooks/usePageLoader";
import dynamic from "next/dynamic";

const ImageCropperModal = dynamic(
  () => import("@/components/ui/ImageCropperModal"),
  { ssr: false },
);

// ─── Helpers ──────────────────────────────────────────────────────────────────

const MAX_PAGES = 5;
const getPagesToShow = (current: number, total: number): number[] => {
  if (total <= MAX_PAGES) return Array.from({ length: total }, (_, i) => i + 1);
  const half = Math.floor(MAX_PAGES / 2);
  let start = Math.max(1, current - half);
  const end = Math.min(total, start + MAX_PAGES - 1);
  start = Math.max(1, end - MAX_PAGES + 1);
  return Array.from({ length: end - start + 1 }, (_, i) => start + i);
};

const extractErrorMessage = (err: unknown, fallback: string): string => {
  if (err && typeof err === "object") {
    const axiosMsg = (err as { response?: { data?: { message?: string } } })
      ?.response?.data?.message;
    if (axiosMsg) return axiosMsg;
    const errMsg = (err as { message?: string }).message;
    if (errMsg) return errMsg;
  }
  return fallback;
};

const formatBytes = (bytes?: number) => {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const inputCls =
  "w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-900 focus:ring-1 focus:ring-blue-900";
const labelCls = "block text-xs font-semibold text-gray-600 mb-1";

// ─── Image Upload Field ───────────────────────────────────────────────────────

const ImageUploadField = ({
  file,
  previewUrl,
  onFileChange,
  onClear,
  label = "Image",
  required = false,
}: {
  file: File | null;
  previewUrl?: string;
  onFileChange: (f: File | null) => void;
  onClear: () => void;
  label?: string;
  required?: boolean;
}) => {
  const fileRef = useRef<HTMLInputElement>(null);
  const [cropFile, setCropFile] = useState<File | null>(null);
  const { showToast } = useToast();

  const ALLOWED = ["image/jpeg", "image/png", "image/webp", "image/gif"];

  const handleCancelCrop = () => {
    setCropFile(null);
    if (fileRef.current) fileRef.current.value = "";
  };

  return (
    <div>
      {/* Cropper Modal Triggered on Selection */}
      {cropFile && (
        <ImageCropperModal
          file={cropFile}
          onSave={(croppedFile) => {
            onFileChange(croppedFile);
            setCropFile(null);
          }}
          onCancel={handleCancelCrop}
        />
      )}

      <label className={labelCls}>
        {label} {required && <span className="text-red-500">*</span>}
      </label>

      {/* Preview of existing image (edit mode) */}
      {previewUrl && !file && (
        <div className="mb-2 flex items-center gap-2">
          <img
            src={previewUrl}
            alt="Current"
            className="w-14 h-14 rounded-lg object-cover border border-gray-200"
          />
          <span className="text-xs text-gray-500">Current image</span>
        </div>
      )}

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
            <img
              src={URL.createObjectURL(file)}
              alt="Preview"
              className="w-12 h-12 rounded-lg object-cover border border-green-200 shrink-0"
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-green-700 truncate">
                {file.name}
              </p>
              <p className="text-xs text-green-600">{formatBytes(file.size)}</p>
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onClear();
                if (fileRef.current) fileRef.current.value = "";
              }}
              className="text-gray-400 hover:text-red-500 transition-colors cursor-pointer"
            >
              <X size={16} />
            </button>
          </>
        ) : (
          <>
            <Upload size={20} className="text-gray-400 shrink-0" />
            <div>
              <p className="text-sm text-gray-600 font-medium">
                Click to upload image
              </p>
              <p className="text-xs text-gray-400">
                JPG, PNG, WEBP or GIF · Max 5MB
              </p>
            </div>
          </>
        )}
      </div>

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0] ?? null;
          if (!f) return;

          if (!ALLOWED.includes(f.type)) {
            showToast(
              "Only image files (JPG, PNG, WEBP, GIF) are allowed",
              "error",
            );
            if (fileRef.current) fileRef.current.value = "";
            return;
          }
          if (f.size > 5 * 1024 * 1024) {
            showToast("Image must be under 5MB", "error");
            if (fileRef.current) fileRef.current.value = "";
            return;
          }

          // Trigger crop modal instead of setting immediately
          setCropFile(f);
        }}
      />
    </div>
  );
};

// ─── Add Modal ────────────────────────────────────────────────────────────────

const AddCouncilImageModal = () => {
  const { addForm, isSaving, updateAddForm, closeAddModal, addImage } =
    useCouncilImageStore();
  const { showToast } = useToast();

  return (
    <div className="fixed min-h-screen inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 sticky top-0 bg-white z-10">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-serif font-bold text-blue-900">
              Add Details
            </h3>
          </div>
          <button
            onClick={closeAddModal}
            disabled={isSaving}
            className="text-gray-400 hover:text-gray-600 cursor-pointer transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="px-6 py-5 space-y-4">
          {/* Name */}
          <div>
            <label className={labelCls}>
              Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="Full name of the council member"
              value={addForm.name}
              onChange={(e) => {
                const val = e.target.value
                  .replace(/[^a-zA-Z\s.]/g, "")
                  .replace(/\b\w/g, (char) => char.toUpperCase());
                updateAddForm({ name: val });
              }}
              className={inputCls}
            />
          </div>

          {/* Designation */}
          <div>
            <label className={labelCls}>
              Designation <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. President, Secretary, Member"
              value={addForm.designation}
              onChange={(e) =>
                updateAddForm({
                  designation: e.target.value
                    .replace(/[^a-zA-Z\s.]/g, "")
                    .replace(/\b\w/g, (char) => char.toUpperCase()),
                })
              }
              className={inputCls}
            />
          </div>

          {/* Image Upload */}
          <ImageUploadField
            file={addForm.image}
            onFileChange={(f) => updateAddForm({ image: f })}
            onClear={() => updateAddForm({ image: null })}
            label="Photo"
            required
          />
          <p className="text-red-500 text-xs">
            Fields marked with an asterisk (*) are required.
          </p>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50 sticky bottom-0">
          <button
            onClick={closeAddModal}
            disabled={isSaving}
            className="px-4 py-2 text-sm border border-gray-300 rounded hover:bg-gray-100 cursor-pointer transition disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={async () => {
              try {
                await addImage();
                showToast(
                  "Council member image added successfully!",
                  "success",
                );
              } catch (err: unknown) {
                showToast(
                  extractErrorMessage(
                    err,
                    "Failed to add council member image.",
                  ),
                  "error",
                );
              }
            }}
            disabled={isSaving}
            className="flex items-center gap-2 px-5 py-2 text-sm bg-blue-900 text-white rounded hover:bg-blue-800 cursor-pointer transition disabled:opacity-60"
          >
            {isSaving ? (
              <>
                <Loader size={15} className="animate-spin" /> Saving…
              </>
            ) : (
              <>Upload</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Edit Modal ───────────────────────────────────────────────────────────────

interface EditForm {
  name: string;
  designation: string;
  image: File | null;
}

const EditCouncilImageModal = ({ image }: { image: CouncilImage }) => {
  const { updateImage, closeEditModal, isSaving } = useCouncilImageStore();
  const { showToast } = useToast();

  const [form, setForm] = useState<EditForm>({
    name: image.name,
    designation: image.designation,
    image: null,
  });

  const patch = (p: Partial<EditForm>) =>
    setForm((prev) => ({ ...prev, ...p }));

  const handleSubmit = async () => {
    if (!form.name.trim()) {
      showToast("Name is required", "error");
      return;
    }
    if (!form.designation.trim()) {
      showToast("Designation is required", "error");
      return;
    }

    try {
      const fd = new FormData();
      fd.append("name", form.name.trim());
      fd.append("designation", form.designation.trim());
      if (form.image) fd.append("image", form.image);

      await updateImage(image._id, fd);
      showToast("Council member image updated successfully!", "success");
    } catch (err: unknown) {
      showToast(
        extractErrorMessage(err, "Failed to update council member image."),
        "error",
      );
    }
  };

  return (
    <div className="fixed min-h-screen inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 sticky top-0 bg-white z-10">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-serif font-bold text-blue-900">
              Edit Info
            </h3>
          </div>
          <button
            onClick={closeEditModal}
            disabled={isSaving}
            className="text-gray-400 hover:text-gray-600 cursor-pointer transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="px-6 py-5 space-y-4">
          {/* Name */}
          <div>
            <label className={labelCls}>
              Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => {
                const val = e.target.value
                  .replace(/[^a-zA-Z\s.]/g, "")
                  .replace(/\b\w/g, (char) => char.toUpperCase());
                patch({ name: val });
              }}
              className={inputCls}
            />
          </div>

          {/* Designation */}
          <div>
            <label className={labelCls}>
              Designation <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.designation}
              onChange={(e) =>
                patch({
                  designation: e.target.value
                    .replace(/[^a-zA-Z\s.]/g, "")
                    .replace(/\b\w/g, (char) => char.toUpperCase()),
                })
              }
              className={inputCls}
            />
          </div>

          {/* Image Upload */}
          <ImageUploadField
            file={form.image}
            previewUrl={image.fileUrl}
            onFileChange={(f) => patch({ image: f })}
            onClear={() => patch({ image: null })}
            label="Replace Photo"
          />
          <p className="text-red-500 text-xs">
            Fields marked with an asterisk (*) are required.
          </p>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50 sticky bottom-0">
          <button
            onClick={closeEditModal}
            disabled={isSaving}
            className="px-4 py-2 text-sm border border-gray-300 rounded hover:bg-gray-100 cursor-pointer transition disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSaving}
            className="flex items-center gap-2 px-5 py-2 text-sm bg-blue-900 text-white rounded hover:bg-blue-800 cursor-pointer transition disabled:opacity-60"
          >
            {isSaving ? (
              <>
                <Loader size={15} className="animate-spin" /> Saving…
              </>
            ) : (
              <>Save</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── View Modal ───────────────────────────────────────────────────────────────

const ViewCouncilImageModal = ({
  image,
  onClose,
}: {
  image: CouncilImage;
  onClose: () => void;
}) => (
  <div className="fixed min-h-screen inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
    <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm">
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-serif font-bold text-blue-900">
          View Info
        </h3>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 cursor-pointer"
        >
          <X size={20} />
        </button>
      </div>

      <div className="px-6 py-5 flex flex-col items-center gap-4 text-center">
        <div className="relative">
          <img
            src={image.fileUrl}
            alt={image.name}
            className="w-28 h-28 rounded-full object-cover border-4 border-blue-100 shadow-md"
            onError={(e) => {
              (e.target as HTMLImageElement).src =
                "https://placehold.co/112x112/e2e8f0/94a3b8?text=?";
            }}
          />
        </div>
        <div>
          <h4 className="text-base font-bold text-gray-900">{image.name}</h4>
          <p className="text-sm text-blue-800 font-medium mt-0.5">
            {image.designation}
          </p>
          {image.fileSize && (
            <p className="text-xs text-gray-400 mt-1">
              {formatBytes(image.fileSize)}
            </p>
          )}
        </div>
      </div>

      <div className="flex justify-end gap-2 px-6 py-4 border-t border-gray-100 bg-gray-50 rounded-b-xl">
        <a
          href={image.fileUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-4 py-2 text-sm bg-blue-900 text-white rounded hover:bg-blue-800 transition"
        >
          <Eye size={14} /> View Full Image
        </a>
      </div>
    </div>
  </div>
);

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function CouncilImagesPage() {
  const {
    images,
    pagination,
    loading,
    error,
    search,
    currentPage,
    isAdding,
    isEditing,
    editTarget,
    isDeleting,
    fetchImages,
    setSearch,
    setCurrentPage,
    openAddModal,
    openEditModal,
    deleteImage,
    setError,
  } = useCouncilImageStore();

  const { showToast } = useToast();
  const { showConfirm } = useConfirmDialog();

  const [localSearch, setLocalSearch] = useState(search);
  const [isTableLoading, setIsTableLoading] = useState(true);
  const [viewTarget, setViewTarget] = useState<CouncilImage | null>(null);

  const isInitialLoad = useRef(true);
  const { isLoading: isPageLoading } = usePageLoader([
    isInitialLoad.current ? loading : false,
  ]);

  // Clean up search state when leaving the page/tab
  useEffect(() => {
    return () => {
      setSearch("");
      setCurrentPage(1);
    };
  }, [setSearch, setCurrentPage]);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (localSearch !== search) {
        setSearch(localSearch);
        setCurrentPage(1);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [localSearch, search, setSearch, setCurrentPage]);

  useEffect(() => {
    setLocalSearch(search);
  }, [search]);

  useEffect(() => {
    fetchImages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, currentPage]);

  useEffect(() => {
    if (!loading && isInitialLoad.current) {
      isInitialLoad.current = false;
    }
  }, [loading]);

  // Artificial visual delay
  useEffect(() => {
    if (loading) {
      setIsTableLoading(true);
    } else {
      const timer = setTimeout(() => setIsTableLoading(false), 600);
      return () => clearTimeout(timer);
    }
  }, [loading]);

  useEffect(() => {
    if (error) {
      showToast(error, "error");
      setError(null);
    }
  }, [error, showToast, setError]);

  const handleDelete = useCallback(
    async (id: string) => {
      showConfirm(
        async () => {
          try {
            await deleteImage(id);
            showToast("Council member image deleted successfully!", "success");
          } catch (err: unknown) {
            showToast(
              extractErrorMessage(
                err,
                "Failed to delete council image. Please try again.",
              ),
              "error",
            );
          }
        },
        "Delete this council member? This action cannot be undone.",
        "Delete",
        "Cancel",
      );
    },
    [deleteImage, showConfirm, showToast],
  );

  if (isPageLoading) {
    return <CustomLoader fullPage message="Loading council images..." />;
  }

  const pages = getPagesToShow(currentPage, pagination.totalPages);
  const startEntry =
    images.length === 0 ? 0 : (currentPage - 1) * pagination.limit + 1;
  const endEntry = Math.min(currentPage * pagination.limit, pagination.total);

  return (
    <>
      {isAdding && <AddCouncilImageModal />}
      {isEditing && editTarget && <EditCouncilImageModal image={editTarget} />}
      {viewTarget && (
        <ViewCouncilImageModal
          image={viewTarget}
          onClose={() => setViewTarget(null)}
        />
      )}

      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-start flex-wrap gap-4 border-b border-gray-100 pb-2">
          <div>
            <h2 className="text-lg font-bold text-gray-800">Council Gallery</h2>
          </div>
          <div className="flex items-center gap-3">
            {/* Stats pill */}
            <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-lg px-3 py-2">
              <div className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
              <span className="text-sm font-semibold text-blue-900">
                {pagination.total} Members
              </span>
            </div>
            <button
              onClick={openAddModal}
              className="bg-blue-900 text-white px-4 py-2 rounded shadow-sm hover:bg-blue-800 transition flex items-center gap-2 text-sm cursor-pointer"
            >
              <Plus size={18} /> Add Member
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 flex flex-wrap gap-4 items-center">
          <div className="flex-1 min-w-62.5 relative">
            <Search className="absolute left-3 top-2.5 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search by member name..."
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              className="w-full pl-10 p-2 border border-gray-300 rounded text-sm focus:outline-none focus:border-blue-900 focus:ring-1 focus:ring-blue-900"
            />
          </div>
          <button
            onClick={() => {
              setSearch("");
              setLocalSearch("");
              setCurrentPage(1);
            }}
            className="px-4 py-2 text-sm border bg-red-600 text-white rounded hover:bg-red-700 transition cursor-pointer flex items-center gap-2"
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
                  <th className="p-4 text-center">Sl. No.</th>
                  <th className="p-4 ">Photo</th>
                  <th className="p-4">Name</th>
                  <th className="p-4 text-center">Designation</th>
                  <th className="p-4 text-center">File Size</th>
                  <th className="p-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="text-sm divide-y divide-gray-100">
                {/* Loading */}
                {isTableLoading && (
                  <tr>
                    <td colSpan={6} className="text-center py-14 text-gray-500">
                      <div className="flex flex-col items-center gap-2">
                        <Loader
                          size={32}
                          className="animate-spin text-blue-900"
                        />
                        <p className="font-medium text-sm">
                          Loading council members...
                        </p>
                      </div>
                    </td>
                  </tr>
                )}

                {/* Rows */}
                {!isTableLoading &&
                  images.map((img, index) => (
                    <tr
                      key={img._id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="p-4 text-xs text-gray-500 text-center">
                        {(currentPage - 1) * pagination.limit + index + 1}
                      </td>
                      <td className="p-4">
                        <div className="w-10 h-10 rounded-full overflow-hidden border border-gray-200 bg-gray-100 flex items-center justify-center shrink-0">
                          {img.fileUrl ? (
                            <img
                              src={img.fileUrl}
                              alt={img.name}
                              className="w-full h-full object-cover object-center"
                              onError={(e) => {
                                (e.target as HTMLImageElement).style.display =
                                  "none";
                              }}
                            />
                          ) : (
                            <ImageIcon size={16} className="text-gray-400" />
                          )}
                        </div>
                      </td>
                      <td className="p-4 font-medium text-gray-800">
                        {img.name}
                      </td>
                      <td className="p-4 text-center">
                        <span className="text-xs font-semibold px-2 py-1 rounded-full bg-blue-100 text-blue-800">
                          {img.designation}
                        </span>
                      </td>
                      <td className="p-4 text-xs text-center text-gray-500">
                        {formatBytes(img.fileSize) || "—"}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-center gap-3">
                          <button
                            onClick={() => setViewTarget(img)}
                            className="text-blue-700 hover:text-blue-800 transition-colors cursor-pointer"
                            title="View"
                          >
                            <Eye size={17} />
                          </button>
                          <button
                            onClick={() => openEditModal(img)}
                            className="text-green-600 hover:text-green-700 transition-colors cursor-pointer"
                            title="Edit"
                          >
                            <SquarePen size={17} />
                          </button>
                          <button
                            onClick={() => handleDelete(img._id)}
                            disabled={isDeleting === img._id}
                            className="text-red-500 hover:text-red-600 transition-colors disabled:opacity-40 cursor-pointer"
                            title="Delete"
                          >
                            {isDeleting === img._id ? (
                              <Loader size={15} className="animate-spin" />
                            ) : (
                              <Trash2 size={15} />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}

                {/* Empty */}
                {!isTableLoading && images.length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-center py-14 text-gray-400">
                      <div className="flex flex-col items-center gap-2">
                        <ImageIcon size={32} className="opacity-25" />
                        <p className="font-medium">No council members found.</p>
                        <p className="text-xs">
                          {search
                            ? "Try adjusting your search query."
                            : "Add the first council member to get started."}
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between bg-gray-50 flex-wrap gap-3">
            <span className="text-sm text-gray-600">
              {isTableLoading
                ? "Loading…"
                : `Showing ${startEntry}–${endEntry} of ${pagination.total} members`}
            </span>
            <div className="flex gap-1 flex-wrap">
              <button
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={!pagination.hasPrevPage || isTableLoading}
                className="px-3 py-1 border rounded text-sm disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                ← Prev
              </button>

              {pages[0] > 1 && (
                <>
                  <button
                    onClick={() => setCurrentPage(1)}
                    className="px-3 py-1 border rounded border-gray-300 text-gray-600 text-sm cursor-pointer"
                  >
                    1
                  </button>
                  {pages[0] > 2 && (
                    <span className="px-2 py-1 text-gray-400 text-sm">…</span>
                  )}
                </>
              )}

              {pages.map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  disabled={isTableLoading}
                  className={`px-3 py-1 border rounded text-sm cursor-pointer ${
                    currentPage === page
                      ? "bg-blue-900 text-white border-blue-900"
                      : "border-gray-300 text-gray-600"
                  }`}
                >
                  {page}
                </button>
              ))}

              {pages[pages.length - 1] < pagination.totalPages && (
                <>
                  {pages[pages.length - 1] < pagination.totalPages - 1 && (
                    <span className="px-2 py-1 text-gray-400 text-sm">…</span>
                  )}
                  <button
                    onClick={() => setCurrentPage(pagination.totalPages)}
                    className="px-3 py-1 border rounded border-gray-300 text-gray-600 text-sm cursor-pointer"
                  >
                    {pagination.totalPages}
                  </button>
                </>
              )}

              <button
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={!pagination.hasNextPage || isTableLoading}
                className="px-3 py-1 border rounded text-sm disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                Next →
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
