"use client";

import React, { useEffect, useRef, useState } from "react";
import { useAddressStore } from "@/store/addressStore";
import { useLogoAboutStore } from "@/store/logoAboutStore";
import { useConfirmDialog } from "@/components/ui/ConfirmDialogContext";
import { useToast } from "@/components/ui/ToastContext";
import { apiClient } from "@/lib/axios-instance";
import { Loader } from "lucide-react";
import CustomLoader from "@/components/ui/CustomLoader";
import { usePageLoader } from "@/hooks/usePageLoader";

// ─── Shared UI ────────────────────────────────────────────────────────────────

function Card({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`bg-white border border-gray-200 rounded-xl p-4 sm:p-5 shadow-sm ${className}`}
    >
      {children}
    </div>
  );
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3">
      {children}
    </h3>
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="block text-[13px] font-semibold text-gray-600 mb-1.5 tracking-wide uppercase">
      {children}
    </label>
  );
}

function UnsavedBadge() {
  return (
    <p className="text-xs text-amber-600 flex items-center gap-1.5">
      <svg
        className="w-3.5 h-3.5 shrink-0"
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path
          fillRule="evenodd"
          d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
          clipRule="evenodd"
        />
      </svg>
      Unsaved changes
    </p>
  );
}

function ErrorAlert({ message }: { message: string }) {
  return (
    <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 px-3 py-2.5 rounded-lg text-xs">
      <svg
        className="w-3.5 h-3.5 mt-0.5 shrink-0"
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path
          fillRule="evenodd"
          d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
          clipRule="evenodd"
        />
      </svg>
      {message}
    </div>
  );
}

const inputCls =
  "w-full border border-gray-200 bg-gray-50 rounded-lg px-3.5 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition";

// ─── Types ────────────────────────────────────────────────────────────────────

interface SectionCounter {
  section: string;
  label: string;
  isInitialized: boolean;
  prefix: string | null;
  year: number | null;
  initialSeq: string | null;
  initialSerial: string | null;
  currentSeq: string | null;
  nextSerial: string | null;
}

interface BackupManifest {
  trigger: string;
  triggeredBy: string;
  timestamp: string;
  backupId: string;
  db: { size: string; success: boolean } | null;
  files: { size: string; success: boolean } | null;
  durationMs: number | null;
  success: boolean;
  error: string | null;
}

interface BackupEntry {
  backupId: string;
  path: string;
  createdAt: string;
  manifest: BackupManifest | null;
}

const TRACKED_SECTIONS = [
  "New-form",
  "Renewal-form",
  "Reciprocal-form",
] as const;
type TrackedSection = (typeof TRACKED_SECTIONS)[number];

const DEFAULT_PREFIXES: Record<TrackedSection, string> = {
  "New-form": "NEW",
  "Renewal-form": "REW",
  "Reciprocal-form": "REC",
};

// ─── SerialCounterCard ────────────────────────────────────────────────────────

function SerialCounterCard({
  counter,
  onSaved,
}: {
  counter: SectionCounter;
  onSaved: () => void;
}) {
  const { showToast } = useToast();
  const { showConfirm } = useConfirmDialog();

  const defaultPrefix =
    DEFAULT_PREFIXES[counter.section as TrackedSection] ?? "APPC";

  const initialForm = {
    prefix: counter.prefix ?? defaultPrefix,
    year: String(counter.year ?? new Date().getFullYear()),
    seq: counter.initialSeq ?? "",
  };

  const [form, setForm] = React.useState(initialForm);
  const [original, setOriginal] = React.useState(initialForm);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState("");

  React.useEffect(() => {
    const next = {
      prefix: counter.prefix ?? defaultPrefix,
      year: String(counter.year ?? new Date().getFullYear()),
      seq: counter.initialSeq ?? "",
    };
    setForm(next);
    setOriginal(next);
  }, [counter]);

  const hasChanges =
    form.prefix.trim() !== original.prefix.trim() ||
    form.year.trim() !== original.year.trim() ||
    form.seq.trim() !== original.seq.trim();

  const preview =
    form.prefix.trim() && form.year.trim() && form.seq.trim()
      ? `${form.prefix.trim().toUpperCase()}-${form.year.trim()}-${form.seq.trim()}`
      : null;

  const handleSave = () => {
    if (!form.seq.trim()) {
      setError("Starting number is required");
      return;
    }
    if (!/^\d+$/.test(form.seq.trim())) {
      setError("Starting number must be digits only");
      return;
    }

    showConfirm(
      async () => {
        setSaving(true);
        await new Promise((res) => setTimeout(res, 600));
        setError("");
        try {
          const payload: Record<string, string | number> = {
            section: counter.section,
            seq: form.seq.trim(),
            year: Number(form.year),
          };
          if (form.prefix.trim())
            payload.prefix = form.prefix.trim().toUpperCase();
          const res = await apiClient.post(
            "/admin/set-serial-counter",
            payload,
          );
          showToast(res.data.message, "success");
          onSaved();
        } catch (err: any) {
          const msg =
            err?.response?.data?.message ?? "Failed to update counter";
          setError(msg);
          showToast(msg, "error");
        } finally {
          setSaving(false);
        }
      },
      `Update serial counter for "${counter.label}"? This affects all future downloads of this form.`,
      "Yes, Update",
      "Cancel",
    );
  };

  return (
    <Card className="space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-gray-800 truncate">
            {counter.label}
          </p>
          <p className="text-[11px] text-gray-400 mt-0.5 font-mono truncate">
            {counter.section}
          </p>
        </div>
        {counter.isInitialized ? (
          <div className="text-right shrink-0">
            <p className="text-[10px] text-gray-400 uppercase tracking-widest">
              Next Serial
            </p>
            <p className="text-sm font-bold text-blue-800 tabular-nums">
              {counter.nextSerial}
            </p>
          </div>
        ) : (
          <span className="shrink-0 text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded bg-amber-50 text-amber-600 border border-amber-200">
            Not set
          </span>
        )}
      </div>

      {/* Status pills */}
      {counter.isInitialized && (
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">
              Initial Serial
            </p>
            <p className="text-xs font-bold text-gray-700 tabular-nums truncate">
              {counter.initialSerial}
            </p>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-lg px-3 py-2">
            <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-0.5">
              Current Serial
            </p>
            <p className="text-xs font-bold text-blue-800 tabular-nums truncate">
              {counter.nextSerial}
            </p>
          </div>
        </div>
      )}

      {error && <ErrorAlert message={error} />}

      {/* Form fields — 2 cols on xs, 3 cols on sm+ */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <div>
          <FieldLabel>Prefix</FieldLabel>
          <input
            type="text"
            value={form.prefix}
            onChange={(e) => {
              setForm((p) => ({ ...p, prefix: e.target.value }));
              setError("");
            }}
            placeholder={defaultPrefix}
            className={inputCls}
          />
          <p className="text-[11px] text-gray-400 mt-1">2–10 chars</p>
        </div>
        <div>
          <FieldLabel>Year</FieldLabel>
          <input
            type="text"
            value={form.year}
            onChange={(e) => {
              const numbersOnly = e.target.value.replace(/\D/g, "").slice(0, 4);

              setForm((p) => ({ ...p, year: numbersOnly }));
              setError("");
            }}
            placeholder={`${new Date().getFullYear()}`}
            className={inputCls}
          />
        </div>
        <div className="col-span-2 sm:col-span-1">
          <FieldLabel>Starting No.</FieldLabel>
          <input
            type="text"
            value={form.seq}
            onChange={(e) => {
              const val = e.target.value.replace(/[^\d]/g, "");
              setForm((p) => ({ ...p, seq: val }));
              setError("");
            }}
            placeholder="0001"
            className={inputCls}
          />
          <p className="text-[11px] text-gray-400 mt-1">Zeros preserved</p>
        </div>
      </div>

      {/* Preview */}
      <div
        className={`border border-dashed rounded-lg px-4 py-3 bg-gray-50 ${preview ? "border-gray-300" : "border-gray-200"}`}
      >
        <p className="text-[11px] text-gray-400 uppercase tracking-widest mb-1">
          Preview
        </p>
        {preview ? (
          <p className="text-base font-bold text-gray-800 tabular-nums tracking-wide break-all">
            {preview}
          </p>
        ) : (
          <p className="text-sm text-gray-400 italic">
            Fill all fields to see preview…
          </p>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between flex-wrap gap-2 pt-3 border-t border-gray-100">
        {hasChanges && !saving ? <UnsavedBadge /> : <span />}
        <button
          onClick={handleSave}
          disabled={!hasChanges || !form.seq.trim() || saving}
          className="inline-flex items-center justify-center gap-2 text-sm font-semibold px-5 py-2.5 rounded-lg bg-blue-900 text-white hover:bg-blue-800 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm cursor-pointer"
        >
          {saving && <Loader className="w-4 h-4 animate-spin" />}
          {saving ? "Saving…" : "Save Counter"}
        </button>
      </div>
    </Card>
  );
}

// ─── SerialCountersSection ────────────────────────────────────────────────────

function SerialCountersSection() {
  const [counters, setCounters] = React.useState<SectionCounter[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");

  const fetchCounters = React.useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await apiClient.get("/admin/get-serial-counter");
      setCounters(res.data.data ?? []);
    } catch {
      setError("Failed to load serial counters");
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchCounters();
  }, [fetchCounters]);

  return (
    <div className="space-y-4">
      <SectionHeading>Form Serial Numbers</SectionHeading>
      {error && <ErrorAlert message={error} />}
      {loading ? (
        <Card className="flex items-center justify-center h-24">
          <Loader className="w-5 h-5 text-gray-300 animate-spin" />
        </Card>
      ) : (
        /* 1 col on mobile, 2 cols on md+ */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {counters.map((counter) => (
            <SerialCounterCard
              key={counter.section}
              counter={counter}
              onSaved={fetchCounters}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── BackupSection ────────────────────────────────────────────────────────────

function BackupSection() {
  const { showConfirm } = useConfirmDialog();
  const { showToast } = useToast();

  const [backups, setBackups] = useState<BackupEntry[]>([]);
  const [listLoading, setListLoading] = useState(false);
  const [runLoading, setRunLoading] = useState(false);
  const [listError, setListError] = useState("");

  const fetchBackups = async () => {
    setListLoading(true);
    await new Promise((res) => setTimeout(res, 600));
    setListError("");
    try {
      const res = await apiClient.get("/backup/list");
      setBackups(res.data.data.backups ?? []);
    } catch (err: any) {
      setListError(err?.response?.data?.message ?? "Failed to fetch backups");
    } finally {
      setListLoading(false);
    }
  };

  useEffect(() => {
    fetchBackups();
  }, []);

  const handleRunBackup = () => {
    showConfirm(
      async () => {
        setRunLoading(true);
        await new Promise((res) => setTimeout(res, 600));
        try {
          const res = await apiClient.post("/backup/run");
          showToast(res.data.message ?? "Backup completed", "success");
          await fetchBackups();
        } catch (err: any) {
          showToast(
            err?.response?.data?.message ?? "Backup failed. Check server logs.",
            "error",
          );
        } finally {
          setRunLoading(false);
        }
      },
      "This will immediately create a full backup of the database and files. Continue?",
      "Yes, Run Backup",
      "Cancel",
    );
  };

  const formatDate = (iso: string) => {
    try {
      return new Date(iso).toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return iso;
    }
  };

  return (
    <div>
      <SectionHeading>Database &amp; File Backups</SectionHeading>
      <div className="space-y-4">
        {/* Run Backup */}
        <Card className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0">
            <svg
              className="w-5 h-5 text-blue-700"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 7v10c0 2 1 3 3 3h10c2 0 3-1 3-3V7M4 7c0-2 1-3 3-3h10c2 0 3 1 3 3M4 7h16M12 11v6m0 0l-2-2m2 2l2-2"
              />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-800">Manual Backup</p>
            <p className="text-xs text-gray-500 mt-0.5">
              Backs up Databases + uploaded files. Auto-backups run every Sunday
              at 2:00 AM.
            </p>
          </div>
          <button
            onClick={handleRunBackup}
            disabled={runLoading}
            className="w-full sm:w-auto shrink-0 inline-flex items-center justify-center gap-2 text-xs font-semibold px-4 py-2.5 rounded-lg bg-blue-900 text-white hover:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-sm cursor-pointer"
          >
            {runLoading ? (
              <>
                <Loader className="w-3.5 h-3.5 animate-spin" /> Running…
              </>
            ) : (
              "Run Now"
            )}
          </button>
        </Card>

        {/* Backup History */}
        <Card className="space-y-3">
          <div className="flex items-center justify-between mb-1">
            <p className="text-sm font-semibold text-gray-800">
              Backup History
            </p>
            <button
              onClick={fetchBackups}
              disabled={listLoading}
              className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-blue-700 transition disabled:opacity-40 cursor-pointer"
            >
              <svg
                className={`w-3.5 h-3.5 ${listLoading ? "animate-spin" : ""}`}
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              Refresh
            </button>
          </div>

          {listError && <ErrorAlert message={listError} />}

          {listLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader className="w-5 h-5 text-gray-300 animate-spin" />
            </div>
          ) : backups.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-2">
                <svg
                  className="w-5 h-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.5}
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                  />
                </svg>
              </div>
              <p className="text-sm text-gray-400">No backups found</p>
              <p className="text-xs text-gray-400 mt-0.5">
                Run your first backup above
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100 -mx-4 sm:-mx-5 px-4 sm:px-5">
              {backups.map((b) => {
                const m = b.manifest;
                const success = m?.success ?? false;
                const isAuto = m?.trigger === "auto";
                return (
                  <div key={b.backupId} className="py-3 flex items-start gap-3">
                    <div className="mt-1 shrink-0">
                      <span
                        className={`inline-block w-2 h-2 rounded-full ${success ? "bg-green-500" : "bg-red-400"}`}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-xs font-semibold text-gray-700 tabular-nums break-all">
                          {b.backupId}
                        </p>
                        <span
                          className={`text-[10px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded ${isAuto ? "bg-gray-100 text-gray-500" : "bg-blue-50 text-blue-600"}`}
                        >
                          {isAuto ? "Auto" : "Manual"}
                        </span>
                        {m?.error && (
                          <span className="text-[10px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded bg-red-50 text-red-500">
                            Failed
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-gray-400 mt-0.5">
                        {m?.timestamp
                          ? formatDate(m.timestamp)
                          : formatDate(b.createdAt)}
                        {m?.triggeredBy && !isAuto && (
                          <span className="ml-1">· by {m.triggeredBy}</span>
                        )}
                      </p>
                      {m?.error && (
                        <p className="text-[11px] text-red-400 mt-0.5 truncate">
                          {m.error}
                        </p>
                      )}
                    </div>
                    {success && (
                      <div className="shrink-0 text-right">
                        <p className="text-[11px] text-gray-500">
                          DB:{" "}
                          <span className="font-semibold text-gray-700">
                            {m?.db?.size ?? "—"}
                          </span>
                        </p>
                        <p className="text-[11px] text-gray-500">
                          Files:{" "}
                          <span className="font-semibold text-gray-700">
                            {m?.files?.size ?? "—"}
                          </span>
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
          <p className="text-[11px] text-gray-400 pt-2 border-t border-gray-100">
            Keeping last 2 backups. Older ones are auto-deleted.
          </p>
        </Card>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function GeneralTab({
  user,
}: {
  user?: { role?: string } | null;
}) {
  const { showToast } = useToast();
  const { showConfirm } = useConfirmDialog();
  const isAdmin = user?.role === "admin" || user?.role === "super-admin";

  const {
    address,
    loading: addressLoading,
    saving: addressSaving,
    error: addressError,
    fetched: addressFetched,
    fetchAddress,
    updateAddress,
    setError: setAddressError,
  } = useAddressStore();

  const {
    about: savedAbout,
    aboutLoading,
    aboutSaving,
    aboutFetched,
    aboutError,
    fetchAbout,
    saveAbout,
    setAboutError,
  } = useLogoAboutStore();

  const [formData, setFormData] = useState({
    officeAddress: "",
    email: "",
    officePhone: "",
  });
  const [originalData, setOriginalData] = useState({
    officeAddress: "",
    email: "",
    officePhone: "",
  });
  const [aboutText, setAboutText] = useState("");
  const [originalAbout, setOriginalAbout] = useState("");

  // Setup Page Loader Hook
  const isInitialLoad = useRef(true);
  const { isLoading: isPageLoading } = usePageLoader([
    isInitialLoad.current ? addressLoading || aboutLoading : false,
  ]);

  useEffect(() => {
    // Only stop the initial loader when both API requests finish fetching
    if (!addressLoading && !aboutLoading && isInitialLoad.current) {
      isInitialLoad.current = false;
    }
  }, [addressLoading, aboutLoading]);

  useEffect(() => {
    if (!addressFetched) fetchAddress();
    if (!aboutFetched) fetchAbout();
  }, []);

  useEffect(() => {
    if (address) {
      const d = {
        officeAddress: address.officeAddress,
        email: address.email,
        officePhone: address.officePhone,
      };
      setFormData(d);
      setOriginalData(d);
    }
  }, [address]);

  useEffect(() => {
    if (savedAbout) {
      setAboutText(savedAbout);
      setOriginalAbout(savedAbout);
    }
  }, [savedAbout]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setAddressError("");
  };

  const hasAddressChanges = Object.keys(formData).some(
    (k) =>
      formData[k as keyof typeof formData].trim() !==
      originalData[k as keyof typeof originalData].trim(),
  );
  const isAddressValid =
    formData.officeAddress.trim() &&
    formData.email.trim() &&
    formData.officePhone.trim();
  const isAddressButtonEnabled =
    hasAddressChanges && isAddressValid && !addressSaving && !addressLoading;

  const handleSaveAddress = () => {
    if (!isAddressValid) {
      setAddressError("All fields are required");
      return;
    }
    showConfirm(
      async () => {
        const result = await updateAddress(formData);
        if (result.success) setOriginalData(formData);
        showToast(result.message, result.success ? "success" : "error");
      },
      "Are you sure you want to update the contact information?",
      "Yes, Save",
      "Cancel",
    );
  };

  const hasAboutChanges = aboutText.trim() !== originalAbout.trim();

  const handleSaveAbout = () => {
    if (!aboutText.trim()) {
      setAboutError("About text is required");
      return;
    }
    showConfirm(
      async () => {
        const result = await saveAbout(aboutText.trim());
        showToast(result.message, result.success ? "success" : "error");
        if (result.success) setOriginalAbout(aboutText.trim());
      },
      "Are you sure you want to update the About section?",
      "Yes, Save",
      "Cancel",
    );
  };

  // Prevent UI rendering until the loader is done
  if (isPageLoading) {
    return <CustomLoader fullPage message="Loading settings..." />;
  }

  return (
    <div className="space-y-7">
      {/* Page header */}
      <div>
        <h2 className="text-lg font-bold text-gray-800 border-b border-gray-100 pb-2">
          General Settings
        </h2>
      </div>

      {addressError && (
        <div className="flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          <svg
            className="w-4 h-4 mt-0.5 shrink-0"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clipRule="evenodd"
            />
          </svg>
          {addressError}
        </div>
      )}

      {/* ── Organization Identity ── */}
      <div>
        <SectionHeading>Organization Identity</SectionHeading>
        <Card>
          <div className="flex items-start justify-between mb-3 gap-2">
            <div className="min-w-0">
              <p className="text-sm font-semibold text-gray-800">
                About Organization
              </p>
              <p className="text-xs text-gray-500 mt-0.5">
                A short description shown on your public profile
              </p>
            </div>
            <span className="text-[11px] text-gray-400 tabular-nums mt-0.5 shrink-0">
              {aboutText.length} chars
            </span>
          </div>
          {aboutError && (
            <p className="text-xs text-red-500 mb-2">{aboutError}</p>
          )}
          {aboutLoading ? (
            <div className="h-28 flex items-center justify-center">
              <Loader className="w-5 h-5 text-gray-300 animate-spin" />
            </div>
          ) : (
            <textarea
              value={aboutText}
              onChange={(e) => {
                setAboutText(e.target.value);
                setAboutError("");
              }}
              placeholder="Write a short description about your organization…"
              rows={4}
              className={`${inputCls} resize-none`}
            />
          )}
          <div className="flex items-center justify-between flex-wrap gap-2 mt-3 pt-3 border-t border-gray-100">
            {hasAboutChanges && !aboutSaving ? <UnsavedBadge /> : <span />}
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setAboutText(originalAbout);
                  setAboutError("");
                }}
                disabled={!hasAboutChanges || aboutSaving}
                className="text-xs font-medium px-4 py-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveAbout}
                disabled={!hasAboutChanges || aboutSaving || aboutLoading}
                className="inline-flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-lg bg-blue-900 text-white hover:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition cursor-pointer"
              >
                {aboutSaving && <Loader className="w-3 h-3 animate-spin" />}
                {aboutSaving ? "Saving…" : "Save"}
              </button>
            </div>
          </div>
        </Card>
      </div>

      {/* ── Contact Details ── */}
      <div>
        <SectionHeading>Contact Details</SectionHeading>
        {addressLoading ? (
          <Card className="flex items-center justify-center h-40">
            <Loader className="w-5 h-5 text-gray-300" />
          </Card>
        ) : (
          <Card>
            {/* 1 col on mobile, 2 cols on md+ */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="md:col-span-2">
                <FieldLabel>Official Address</FieldLabel>
                <textarea
                  rows={3}
                  name="officeAddress"
                  value={formData.officeAddress}
                  onChange={handleInputChange}
                  placeholder="Enter the official office address…"
                  className={`${inputCls} resize-none`}
                />
              </div>
              <div>
                <FieldLabel>Contact Email</FieldLabel>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="contact@organization.org"
                  className={inputCls}
                />
              </div>
              <div>
                <FieldLabel>Contact Phone</FieldLabel>
                <input
                  type="text"
                  name="officePhone"
                  value={formData.officePhone}
                  onChange={(e) => {
                    const numbersOnly = e.target.value
                      .replace(/\D/g, "")
                      .slice(0, 11);

                    setFormData((prev) => ({
                      ...prev,
                      officePhone: numbersOnly,
                    }));
                  }}
                  placeholder="98765 43210"
                  className={inputCls}
                />
              </div>
            </div>
            <div className="flex items-center justify-between flex-wrap gap-2 mt-5 pt-4 border-t border-gray-100">
              {hasAddressChanges && !addressSaving ? (
                <UnsavedBadge />
              ) : (
                <span />
              )}
              <button
                onClick={handleSaveAddress}
                disabled={!isAddressButtonEnabled}
                className="inline-flex items-center gap-2 text-sm font-semibold px-5 py-2.5 rounded-lg bg-blue-900 text-white hover:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-sm cursor-pointer"
              >
                {addressSaving && (
                  <Loader className="w-3.5 h-3.5 animate-spin" />
                )}
                {addressSaving ? "Saving…" : "Save Changes"}
              </button>
            </div>
          </Card>
        )}
      </div>

      {/* ── Admin-only sections ── */}
      {isAdmin && (
        <div className="grid grid-cols-1 gap-6 items-start">
          <SerialCountersSection />
          <BackupSection />
        </div>
      )}
    </div>
  );
}
