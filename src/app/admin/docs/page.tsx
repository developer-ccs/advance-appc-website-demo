"use client";

import { useEffect, useState } from "react";
import {
  FileText,
  XCircle,
  Search,
  FolderOpen,
  Eye,
  Filter,
  User,
  Globe,
  Loader,
  X,
} from "lucide-react";

import CustomLoader from "@/components/ui/CustomLoader";
import { usePageLoader } from "@/hooks/usePageLoader";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Pdf {
  _id: string;
  title?: string;
  fileName: string;
  fileUrl: string;
  section: string;
  createdAt: string;
  isNew?: boolean;
  userId?: { name: string; email: string };
}

interface Tender {
  _id: string;
  title: string;
  category: string;
  status: "ongoing" | "ended";
  fileUrl: string;
  fileName: string;
  fileSize: number;
  isNew?: boolean;
  createdAt: string;
  userId?: { name: string; email: string };
}

interface SectionCount {
  _id: string;
  count: number;
}

interface ApiData {
  pdfs: Pdf[];
  totalCount: number;
  sectionCountTotal: number;
  sectionWiseCounts: SectionCount[];
}

type MainTab = "my-uploads" | "all";

const ITEMS_PER_PAGE = 10;
const TENDER_LIMIT = 10;

// ─── Mock Data & Simulation ───────────────────────────────────────────────────

const MOCK_USERS = {
  me: { name: "Current User", email: "me@example.com" },
  other1: { name: "Admin Officer", email: "admin@example.com" },
  other2: { name: "Jane Smith", email: "jane@example.com" },
};

const SECTIONS = ["circulars", "reports", "guidelines", "notices"];
const CATEGORIES = ["WORKS", "GOODS", "SERVICES"];

const MOCK_PDFS: Pdf[] = Array.from({ length: 45 }).map((_, i) => ({
  _id: `pdf-${i + 1}`,
  title:
    i % 3 === 0
      ? `Important Policy Update 202${(i % 5) + 1}`
      : `General Document ${i + 1}`,
  fileName: `document_${i + 1}.pdf`,
  fileUrl: "#",
  section: SECTIONS[i % SECTIONS.length],
  createdAt: new Date(Date.now() - i * 86400000 * 2).toISOString(),
  isNew: i < 5,
  userId:
    i % 3 === 0
      ? MOCK_USERS.me
      : i % 2 === 0
        ? MOCK_USERS.other1
        : MOCK_USERS.other2,
}));

const MOCK_TENDERS: Tender[] = Array.from({ length: 35 }).map((_, i) => ({
  _id: `tender-${i + 1}`,
  title:
    i % 4 === 0
      ? `Campus Infrastructure Upgrade Phase ${i + 1}`
      : `Supply of Equipment Batch ${i + 1}`,
  category: CATEGORIES[i % CATEGORIES.length],
  status: i % 5 === 0 ? "ended" : "ongoing",
  fileUrl: "#",
  fileName: `tender_${i + 1}.pdf`,
  fileSize: 1024 * 1024 * ((i % 5) + 1.5), // 1.5MB to 5.5MB
  isNew: i < 3,
  createdAt: new Date(Date.now() - i * 86400000 * 3).toISOString(),
  userId: i % 2 === 0 ? MOCK_USERS.me : MOCK_USERS.other1,
}));

const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function MyDocumentsPage() {
  // PDF state
  const [data, setData] = useState<ApiData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Tender state
  const [tenders, setTenders] = useState<Tender[]>([]);
  const [tenderTotal, setTenderTotal] = useState(0);
  const [tenderPage, setTenderPage] = useState(1);
  const [tenderLoading, setTenderLoading] = useState(true);
  const [tenderError, setTenderError] = useState("");

  // Shared filter state
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [activeSection, setActiveSection] = useState<string>("all");
  const [mainTab, setMainTab] = useState<MainTab>("my-uploads");
  const [currentPage, setCurrentPage] = useState(1);

  // Full page loader for the initial mount only
  const { isLoading: isPageLoading } = usePageLoader([loading && !data]);

  // Localized loaders
  const { isLoading: isTableLoading } = usePageLoader([loading]);
  const { isLoading: isTenderTableLoading } = usePageLoader([tenderLoading]);

  // ─── Debounce Search ──────────────────────────────────────────────────────

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);
    return () => clearTimeout(handler);
  }, [search]);

  // ─── Reset pages on filter change ─────────────────────────────────────────

  useEffect(() => {
    setCurrentPage(1);
    setTenderPage(1);
  }, [debouncedSearch, activeSection, mainTab]);

  // ─── Fetch PDFs ───────────────────────────────────────────────────────────

  useEffect(() => {
    const fetchPdfs = async () => {
      try {
        setLoading(true);
        setError("");

        await delay(600); // Simulate API latency

        let filtered =
          mainTab === "my-uploads"
            ? MOCK_PDFS.filter((p) => p.userId?.email === MOCK_USERS.me.email)
            : [...MOCK_PDFS];

        if (debouncedSearch) {
          const lowerQ = debouncedSearch.toLowerCase();
          filtered = filtered.filter(
            (p) =>
              p.title?.toLowerCase().includes(lowerQ) ||
              p.fileName.toLowerCase().includes(lowerQ),
          );
        }

        const totalCount = filtered.length;

        // Group by sections for the filter tabs
        const secMap = filtered.reduce(
          (acc, p) => {
            acc[p.section] = (acc[p.section] || 0) + 1;
            return acc;
          },
          {} as Record<string, number>,
        );

        const sectionWiseCounts = Object.entries(secMap).map(
          ([_id, count]) => ({
            _id,
            count,
          }),
        );

        if (activeSection !== "all") {
          filtered = filtered.filter((p) => p.section === activeSection);
        }

        const sectionCountTotal = filtered.length;

        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        const paginatedPdfs = filtered.slice(
          startIndex,
          startIndex + ITEMS_PER_PAGE,
        );

        setData({
          pdfs: paginatedPdfs,
          totalCount,
          sectionCountTotal,
          sectionWiseCounts,
        });
      } catch (err) {
        setError("Failed to load documents");
      } finally {
        setLoading(false);
      }
    };

    fetchPdfs();
  }, [mainTab, activeSection, currentPage, debouncedSearch]);

  // ─── Fetch Tenders ────────────────────────────────────────────────────────

  useEffect(() => {
    const fetchTenders = async () => {
      try {
        setTenderLoading(true);
        setTenderError("");

        await delay(800); // Simulate API latency

        let filtered =
          mainTab === "my-uploads"
            ? MOCK_TENDERS.filter(
                (t) => t.userId?.email === MOCK_USERS.me.email,
              )
            : [...MOCK_TENDERS];

        if (debouncedSearch) {
          const lowerQ = debouncedSearch.toLowerCase();
          filtered = filtered.filter((t) =>
            t.title.toLowerCase().includes(lowerQ),
          );
        }

        const totalFiltered = filtered.length;
        const startIndex = (tenderPage - 1) * TENDER_LIMIT;
        const paginatedTenders = filtered.slice(
          startIndex,
          startIndex + TENDER_LIMIT,
        );

        setTenders(paginatedTenders);
        setTenderTotal(totalFiltered);
      } catch (err) {
        setTenderError("Failed to load tenders");
      } finally {
        setTenderLoading(false);
      }
    };

    fetchTenders();
  }, [mainTab, tenderPage, debouncedSearch]);

  // ─── Handlers ─────────────────────────────────────────────────────────────

  const handleMainTabChange = (tab: MainTab) => {
    setMainTab(tab);
    setActiveSection("all");
    setSearch("");
    setDebouncedSearch("");
    setCurrentPage(1);
    setTenderPage(1);
  };

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

  // ─── Derived values ───────────────────────────────────────────────────────

  const pdfs = data?.pdfs ?? [];
  const totalItems = data?.sectionCountTotal ?? data?.totalCount ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalItems / ITEMS_PER_PAGE));
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const tenderTotalPages = Math.max(1, Math.ceil(tenderTotal / TENDER_LIMIT));

  const sections = [
    { key: "all", label: "All", count: data?.totalCount ?? 0 },
    ...(data?.sectionWiseCounts ?? []).map((s) => ({
      key: s._id,
      label: s._id,
      count: s.count,
    })),
  ];

  const pdfColSpan = mainTab === "all" ? 6 : 5;
  const tenderColSpan = mainTab === "all" ? 7 : 6;

  // ─── Page numbers helper ──────────────────────────────────────────────────

  const buildPageButtons = (current: number, total: number) =>
    Array.from({ length: total }, (_, i) => i + 1)
      .filter((p) => p === 1 || p === total || Math.abs(p - current) <= 1)
      .reduce<(number | "…")[]>((acc, p, idx, arr) => {
        if (
          idx > 0 &&
          typeof arr[idx - 1] === "number" &&
          (p as number) - (arr[idx - 1] as number) > 1
        )
          acc.push("…");
        acc.push(p);
        return acc;
      }, []);

  if (isPageLoading) {
    return <CustomLoader fullPage message="Loading My Uploads..." />;
  }

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <div className="flex items-start justify-between">
        <div className="pb-1">
          <h2 className="text-2xl font-bold text-blue-900 tracking-tight">
            Documents
          </h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Browse and view uploaded PDF documents and tenders available in the
            portal.
          </p>
        </div>
      </div>

      {/* ── Main Tabs ── */}
      <div className="flex items-center gap-1 border-b border-gray-200">
        <button
          onClick={() => handleMainTabChange("my-uploads")}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors cursor-pointer -mb-px ${
            mainTab === "my-uploads"
              ? "border-blue-900 text-blue-900"
              : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
          }`}
        >
          <User className="w-4 h-4" />
          My Uploads
        </button>
        <button
          onClick={() => handleMainTabChange("all")}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors cursor-pointer -mb-px ${
            mainTab === "all"
              ? "border-blue-900 text-blue-900"
              : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
          }`}
        >
          <Globe className="w-4 h-4" />
          All
        </button>
      </div>

      {/* ── Section Filter Tabs (PDFs only) ── */}
      {sections.length > 1 && (
        <div className="flex items-center gap-2 flex-wrap">
          <Filter className="w-4 h-4 text-gray-400" />
          {sections.map((sec) => (
            <button
              key={sec.key}
              onClick={() => setActiveSection(sec.key)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition cursor-pointer ${
                activeSection === sec.key
                  ? "bg-blue-900 text-white border-blue-900"
                  : "bg-white text-gray-600 border-gray-300 hover:bg-gray-50"
              }`}
            >
              {sec.label}
              <span
                className={`ml-1.5 px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                  activeSection === sec.key
                    ? "bg-white/20 text-white"
                    : "bg-gray-100 text-gray-500"
                }`}
              >
                {sec.count}
              </span>
            </button>
          ))}
        </div>
      )}

      {/* ── Shared Search Bar ── */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4 flex gap-3 items-center">
        <div className="relative w-full">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search documents and tenders..."
            className="w-full pl-10 p-2 text-sm border border-gray-300 rounded focus:outline-none focus:border-blue-900 focus:ring-1 focus:ring-blue-900"
          />
        </div>
        <button
          onClick={() => setSearch("")}
          className="px-4 py-2 text-sm border bg-red-600 text-white rounded hover:bg-red-700 transition cursor-pointer flex items-center gap-2 shrink-0"
        >
          <X size={14} /> Clear
        </button>
      </div>

      {/* ════════════════════════════════════════════════════
          DOCUMENTS TABLE
      ════════════════════════════════════════════════════ */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
        <div className="px-4 pt-4 pb-2 flex items-center gap-2">
          <FileText className="w-4 h-4 text-red-500" />
          <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">
            Documents
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider border-y border-gray-200">
                <th className="px-4 py-3 font-medium">#</th>
                <th className="px-4 py-3 font-medium">Document Name</th>
                <th className="px-4 py-3 font-medium">Section</th>
                {mainTab === "all" && (
                  <th className="px-4 py-3 font-medium">Uploaded By</th>
                )}
                <th className="px-4 py-3 font-medium">Uploaded On</th>
                <th className="px-4 py-3 font-medium text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-gray-100">
              {isTableLoading ? (
                <tr>
                  <td colSpan={pdfColSpan} className="px-4 py-14 text-center">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Loader
                        size={28}
                        className="animate-spin text-blue-900"
                      />
                      <span className="text-sm text-gray-500">
                        Loading documents...
                      </span>
                    </div>
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={pdfColSpan} className="px-4 py-12 text-center">
                    <div className="flex flex-col items-center gap-2 text-red-500">
                      <XCircle className="w-7 h-7" />
                      <span className="text-sm">{error}</span>
                    </div>
                  </td>
                </tr>
              ) : pdfs.length === 0 ? (
                <tr>
                  <td colSpan={pdfColSpan} className="px-4 py-14 text-center">
                    <div className="flex flex-col items-center gap-3 text-gray-400">
                      <FolderOpen className="w-10 h-10 text-gray-300" />
                      <p className="text-sm font-medium text-gray-500">
                        No documents found
                      </p>
                      <p className="text-xs text-gray-400">
                        {debouncedSearch
                          ? "Try a different search term"
                          : mainTab === "my-uploads"
                            ? "You haven't uploaded any documents yet"
                            : "No documents have been uploaded yet"}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                pdfs.map((pdf, index) => (
                  <tr key={pdf._id} className="hover:bg-gray-50 transition">
                    <td className="px-4 py-3 text-gray-400 text-xs font-mono">
                      {startIndex + index + 1}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-red-50 border border-red-100 rounded flex items-center justify-center shrink-0">
                          <FileText className="w-4 h-4 text-red-500" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-800 leading-snug">
                            {pdf.title || pdf.fileName}
                          </p>
                          {pdf.title && (
                            <p className="text-xs text-gray-400 mt-0.5 truncate max-w-xs">
                              {pdf.fileName}
                            </p>
                          )}
                        </div>
                        {pdf.isNew && (
                          <span className="bg-green-100 text-green-800 text-[10px] font-bold px-1.5 py-0.5 rounded border border-green-200 leading-none shrink-0">
                            NEW
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-block bg-blue-50 text-blue-800 border border-blue-100 px-2 py-1 rounded text-xs font-semibold capitalize">
                        {pdf.section}
                      </span>
                    </td>
                    {mainTab === "all" && (
                      <td className="px-4 py-3 text-xs text-gray-700 font-medium">
                        {pdf.userId?.name ?? "—"}
                      </td>
                    )}
                    <td className="px-4 py-3 text-gray-500 text-xs">
                      {formatDate(pdf.createdAt)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center">
                        <a
                          href={pdf.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="View"
                          className="text-blue-800 hover:text-blue-900 transition"
                        >
                          <Eye className="w-4 h-4" />
                        </a>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* PDF Pagination */}
        {!isTableLoading && totalItems > 0 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 bg-gray-50 w-full">
            <p className="text-xs text-gray-500">
              Showing{" "}
              <span className="font-semibold text-gray-700">
                {(currentPage - 1) * ITEMS_PER_PAGE + 1}–
                {Math.min(currentPage * ITEMS_PER_PAGE, totalItems)}
              </span>{" "}
              of{" "}
              <span className="font-semibold text-gray-700">{totalItems}</span>{" "}
              document{totalItems !== 1 ? "s" : ""}
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1.5 text-xs bg-white border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
              >
                ← Prev
              </button>
              {buildPageButtons(currentPage, totalPages).map((item, idx) =>
                item === "…" ? (
                  <span
                    key={`dp-${idx}`}
                    className="px-2 text-xs text-gray-400"
                  >
                    …
                  </span>
                ) : (
                  <button
                    key={item}
                    onClick={() => setCurrentPage(item as number)}
                    className={`w-8 h-7 text-xs rounded border transition cursor-pointer ${
                      currentPage === item
                        ? "bg-blue-900 text-white border-blue-900"
                        : "bg-white border-gray-300 hover:bg-gray-100"
                    }`}
                  >
                    {item}
                  </button>
                ),
              )}
              <button
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
                disabled={currentPage >= totalPages}
                className="px-3 py-1.5 text-xs bg-white border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
              >
                Next →
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ════════════════════════════════════════════════════
          TENDERS TABLE
      ════════════════════════════════════════════════════ */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
        <div className="px-4 pt-4 pb-2 flex items-center gap-2">
          <FileText className="w-4 h-4 text-amber-500" />
          <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">
            Tenders
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider border-y border-gray-200">
                <th className="px-4 py-3 font-medium">#</th>
                <th className="px-4 py-3 font-medium">Title</th>
                <th className="px-4 py-3 font-medium">Category</th>
                <th className="px-4 py-3 font-medium">Status</th>
                {mainTab === "all" && (
                  <th className="px-4 py-3 font-medium">Uploaded By</th>
                )}
                <th className="px-4 py-3 font-medium">Date</th>
                <th className="px-4 py-3 font-medium text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-gray-100">
              {isTenderTableLoading ? (
                <tr>
                  <td
                    colSpan={tenderColSpan}
                    className="px-4 py-14 text-center"
                  >
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Loader
                        size={28}
                        className="animate-spin text-blue-900"
                      />
                      <span className="text-sm text-gray-500">
                        Loading tenders...
                      </span>
                    </div>
                  </td>
                </tr>
              ) : tenderError ? (
                <tr>
                  <td
                    colSpan={tenderColSpan}
                    className="px-4 py-12 text-center"
                  >
                    <div className="flex flex-col items-center gap-2 text-red-500">
                      <XCircle className="w-7 h-7" />
                      <span className="text-sm">{tenderError}</span>
                    </div>
                  </td>
                </tr>
              ) : tenders.length === 0 ? (
                <tr>
                  <td
                    colSpan={tenderColSpan}
                    className="px-4 py-14 text-center"
                  >
                    <div className="flex flex-col items-center gap-3 text-gray-400">
                      <FolderOpen className="w-10 h-10 text-gray-300" />
                      <p className="text-sm font-medium text-gray-500">
                        No tenders found
                      </p>
                      <p className="text-xs text-gray-400">
                        {debouncedSearch
                          ? "Try a different search term"
                          : mainTab === "my-uploads"
                            ? "You haven't uploaded any tenders yet"
                            : "No tenders have been uploaded yet"}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                tenders.map((tender, index) => (
                  <tr key={tender._id} className="hover:bg-gray-50 transition">
                    <td className="px-4 py-3 text-gray-400 text-xs font-mono">
                      {(tenderPage - 1) * TENDER_LIMIT + index + 1}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-amber-50 border border-amber-100 rounded flex items-center justify-center shrink-0">
                          <FileText className="w-4 h-4 text-amber-500" />
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-medium text-gray-800">
                            {tender.title}
                          </span>
                          {tender.isNew && (
                            <span className="bg-green-100 text-green-800 text-[10px] font-bold px-1.5 py-0.5 rounded border border-green-200 leading-none shrink-0">
                              NEW
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-block bg-blue-50 text-blue-800 border border-blue-100 px-2 py-1 rounded text-xs font-semibold">
                        {tender.category}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`text-xs font-bold px-2 py-1 rounded border ${
                          tender.status === "ongoing"
                            ? "bg-green-50 text-green-700 border-green-200"
                            : "bg-red-50 text-red-700 border-red-200"
                        }`}
                      >
                        {tender.status === "ongoing" ? "Ongoing" : "Ended"}
                      </span>
                    </td>
                    {mainTab === "all" && (
                      <td className="px-4 py-3 text-xs text-gray-700 font-medium">
                        {tender.userId?.name ?? "—"}
                      </td>
                    )}
                    <td className="px-4 py-3 text-gray-500 text-xs">
                      {formatDate(tender.createdAt)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center">
                        <a
                          href={tender.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="View"
                          className="text-blue-800 hover:text-blue-900 transition"
                        >
                          <Eye className="w-4 h-4" />
                        </a>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Tender Pagination */}
        {!isTenderTableLoading && tenderTotal > 0 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 bg-gray-50 w-full">
            <p className="text-xs text-gray-500">
              Showing{" "}
              <span className="font-semibold text-gray-700">
                {(tenderPage - 1) * TENDER_LIMIT + 1}–
                {Math.min(tenderPage * TENDER_LIMIT, tenderTotal)}
              </span>{" "}
              of{" "}
              <span className="font-semibold text-gray-700">{tenderTotal}</span>{" "}
              tender{tenderTotal !== 1 ? "s" : ""}
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setTenderPage((p) => Math.max(1, p - 1))}
                disabled={tenderPage === 1}
                className="px-3 py-1.5 text-xs bg-white border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
              >
                ← Prev
              </button>
              {buildPageButtons(tenderPage, tenderTotalPages).map(
                (item, idx) =>
                  item === "…" ? (
                    <span
                      key={`tp-${idx}`}
                      className="px-2 text-xs text-gray-400"
                    >
                      …
                    </span>
                  ) : (
                    <button
                      key={item}
                      onClick={() => setTenderPage(item as number)}
                      className={`w-8 h-7 text-xs rounded border transition cursor-pointer ${
                        tenderPage === item
                          ? "bg-blue-900 text-white border-blue-900"
                          : "bg-white border-gray-300 hover:bg-gray-100"
                      }`}
                    >
                      {item}
                    </button>
                  ),
              )}
              <button
                onClick={() =>
                  setTenderPage((p) => Math.min(tenderTotalPages, p + 1))
                }
                disabled={tenderPage >= tenderTotalPages}
                className="px-3 py-1.5 text-xs bg-white border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
              >
                Next →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
