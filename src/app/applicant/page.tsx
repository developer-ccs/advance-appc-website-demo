"use client";

import Link from "next/link";
import {
  Download,
  Eye,
  ShieldX,
  CircleCheck,
  FilePlus,
  RefreshCw,
  ArrowRightLeft,
  ChevronRight,
} from "lucide-react";

// --- DEMO DATA CONSTANTS ---
const DEMO_USER = {
  name: "Dr. Jane Doe",
  email: "jane.doe@example.com",
  profileImage: "", // Add an image URL here to test the image render, otherwise it falls back to initials
};

const DEMO_ACTIVE_CERTS = [
  {
    _id: "demo-cert-1",
    certificateType: "Renewal",
    registrationNumber: "MED-2023-8475",
    ownerName: "Dr. Jane Doe",
    degree: "MBBS, MD (Cardiology)",
    issueDate: "2023-01-15T00:00:00Z",
    expiryDate: "2028-01-14T00:00:00Z",
    remarks: "Standard 5-year renewal approved.",
    fileUrl: "#demo-file",
  },
];

const DEMO_HISTORY = [
  {
    _id: "demo-hist-2",
    registrationNumber: "MED-2023-8475",
    certificateType: "Renewal",
    degree: "MBBS, MD (Cardiology)",
    issueDate: "2023-01-15T00:00:00Z",
    expiryDate: "2028-01-14T00:00:00Z",
    status: "Active",
    remarks: "Standard 5-year renewal",
  },
  {
    _id: "demo-hist-1",
    registrationNumber: "MED-2018-1234",
    certificateType: "New",
    degree: "MBBS",
    issueDate: "2018-01-15T00:00:00Z",
    expiryDate: "2023-01-14T00:00:00Z",
    status: "Expired",
    remarks: "Renewed to MED-2023-8475",
  },
];

// --- APPLICATION LINKS DATA ---
const APPLICATION_LINKS = [
  {
    id: "registration",
    title: "New Registration",
    description: "Apply for a new pharmacist certificate",
    icon: FilePlus,
    href: "/applicant/registration", // Adjust route as per your app structure
    iconColor: "text-blue-600",
    bgColor: "bg-blue-100",
  },
  {
    id: "renewal",
    title: "Certificate Renewal",
    description: "Renew your existing registration",
    icon: RefreshCw,
    href: "/applicant/renewal", // Adjust route as per your app structure
    iconColor: "text-red-600",
    bgColor: "bg-red-100",
  },
  {
    id: "reciprocal",
    title: "Reciprocal Transfer",
    description: "Transfer from another state council",
    icon: ArrowRightLeft,
    href: "/applicant/reciprocal", // Adjust route as per your app structure
    iconColor: "text-indigo-600",
    bgColor: "bg-indigo-100",
  },
];

const handleDownload = async (fileUrl: string, fileName: string) => {
  // Catch Demo Mode downloads
  if (fileUrl === "#demo-file") {
    alert(`[Demo] Download triggered for: ${fileName}`);
    return;
  }

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

    URL.revokeObjectURL(blobUrl);
  } catch (error) {
    console.error("Download failed:", error);
  }
};

// Helper function to extract initials from the name
const getInitials = (name: string) => {
  const cleanName = name.replace(/^(Dr\.|Mr\.|Mrs\.|Ms\.)\s+/i, "");
  const parts = cleanName.trim().split(" ");
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return cleanName.substring(0, 2).toUpperCase();
};

export default function ApplicantDashboard() {
  const displayTotal = DEMO_HISTORY.length;

  return (
    <div className="space-y-6 mx-auto">
      {/* ── Welcome Banner ── */}
      <div className="bg-blue-900 rounded-xl p-6 text-white shadow-md relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative z-10 flex items-center space-x-4">
          <div>
            <h2 className="text-2xl font-serif font-bold mb-1">
              Welcome, <span>{DEMO_USER.name}</span>
            </h2>
            <p className="text-blue-100 text-sm">
              Here is the current status of your applications and pending
              actions.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ── Main Column ── */}
        <div className="lg:col-span-2 space-y-6">
          <div className="space-y-4">
            {/* Certificate Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              {DEMO_ACTIVE_CERTS.length > 0 ? (
                /* ── Active Certificates ── */
                <div className="space-y-4">
                  {DEMO_ACTIVE_CERTS.map((activeCert, idx) => (
                    <div
                      key={activeCert._id}
                      className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
                    >
                      {/* Card Header */}
                      <div className="flex justify-between items-start mb-6">
                        <div>
                          <h3 className="text-lg font-bold text-gray-800">
                            Registration Certificate
                            {DEMO_ACTIVE_CERTS.length > 1 && (
                              <span className="ml-2 text-sm text-gray-400 font-normal">
                                ({idx + 1} of {DEMO_ACTIVE_CERTS.length})
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
                        <button
                          onClick={() => alert("[Demo] Viewing Certificate")}
                          className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded shadow-sm hover:bg-gray-50 cursor-pointer transition font-medium text-sm flex items-center gap-2"
                        >
                          <Eye size={14} />
                          View Certificate
                        </button>
                        <button
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
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                /* ── No Active Certificate ── */
                <div className="bg-white rounded-lg flex gap-2">
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
            {DEMO_HISTORY.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-bold text-gray-800">
                      Certificate History
                    </h3>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {displayTotal} total certificate
                      {displayTotal !== 1 ? "s" : ""} on record
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
                      {DEMO_HISTORY.map((cert) => (
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

        {/* ── Sidebar (Application Links) ── */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-5 border-b border-gray-200 bg-gray-50">
              <h3 className="font-bold text-gray-800 text-lg">Apply Online</h3>
              <p className="text-xs text-gray-500 mt-1">
                Submit a new application to the Council.
              </p>
            </div>

            <div className="divide-y divide-gray-100">
              {APPLICATION_LINKS.map((link) => {
                const Icon = link.icon;
                return (
                  <Link
                    key={link.id}
                    href={link.href}
                    className="flex items-center p-5 hover:bg-gray-50 transition-colors group cursor-pointer"
                  >
                    <div
                      className={`${link.bgColor} ${link.iconColor} p-3 rounded-lg mr-4 group-hover:scale-105 transition-transform`}
                    >
                      <Icon size={20} />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-800 text-sm group-hover:text-blue-700 transition-colors">
                        {link.title}
                      </h4>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {link.description}
                      </p>
                    </div>
                    <ChevronRight
                      size={18}
                      className="text-gray-300 group-hover:text-gray-500 group-hover:translate-x-1 transition-all"
                    />
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
