"use client";

import { useState } from "react";
import { Download, HardDriveDownload } from "lucide-react";
import dynamic from "next/dynamic";
import type { ViewType } from "@/utils/types";

const CustomOffcanvas = dynamic(
  () =>
    import("@/components/layout/custom-canvas").then(
      (mod) => mod.CustomOffcanvas,
    ),
  { ssr: false },
);

interface PdfItem {
  _id: string;
  title: string;
  section: string;
  fileUrl: string;
  fileName: string;
  createdAt: string;
}

// --- DEMO DATA ---
const DEMO_FORMS: PdfItem[] = [
  {
    _id: "form-1",
    title: "Application Form for New Pharmacist Registration",
    section: "New-form",
    fileUrl: "#",
    fileName: "new-registration-form.pdf",
    createdAt: "2024-01-01T10:00:00Z",
  },
  {
    _id: "form-2",
    title: "Pharmacist License Renewal Application",
    section: "Renewal-form",
    fileUrl: "#",
    fileName: "renewal-form.pdf",
    createdAt: "2024-02-15T10:00:00Z",
  },
  {
    _id: "form-3",
    title: "Reciprocal Registration Transfer Form",
    section: "Reciprocal-form",
    fileUrl: "#",
    fileName: "reciprocal-form.pdf",
    createdAt: "2024-03-10T10:00:00Z",
  },
  {
    _id: "form-4",
    title: "Good Standing Certificate Request",
    section: "Other",
    fileUrl: "#",
    fileName: "good-standing-cert.pdf",
    createdAt: "2024-04-20T10:00:00Z",
  },
];
// -----------------

export default function DownloadSection() {
  // Mock logged-in state for the demo (avoids triggering the login sidebar)
  const token = "demo-token";

  // Replace API state with demo data
  const forms = DEMO_FORMS;
  const loadingForms = false;

  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [errorId, setErrorId] = useState<string | null>(null);

  // ── Sidebar state ──
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarView, setSidebarView] = useState<ViewType>("applicant-login");

  const handleDownload = (form: PdfItem) => {
    if (!token) {
      setSidebarView("applicant-login");
      setSidebarOpen(true);
      return;
    }
    triggerDownload(form);
  };

  const triggerDownload = (form: PdfItem) => {
    setDownloadingId(form._id);
    setErrorId(null);

    // Simulate a network request for the PDF download
    setTimeout(() => {
      setDownloadingId(null);
      alert(`Demo: Successfully downloaded "${form.fileName}"`);
    }, 1000);
  };

  return (
    <>
      <section className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-blue-900 text-white p-4">
          <h2 className="text-lg font-serif flex font-bold items-center">
            <HardDriveDownload className="mr-2" size={20} />
            Important Downloads
          </h2>
        </div>

        <div className="p-0">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-gray-100 text-gray-700">
                <th className="p-3 border-b border-gray-200 w-12 text-center">
                  S.No
                </th>
                <th className="p-3 border-b border-gray-200">Form Name</th>
                <th className="p-3 border-b border-gray-200 w-20 text-center">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {loadingForms ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <tr key={i} className="border-b border-gray-100">
                    <td className="p-3 text-center text-gray-300">{i + 1}</td>
                    <td className="p-3">
                      <div className="h-4 bg-gray-100 rounded animate-pulse w-48" />
                    </td>
                    <td className="p-3 text-center">
                      <div className="h-5 w-5 bg-gray-100 rounded animate-pulse mx-auto" />
                    </td>
                  </tr>
                ))
              ) : forms.length === 0 ? (
                <tr>
                  <td
                    colSpan={3}
                    className="p-6 text-center text-sm text-gray-400"
                  >
                    No forms available at the moment
                  </td>
                </tr>
              ) : (
                forms.map((form, idx) => (
                  <tr
                    key={form._id}
                    className="border-b border-gray-200 hover:bg-gray-50 transition"
                  >
                    <td className="p-3 text-center text-gray-500">{idx + 1}</td>
                    <td className="p-3">
                      <div className="flex items-center justify-start gap-2">
                        <p className="font-medium text-gray-800 truncate">
                          {form.title}
                        </p>
                        <span
                          className={`shrink-0 inline-block text-xs font-medium px-2 py-0.5 rounded-full ${
                            form.section === "New-form"
                              ? "bg-blue-50 text-blue-700 border border-blue-100"
                              : form.section === "Renewal-form"
                                ? "bg-green-50 text-green-700 border border-green-100"
                                : form.section === "Reciprocal-form"
                                  ? "bg-purple-50 text-purple-700 border border-purple-100"
                                  : "bg-gray-100 text-gray-600 border border-gray-200"
                          }`}
                        >
                          {form.section === "New-form"
                            ? "New Registration"
                            : form.section === "Renewal-form"
                              ? "Renewal"
                              : form.section === "Reciprocal-form"
                                ? "Reciprocal"
                                : form.section}
                        </span>
                      </div>
                      {errorId === form._id && (
                        <p className="text-xs text-red-500 mt-1">
                          Download failed. Please try again.
                        </p>
                      )}
                    </td>
                    <td className="p-3 text-center">
                      <button
                        onClick={() => handleDownload(form)}
                        disabled={downloadingId === form._id}
                        title={token ? "Download" : "Login to download"}
                        className="text-red-800 hover:text-red-700 transition inline-flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                      >
                        {downloadingId === form._id ? (
                          <div className="animate-spin h-5 w-5 border-2 border-red-800 border-t-transparent rounded-full" />
                        ) : (
                          <Download size={20} />
                        )}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* ── Sidebar opens instead of popup ── */}
      <CustomOffcanvas
        open={sidebarOpen}
        onOpenChange={setSidebarOpen}
        initialView={sidebarView}
      />
    </>
  );
}
