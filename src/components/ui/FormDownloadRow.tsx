"use client";

import { useState } from "react";
import { FileText, Download, Loader, AlertTriangle, X } from "lucide-react";
import { apiClient } from "@/lib/axios-instance";
import axios from "axios";

interface PdfItem {
  _id: string;
  title: string;
  section: string;
  fileName: string;
  createdAt: string;
}

const SECTION_LABELS: Record<string, { label: string; color: string }> = {
  "New-form": { label: "New Registration", color: "bg-blue-100 text-blue-800" },
  "Renewal-form": { label: "Renewal", color: "bg-green-100 text-green-800" },
  "Reciprocal-form": {
    label: "Reciprocal",
    color: "bg-purple-100 text-purple-800",
  },
};

const INSTRUCTIONS: (string | React.ReactNode)[] = [
  "Each downloaded form will have a unique Form Number.",
  "Candidates must fill in all required details carefully in the downloaded form.",
  "The application fee must be paid at the time of submitting the hard copy of the form at the department office.",
  <>
    The affidavit must be printed on{" "}
    <span className="font-semibold text-gray-900">
      ₹20 non-judicial stamp paper
    </span>
    , strictly following the prescribed format.
  </>,
];

export function FormDownloadRow({ form }: { form: PdfItem }) {
  const [showModal, setShowModal] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState("");

  const handleDownload = async () => {
    setShowModal(false);
    setDownloading(true);
    setError("");

    try {
      const response = await apiClient.post(
        `/applicant/download/${form._id}`,
        {},
        { responseType: "blob" },
      );

      // In FormDownloadRow.tsx - more robust filename extraction
      const disposition = response.headers["content-disposition"] as
        | string
        | undefined;
      let fileName = form.fileName;
      if (disposition) {
        // Handles both filename="foo.pdf" and filename=foo.pdf
        const match = disposition.match(
          /filename[^;=\n]*=["']?([^"'\n]+)["']?/,
        );
        if (match) fileName = match[1].trim();
      }

      const url = URL.createObjectURL(
        new Blob([response.data], { type: "application/pdf" }),
      );
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err: unknown) {
      console.error("Download failed", err);
      if (axios.isAxiosError(err)) {
        const status = err.response?.status;
        const message = err.response?.data?.message;
        if (status === 401) setError("Please log in to download this form.");
        else if (status === 404) setError("Form not found on server.");
        else
          setError(message ?? `Download failed (${status}). Please try again.`);
      } else {
        setError("Download failed. Please try again.");
      }
    } finally {
      setDownloading(false);
    }
  };

  const badge = SECTION_LABELS[form.section] ?? {
    label: form.section,
    color: "bg-gray-100 text-gray-700",
  };

  return (
    <>
      {/* ── Row ── */}
      <div className="p-4 hover:bg-gray-50 transition">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 text-blue-900">
            <FileText size={18} />
          </div>

          <div className="flex-1 min-w-0">
            {/* Title + Badge Row */}
            <div className="flex items-center justify-start gap-2">
              <p className="text-sm font-medium text-gray-800 truncate">
                {form.title}
              </p>

              <span
                className={`shrink-0 text-xs px-2 py-0.5 rounded-full font-medium ${badge.color}`}
              >
                {badge.label}
              </span>
            </div>

            {/* Date Row */}
            <div className="mt-1">
              <span className="text-xs text-gray-400">
                {new Date(form.createdAt).toLocaleDateString("en-GB", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })}
              </span>
            </div>

            {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
          </div>

          <button
            onClick={() => setShowModal(true)}
            disabled={downloading}
            className="ml-auto shrink-0 flex items-center gap-1.5 text-xs font-medium text-blue-900 border border-blue-200 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {downloading ? (
              <Loader size={13} className="animate-spin" />
            ) : (
              <Download size={13} />
            )}
            {downloading ? "Downloading..." : "Download"}
          </button>
        </div>
      </div>

      {/* ── Instructions Modal ── */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4"
          onClick={(e) => e.target === e.currentTarget && setShowModal(false)}
        >
          <div className="bg-white rounded-xl shadow-2xl border border-gray-200 w-full max-w-md">
            {/* Header */}
            <div className="flex items-start justify-between gap-3 px-6 pt-5 pb-4 border-b border-gray-100">
              <div className="flex items-start gap-3">
                <div className="bg-amber-100 p-2 rounded-lg mt-0.5 shrink-0">
                  <AlertTriangle size={17} className="text-amber-700" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-gray-800 leading-snug">
                    Important Instructions Before Downloading
                  </h2>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Please read carefully before proceeding.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600 transition mt-0.5 shrink-0 cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Instructions */}
            <div className="px-6 py-4">
              <ol className="list-decimal list-outside pl-5 space-y-2.5">
                {INSTRUCTIONS.map((item, i) => (
                  <li key={i} className="text-sm text-gray-700 leading-relaxed">
                    {item}
                  </li>
                ))}
              </ol>
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-3 px-6 py-4 bg-gray-50 rounded-b-xl border-t border-gray-100">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-100 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleDownload}
                className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-blue-900 rounded-lg hover:bg-blue-800 transition cursor-pointer"
              >
                <Download size={14} />
                Download
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
