"use client";

import { useEffect, useCallback, useRef, useState } from "react";
import {
  Plus,
  Search,
  SquarePen,
  Loader,
  AlertCircle,
  X,
  Upload,
  FileText,
  Eye,
  Trash2,
} from "lucide-react";
import { useCertificatesStore, Certificate } from "@/store/pharmacistStore";
import { useToast } from "@/components/ui/ToastContext";
import { useConfirmDialog } from "@/components/ui/ConfirmDialogContext";
import { apiClient } from "@/lib/axios-instance";
import CustomLoader from "@/components/ui/CustomLoader";
import { usePageLoader } from "@/hooks/usePageLoader";

// Helpers
type CertificateStatus = "Active" | "Expired" | "Suspended";

const STATUS_STYLES: Record<CertificateStatus, string> = {
  Active: "bg-green-100 text-green-800 border-green-200",
  Expired: "bg-red-100 text-red-800 border-red-200",
  Suspended: "bg-yellow-100 text-yellow-800 border-yellow-200",
};

const StatusBadge = ({ status }: { status: string }) => (
  <span
    className={`px-2 py-1 rounded text-xs font-bold border ${
      STATUS_STYLES[status as CertificateStatus] ??
      "bg-gray-100 text-gray-700 border-gray-200"
    }`}
  >
    {status}
  </span>
);

const formatDate = (dateStr: string | null | undefined) => {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const toInputDate = (dateStr: string | null | undefined): string => {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? "" : d.toISOString().split("T")[0];
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

const MAX_PAGES = 5;
const getPagesToShow = (current: number, total: number): number[] => {
  if (total <= MAX_PAGES) return Array.from({ length: total }, (_, i) => i + 1);
  const half = Math.floor(MAX_PAGES / 2);
  let start = Math.max(1, current - half);
  const end = Math.min(total, start + MAX_PAGES - 1);
  start = Math.max(1, end - MAX_PAGES + 1);
  return Array.from({ length: end - start + 1 }, (_, i) => start + i);
};

// Type-specific success messages
const ADD_SUCCESS_MESSAGES: Record<"New" | "Renewal" | "Reciprocal", string> = {
  New: "New pharmacist registered successfully!",
  Renewal: "Pharmacist renewed successfully!",
  Reciprocal: "Reciprocal pharmacist added successfully!",
};

const inputCls =
  "w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-900 focus:ring-1 focus:ring-blue-900";
const labelCls = "block text-xs font-semibold text-gray-600 mb-1";

// Add Modal
const AddCertificateModal = () => {
  const {
    addForm,
    isSaving,
    updateAddForm,
    closeAddModal,
    addCertificate,
    setError,
  } = useCertificatesStore();
  const { showToast } = useToast();
  const fileRef = useRef<HTMLInputElement>(null);

  const [searchRegNo, setSearchRegNo] = useState("");
  const [isSearchingReg, setIsSearchingReg] = useState(false);
  const [searchRegError, setSearchRegError] = useState<string | null>(null);
  const [prefilledReg, setPrefilledReg] = useState(false);

  const [searchEmail, setSearchEmail] = useState("");
  const [isSearchingEmail, setIsSearchingEmail] = useState(false);
  const [searchEmailError, setSearchEmailError] = useState<string | null>(null);
  const [prefilledEmail, setPrefilledEmail] = useState(false);

  const handleTypeChange = (type: "New" | "Renewal" | "Reciprocal") => {
    updateAddForm({ certificateType: type });
    setSearchRegNo("");
    setSearchRegError(null);
    setPrefilledReg(false);
    setSearchEmail("");
    setSearchEmailError(null);
    setPrefilledEmail(false);
  };

  const handleRegSearch = async () => {
    const trimmed = searchRegNo.trim().toUpperCase();
    if (!trimmed) {
      setSearchRegError("Enter a registration number to search");
      return;
    }
    setIsSearchingReg(true);
    setSearchRegError(null);
    setPrefilledReg(false);
    try {
      const { data } = await apiClient.get(
        `/upload/get-certificate-details/${encodeURIComponent(trimmed)}`,
      );
      const cert = data.data;
      updateAddForm({
        registrationNumber: cert.registrationNumber,
        ownerName: cert.ownerName,
        email: cert.email,
        phoneNumber: cert.phoneNumber,
        degree: cert.degree,
        issueDate: "",
        expiryDate: "",
      });
      setPrefilledReg(true);
    } catch (err: unknown) {
      setSearchRegError(extractErrorMessage(err, "Certificate not found"));
    } finally {
      setIsSearchingReg(false);
    }
  };

  const handleEmailSearch = async () => {
    const trimmed = searchEmail.trim().toLowerCase();
    if (!trimmed) {
      setSearchEmailError("Enter an email to search");
      return;
    }
    setIsSearchingEmail(true);
    setSearchEmailError(null);
    setPrefilledEmail(false);
    try {
      const { data } = await apiClient.get(
        `/global/student-details-with-email`,
        { params: { email: trimmed } },
      );
      const student = data.data;
      updateAddForm({
        ownerName: student.name,
        email: student.email,
        phoneNumber: student.phoneNumber,
        registrationNumber: "",
        issueDate: "",
        expiryDate: "",
      });
      setPrefilledEmail(true);
    } catch (err: unknown) {
      setSearchEmailError(extractErrorMessage(err, "Student not found"));
    } finally {
      setIsSearchingEmail(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 sticky top-0 bg-white z-10">
          <h3 className="text-lg font-serif font-bold text-blue-900">
            Add Pharmacist Details
          </h3>
          <button
            onClick={closeAddModal}
            disabled={isSaving}
            className="text-gray-400 hover:text-gray-600 cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        <div className="px-6 py-5 space-y-4">
          {/* Certificate Type */}
          <div>
            <label className={labelCls}>
              Certificate Type <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-2">
              {(["New", "Reciprocal", "Renewal"] as const).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => handleTypeChange(type)}
                  className={`flex-1 py-2 rounded text-sm font-medium border transition ${
                    addForm.certificateType === type
                      ? "bg-blue-900 text-white border-blue-900"
                      : "bg-white text-gray-600 border-gray-300 hover:border-blue-900 cursor-pointer"
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* Email Search (New + Reciprocal) */}
          {(addForm.certificateType === "New" ||
            addForm.certificateType === "Reciprocal") && (
            <div>
              <label className={labelCls}>
                Search Student by Email{" "}
                <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder="Enter student email to auto-fill…"
                  value={searchEmail}
                  onChange={(e) => {
                    setSearchEmail(e.target.value.toLowerCase());
                    setSearchEmailError(null);
                  }}
                  onKeyDown={(e) => e.key === "Enter" && handleEmailSearch()}
                  className={`${inputCls} flex-1`}
                />
                <button
                  type="button"
                  onClick={handleEmailSearch}
                  disabled={isSearchingEmail}
                  className="flex items-center gap-1.5 px-3 py-2 text-sm bg-blue-900 text-white rounded hover:bg-blue-800 transition disabled:opacity-60 whitespace-nowrap cursor-pointer"
                >
                  {isSearchingEmail ? (
                    <Loader size={14} className="animate-spin" />
                  ) : (
                    <Search size={14} />
                  )}
                  {isSearchingEmail ? "Searching…" : "Search"}
                </button>
              </div>
              {searchEmailError && (
                <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                  <AlertCircle size={11} /> {searchEmailError}
                </p>
              )}
            </div>
          )}

          {/* Reg No Search (Renewal only) */}
          {addForm.certificateType === "Renewal" && (
            <div>
              <label className={labelCls}>
                Search Previous Record <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Enter reg. no. to search…"
                  value={searchRegNo}
                  onChange={(e) => {
                    setSearchRegNo(e.target.value);
                    setSearchRegError(null);
                  }}
                  onKeyDown={(e) => e.key === "Enter" && handleRegSearch()}
                  className={`${inputCls} flex-1`}
                />
                <button
                  type="button"
                  onClick={handleRegSearch}
                  disabled={isSearchingReg}
                  className="flex items-center gap-1.5 px-3 py-2 text-sm bg-blue-900 text-white rounded hover:bg-blue-800 transition disabled:opacity-60 whitespace-nowrap cursor-pointer"
                >
                  {isSearchingReg ? (
                    <Loader size={14} className="animate-spin" />
                  ) : (
                    <Search size={14} />
                  )}
                  {isSearchingReg ? "Searching…" : "Search"}
                </button>
              </div>
              {searchRegError && (
                <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                  <AlertCircle size={11} /> {searchRegError}
                </p>
              )}
            </div>
          )}

          {/* Registration Number */}
          <div>
            <label className={labelCls}>
              Registration Number <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. APPC/2024/001"
              value={addForm.registrationNumber}
              onChange={(e) =>
                updateAddForm({ registrationNumber: e.target.value })
              }
              className={inputCls}
            />
          </div>

          {(prefilledReg || prefilledEmail) && (
            <div className="flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-2.5 text-xs text-blue-700">
              <AlertCircle size={13} className="shrink-0" />
              Fields pre-filled from{" "}
              {prefilledReg ? "the previous registration" : "student account"}.
              Review and update before saving.
            </div>
          )}

          {/* Name + Email */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>
                Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="Full name"
                value={addForm.ownerName}
                onChange={(e) => {
                  const val = e.target.value
                    .replace(/[^a-zA-Z ]/g, "")
                    .toLowerCase()
                    .replace(/\b\w/g, (char) => char.toUpperCase());
                  updateAddForm({ ownerName: val });
                }}
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                placeholder="e.g. email@example.com"
                value={addForm.email}
                onChange={(e) =>
                  updateAddForm({ email: e.target.value.toLowerCase() })
                }
                onBlur={(e) => updateAddForm({ email: e.target.value.trim() })}
                className={inputCls}
              />
            </div>
          </div>

          {/* Phone + Degree */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>
                Phone Number <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                placeholder="e.g. 954XX XXX89"
                value={addForm.phoneNumber}
                onChange={(e) => {
                  const digits = e.target.value.replace(/\D/g, "").slice(0, 10);
                  if (digits.length === 1 && !/[6-9]/.test(digits)) return;
                  updateAddForm({ phoneNumber: digits });
                }}
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>
                Degree <span className="text-red-500">*</span>
              </label>
              <select
                value={addForm.degree}
                onChange={(e) => updateAddForm({ degree: e.target.value })}
                className={inputCls}
              >
                <option value="">Select qualification</option>
                <option value="D.Pharm">D.Pharm</option>
                <option value="B.Pharm">B.Pharm</option>
                <option value="Pharm.D">Pharm.D</option>
              </select>
            </div>
          </div>

          {/* Issue + Expiry */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>
                Issue Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={addForm.issueDate}
                onChange={(e) => updateAddForm({ issueDate: e.target.value })}
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>Expiry Date</label>
              <input
                type="date"
                value={addForm.expiryDate}
                onChange={(e) => updateAddForm({ expiryDate: e.target.value })}
                className={inputCls}
              />
            </div>
          </div>

          {/* Remarks */}
          <div>
            <label className={labelCls}>Remarks</label>
            <textarea
              rows={2}
              placeholder="Optional notes..."
              value={addForm.remarks}
              onChange={(e) => updateAddForm({ remarks: e.target.value })}
              className={`${inputCls} resize-none`}
            />
          </div>

          {/* PDF Upload */}
          <div>
            <label className={labelCls}>
              Certificate PDF <span className="text-red-500">*</span>
            </label>
            <div
              onClick={() => fileRef.current?.click()}
              className={`flex items-center gap-3 border-2 border-dashed rounded-lg px-4 py-4 cursor-pointer transition ${
                addForm.certificate
                  ? "border-green-400 bg-green-50"
                  : "border-gray-300 hover:border-blue-900 hover:bg-blue-50"
              }`}
            >
              {addForm.certificate ? (
                <>
                  <FileText size={20} className="text-green-600 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-green-700 truncate">
                      {addForm.certificate.name}
                    </p>
                    <p className="text-xs text-green-600">
                      {(addForm.certificate.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      updateAddForm({ certificate: null });
                      if (fileRef.current) fileRef.current.value = "";
                    }}
                    className="text-gray-400 hover:text-red-500"
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
                updateAddForm({ certificate: f });
                setError(null);
              }}
            />
          </div>
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
              // Capture the type BEFORE addCertificate() clears the form
              const certType = addForm.certificateType as
                | "New"
                | "Renewal"
                | "Reciprocal";
              try {
                await addCertificate();
                showToast(
                  ADD_SUCCESS_MESSAGES[certType] ??
                    "Pharmacist registered successfully!",
                  "success",
                );
              } catch (err: unknown) {
                showToast(
                  extractErrorMessage(
                    err,
                    "Failed to register pharmacist. Please try again.",
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
              <>Save</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

// Edit Modal
interface EditForm {
  ownerName: string;
  email: string;
  phoneNumber: string;
  issueDate: string;
  expiryDate: string;
  status: string;
  remarks: string;
  certificate: File | null;
}

const EditCertificateModal = ({ cert }: { cert: Certificate }) => {
  const { updateCertificate, closeEditModal } = useCertificatesStore();
  const { showToast } = useToast();

  const [form, setForm] = useState<EditForm>({
    ownerName: cert.ownerName,
    email: cert.email,
    phoneNumber: cert.phoneNumber,
    issueDate: toInputDate(cert.issueDate),
    expiryDate: toInputDate(cert.expiryDate),
    status: cert.status,
    remarks: cert.remarks ?? "",
    certificate: null,
  });
  const [saving, setSaving] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const patch = (p: Partial<EditForm>) =>
    setForm((prev) => ({ ...prev, ...p }));

  const handleSubmit = async () => {
    if (
      !form.ownerName.trim() ||
      !form.email.trim() ||
      !form.phoneNumber.trim() ||
      !form.issueDate
    ) {
      showToast(
        "Owner name, email, phone and issue date are required.",
        "error",
      );
      return;
    }

    setSaving(true);
    try {
      const fd = new FormData();
      fd.append("ownerName", form.ownerName.trim());
      fd.append("email", form.email.trim().toLowerCase());
      fd.append("phoneNumber", form.phoneNumber.trim());
      fd.append("issueDate", form.issueDate);
      fd.append("expiryDate", form.expiryDate ?? "");
      fd.append("status", form.status);
      fd.append("remarks", form.remarks.trim());
      if (form.certificate) fd.append("certificate", form.certificate);

      await updateCertificate(cert._id, fd);
      showToast("Pharmacist updated successfully!", "success");
    } catch (err: unknown) {
      showToast(
        extractErrorMessage(
          err,
          "Failed to update certificate. Please try again.",
        ),
        "error",
      );
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 sticky top-0 bg-white z-10">
          <h3 className="text-lg font-serif font-bold text-blue-900">
            Edit Certificate
          </h3>
          <button
            onClick={closeEditModal}
            disabled={saving}
            className="text-gray-400 hover:text-gray-600 cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        <div className="px-6 py-5 space-y-4">
          <div className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 grid grid-cols-2 gap-x-6 gap-y-1">
            <div>
              <p className="text-[10px] text-gray-400 uppercase tracking-wide">
                Reg No.
              </p>
              <p className="text-xs font-mono font-bold text-gray-700">
                {cert.registrationNumber}
              </p>
            </div>
            <div>
              <p className="text-[10px] text-gray-400 uppercase tracking-wide">
                Certificate Type
              </p>
              <p className="text-xs font-semibold text-gray-700">
                {cert.certificateType}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>
                Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.ownerName}
                onChange={(e) =>
                  patch({
                    ownerName: e.target.value
                      .replace(/[^a-zA-Z ]/g, "")
                      .toLowerCase()
                      .replace(/\b\w/g, (char) => char.toUpperCase()),
                  })
                }
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>
                Phone Number <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                value={form.phoneNumber}
                onChange={(e) => {
                  const digits = e.target.value.replace(/\D/g, "").slice(0, 10);
                  if (digits.length === 1 && !/[6-9]/.test(digits)) return;
                  patch({ phoneNumber: digits });
                }}
                className={inputCls}
              />
            </div>
          </div>

          <div>
            <label className={labelCls}>
              Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => patch({ email: e.target.value.toLowerCase() })}
              className={inputCls}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>
                Issue Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={form.issueDate}
                onChange={(e) => patch({ issueDate: e.target.value })}
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>
                Expiry Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={form.expiryDate}
                onChange={(e) => patch({ expiryDate: e.target.value })}
                className={inputCls}
              />
            </div>
          </div>

          <div>
            <label className={labelCls}>Status</label>
            <select
              value={form.status}
              onChange={(e) => patch({ status: e.target.value })}
              className={inputCls}
            >
              <option value="Active">Active</option>
              <option value="Expired">Expired</option>
              <option value="Suspended">Suspended</option>
            </select>
          </div>

          <div>
            <label className={labelCls}>Remarks</label>
            <textarea
              rows={2}
              placeholder="Optional notes..."
              value={form.remarks}
              onChange={(e) => patch({ remarks: e.target.value })}
              className={`${inputCls} resize-none`}
            />
          </div>

          <div>
            <label className={labelCls}>
              Replace Certificate PDF{" "}
              <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            {cert.fileUrl && !form.certificate && (
              <a
                href={cert.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs text-blue-700 hover:underline mb-2"
              >
                <Eye size={11} /> View current certificate
              </a>
            )}
            <div
              onClick={() => fileRef.current?.click()}
              className={`flex items-center gap-3 border-2 border-dashed rounded-lg px-4 py-3 cursor-pointer transition ${
                form.certificate
                  ? "border-green-400 bg-green-50"
                  : "border-gray-200 hover:border-blue-900 hover:bg-blue-50"
              }`}
            >
              {form.certificate ? (
                <>
                  <FileText size={18} className="text-green-600 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-green-700 truncate">
                      {form.certificate.name}
                    </p>
                    <p className="text-xs text-green-600">
                      {(form.certificate.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      patch({ certificate: null });
                      if (fileRef.current) fileRef.current.value = "";
                    }}
                    className="text-gray-400 hover:text-red-500"
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
                  showToast("Only PDF files are allowed.", "error");
                  return;
                }
                patch({ certificate: f });
              }}
            />
          </div>
          <p className="text-red-500 text-xs">
            Fields marked with an asterisk (*) are required.
          </p>
        </div>

        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50 sticky bottom-0">
          <button
            onClick={closeEditModal}
            disabled={saving}
            className="px-4 py-2 text-sm border border-gray-300 rounded hover:bg-gray-100 transition disabled:opacity-50 cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2 text-sm bg-blue-900 text-white rounded hover:bg-blue-800 transition disabled:opacity-60 cursor-pointer"
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

// View Details Modal

const ViewDetailsModal = ({
  cert,
  onClose,
}: {
  cert: Certificate;
  onClose: () => void;
}) => {
  const Row = ({ label, value }: { label: string; value: string }) => (
    <div className="flex justify-between py-2 border-b border-gray-100 last:border-0">
      <span className="text-xs text-gray-500 font-medium">{label}</span>
      <span className="text-xs text-gray-800 font-semibold text-right max-w-[55%] break-all">
        {value}
      </span>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-serif font-bold text-blue-900">
            Certificate Details
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>
        <div className="px-6 py-4">
          <Row label="Registration No." value={cert.registrationNumber} />
          <Row label="Owner Name" value={cert.ownerName} />
          <Row label="Email" value={cert.email} />
          <Row label="Phone" value={cert.phoneNumber} />
          <Row label="Degree" value={cert.degree} />
          <Row label="Certificate Type" value={cert.certificateType} />
          <Row label="Issue Date" value={formatDate(cert.issueDate)} />
          <Row label="Expiry Date" value={formatDate(cert.expiryDate)} />
          <Row label="Status" value={cert.status} />
          {cert.remarks && <Row label="Remarks" value={cert.remarks} />}
        </div>
        <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50 rounded-b-xl">
          {cert.fileUrl && (
            <a
              href={cert.fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={onClose}
              className="flex items-center gap-2 px-4 py-2 text-sm bg-blue-900 text-white rounded hover:bg-blue-800 transition"
            >
              <FileText size={14} /> View Certificate
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

// Main Page
export default function PharmacistsPage() {
  const {
    certificates,
    pagination,
    loading,
    error,
    search,
    selectedStatus,
    selectedType,
    currentPage,
    isAdding,
    isEditing,
    editTarget,
    isDeleting,
    fetchCertificates,
    setSearch,
    setSelectedStatus,
    setSelectedType,
    setCurrentPage,
    openAddModal,
    openEditModal,
    deleteCertificate,
    setError,
  } = useCertificatesStore();

  const { showToast } = useToast();
  const { showConfirm } = useConfirmDialog();

  const [viewTarget, setViewTarget] = useState<Certificate | null>(null);

  const [localSearch, setLocalSearch] = useState(search);
  const [isTableLoading, setIsTableLoading] = useState(true);

  const isInitialLoad = useRef(true);
  const { isLoading: isPageLoading } = usePageLoader([
    isInitialLoad.current ? loading : false,
  ]);

  const TYPE_BADGE: Record<string, string> = {
    New: "bg-blue-100 text-blue-800",
    Renewal: "bg-purple-100 text-purple-800",
    Reciprocal: "bg-teal-100 text-teal-800",
  };

  const TYPE_LABEL: Record<string, string> = {
    New: "New",
    Renewal: "Renewed",
    Reciprocal: "Reciprocal",
  };

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
    fetchCertificates();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, selectedStatus, selectedType, currentPage]);

  useEffect(() => {
    if (!loading && isInitialLoad.current) {
      isInitialLoad.current = false;
    }
  }, [loading]);

  useEffect(() => {
    if (loading) {
      setIsTableLoading(true);
    } else {
      const timer = setTimeout(() => {
        setIsTableLoading(false);
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [loading]);

  useEffect(() => {
    if (error) {
      showToast(error, "error");
      setError(null);
    }
  }, [error, showToast, setError]);

  useEffect(() => {
    return () => {
      setSearch("");
      setSelectedType("All Types");
      setSelectedStatus("All Statuses");
      setCurrentPage(1);
    };
  }, [setSearch, setSelectedType, setSelectedStatus, setCurrentPage]);

  const handleDelete = useCallback(
    async (id: string) => {
      showConfirm(
        async () => {
          try {
            await deleteCertificate(id);
            showToast("Pharmacist deleted successfully!", "success");
          } catch (err: unknown) {
            showToast(
              extractErrorMessage(
                err,
                "Failed to delete certificate. Please try again.",
              ),
              "error",
            );
          }
        },
        "Delete this certificate? This action cannot be undone.",
        "Delete",
        "Cancel",
      );
    },
    [deleteCertificate, showConfirm, showToast],
  );

  if (isPageLoading) {
    return <CustomLoader fullPage message="Loading pharmacist records..." />;
  }

  const pages = getPagesToShow(currentPage, pagination.totalPages);
  const startEntry =
    certificates.length === 0 ? 0 : (currentPage - 1) * pagination.limit + 1;
  const endEntry = Math.min(currentPage * pagination.limit, pagination.total);

  if (loading) {
    return <CustomLoader fullPage message="Loading pharmacists..." />;
  }

  return (
    <>
      {isAdding && <AddCertificateModal />}
      {isEditing && editTarget && <EditCertificateModal cert={editTarget} />}
      {viewTarget && (
        <ViewDetailsModal
          cert={viewTarget}
          onClose={() => setViewTarget(null)}
        />
      )}

      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-serif font-bold text-blue-900">
              Manage Pharmacist
            </h2>
            <p className="text-sm text-gray-600 mt-1 max-w">
              Add, update, and manage pharmacist records including registration,
              reciprocal registration, and renewal details.
            </p>
          </div>
          <button
            onClick={openAddModal}
            className="bg-blue-900 text-white px-4 py-2 rounded shadow-sm hover:bg-blue-800 transition flex items-center gap-2 text-sm cursor-pointer"
          >
            <Plus size={18} /> Add Pharmacist
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 flex flex-wrap gap-4 items-center">
          <div className="flex-1 min-w-62.5 relative">
            <Search className="absolute left-3 top-2.5 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search by Registration No. or Name..."
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              className="w-full pl-10 p-2 border border-gray-300 rounded text-sm focus:outline-none focus:border-blue-900 focus:ring-1 focus:ring-blue-900"
            />
          </div>

          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="border border-gray-300 rounded px-4 py-2 text-sm focus:outline-none focus:border-blue-900 focus:ring-1 focus:ring-blue-900"
          >
            <option>All Types</option>
            <option value="New">New</option>
            <option value="Renewal">Renewal</option>
            <option value="Reciprocal">Reciprocal</option>
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="border border-gray-300 rounded px-4 py-2 text-sm focus:outline-none focus:border-blue-900 focus:ring-1 focus:ring-blue-900"
          >
            <option>All Statuses</option>
            <option>Active</option>
            <option>Expired</option>
            <option>Suspended</option>
          </select>

          <button
            onClick={() => {
              setSearch("");
              setLocalSearch("");
              setSelectedType("All Types");
              setSelectedStatus("All Statuses");
              setCurrentPage(1);
            }}
            className="px-4 py-2 text-sm border bg-red-600 text-white rounded hover:bg-red-700 transition cursor-pointer flex items-center gap-2"
          >
            <X size={14} />
            Clear
          </button>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider border-b border-gray-200">
                  <th className="p-4 text-center">Sl. No.</th>
                  <th className="p-4">Reg No.</th>
                  <th className="p-4">Name</th>
                  <th className="p-4">Degree</th>
                  <th className="p-4">Type</th>
                  <th className="p-4">Issue By</th>
                  <th className="p-4">Issue Date</th>
                  <th className="p-4">Expiry Date</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="text-sm divide-y divide-gray-100">
                {isTableLoading && (
                  <tr>
                    <td colSpan={9} className="text-center py-14 text-gray-500">
                      <div className="flex flex-col items-center gap-2">
                        <Loader
                          size={32}
                          className="animate-spin text-blue-900"
                        />
                        <p className="font-medium text-sm">Loading data...</p>
                      </div>
                    </td>
                  </tr>
                )}

                {!isTableLoading &&
                  certificates.map((cert, index) => (
                    <tr key={cert._id} className="hover:bg-gray-50">
                      <td className="p-4 text-xs text-gray-500 text-center">
                        {(currentPage - 1) * pagination.limit + index + 1}
                      </td>
                      <td className="p-4 font-mono text-xs font-bold text-gray-600">
                        {cert.registrationNumber}
                      </td>
                      <td className="p-4 font-medium">{cert.ownerName}</td>
                      <td className="p-4 text-gray-600">{cert.degree}</td>
                      <td className="p-4">
                        <span
                          className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                            TYPE_BADGE[cert.certificateType] ??
                            "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {TYPE_LABEL[cert.certificateType] ??
                            cert.certificateType}
                        </span>
                      </td>
                      <td className="p-4">
                        {cert?.uploadedBy?.name ?? "N/A"}
                      </td>
                      <td className="p-4 text-xs text-gray-500">
                        {formatDate(cert.issueDate)}
                      </td>
                      <td className="p-4 text-xs text-gray-500">
                        {formatDate(cert.expiryDate)}
                      </td>
                      <td className="p-4">
                        <StatusBadge status={cert.status} />
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-center gap-3">
                          <button
                            onClick={() => setViewTarget(cert)}
                            className="text-blue-700 hover:text-blue-800 transition-colors cursor-pointer"
                            title="View Details"
                          >
                            <Eye size={17} />
                          </button>
                          <button
                            onClick={() => openEditModal(cert)}
                            className="text-green-600 hover:text-green-700 transition-colors cursor-pointer"
                            title="Edit Certificate"
                          >
                            <SquarePen size={17} />
                          </button>
                          <button
                            onClick={() => handleDelete(cert._id)}
                            disabled={isDeleting === cert._id}
                            className="text-red-500 hover:text-red-600 transition-colors disabled:opacity-40 cursor-pointer"
                            title="Delete"
                          >
                            {isDeleting === cert._id ? (
                              <Loader size={15} className="animate-spin" />
                            ) : (
                              <Trash2 size={15} />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}

                {!isTableLoading && certificates.length === 0 && (
                  <tr>
                    <td colSpan={9} className="text-center py-14 text-gray-400">
                      <div className="flex flex-col items-center gap-2">
                        <Search size={32} className="opacity-25" />
                        <p className="font-medium">No certificates found.</p>
                        <p className="text-xs">
                          Try adjusting filters or add a new pharmacist.
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
                : `Showing ${startEntry}–${endEntry} of ${pagination.total} entries`}
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
                    className="px-3 py-1 border rounded border-gray-300 text-gray-600 text-sm"
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
                  className={`px-3 py-1 border rounded text-sm ${
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
                    className="px-3 py-1 border rounded border-gray-300 text-gray-600 text-sm"
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
