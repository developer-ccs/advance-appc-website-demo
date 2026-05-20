"use client";

import { useEffect, useCallback, useState, useMemo } from "react";
import {
  Plus,
  Search,
  SquarePen,
  Loader,
  X,
  ImageIcon,
  Trash2,
  Eye,
} from "lucide-react";
import { useToast } from "@/components/ui/ToastContext";
import { useConfirmDialog } from "@/components/ui/ConfirmDialogContext";

// ─── Mock Data ───────────────────────────────────────────────────────────────

const MOCK_IMAGES = [
  {
    _id: "1",
    name: "Dr. Aruna Reddy",
    designation: "President",
    fileUrl: "https://i.pravatar.cc/150?u=aruna",
    fileSize: 1024 * 450,
  },
  {
    _id: "2",
    name: "Shri. V. Rama Rao",
    designation: "Vice President",
    fileUrl: "https://i.pravatar.cc/150?u=rama",
    fileSize: 1024 * 380,
  },
  {
    _id: "3",
    name: "Dr. K. Srinivas",
    designation: "General Secretary",
    fileUrl: "https://i.pravatar.cc/150?u=srinivas",
    fileSize: 1024 * 520,
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const formatBytes = (bytes?: number) => {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const inputCls =
  "w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-900 focus:ring-1 focus:ring-blue-900";
const labelCls = "block text-xs font-semibold text-gray-600 mb-1";

// ─── Modals (Demo Integrated) ─────────────────────────────────────────────────

const AddModal = ({
  onAdd,
  onClose,
}: {
  onAdd: (m: any) => void;
  onClose: () => void;
}) => {
  const [form, setForm] = useState({ name: "", designation: "" });
  const [saving, setSaving] = useState(false);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-bold text-blue-900">
            Add Council Member
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className={labelCls}>Name</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className={inputCls}
              placeholder="Full Name"
            />
          </div>
          <div>
            <label className={labelCls}>Designation</label>
            <input
              type="text"
              value={form.designation}
              onChange={(e) =>
                setForm({ ...form, designation: e.target.value })
              }
              className={inputCls}
              placeholder="e.g. Member"
            />
          </div>
          <div className="border-2 border-dashed border-gray-200 rounded-lg p-8 text-center text-gray-400 text-xs">
            <ImageIcon className="mx-auto mb-2 opacity-20" size={32} />
            Image upload is disabled in demo mode
          </div>
        </div>
        <div className="px-6 py-4 border-t bg-gray-50 flex justify-end gap-2 rounded-b-xl">
          <button onClick={onClose} className="px-4 py-2 text-sm text-gray-500">
            Cancel
          </button>
          <button
            disabled={saving || !form.name}
            onClick={async () => {
              setSaving(true);
              await new Promise((r) => setTimeout(r, 800));
              onAdd({
                ...form,
                _id: Date.now().toString(),
                fileUrl: `https://i.pravatar.cc/150?u=${form.name}`,
                fileSize: 250000,
              });
              setSaving(false);
            }}
            className="bg-blue-900 text-white px-6 py-2 rounded-lg text-sm hover:bg-blue-800 transition flex items-center gap-2 cursor-pointer"
          >
            {saving && <Loader size={14} className="animate-spin" />}
            Save Member
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

export default function CouncilImagesPage() {
  const [images, setImages] = useState(MOCK_IMAGES);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [viewTarget, setViewTarget] = useState<any | null>(null);

  const { showToast } = useToast();
  const { showConfirm } = useConfirmDialog();

  // Simulated initial load
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  const filteredImages = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return images;
    return images.filter(
      (img) =>
        img.name.toLowerCase().includes(q) ||
        img.designation.toLowerCase().includes(q),
    );
  }, [images, search]);

  const handleDelete = (id: string, name: string) => {
    showConfirm(
      async () => {
        setLoading(true);
        await new Promise((r) => setTimeout(r, 600));
        setImages((prev) => prev.filter((img) => img._id !== id));
        setLoading(false);
        showToast(`${name} removed successfully (Demo)`, "success");
      },
      `Are you sure you want to delete ${name}?`,
      "Delete",
      "Cancel",
    );
  };

  return (
    <>
      {isAdding && (
        <AddModal
          onClose={() => setIsAdding(false)}
          onAdd={(newImg) => {
            setImages([newImg, ...images]);
            setIsAdding(false);
            showToast("Member added successfully!", "success");
          }}
        />
      )}

      {viewTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-xs p-6 text-center">
            <img
              src={viewTarget.fileUrl}
              className="w-24 h-24 rounded-full mx-auto border-4 border-blue-50 object-cover shadow-sm mb-4"
            />
            <h4 className="font-bold text-gray-900">{viewTarget.name}</h4>
            <p className="text-sm text-blue-600 font-medium mb-4">
              {viewTarget.designation}
            </p>
            <button
              onClick={() => setViewTarget(null)}
              className="w-full py-2 bg-gray-100 rounded-lg text-sm text-gray-600"
            >
              Close
            </button>
          </div>
        </div>
      )}

      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center border-b border-gray-100 pb-3">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-gray-800">Council Gallery</h2>
          </div>
          <button
            onClick={() => setIsAdding(true)}
            className="bg-blue-900 text-white px-4 py-2 rounded-lg shadow-sm hover:bg-blue-800 transition flex items-center gap-2 text-sm cursor-pointer"
          >
            <Plus size={18} /> Add Member
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-200 flex gap-3 items-center">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-2.5 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search by member name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 p-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 transition"
            />
          </div>
          {search && (
            <button
              onClick={() => setSearch("")}
              className="text-xs text-red-500 font-semibold px-2"
            >
              Clear
            </button>
          )}
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 text-gray-500 text-[10px] uppercase tracking-widest border-b border-gray-200 font-bold">
                  <th className="p-4 w-16 text-center">#</th>
                  <th className="p-4">Photo</th>
                  <th className="p-4">Name</th>
                  <th className="p-4">Designation</th>
                  <th className="p-4 text-center">File Size</th>
                  <th className="p-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="text-sm divide-y divide-gray-100">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="text-center py-20 text-gray-400">
                      <Loader className="animate-spin mx-auto mb-2" />
                      <p className="text-xs">Loading Gallery...</p>
                    </td>
                  </tr>
                ) : filteredImages.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="text-center py-20 text-gray-400 italic"
                    >
                      No members found.
                    </td>
                  </tr>
                ) : (
                  filteredImages.map((img, idx) => (
                    <tr
                      key={img._id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="p-4 text-center text-gray-400 font-mono text-xs">
                        {idx + 1}
                      </td>
                      <td className="p-4">
                        <div className="w-10 h-10 rounded-full overflow-hidden border border-gray-200 bg-gray-100">
                          <img
                            src={img.fileUrl}
                            alt={img.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </td>
                      <td className="p-4 font-semibold text-gray-800">
                        {img.name}
                      </td>
                      <td className="p-4">
                        <span className="text-[10px] font-bold px-2 py-1 rounded bg-blue-50 text-blue-700 uppercase tracking-tight">
                          {img.designation}
                        </span>
                      </td>
                      <td className="p-4 text-center text-xs text-gray-500">
                        {formatBytes(img.fileSize)}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-center gap-4">
                          <button
                            onClick={() => setViewTarget(img)}
                            className="text-blue-600 hover:text-blue-800 cursor-pointer"
                          >
                            <Eye size={17} />
                          </button>
                          <button className="text-gray-300 cursor-not-allowed">
                            <SquarePen size={17} />
                          </button>
                          <button
                            onClick={() => handleDelete(img._id, img.name)}
                            className="text-red-500 hover:text-red-700 cursor-pointer"
                          >
                            <Trash2 size={17} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-between items-center">
            <p className="text-[10px] text-gray-400 font-medium">
              Demo Mode: Images are generated via placeholder API
            </p>
            <p className="text-xs text-gray-500">
              Total: {filteredImages.length} Members
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
