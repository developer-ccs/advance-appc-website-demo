"use client";

import { useEffect, useState } from "react";
import {
  Download,
  FileText,
  Users,
  TrendingUp,
  XCircle,
  Search,
  Hash,
  RefreshCw,
  X,
} from "lucide-react";
import CustomLoader from "@/components/ui/CustomLoader";

// Types

interface DownloadHistoryItem {
  _id: string;
  userId: {
    _id: string;
    name: string;
    email: string;
    phoneNumber: string;
    role: string;
  } | null;
  pdfId: {
    _id: string;
    title: string;
    section: string;
    fileUrl: string;
  } | null;
  serialNumber: string;
  downloadedAt: string;
  downloadCount: number;
  serialExpiresAt: string;
  createdAt: string;
}

interface Pagination {
  total: number;
  totalPages: number;
  currentPage: number;
  limit: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

// ─── Mock Data & Simulation ───────────────────────────────────────────────────

const USERS = [
  {
    _id: "u1",
    name: "Alice Johnson",
    email: "alice@example.com",
    phoneNumber: "1234567890",
    role: "user",
  },
  {
    _id: "u2",
    name: "Bob Smith",
    email: "bob@example.com",
    phoneNumber: "9876543210",
    role: "pharmacist",
  },
  {
    _id: "u3",
    name: "Clara Oswald",
    email: "clara@example.com",
    phoneNumber: "5551234567",
    role: "admin",
  },
  {
    _id: "u4",
    name: "David Tennant",
    email: "david@example.com",
    phoneNumber: "4449871234",
    role: "user",
  },
];

const PDFS = [
  {
    _id: "p1",
    title: "Pharmacy Registration Form 2026",
    section: "New-form",
    fileUrl: "#",
  },
  {
    _id: "p2",
    title: "Annual License Renewal",
    section: "Renewal-form",
    fileUrl: "#",
  },
  {
    _id: "p3",
    title: "Reciprocal Transfer Application",
    section: "Reciprocal-form",
    fileUrl: "#",
  },
  {
    _id: "p4",
    title: "General Board Notice - May",
    section: "Notice",
    fileUrl: "#",
  },
  { _id: "p5", title: "Deleted/Old Form", section: "unknown", fileUrl: "#" },
];

const MOCK_HISTORY_DATA: DownloadHistoryItem[] = Array.from({ length: 42 }).map(
  (_, i) => {
    const user = USERS[i % USERS.length];
    // Deliberately make one pdfId null to test the deleted form scenario
    const pdf = i === 15 ? null : PDFS[i % PDFS.length];

    const createdDate = new Date(Date.now() - i * 86400000 * 1.5); // Spread over past two months
    const downloadedDate = new Date(createdDate.getTime() + 3600000); // 1 hour later
    const expiresDate = new Date(downloadedDate.getTime() + 86400000 * 30); // Expires 30 days later

    return {
      _id: `hist-${i + 1}`,
      userId: user,
      pdfId: pdf,
      serialNumber: `SN-${1000 + i}${Math.random().toString(36).substring(2, 4).toUpperCase()}`,
      downloadCount: (i % 5) + 1, // 1 to 5 downloads
      downloadedAt: downloadedDate.toISOString(),
      serialExpiresAt: expiresDate.toISOString(),
      createdAt: createdDate.toISOString(),
    };
  },
);

// Helpers

const SECTION_LABEL: Record<string, string> = {
  "New-form": "New Form",
  "Renewal-form": "Renewal Form",
  "Reciprocal-form": "Reciprocal Form",
  Notice: "Notice",
};

const SECTION_COLOR: { [key: string]: { badge: string; dot: string } } = {
  "New-form": {
    badge: "bg-blue-50 text-blue-700 border-blue-200",
    dot: "bg-blue-500",
  },
  "Renewal-form": {
    badge: "bg-amber-50 text-amber-700 border-amber-200",
    dot: "bg-amber-500",
  },
  "Reciprocal-form": {
    badge: "bg-purple-50 text-purple-700 border-purple-200",
    dot: "bg-purple-500",
  },
  Notice: {
    badge: "bg-emerald-50 text-emerald-700 border-emerald-200",
    dot: "bg-emerald-500",
  },
};

const getSectionStyle = (section?: string) =>
  section && SECTION_COLOR[section]
    ? SECTION_COLOR[section]
    : { badge: "bg-gray-50 text-gray-600 border-gray-200", dot: "bg-gray-400" };

// Component

export default function DownloadHistoryPage() {
  const [history, setHistory] = useState<DownloadHistoryItem[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const LIMIT = 10;

  const fetchHistory = async (p = 1) => {
    try {
      setLoading(true);
      // Simulate API network delay
      await new Promise((resolve) => setTimeout(resolve, 600));
      setError("");

      // Mock API Pagination
      const startIndex = (p - 1) * LIMIT;
      const paginatedData = MOCK_HISTORY_DATA.slice(
        startIndex,
        startIndex + LIMIT,
      );
      const totalCount = MOCK_HISTORY_DATA.length;
      const totalPages = Math.ceil(totalCount / LIMIT);

      setHistory(paginatedData);
      setPagination({
        total: totalCount,
        totalPages,
        currentPage: p,
        limit: LIMIT,
        hasNextPage: p < totalPages,
        hasPrevPage: p > 1,
      });
    } catch (err) {
      setError("Failed to load download history");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory(page);
  }, [page]);

  // Computed Stats from history (In a real app, this might come directly from the API for all records, but we map the current page for demo purposes)

  const totalDownloads = history.reduce(
    (sum, item) => sum + (item.downloadCount ?? 0),
    0,
  );

  const uniqueUsers = new Set(
    history.map((item) => item.userId?._id).filter(Boolean),
  ).size;

  // Form-wise breakdown: group by pdfId title + section
  const formWiseMap: {
    [key: string]: {
      title: string;
      section: string;
      count: number;
      downloads: number;
    };
  } = {};

  history.forEach((item) => {
    const key = item.pdfId?._id ?? "unknown";
    const title = item.pdfId?.title ?? "Deleted / Unknown Form";
    const section = item.pdfId?.section ?? "unknown";
    if (!formWiseMap[key]) {
      formWiseMap[key] = { title, section, count: 0, downloads: 0 };
    }
    formWiseMap[key].count += 1;
    formWiseMap[key].downloads += item.downloadCount ?? 0;
  });

  const formWiseStats = Object.values(formWiseMap).sort(
    (a, b) => b.downloads - a.downloads,
  );

  // Search filter

  const filtered = history.filter((item) => {
    const q = search.toLowerCase();
    return (
      item.userId?.name?.toLowerCase().includes(q) ||
      item.pdfId?.title?.toLowerCase().includes(q) ||
      item.serialNumber?.toLowerCase().includes(q) ||
      item.userId?.email?.toLowerCase().includes(q)
    );
  });

  // Loading / Error

  if (loading) {
    return <CustomLoader fullPage message="Loading download history..." />;
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg flex items-center gap-3">
          <XCircle className="w-5 h-5 shrink-0" />
          <span className="text-sm">{error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header*/}
      <div className="flex items-start justify-between">
        <div className="pb-1">
          <h2 className="text-2xl font-bold text-blue-900 tracking-tight">
            History
          </h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Track all form downloads with serial numbers, user information, and
            download records.
          </p>
        </div>
        <button
          onClick={() => fetchHistory(page)}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-900 border border-blue-200 bg-blue-50 hover:bg-blue-100 rounded-lg transition cursor-pointer"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* Stats Cards*/}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total Downloads */}
        <div className="bg-white border border-gray-200 rounded-lg p-4 flex items-center gap-4 shadow-sm">
          <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center shrink-0">
            <Download className="w-5 h-5 text-blue-900" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-800">{totalDownloads}</p>
            <p className="text-xs text-gray-500">Total Downloads</p>
          </div>
        </div>

        {/* Total Records */}
        <div className="bg-white border border-gray-200 rounded-lg p-4 flex items-center gap-4 shadow-sm">
          <div className="w-10 h-10 bg-emerald-50 rounded-full flex items-center justify-center shrink-0">
            <FileText className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-800">
              {pagination?.total ?? history.length}
            </p>
            <p className="text-xs text-gray-500">Total Records</p>
          </div>
        </div>

        {/* Unique Users */}
        <div className="bg-white border border-gray-200 rounded-lg p-4 flex items-center gap-4 shadow-sm">
          <div className="w-10 h-10 bg-purple-50 rounded-full flex items-center justify-center shrink-0">
            <Users className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-800">{uniqueUsers}</p>
            <p className="text-xs text-gray-500">Unique Downloaders</p>
          </div>
        </div>
      </div>

      {/* Form-wise Breakdown */}
      {formWiseStats.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-blue-900" />
            <h3 className="font-semibold text-gray-800 text-sm">
              Form-wise Download Breakdown
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 divide-x divide-y md:divide-y-0 divide-gray-100">
            {formWiseStats.map((f, i) => {
              const style = getSectionStyle(f.section);
              return (
                <div key={i} className="px-5 py-4 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${style.dot}`} />
                    <span
                      className={`text-xs font-medium px-2 py-0.5 rounded border ${style.badge}`}
                    >
                      {SECTION_LABEL[f.section] ?? f.section}
                    </span>
                  </div>
                  <p
                    className="text-sm font-semibold text-gray-700 truncate"
                    title={f.title}
                  >
                    {f.title}
                  </p>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>{f.count} records</span>
                    <span className="font-bold text-gray-800">
                      {f.downloads} downloads
                    </span>
                  </div>
                  {/* Mini progress bar */}
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${style.dot}`}
                      style={{
                        width: `${Math.min(
                          100,
                          (f.downloads / totalDownloads) * 100,
                        )}%`,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
        {/* Search bar */}
        <div className="p-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between gap-4">
          <div className="relative w-72">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, form, serial..."
              className="w-full pl-10 p-2 text-sm border border-gray-300 rounded focus:outline-none focus:border-blue-900 focus:ring-1 focus:ring-blue-900"
            />
            {/* Search Clear Button */}
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-2.5 text-red-600 hover:text-red-700 transition cursor-pointer"
                aria-label="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <span className="text-xs text-gray-400">
            Showing {filtered.length} of {history.length} records
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white text-gray-500 text-xs uppercase tracking-wider border-b border-gray-200">
                <th className="px-4 py-3 font-medium">
                  <div className="flex items-center gap-1">
                    <Hash className="w-3 h-3" />
                    Serial No
                  </div>
                </th>
                <th className="px-4 py-3 font-medium">User</th>
                <th className="px-4 py-3 font-medium">Form Name</th>
                <th className="px-4 py-3 font-medium">Section</th>
                <th className="px-4 py-3 font-medium text-center">Downloads</th>
                <th className="px-4 py-3 font-medium">Last Downloaded</th>
                <th className="px-4 py-3 font-medium">Expires</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-gray-100">
              {filtered.length > 0 ? (
                filtered.map((item) => {
                  const style = getSectionStyle(item.pdfId?.section);
                  return (
                    <tr key={item._id} className="hover:bg-gray-50 transition">
                      {/* Serial Number */}
                      <td className="px-4 py-3">
                        <span className="font-mono text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded border border-gray-200">
                          {item.serialNumber}
                        </span>
                      </td>

                      {/* User */}
                      <td className="px-4 py-3">
                        <p className="font-semibold text-gray-800 text-sm">
                          {item.userId?.name ?? "—"}
                        </p>
                        <p className="text-xs text-gray-400">
                          {item.userId?.email ?? ""}
                        </p>
                      </td>

                      {/* Form Name */}
                      <td className="px-4 py-3 text-gray-600 max-w-40 truncate">
                        {item.pdfId?.title ?? (
                          <span className="text-gray-400 italic">
                            Deleted form
                          </span>
                        )}
                      </td>

                      {/* Section Badge */}
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center gap-1.5 text-xs font-medium px-2 py-1 rounded border ${style.badge}`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${style.dot}`}
                          />
                          {SECTION_LABEL[item.pdfId?.section ?? ""] ??
                            item.pdfId?.section ??
                            "—"}
                        </span>
                      </td>

                      {/* Download Count */}
                      <td className="px-4 py-3 text-center">
                        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-50 text-blue-800 text-xs font-bold border border-blue-200">
                          {item.downloadCount}
                        </span>
                      </td>

                      {/* Last Downloaded */}
                      <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">
                        {new Date(item.downloadedAt).toLocaleDateString(
                          "en-IN",
                          {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          },
                        )}
                      </td>

                      {/* Expires */}
                      <td className="px-4 py-3 text-xs whitespace-nowrap">
                        {(() => {
                          const exp = new Date(item.serialExpiresAt);
                          const isExpired = exp < new Date();
                          return (
                            <span
                              className={
                                isExpired
                                  ? "text-red-500 font-medium"
                                  : "text-gray-500"
                              }
                            >
                              {exp.toLocaleDateString("en-IN", {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                              })}
                            </span>
                          );
                        })()}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="px-4 py-16 text-center">
                    <div className="flex flex-col items-center gap-3 text-gray-400">
                      <Download className="w-10 h-10 text-gray-300" />
                      <p className="text-sm font-medium text-gray-500">
                        No download records found
                      </p>
                      <p className="text-xs text-gray-400">
                        Try adjusting your search
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="px-4 py-3 border-t border-gray-200 bg-gray-50 flex items-center justify-between text-sm">
            <span className="text-gray-500 text-xs">
              Page {pagination.currentPage} of {pagination.totalPages} —{" "}
              {pagination.total} total records
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={!pagination.hasPrevPage}
                className="px-3 py-1.5 rounded border border-gray-300 text-gray-600 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition text-xs font-medium cursor-pointer"
              >
                Previous
              </button>
              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={!pagination.hasNextPage}
                className="px-3 py-1.5 rounded border border-gray-300 text-gray-600 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition text-xs font-medium cursor-pointer"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
