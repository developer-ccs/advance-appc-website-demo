"use client";

import React, { useEffect, useState } from "react";
import { useConfirmDialog } from "@/components/ui/ConfirmDialogContext";
import { useToast } from "@/components/ui/ToastContext";
import { Loader } from "lucide-react";

// ─── Mock Data for Demo ──────────────────────────────────────────────────────

const MOCK_COUNTERS = [
  {
    section: "New-form",
    label: "New Membership Application",
    isInitialized: true,
    prefix: "NEW",
    year: 2024,
    initialSeq: "0001",
    initialSerial: "NEW-2024-0001",
    currentSeq: "0142",
    nextSerial: "NEW-2024-0143",
  },
  {
    section: "Renewal-form",
    label: "Annual Renewal",
    isInitialized: true,
    prefix: "REW",
    year: 2024,
    initialSeq: "1001",
    initialSerial: "REW-2024-1001",
    currentSeq: "1050",
    nextSerial: "REW-2024-1051",
  },
];

const MOCK_BACKUPS = [
  {
    backupId: "backup_2024_05_15_0200",
    path: "/backups/1.zip",
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    manifest: {
      trigger: "auto",
      triggeredBy: "system",
      timestamp: new Date(Date.now() - 86400000 * 2).toISOString(),
      backupId: "backup_2024_05_15_0200",
      db: { size: "12.4 MB", success: true },
      files: { size: "450 MB", success: true },
      success: true,
      error: null,
    },
  },
];

// ─── Shared UI (Same as original) ──────────────────────────────────────────

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

const inputCls =
  "w-full border border-gray-200 bg-gray-50 rounded-lg px-3.5 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition";

// ─── SerialCounterCard (Demo Version) ────────────────────────────────────────

function SerialCounterCard({ counter }: { counter: any }) {
  const { showToast } = useToast();
  const { showConfirm } = useConfirmDialog();

  const [form, setForm] = useState({
    prefix: counter.prefix,
    year: String(counter.year),
    seq: counter.initialSeq,
  });
  const [saving, setSaving] = useState(false);

  const handleSave = () => {
    showConfirm(
      async () => {
        setSaving(true);
        await new Promise((res) => setTimeout(res, 800));
        setSaving(false);
        showToast("Counter updated successfully (Demo)", "success");
      },
      "Update serial counter? (Demo Mode)",
      "Yes, Update",
      "Cancel",
    );
  };

  return (
    <Card className="space-y-4">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-sm font-semibold text-gray-800">{counter.label}</p>
          <p className="text-[11px] text-gray-400 mt-0.5 font-mono">
            {counter.section}
          </p>
        </div>
        <div className="text-right">
          <p className="text-[10px] text-gray-400 uppercase tracking-widest">
            Next Serial
          </p>
          <p className="text-sm font-bold text-blue-800">
            {counter.nextSerial}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div>
          <FieldLabel>Prefix</FieldLabel>
          <input
            type="text"
            value={form.prefix}
            onChange={(e) => setForm({ ...form, prefix: e.target.value })}
            className={inputCls}
          />
        </div>
        <div>
          <FieldLabel>Year</FieldLabel>
          <input
            type="text"
            value={form.year}
            onChange={(e) => setForm({ ...form, year: e.target.value })}
            className={inputCls}
          />
        </div>
        <div>
          <FieldLabel>Start No.</FieldLabel>
          <input
            type="text"
            value={form.seq}
            onChange={(e) => setForm({ ...form, seq: e.target.value })}
            className={inputCls}
          />
        </div>
      </div>

      <button
        onClick={handleSave}
        disabled={saving}
        className="w-full inline-flex items-center justify-center gap-2 text-xs font-semibold px-4 py-2 rounded-lg bg-blue-900 text-white hover:bg-blue-800 transition cursor-pointer"
      >
        {saving ? (
          <Loader className="w-3.5 h-3.5 animate-spin" />
        ) : (
          "Update Counter"
        )}
      </button>
    </Card>
  );
}

// ─── BackupSection (Demo Version) ────────────────────────────────────────────

function BackupSection() {
  const { showConfirm } = useConfirmDialog();
  const { showToast } = useToast();
  const [runLoading, setRunLoading] = useState(false);

  const handleRunBackup = () => {
    showConfirm(
      async () => {
        setRunLoading(true);
        await new Promise((res) => setTimeout(res, 1500));
        setRunLoading(false);
        showToast("Backup simulated successfully!", "success");
      },
      "Run full system backup? (Demo Mode)",
      "Run Now",
      "Cancel",
    );
  };

  return (
    <div>
      <SectionHeading>Database & File Backups</SectionHeading>
      <div className="space-y-4">
        <Card className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
            <svg
              className="w-5 h-5 text-blue-700"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 7v10c0 2 1 3 3 3h10c2 0 3-1 3-3V7M4 7c0-2 1-3 3-3h10c2 0 3 1 3 3M4 7h16M12 11v6m0 0l-2-2m2 2l2-2"
              />
            </svg>
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-gray-800">Manual Backup</p>
            <p className="text-xs text-gray-500">
              Last successful backup: 2 days ago
            </p>
          </div>
          <button
            onClick={handleRunBackup}
            disabled={runLoading}
            className="shrink-0 text-xs font-semibold px-4 py-2.5 rounded-lg bg-blue-900 text-white cursor-pointer"
          >
            {runLoading ? "Running..." : "Run Now"}
          </button>
        </Card>

        <Card className="space-y-3">
          <p className="text-sm font-semibold text-gray-800">
            Backup History (Demo)
          </p>
          <div className="divide-y divide-gray-100">
            {MOCK_BACKUPS.map((b) => (
              <div
                key={b.backupId}
                className="py-3 flex justify-between items-center"
              >
                <div>
                  <p className="text-xs font-semibold text-gray-700">
                    {b.backupId}
                  </p>
                  <p className="text-[10px] text-gray-400">
                    May 15, 2024 · 02:00 AM · Auto
                  </p>
                </div>
                <span className="text-[10px] font-bold text-green-600 bg-green-50 px-2 py-1 rounded">
                  Success
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

// ─── Main Component (Demo Version) ───────────────────────────────────────────

export default function GeneralTab() {
  const { showToast } = useToast();
  const { showConfirm } = useConfirmDialog();

  const [formData, setFormData] = useState({
    officeAddress:
      "123 Council Chambers, Administrative District, State Capital - 500001",
    email: "admin@council-portal.org",
    officePhone: "04023456789",
  });

  const [aboutText, setAboutText] = useState(
    "The State Council is committed to excellence in professional regulation and public service. This portal serves as the primary gateway for membership management, applications, and professional standards enforcement.",
  );
  const [saving, setSaving] = useState(false);

  const handleSave = (section: string) => {
    showConfirm(
      async () => {
        setSaving(true);
        await new Promise((res) => setTimeout(res, 1000));
        setSaving(false);
        showToast(`${section} updated successfully (Demo)`, "success");
      },
      `Update ${section}?`,
      "Save Changes",
      "Cancel",
    );
  };

  return (
    <div className="space-y-7">
      <div className="flex items-center justify-between border-b border-gray-100 pb-2">
        <h2 className="text-lg font-bold text-gray-800">General Settings</h2>
        <span className="px-2 py-0.5 text-[10px] font-bold bg-amber-100 text-amber-700 rounded uppercase tracking-wider">
          Demo Mode
        </span>
      </div>

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
                Visible on the public portal footer
              </p>
            </div>
          </div>
          <textarea
            value={aboutText}
            onChange={(e) => setAboutText(e.target.value)}
            rows={4}
            className={`${inputCls} resize-none`}
          />
          <div className="flex items-center justify-end mt-3 pt-3 border-t border-gray-100">
            <button
              onClick={() => handleSave("About Section")}
              className="inline-flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-lg bg-blue-900 text-white cursor-pointer hover:bg-blue-800"
            >
              {saving ? (
                <Loader className="w-3 h-3 animate-spin" />
              ) : (
                "Save Description"
              )}
            </button>
          </div>
        </Card>
      </div>

      {/* ── Contact Details ── */}
      <div>
        <SectionHeading>Contact Details</SectionHeading>
        <Card>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="md:col-span-2">
              <FieldLabel>Official Address</FieldLabel>
              <textarea
                rows={2}
                value={formData.officeAddress}
                onChange={(e) =>
                  setFormData({ ...formData, officeAddress: e.target.value })
                }
                className={`${inputCls} resize-none`}
              />
            </div>
            <div>
              <FieldLabel>Contact Email</FieldLabel>
              <input
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className={inputCls}
              />
            </div>
            <div>
              <FieldLabel>Contact Phone</FieldLabel>
              <input
                type="text"
                value={formData.officePhone}
                onChange={(e) =>
                  setFormData({ ...formData, officePhone: e.target.value })
                }
                className={inputCls}
              />
            </div>
          </div>
          <div className="flex items-center justify-end mt-5 pt-4 border-t border-gray-100">
            <button
              onClick={() => handleSave("Contact Info")}
              className="text-sm font-semibold px-5 py-2.5 rounded-lg bg-blue-900 text-white cursor-pointer hover:bg-blue-800"
            >
              Save Contact Details
            </button>
          </div>
        </Card>
      </div>

      {/* ── Admin Sections ── */}
      <div className="grid grid-cols-1 gap-6">
        <div className="space-y-4">
          <SectionHeading>Form Serial Numbers</SectionHeading>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {MOCK_COUNTERS.map((c) => (
              <SerialCounterCard key={c.section} counter={c} />
            ))}
          </div>
        </div>
        <BackupSection />
      </div>
    </div>
  );
}
