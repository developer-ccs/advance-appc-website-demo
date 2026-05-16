"use client";

import { useEffect } from "react";
import {
  Loader,
  Download,
  ExternalLink,
  ShieldX,
  Eye,
  CircleCheck,
} from "lucide-react";
import { useUserProfileStore } from "@/store/userProfileStore";
import { usePdfStore } from "@/store/pdfStore";
import { useCertificateStore } from "@/store/certificateStore";
import { FormDownloadRow } from "@/components/ui/FormDownloadRow";
import { useAuthStore } from "@/store/authStore";

const handleDownload = async (fileUrl: string, fileName: string) => {
  try {
    const response = await fetch(fileUrl);
    const blob = await response.blob();
    const blobUrl = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = blobUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(blobUrl); // clean up memory
  } catch (error) {
    console.error("Download failed:", error);
  }
};

export default function ApplicantDashboard() {
  const { user, loading, fetchUser } = useUserProfileStore();
  const { forms, fetchForms, loadingForms } = usePdfStore();
  const _hasHydrated = useAuthStore((state) => state._hasHydrated);

  const {
    activeCerts,
    history,
    total,
    loading: certLoading,
    fetched,
    fetchCertificate,
  } = useCertificateStore();

  useEffect(() => {
    if (!_hasHydrated) return;
    fetchUser();
  }, [_hasHydrated]);

  useEffect(() => {
    if (!_hasHydrated) return;
    fetchForms();
  }, [_hasHydrated]);

  useEffect(() => {
    if (!_hasHydrated) return;
    fetchCertificate();
  }, [_hasHydrated]);

  return (
    <div className="space-y-6 mx-auto">
      {/* ── Welcome Banner ── */}
      <div className="bg-blue-900 rounded-xl p-6 text-white shadow-md relative overflow-hidden">
        <div className="relative z-10">
          <h2 className="text-2xl font-serif font-bold mb-1">
            Welcome{" "}
            {loading ? (
              <span className="opacity-60">Loading...</span>
            ) : (
              <span>{user?.userId?.name}</span>
            )}
          </h2>
          <p className="text-blue-100">
            Here is the current status of your applications and pending actions.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ── Main Column ── */}
        <div className="lg:col-span-2 space-y-6">
          <div className="space-y-4">
            {/* Certificate Card */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              {/* Loading State */}
              {certLoading ? (
                <div className="flex items-center gap-3 py-10 justify-center text-gray-400">
                  <Loader size={18} className="animate-spin" />
                  <span className="text-sm">
                    Fetching your certificate status...
                  </span>
                </div>
              ) : activeCerts.length > 0 ? (
                /* ── Active Certificates ── */
                <div className="space-y-4">
                  {activeCerts.map((activeCert, idx) => (
                    <div
                      key={activeCert._id}
                      className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
                    >
                      {/* Card Header */}
                      <div className="flex justify-between items-start mb-6">
                        <div>
                          <h3 className="text-lg font-bold text-gray-800">
                            Registration Certificate
                            {activeCerts.length > 1 && (
                              <span className="ml-2 text-sm text-gray-400 font-normal">
                                ({idx + 1} of {activeCerts.length})
                              </span>
                            )}
                          </h3>
                          <p className="text-sm text-gray-500">
                            {activeCert.certificateType} Registration · #
                            {activeCert.registrationNumber}
                          </p>
                        </div>
                        <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-bold border border-green-200 flex items-center gap-1.5">
                          <CircleCheck size={13} />
                          Active
                        </span>
                      </div>

                      {/* Progress Bar */}
                      <div className="mb-6">
                        <div className="flex justify-between text-sm mb-2 font-medium">
                          <span className="text-gray-600">
                            Registration Valid
                          </span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-3">
                          <div className="bg-green-600 h-3 rounded-full w-full transition-all duration-1000" />
                        </div>
                      </div>

                      {/* Info Grid */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                        <div className="text-center p-3 bg-gray-50 rounded border border-gray-100">
                          <div className="text-xs text-gray-500 mb-1">
                            Registered Name
                          </div>
                          <div className="font-medium text-gray-800 text-sm truncate">
                            {activeCert.ownerName}
                          </div>
                        </div>
                        <div className="text-center p-3 bg-gray-50 rounded border border-gray-100">
                          <div className="text-xs text-gray-500 mb-1">
                            Degree
                          </div>
                          <div className="font-medium text-gray-800">
                            {activeCert.degree}
                          </div>
                        </div>
                        <div className="text-center p-3 bg-gray-50 rounded border border-gray-100">
                          <div className="text-xs text-gray-500 mb-1">
                            Issue Date
                          </div>
                          <div className="font-medium text-gray-800">
                            {new Date(activeCert.issueDate).toLocaleDateString(
                              "en-GB",
                              {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                              },
                            )}
                          </div>
                        </div>
                        <div className="text-center p-3 bg-gray-50 rounded border border-gray-100">
                          <div className="text-xs text-gray-500 mb-1">
                            Expiry Date
                          </div>
                          <div className="text-orange-600 font-semibold">
                            {new Date(activeCert.expiryDate).toLocaleDateString(
                              "en-GB",
                              {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                              },
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Remarks */}
                      {activeCert.remarks && (
                        <div className="mb-5 px-3 py-2 bg-blue-50 border border-blue-100 rounded text-xs text-blue-700">
                          <span className="font-semibold">Remarks:</span>{" "}
                          {activeCert.remarks}
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex space-x-3">
                        <a
                          href={activeCert.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded shadow-sm hover:bg-gray-50 transition font-medium text-sm flex items-center gap-2"
                        >
                          <Eye size={14} />
                          View Certificate
                        </a>
                        <a
                          onClick={() =>
                            handleDownload(
                              activeCert.fileUrl,
                              `${activeCert.ownerName}_${activeCert.registrationNumber}.pdf`,
                            )
                          }
                          className="bg-blue-900 text-white px-4 py-2 rounded hover:bg-blue-800 transition font-medium text-sm flex items-center gap-2 cursor-pointer"
                        >
                          <Download size={14} />
                          Download Certificate
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                /* ── No Active Certificate ── */
                <div className="bg-white rounded-lg flex gap-2">
                  {/* ── Certificate Not Issued Banner ── */}
                  <ShieldX size={18} className="text-red-500 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-red-700">
                      The certificate has not been issued at this time.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* ── Certificate History Table ── */}
            {!certLoading && history.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-bold text-gray-800">
                      Certificate History
                    </h3>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {total} total certificate{total !== 1 ? "s" : ""} on
                      record
                    </p>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-100 text-xs text-gray-500 uppercase tracking-wide">
                        <th className="text-left px-6 py-3 font-medium">
                          Reg. No.
                        </th>
                        <th className="text-left px-6 py-3 font-medium">
                          Type
                        </th>
                        <th className="text-left px-6 py-3 font-medium">
                          Degree
                        </th>
                        <th className="text-left px-6 py-3 font-medium">
                          Issue Date
                        </th>
                        <th className="text-left px-6 py-3 font-medium">
                          Expiry Date
                        </th>
                        <th className="text-left px-6 py-3 font-medium">
                          Status
                        </th>
                        <th className="text-left px-6 py-3 font-medium">
                          Remarks
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {history.map((cert) => (
                        <tr
                          key={cert._id}
                          className="hover:bg-gray-50 transition"
                        >
                          <td className="px-6 py-4 font-mono text-xs text-gray-700">
                            {cert.registrationNumber}
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${
                                cert.certificateType === "Renewal"
                                  ? "bg-purple-50 text-purple-700 border-purple-200"
                                  : "bg-blue-50 text-blue-700 border-blue-200"
                              }`}
                            >
                              {cert.certificateType}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-gray-700">
                            {cert.degree}
                          </td>
                          <td className="px-6 py-4 text-gray-600">
                            {new Date(cert.issueDate).toLocaleDateString(
                              "en-GB",
                              {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                              },
                            )}
                          </td>
                          <td className="px-6 py-4 text-gray-600">
                            {new Date(cert.expiryDate).toLocaleDateString(
                              "en-GB",
                              {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                              },
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${
                                cert.status === "Active"
                                  ? "bg-green-50 text-green-700 border-green-200"
                                  : cert.status === "Expired"
                                    ? "bg-red-50 text-red-600 border-red-200"
                                    : "bg-gray-100 text-gray-600 border-gray-200"
                              }`}
                            >
                              {cert.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-gray-500 text-xs max-w-30 truncate">
                            {cert.remarks || "—"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── Sidebar ── */}
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
              <h3 className="font-bold text-gray-800">Download Forms</h3>
            </div>

            <div className="divide-y divide-gray-100">
              {loadingForms ? (
                <div className="p-6 flex items-center justify-center gap-2 text-gray-400 text-sm">
                  <Loader size={16} className="animate-spin" />
                  <span>Loading forms...</span>
                </div>
              ) : forms.length === 0 ? (
                <div className="p-6 text-center text-sm text-gray-400">
                  No forms available
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {forms.map((form) => (
                    <FormDownloadRow key={form._id} form={form} />
                  ))}
                </div>
              )}
            </div>

            <div className="p-3 border-t border-gray-100 text-center bg-white hover:bg-gray-50 transition">
              <span className="text-xs font-bold text-blue-900">
                Access and download the latest official forms
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
