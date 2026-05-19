"use client";

import {
  Users,
  UserPlus,
  RefreshCw,
  Megaphone,
  PlusCircle,
  Upload,
  UserCheck,
  ArrowRight,
  ChevronRight,
  Download,
} from "lucide-react";

import { StatusBadge } from "@/components/ui/StatusBadge";
import Link from "next/link";
import { useRouter } from "next/navigation";

// Demo Data
const demoStatusWiseCounts = [{ _id: "Active", count: 1245 }];
const demoNewForm = { uniqueDownloaders: 432 };
const demoRenewalForm = { uniqueDownloaders: 856 };
const demoNoticesTotalCount = 42;

type StatusType =
  | "Active"
  | "Pending"
  | "Rejected"
  | "Approved"
  | "In Review"
  | "Expired"
  | "Revoked";

const demoCertificates: {
  _id: string;
  registrationNumber: string;
  ownerName: string;
  certificateType: string;
  status: StatusType; // Force this specific type
}[] = [
  {
    _id: "1",
    registrationNumber: "PH-2023-001",
    ownerName: "John Doe",
    certificateType: "New",
    status: "Active",
  },
  {
    _id: "2",
    registrationNumber: "PH-2023-002",
    ownerName: "Jane Smith",
    certificateType: "Renewal",
    status: "Pending",
  },
  {
    _id: "3",
    registrationNumber: "PH-2023-003",
    ownerName: "Alice Johnson",
    certificateType: "New",
    status: "Active",
  },
  {
    _id: "4",
    registrationNumber: "PH-2023-004",
    ownerName: "Bob Brown",
    certificateType: "Renewal",
    status: "Rejected",
  },
  {
    _id: "5",
    registrationNumber: "PH-2023-005",
    ownerName: "Charlie Davis",
    certificateType: "New",
    status: "Active",
  },
];

const demoNotices = [
  {
    _id: "n1",
    section: "Notice",
    title: "Annual General Meeting 2024",
    isNew: true,
    userId: { name: "Admin Staff" },
    createdAt: new Date().toISOString(),
  },
  {
    _id: "n2",
    section: "Notice",
    title: "System Maintenance Window",
    isNew: false,
    userId: { name: "IT Dept" },
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    _id: "n3",
    section: "Notice",
    title: "Updated Registration Guidelines",
    isNew: false,
    userId: { name: "Registrar" },
    createdAt: new Date(Date.now() - 172800000).toISOString(),
  },
];

const demoAnnouncements = [
  {
    _id: "a1",
    section: "Announcement",
    title: "Holiday Schedule for December",
    isNew: true,
    userId: { name: "HR Dept" },
    createdAt: new Date().toISOString(),
  },
  {
    _id: "a2",
    section: "Announcement",
    title: "New Online Portal Launch",
    isNew: true,
    userId: { name: "Admin Staff" },
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    _id: "a3",
    section: "Announcement",
    title: "Pharmacy Board Elections",
    isNew: false,
    userId: { name: "Election Comm." },
    createdAt: new Date(Date.now() - 259200000).toISOString(),
  },
];

const demoDownloadHistory = [
  {
    _id: "d1",
    serialNumber: "DL-001",
    userId: { name: "Michael Scott" },
    pdfId: { title: "Registration Form A" },
    createdAt: new Date().toISOString(),
  },
  {
    _id: "d2",
    serialNumber: "DL-002",
    userId: { name: "Dwight Schrute" },
    pdfId: { title: "Renewal Form B" },
    createdAt: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    _id: "d3",
    serialNumber: "DL-003",
    userId: { name: "Jim Halpert" },
    pdfId: { title: "Registration Form A" },
    createdAt: new Date(Date.now() - 7200000).toISOString(),
  },
];

export default function AdminDashboard() {
  const router = useRouter();

  // Using demo data instead of API state
  const activeCertifiedCount =
    demoStatusWiseCounts.find((s) => s._id === "Active")?.count || 0;

  const stats = [
    {
      title: "Certified Pharmacists",
      value: String(activeCertifiedCount),
      icon: Users,
      accent: "#1e40af",
      bg: "from-blue-50 to-blue-100/60",
      iconBg: "bg-blue-600",
      border: "border-blue-200",
    },
    {
      title: "New Form Downloads",
      value: String(demoNewForm.uniqueDownloaders),
      icon: UserPlus,
      accent: "#b91c1c",
      bg: "from-rose-50 to-rose-100/60",
      iconBg: "bg-rose-600",
      border: "border-rose-200",
    },
    {
      title: "Renewal Form Downloads",
      value: String(demoRenewalForm.uniqueDownloaders),
      icon: RefreshCw,
      accent: "#b45309",
      bg: "from-amber-50 to-amber-100/60",
      iconBg: "bg-amber-500",
      border: "border-amber-200",
    },
    {
      title: "Notices & Announcements",
      value: String(demoNoticesTotalCount),
      icon: Megaphone,
      accent: "#15803d",
      bg: "from-emerald-50 to-emerald-100/60",
      iconBg: "bg-emerald-600",
      border: "border-emerald-200",
    },
  ];

  return (
    <div className="space-y-7 px-1">
      {/* Page header */}
      <div className="pb-1">
        <h2 className="text-2xl font-bold text-blue-900 tracking-tight">
          Dashboard Overview
        </h2>
        <p className="text-sm text-slate-500 mt-0.5">
          Welcome — here’s a quick snapshot of registrations, approvals,
          renewals, and recent activity.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={index}
              className={`bg-linear-to-br ${stat.bg} rounded-xl border ${stat.border} p-5 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow duration-200`}
            >
              <div
                className={`${stat.iconBg} w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-sm shrink-0`}
              >
                <Icon className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide leading-tight truncate">
                  {stat.title}
                </p>
                <h2
                  className="text-3xl font-bold text-slate-800 mt-0.5 leading-none"
                  style={{ fontVariantNumeric: "tabular-nums" }}
                >
                  {stat.value}
                </h2>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Tables Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Recent Certificates */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
              <div>
                <h3 className="font-bold text-slate-800 text-base">
                  Recent Certificates
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Latest registered entries
                </p>
              </div>
              <Link
                href="/admin/pharmacists"
                className="inline-flex items-center gap-1 text-xs font-semibold text-blue-700 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-full transition-colors"
              >
                View All
                <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest bg-slate-50/70">
                    <th className="px-5 py-3 font-semibold">Reg No</th>
                    <th className="px-5 py-3 font-semibold">Owner</th>
                    <th className="px-5 py-3 text-center font-semibold">
                      Type
                    </th>
                    <th className="px-5 py-3 text-center font-semibold">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="text-sm divide-y divide-slate-100">
                  {demoCertificates.slice(0, 5).map((cert) => (
                    <tr
                      key={cert._id}
                      className="hover:bg-slate-50/80 transition-colors"
                    >
                      <td className="px-5 py-3.5 font-mono text-xs text-slate-500 bg-slate-50/40">
                        {cert.registrationNumber}
                      </td>
                      <td className="px-5 py-3.5 font-semibold text-slate-700">
                        {cert.ownerName}
                      </td>
                      <td className="px-5 py-3.5 text-slate-500 text-xs text-center">
                        {cert.certificateType}
                      </td>
                      <td className="px-5 py-3.5 text-center">
                        <StatusBadge status={cert.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Recent Notices */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
              <div>
                <h3 className="font-bold text-slate-800 text-base">
                  Recent Notices
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Published Notices
                </p>
              </div>
              <Link
                href="/admin/notices"
                className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 hover:text-emerald-900 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-full transition-colors"
              >
                View All
                <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest bg-slate-50/70">
                    <th className="px-5 py-3 font-semibold">Title</th>
                    <th className="px-5 py-3 text-center font-semibold">
                      Uploaded By
                    </th>
                    <th className="px-5 py-3 text-center font-semibold">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody className="text-sm divide-y divide-slate-100">
                  {demoNotices
                    .filter((notice) => notice.section === "Notice")
                    .slice(0, 5)
                    .map((notice) => (
                      <tr
                        key={notice._id}
                        className="hover:bg-slate-50/80 transition-colors"
                      >
                        <td className="px-5 py-3.5 font-semibold text-slate-700 max-w-50">
                          <div className="flex items-center gap-2 truncate">
                            <span className="truncate">{notice.title}</span>
                            {notice.isNew && (
                              <span className="bg-green-100 text-green-800 text-[10px] font-bold px-1.5 py-0.5 rounded border border-green-200 leading-none shrink-0">
                                NEW
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-5 py-3.5 text-center text-slate-500">
                          {notice.userId?.name ?? "-"}
                        </td>
                        <td className="px-5 py-3.5 text-slate-400 text-xs text-center whitespace-nowrap">
                          {new Date(notice.createdAt).toLocaleDateString(
                            "en-IN",
                            {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            },
                          )}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Recent Announcements */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
              <div>
                <h3 className="font-bold text-slate-800 text-base">
                  Recent Announcements
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Published announcements
                </p>
              </div>
              <Link
                href="/admin/notices"
                className="inline-flex items-center gap-1 text-xs font-semibold text-amber-700 hover:text-amber-900 bg-amber-50 hover:bg-amber-100 px-3 py-1.5 rounded-full transition-colors"
              >
                View All
                <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest bg-slate-50/70">
                    <th className="px-5 py-3 font-semibold">Title</th>
                    <th className="px-5 py-3 text-center font-semibold">
                      Uploaded By
                    </th>
                    <th className="px-5 py-3 text-center font-semibold">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody className="text-sm divide-y divide-slate-100">
                  {demoAnnouncements
                    .filter(
                      (announcement) => announcement.section === "Announcement",
                    )
                    .slice(0, 5)
                    .map((announcement) => (
                      <tr
                        key={announcement._id}
                        className="hover:bg-slate-50/80 transition-colors"
                      >
                        <td className="px-5 py-3.5 font-semibold text-slate-700 max-w-50">
                          <div className="flex items-center gap-2 truncate">
                            <span className="truncate">
                              {announcement.title}
                            </span>
                            {announcement.isNew && (
                              <span className="bg-green-100 text-green-800 text-[10px] font-bold px-1.5 py-0.5 rounded border border-green-200 leading-none shrink-0">
                                NEW
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-5 py-3.5 text-center text-slate-500">
                          {announcement.userId?.name ?? "-"}
                        </td>
                        <td className="px-5 py-3.5 text-slate-400 text-center text-xs whitespace-nowrap">
                          {new Date(announcement.createdAt).toLocaleDateString(
                            "en-IN",
                            {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            },
                          )}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Recent Form Downloads */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
              <div>
                <h3 className="font-bold text-slate-800 text-base">
                  Recent Form Downloads
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Latest form download activity
                </p>
              </div>
              <Link
                href="/admin/download-history"
                className="inline-flex items-center gap-1 text-xs font-semibold text-rose-700 hover:text-rose-900 bg-rose-50 hover:bg-rose-100 px-3 py-1.5 rounded-full transition-colors"
              >
                View All
                <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest bg-slate-50/70">
                    <th className="px-5 py-3 font-semibold">Serial No</th>
                    <th className="px-5 py-3 font-semibold">User</th>
                    <th className="px-5 py-3 text-center font-semibold">
                      Form Name
                    </th>
                    <th className="px-5 py-3 text-center font-semibold">
                      Downloaded At
                    </th>
                  </tr>
                </thead>
                <tbody className="text-sm divide-y divide-slate-100">
                  {demoDownloadHistory.length === 0 ? (
                    <tr>
                      <td
                        colSpan={4}
                        className="px-5 py-8 text-center text-slate-400 text-sm"
                      >
                        <div className="flex flex-col items-center gap-2">
                          <Download className="w-6 h-6 text-slate-300" />
                          <span>No downloads yet</span>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    demoDownloadHistory.slice(0, 5).map((item) => (
                      <tr
                        key={item._id}
                        className="hover:bg-slate-50/80 transition-colors"
                      >
                        <td className="px-5 py-3.5 font-mono text-xs text-slate-500 bg-slate-50/40">
                          {item.serialNumber ?? "-"}
                        </td>
                        <td className="px-5 py-3.5 font-semibold text-slate-700">
                          {item.userId?.name ?? "—"}
                        </td>
                        <td className="px-5 py-3.5 text-xs text-center text-slate-500 max-w-40 truncate">
                          {item.pdfId?.title ?? "—"}
                        </td>
                        <td className="px-5 py-3.5 text-center text-slate-400 text-xs whitespace-nowrap">
                          {new Date(item.createdAt).toLocaleDateString(
                            "en-IN",
                            {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            },
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right: Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/60">
              <h3 className="font-bold text-slate-800 text-base">
                Quick Actions
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">Frequent tasks</p>
            </div>
            <div className="p-4 space-y-2.5">
              <button
                onClick={() => router.push("/admin/notices")}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg border border-slate-200 bg-white hover:bg-blue-50 hover:border-blue-300 text-slate-700 hover:text-blue-800 transition-all duration-150 text-sm font-medium group cursor-pointer"
              >
                <span className="w-8 h-8 rounded-lg bg-blue-100 group-hover:bg-blue-200 flex items-center justify-center shrink-0 transition-colors">
                  <PlusCircle className="w-4 h-4 text-blue-700" />
                </span>
                <span className="text-left leading-snug flex-1">
                  Publish New Notice
                </span>
                <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity text-blue-500" />
              </button>

              <button
                onClick={() => router.push("/admin/forms")}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg border border-slate-200 bg-white hover:bg-amber-50 hover:border-amber-300 text-slate-700 hover:text-amber-800 transition-all duration-150 text-sm font-medium group cursor-pointer"
              >
                <span className="w-8 h-8 rounded-lg bg-amber-100 group-hover:bg-amber-200 flex items-center justify-center shrink-0 transition-colors">
                  <Upload className="w-4 h-4 text-amber-700" />
                </span>
                <span className="text-left leading-snug flex-1">
                  Upload Downloadable Form
                </span>
                <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity text-amber-500" />
              </button>

              <button
                onClick={() => router.push("/admin/pharmacists")}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg border border-slate-200 bg-white hover:bg-emerald-50 hover:border-emerald-300 text-slate-700 hover:text-emerald-800 transition-all duration-150 text-sm font-medium group cursor-pointer"
              >
                <span className="w-8 h-8 rounded-lg bg-emerald-100 group-hover:bg-emerald-200 flex items-center justify-center shrink-0 transition-colors">
                  <UserCheck className="w-4 h-4 text-emerald-700" />
                </span>
                <span className="text-left leading-snug flex-1">
                  Verify Pharmacist Manually
                </span>
                <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity text-emerald-500" />
              </button>
            </div>
          </div>

          {/* Rate Limit Warning */}
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-5 text-center">
            <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-3">
              <svg
                className="w-5 h-5 text-amber-600"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <p className="text-sm font-bold text-amber-700">
              Rate Limit Warning
            </p>
            <p className="text-xs text-amber-600 mt-1 leading-relaxed">
              Each API is limited to{" "}
              <span className="font-bold">500 requests</span>. If you hit the
              limit, wait <span className="font-bold">10 minutes</span> before
              retrying.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
