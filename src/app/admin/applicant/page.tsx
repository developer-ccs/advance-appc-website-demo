"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import {
  Search,
  Loader,
  Eye,
  X,
  User,
  Phone,
  Mail,
  Calendar,
  Trash2,
  AlertTriangle,
} from "lucide-react";
import CustomLoader from "@/components/ui/CustomLoader";
import { usePageLoader } from "@/hooks/usePageLoader";
import { useToast } from "@/components/ui/ToastContext";

// ─── Types ────────────────────────────────────────────────────────────────────

interface StudentUser {
  _id: string;
  name?: string;
  email?: string;
  phoneNumber?: string;
  role?: string;
  isVerified?: boolean;
  createdAt?: string;
}

interface Student {
  _id: string;
  userId: StudentUser;
  degree?: string;
  college?: string;
  passingYear?: string | number;
  registrationNumber?: string;
  address?: string;
  city?: string;
  state?: string;
  createdAt?: string;
  [key: string]: unknown;
}

interface Pagination {
  totalStudents: number;
  totalPages: number;
  currentPage: number;
  limit: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

// ─── DEMO DATA GENERATOR ──────────────────────────────────────────────────────

let DEMO_STUDENTS: Student[] = Array.from({ length: 34 }).map((_, i) => ({
  _id: `student-doc-${i + 1}`,
  userId: {
    _id: `user-id-${i + 1}`,
    name: `Demo Student ${i + 1}`,
    email: `student${i + 1}@example.com`,
    phoneNumber: `+91 98765${(i + 1).toString().padStart(5, "0")}`,
    createdAt: new Date(Date.now() - Math.random() * 10000000000).toISOString(),
    isVerified: true,
  },
  degree: "B.Pharm",
  college: "Demo Pharmacy Institute",
  passingYear: "2023",
  address: "123 Demo Street, Tech City",
}));

// ─── Helpers ──────────────────────────────────────────────────────────────────

const formatDate = (dateStr: string | null | undefined) => {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
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

// ─── View Details Modal ───────────────────────────────────────────────────────

const ViewStudentModal = ({
  student,
  onClose,
}: {
  student: Student;
  onClose: () => void;
}) => {
  const user = student.userId;

  const Row = ({
    label,
    value,
    icon,
  }: {
    label: string;
    value: string;
    icon?: React.ReactNode;
  }) => (
    <div className="flex items-start justify-between py-3 border-b border-gray-100 last:border-0 gap-4">
      <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-500 font-medium shrink-0 mt-0.5">
        {icon}
        {label}
      </div>
      <span className="text-xs sm:text-sm text-gray-800 font-semibold text-right flex-1 wrap-break-word">
        {value || "—"}
      </span>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 sm:p-6 transition-opacity">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 sm:px-6 sm:py-5 border-b border-gray-100 bg-white z-10 shrink-0">
          <div className="flex items-center gap-3">
            <h3 className="text-lg font-serif font-bold text-blue-900 leading-tight">
              Applicant Profile
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700 hover:bg-gray-100 p-2 -mr-2 rounded-full transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto px-5 py-4 sm:px-6 sm:py-5">
          <div className="space-y-4">
            <div>
              <p className="text-[10px] sm:text-xs text-gray-400 uppercase tracking-widest font-semibold mb-2 ml-1">
                Personal Info
              </p>
              <div className="bg-gray-50 rounded-xl px-4 sm:px-5 border border-gray-100">
                <Row
                  label="Full Name"
                  value={user?.name || ""}
                  icon={<User size={14} />}
                />
                <Row
                  label="Email"
                  value={user?.email || ""}
                  icon={<Mail size={14} />}
                />
                <Row
                  label="Phone"
                  value={user?.phoneNumber || ""}
                  icon={<Phone size={14} />}
                />
                <Row
                  label="Degree"
                  value={student.degree || ""}
                  icon={<User size={14} />}
                />
                <Row
                  label="Registered On"
                  value={formatDate(user?.createdAt)}
                  icon={<Calendar size={14} />}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Delete Confirmation Dialog ───────────────────────────────────────────────

const DeleteConfirmDialog = ({
  student,
  onConfirm,
  onCancel,
  isDeleting,
}: {
  student: Student;
  onConfirm: () => void;
  onCancel: () => void;
  isDeleting: boolean;
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 sm:p-6">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center gap-3 px-5 py-4 sm:px-6 sm:py-5 border-b border-gray-100">
          <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
            <AlertTriangle size={20} className="text-red-600" />
          </div>
          <div>
            <h3 className="text-base font-bold text-gray-900">
              Delete Applicant
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              This action cannot be undone
            </p>
          </div>
        </div>
        <div className="px-5 py-4 sm:px-6 sm:py-5">
          <p className="text-sm text-gray-600 leading-relaxed">
            Are you sure you want to permanently delete{" "}
            <span className="font-semibold text-gray-900">
              {student.userId?.name || "this applicant"}
            </span>
            ? Their profile and account will be removed.
          </p>
        </div>
        <div className="flex gap-3 px-5 pb-5 sm:px-6 sm:pb-6">
          <button
            onClick={onCancel}
            disabled={isDeleting}
            className="flex-1 px-4 py-2.5 text-sm font-medium border border-gray-300 bg-white text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isDeleting}
            className="flex-1 px-4 py-2.5 text-sm font-medium bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2"
          >
            {isDeleting ? (
              <>
                <Loader size={14} className="animate-spin" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 size={14} />
                Delete
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function ApplicantsPage() {
  const { showToast } = useToast();

  const [students, setStudents] = useState<Student[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    totalStudents: 0,
    totalPages: 1,
    currentPage: 1,
    limit: 10,
    hasNextPage: false,
    hasPrevPage: false,
  });
  const [loading, setLoading] = useState(true);
  const [isTableLoading, setIsTableLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [localSearch, setLocalSearch] = useState("");
  const [search, setSearch] = useState("");
  const [viewTarget, setViewTarget] = useState<Student | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Student | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const isInitialLoad = useRef(true);
  const { isLoading: isPageLoading } = usePageLoader([
    isInitialLoad.current ? loading : false,
  ]);

  // Simulated Demo Data Fetch
  const fetchStudents = useCallback(async () => {
    setLoading(true);
    try {
      // Simulate network delay
      await new Promise((resolve) => setTimeout(resolve, 600));

      // Filter Data Locally
      let filteredData = [...DEMO_STUDENTS];
      if (search.trim()) {
        const query = search.toLowerCase();
        filteredData = filteredData.filter(
          (s) =>
            s.userId.name?.toLowerCase().includes(query) ||
            s.userId.email?.toLowerCase().includes(query),
        );
      }

      // Pagination Logic Locally
      const limit = 10;
      const totalStudents = filteredData.length;
      const totalPages = Math.ceil(totalStudents / limit) || 1;

      // Auto-correct page if out of bounds due to deletion/search
      const safePage = Math.min(currentPage, totalPages);
      if (safePage !== currentPage && safePage > 0) {
        setCurrentPage(safePage);
        return; // Effect will re-trigger with new page
      }

      const startIndex = (safePage - 1) * limit;
      const paginatedData = filteredData.slice(startIndex, startIndex + limit);

      setStudents(paginatedData);
      setPagination({
        totalStudents,
        totalPages,
        currentPage: safePage,
        limit,
        hasNextPage: safePage < totalPages,
        hasPrevPage: safePage > 1,
      });
    } catch (err: unknown) {
      showToast("Failed to fetch demo applicants.", "error");
    } finally {
      setLoading(false);
    }
  }, [currentPage, search, showToast]);

  // Simulated Delete Action
  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;

    setIsDeleting(true);
    try {
      // Simulate network delay
      await new Promise((resolve) => setTimeout(resolve, 800));

      // Remove from global DEMO_STUDENTS array
      DEMO_STUDENTS = DEMO_STUDENTS.filter((s) => s._id !== deleteTarget._id);

      showToast(
        `[Demo] ${deleteTarget.userId?.name || "Applicant"} has been deleted.`,
        "success",
      );

      // Re-fetch to apply pagination/filters
      fetchStudents();
    } catch (err: unknown) {
      showToast("Failed to delete demo applicant.", "error");
    } finally {
      setIsDeleting(false);
      setDeleteTarget(null);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      if (localSearch !== search) {
        setSearch(localSearch);
        setCurrentPage(1);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [localSearch, search]);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  useEffect(() => {
    if (!loading && isInitialLoad.current) {
      isInitialLoad.current = false;
    }
  }, [loading]);

  useEffect(() => {
    if (loading) {
      setIsTableLoading(true);
    } else {
      const timer = setTimeout(() => setIsTableLoading(false), 600);
      return () => clearTimeout(timer);
    }
  }, [loading]);

  if (isPageLoading) {
    return <CustomLoader fullPage message="Loading applicant records..." />;
  }

  const pages = getPagesToShow(currentPage, pagination.totalPages);
  const startEntry =
    students.length === 0 ? 0 : (currentPage - 1) * pagination.limit + 1;
  const endEntry = Math.min(
    currentPage * pagination.limit,
    pagination.totalStudents,
  );

  return (
    <>
      {viewTarget && (
        <ViewStudentModal
          student={viewTarget}
          onClose={() => setViewTarget(null)}
        />
      )}

      {deleteTarget && (
        <DeleteConfirmDialog
          student={deleteTarget}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeleteTarget(null)}
          isDeleting={isDeleting}
        />
      )}

      <div className="space-y-4 sm:space-y-6">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="w-full md:flex-1 text-center md:text-left">
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-blue-900">
              Applicants List
            </h2>
            <p className="text-xs sm:text-sm text-gray-600 mt-1 mx-auto md:mx-0">
              View all students and applicants registered on the platform in one
              centralized directory with their details and activity.
            </p>
          </div>

          {/* Stats Pill */}
          <div className="flex items-center justify-center gap-2 bg-blue-50 border border-blue-200 rounded-lg px-4 py-2.5 w-full md:w-auto shrink-0 shadow-sm">
            <div className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
            <span className="text-xs sm:text-sm font-semibold text-blue-900 whitespace-nowrap">
              {pagination.totalStudents.toLocaleString()} Total Applicants
            </span>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="bg-white p-3 sm:p-4 rounded-xl shadow-sm border border-gray-200 flex flex-col sm:flex-row gap-3 items-center">
          <div className="w-full relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search by name and email..."
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-900 focus:ring-1 focus:ring-blue-900 focus:bg-white transition-all"
            />
          </div>
          <button
            onClick={() => {
              setLocalSearch("");
              setSearch("");
              setCurrentPage(1);
            }}
            disabled={!localSearch}
            className="w-full sm:w-auto px-5 py-2.5 text-sm font-medium border bg-red-600 text-white border-red-600 rounded-lg hover:bg-red-700 hover:border-red-700 transition-colors cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <X size={16} /> Clear
          </button>
        </div>

        {/* Responsive Table Wrapper */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-200">
              <thead>
                <tr className="bg-gray-50 text-gray-500 text-xs sm:text-sm uppercase tracking-wider border-b border-gray-200">
                  <th className="px-4 py-3 sm:py-4 text-center font-semibold w-16">
                    SlNo
                  </th>
                  <th className="px-4 py-3 sm:py-4 font-semibold">Name</th>
                  <th className="px-4 py-3 sm:py-4 text-center font-semibold">
                    Email
                  </th>
                  <th className="px-4 py-3 sm:py-4 text-center font-semibold">
                    Phone
                  </th>
                  <th className="px-4 py-3 sm:py-4 text-center font-semibold">
                    Registered
                  </th>
                  <th className="px-4 py-3 sm:py-4 text-center font-semibold w-28">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {/* Loading state */}
                {isTableLoading && (
                  <tr>
                    <td colSpan={6} className="text-center py-16 text-gray-500">
                      <div className="flex flex-col items-center gap-3">
                        <Loader
                          size={32}
                          className="animate-spin text-blue-900"
                        />
                        <p className="font-medium text-sm">
                          Loading applicants...
                        </p>
                      </div>
                    </td>
                  </tr>
                )}

                {/* Data Rows */}
                {!isTableLoading &&
                  students.map((student, index) => (
                    <tr
                      key={student._id}
                      className="hover:bg-gray-50/80 transition-colors group"
                    >
                      <td className="px-4 py-3 sm:py-4 text-xs sm:text-sm text-gray-500 text-center whitespace-nowrap">
                        {(currentPage - 1) * pagination.limit + index + 1}
                      </td>
                      <td className="px-4 py-3 sm:py-4 whitespace-nowrap">
                        <span className="font-semibold text-gray-800 text-sm">
                          {student.userId?.name || "—"}
                        </span>
                      </td>
                      <td className="px-4 py-3 sm:py-4 text-xs sm:text-sm text-gray-600 text-center whitespace-nowrap">
                        {student.userId?.email || "—"}
                      </td>
                      <td className="px-4 py-3 sm:py-4 text-xs sm:text-sm text-gray-600 text-center whitespace-nowrap">
                        {student.userId?.phoneNumber || "—"}
                      </td>
                      <td className="px-4 py-3 sm:py-4 text-xs sm:text-sm text-gray-500 text-center whitespace-nowrap">
                        {formatDate(student.userId?.createdAt)}
                      </td>
                      <td className="px-4 py-3 sm:py-4">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => setViewTarget(student)}
                            className="p-2 text-blue-600 hover:text-blue-900 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                            title="View Details"
                          >
                            <Eye size={18} />
                          </button>
                          <button
                            onClick={() => setDeleteTarget(student)}
                            className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                            title="Delete Applicant"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}

                {/* Empty state */}
                {!isTableLoading && students.length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-center py-16 text-gray-400">
                      <div className="flex flex-col items-center gap-2">
                        <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center mb-2">
                          <Search size={24} className="text-gray-300" />
                        </div>
                        <p className="font-semibold text-gray-600">
                          No applicants found
                        </p>
                        <p className="text-xs sm:text-sm max-w-sm mx-auto text-center px-4">
                          {search
                            ? "Try adjusting your search filters to find what you're looking for."
                            : "No students have registered on the platform yet."}
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="px-4 sm:px-6 py-4 border-t border-gray-200 flex flex-col md:flex-row items-center justify-between bg-gray-50 gap-4">
            <span className="text-xs sm:text-sm text-gray-600 text-center md:text-left w-full md:w-auto font-medium">
              {isTableLoading
                ? "Calculating..."
                : `Showing ${startEntry} to ${endEntry} of ${pagination.totalStudents} entries`}
            </span>
            <div className="flex gap-1.5 flex-wrap justify-center w-full md:w-auto">
              <button
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={!pagination.hasPrevPage || isTableLoading}
                className="px-3 sm:px-4 py-1.5 sm:py-2 border border-gray-300 bg-white rounded-md text-xs sm:text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors cursor-pointer"
              >
                ← Prev
              </button>

              {/* Page Numbers */}
              <div className="hidden sm:flex gap-1.5">
                {pages[0] > 1 && (
                  <>
                    <button
                      onClick={() => setCurrentPage(1)}
                      className="w-8 sm:w-9 h-8 sm:h-9 flex items-center justify-center border rounded-md border-gray-300 bg-white text-gray-700 text-xs sm:text-sm hover:bg-gray-50 transition-colors cursor-pointer"
                    >
                      1
                    </button>
                    {pages[0] > 2 && (
                      <span className="w-8 h-8 flex items-center justify-center text-gray-400 text-sm">
                        ...
                      </span>
                    )}
                  </>
                )}

                {pages.map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    disabled={isTableLoading}
                    className={`w-8 sm:w-9 h-8 sm:h-9 flex items-center justify-center border rounded-md text-xs sm:text-sm font-medium transition-colors cursor-pointer ${
                      currentPage === page
                        ? "bg-blue-900 text-white border-blue-900 shadow-sm"
                        : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    {page}
                  </button>
                ))}

                {pages[pages.length - 1] < pagination.totalPages && (
                  <>
                    {pages[pages.length - 1] < pagination.totalPages - 1 && (
                      <span className="w-8 h-8 flex items-center justify-center text-gray-400 text-sm">
                        ...
                      </span>
                    )}
                    <button
                      onClick={() => setCurrentPage(pagination.totalPages)}
                      className="w-8 sm:w-9 h-8 sm:h-9 flex items-center justify-center border rounded-md border-gray-300 bg-white text-gray-700 text-xs sm:text-sm hover:bg-gray-50 transition-colors cursor-pointer"
                    >
                      {pagination.totalPages}
                    </button>
                  </>
                )}
              </div>

              <button
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={!pagination.hasNextPage || isTableLoading}
                className="px-3 sm:px-4 py-1.5 sm:py-2 border border-gray-300 bg-white rounded-md text-xs sm:text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors cursor-pointer"
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
