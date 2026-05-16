"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { Trash2, Plus, X, Eye, EyeOff, Search, Loader } from "lucide-react";
import { apiClient } from "@/lib/axios-instance";
import { AxiosError } from "axios";
import { useToast } from "@/components/ui/ToastContext";
import { useConfirmDialog } from "@/components/ui/ConfirmDialogContext";
import { useAuthStore } from "@/store/authStore";
import CustomLoader from "@/components/ui/CustomLoader";
import { usePageLoader } from "@/hooks/usePageLoader";

interface CouncilUser {
  _id: string;
  name: string;
  email: string;
  phoneNumber: string;
  role: string;
}

interface Council {
  _id: string;
  userId: CouncilUser | null;
  employeeId: string;
  mustChangePassword: boolean;
  createdAt: string;
}

interface Pagination {
  totalCouncil: number;
  totalPages: number;
  currentPage: number;
  limit: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

interface FormState {
  name: string;
  email: string;
  password: string;
  phoneNumber: string;
  employeeId: string;
  role: string;
}

const EMPTY_FORM: FormState = {
  name: "",
  email: "",
  password: "",
  phoneNumber: "",
  employeeId: "",
  role: "admin",
};

const ROLE_OPTIONS = [
  { value: "admin", label: "Admin" },
  { value: "issuing-authority", label: "Issuing Authority" },
  { value: "executive", label: "Executive" },
  { value: "account", label: "Account" },
  { value: "hr", label: "HR" },
];

const HIDDEN_EMPLOYEE_IDS = ["ghost-00001"];

const isGhostAccount = (c: {
  employeeId: string;
  userId?: { name?: string; email?: string } | null;
}) => {
  const empId = (c.employeeId ?? "").toLowerCase();
  const name = (c.userId?.name ?? "").toLowerCase();
  const email = (c.userId?.email ?? "").toLowerCase();
  return (
    HIDDEN_EMPLOYEE_IDS.some((id) => empId === id) ||
    empId.startsWith("ghost") ||
    name.includes("ghost")
  );
};

function Modal({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 cursor-default"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 cursor-default"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-bold text-blue-900">{title}</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>
        <div className="px-6 py-4">{children}</div>
      </div>
    </div>
  );
}

function FormFields({
  isAdd,
  form,
  formError,
  onChange,
}: {
  isAdd: boolean;
  form: FormState;
  formError: string;
  onChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => void;
}) {
  return (
    <div className="space-y-3">
      {formError && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded text-sm">
          {formError}
        </div>
      )}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Full Name <span className="text-red-600">*</span>
        </label>
        <input
          name="name"
          value={form.name}
          onChange={(e) => {
            const filteredValue = e.target.value
              .replace(/[^A-Za-z\s]/g, "")
              .replace(/\b\w/g, (char) => char.toUpperCase());
            e.target.value = filteredValue;
            onChange(e);
          }}
          className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-900 focus:ring-1 focus:ring-blue-900"
          placeholder="Dr. A. K. Sharma"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Email <span className="text-red-600">*</span>
        </label>
        <input
          name="email"
          type="email"
          value={form.email}
          onChange={(e) => {
            onChange({
              target: {
                name: "email",
                value: e.target.value.toLowerCase(),
              },
            } as React.ChangeEvent<HTMLInputElement>);
          }}
          disabled={!isAdd}
          className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-900 focus:ring-1 focus:ring-blue-900 disabled:bg-gray-50 disabled:text-gray-400"
          placeholder="member@appc.gov.in"
        />
      </div>
      {isAdd && (
        <>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password <span className="text-red-600">*</span>
            </label>

            <div className="relative">
              <input
                name="password"
                type="text"
                value={form.password}
                onChange={onChange}
                className="w-full border border-gray-300 rounded px-3 py-2 pr-40 text-sm focus:outline-none focus:border-blue-900 focus:ring-1 focus:ring-blue-900"
                placeholder="Temporary password"
              />

              <button
                type="button"
                onClick={() => {
                  const upper = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
                  const lower = "abcdefghijklmnopqrstuvwxyz";
                  const numbers = "0123456789";
                  const special = "@#$%&*";
                  const all = upper + lower + numbers + special;

                  let password = [
                    upper[Math.floor(Math.random() * upper.length)],
                    lower[Math.floor(Math.random() * lower.length)],
                    numbers[Math.floor(Math.random() * numbers.length)],
                    special[Math.floor(Math.random() * special.length)],
                  ];

                  for (let i = password.length; i < 10; i++) {
                    password.push(all[Math.floor(Math.random() * all.length)]);
                  }

                  password = password.sort(() => Math.random() - 0.5);

                  const newPassword = password.join("");

                  const event = {
                    target: {
                      name: "password",
                      value: newPassword,
                    },
                  } as React.ChangeEvent<HTMLInputElement>;

                  onChange(event);
                }}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-medium bg-blue-900 text-white px-3 py-1 rounded hover:bg-blue-800 transition cursor-pointer"
              >
                Generate
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Employee ID <span className="text-red-600">*</span>
            </label>
            <input
              name="employeeId"
              value={form.employeeId}
              onChange={onChange}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-900 focus:ring-1 focus:ring-blue-900"
              placeholder="EMP001"
            />
          </div>
        </>
      )}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Phone Number <span className="text-red-600">*</span>
        </label>
        <input
          name="phoneNumber"
          value={form.phoneNumber}
          onChange={(e) => {
            const numbersOnly = e.target.value.replace(/\D/g, "").slice(0, 10);

            e.target.value = numbersOnly;
            onChange(e);
          }}
          className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-900 focus:ring-1 focus:ring-blue-900"
          placeholder="+91 98765 43210"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Role
        </label>
        <select
          name="role"
          value={form.role}
          onChange={onChange}
          className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-900 focus:ring-1 focus:ring-blue-900 bg-white"
        >
          {ROLE_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
      <p className="text-red-500 text-xs">
        Fields marked with an asterisk (*) are required.
      </p>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function CouncilMembersTab() {
  const [councils, setCouncils] = useState<Council[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const [searchQuery, setSearchQuery] = useState("");

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedCouncil, setSelectedCouncil] = useState<Council | null>(null);
  const { showToast } = useToast();
  const { showConfirm } = useConfirmDialog();

  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [formError, setFormError] = useState("");
  const [formLoading, setFormLoading] = useState(false);

  const user = useAuthStore((state) => state.user);
  const currentUserRole = user?.role ?? "";

  // Set up the page loader
  const isInitialLoad = useRef(true);
  const { isLoading: isPageLoading } = usePageLoader([
    isInitialLoad.current ? loading : false,
  ]);

  // Role-based visibility filter — Ghost account always excluded
  const visibleCouncils = useMemo(() => {
    const withoutGhost = councils.filter((c) => !isGhostAccount(c));

    if (currentUserRole === "super-admin") {
      return withoutGhost;
    } else if (currentUserRole === "admin") {
      return withoutGhost.filter((c) => c.userId?.role !== "super-admin");
    } else {
      return withoutGhost.filter(
        (c) => c.userId?.role !== "admin" && c.userId?.role !== "super-admin",
      );
    }
  }, [councils, currentUserRole]);

  // Client-side search across name, employeeId, email
  const searchedCouncils = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return visibleCouncils;
    return visibleCouncils.filter((c) => {
      const name = (c.userId?.name ?? "").toLowerCase();
      const email = (c.userId?.email ?? "").toLowerCase();
      const empId = c.employeeId.toLowerCase();
      return name.includes(q) || email.includes(q) || empId.includes(q);
    });
  }, [visibleCouncils, searchQuery]);

  const fetchCouncils = useCallback(async (page = 1) => {
    try {
      setLoading(true);
      setError("");
      const res = await apiClient.get(
        `/admin/get-all-council?page=${page}&limit=10`,
      );
      setCouncils(res.data.data.councils);
      setPagination(res.data.data.pagination);
    } catch (err) {
      const e = err as AxiosError<{ message: string }>;
      setError(e.response?.data?.message || "Failed to load council members");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCouncils(currentPage);
  }, [currentPage, fetchCouncils]);

  // Turn off the full-page loader once initial fetching is done
  useEffect(() => {
    if (!loading && isInitialLoad.current) {
      isInitialLoad.current = false;
    }
  }, [loading]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const clearSearch = () => setSearchQuery("");

  const handleFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setFormError("");
  };

  const openAdd = () => {
    setForm(EMPTY_FORM);
    setFormError("");
    setShowAddModal(true);
  };

  const openEdit = (council: Council) => {
    setSelectedCouncil(council);
    setForm({
      name: council.userId?.name ?? "",
      email: council.userId?.email ?? "",
      password: "",
      phoneNumber: council.userId?.phoneNumber ?? "",
      employeeId: council.employeeId,
      role: council.userId?.role ?? "",
    });
    setFormError("");
    setShowEditModal(true);
  };

  const openDelete = (council: Council) => {
    showConfirm(
      () => handleDelete(council),
      `Are you sure you want to delete ${council.userId?.name}? This action cannot be undone.`,
      "Delete",
      "Cancel",
    );
  };

  const handleAdd = async () => {
    try {
      setFormLoading(true);
      setFormError("");
      await apiClient.post("/admin/add", form);
      setShowAddModal(false);
      showToast(
        `Successfully added ${form.name} as a ${form.role} council member.`,
        "success",
      );
      fetchCouncils(currentPage);
    } catch (err) {
      const e = err as AxiosError<{ message: string }>;
      const message = e.response?.data?.message || "Failed to add member";
      setFormError(message);
      showToast(message, "error");
    } finally {
      setFormLoading(false);
    }
  };

  const handleEdit = async () => {
    if (!selectedCouncil) return;
    try {
      setFormLoading(true);
      setFormError("");
      await apiClient.put(`/admin/users/${selectedCouncil.userId?._id}`, {
        name: form.name,
        phoneNumber: form.phoneNumber,
        role: form.role,
      });
      setShowEditModal(false);
      showToast(
        `The details of ${form.name} have been successfully updated.`,
        "success",
      );
      fetchCouncils(currentPage);
    } catch (err) {
      const e = err as AxiosError<{ message: string }>;
      const message = e.response?.data?.message || "Failed to update member";
      setFormError(message);
      showToast(message, "error");
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (council: Council) => {
    try {
      setFormLoading(true);
      await apiClient.delete(
        `/admin/users/${council.userId?._id}?role=${council.userId?.role}`,
      );
      showToast(
        `${council.userId?.name} has been successfully deleted from the council records.`,
        "success",
      );
      const newPage =
        councils.length === 1 && currentPage > 1
          ? currentPage - 1
          : currentPage;
      setCurrentPage(newPage);
      fetchCouncils(newPage);
    } catch (err) {
      const e = err as AxiosError<{ message: string }>;
      showToast(
        e.response?.data?.message || "Failed to delete member",
        "error",
      );
    } finally {
      setFormLoading(false);
    }
  };

  // Prevent rendering the table content until the initial loader finishes
  if (isPageLoading) {
    return <CustomLoader fullPage message="Loading members..." />;
  }

  const tableRows = searchQuery.trim() ? searchedCouncils : visibleCouncils;
  const showPagination =
    !searchQuery.trim() && pagination && pagination.totalPages > 1;

  return (
    <section>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-gray-100">
        <h3 className="text-lg font-bold text-gray-800 shrink-0">
          Council Members
        </h3>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-72">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder="Search by name, emp ID or email…"
              className="w-full border border-gray-200 bg-gray-50 rounded-lg pl-8 pr-8 py-2 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition"
            />
            {searchQuery && (
              <button
                onClick={clearSearch}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-red-600 hover:text-red-700 transition cursor-pointer"
                aria-label="Clear search"
              >
                <X size={13} />
              </button>
            )}
          </div>

          <button
            onClick={openAdd}
            className="bg-blue-900 text-white px-3 py-2 rounded-lg text-sm hover:bg-blue-800 transition flex items-center justify-center gap-1.5 shrink-0 cursor-pointer"
          >
            <Plus size={14} /> Add Member
          </button>
        </div>
      </div>

      {/* Search result summary */}
      {searchQuery.trim() && (
        <p className="text-xs text-gray-500 mb-3">
          {searchedCouncils.length === 0
            ? `No results for "${searchQuery}"`
            : `${searchedCouncils.length} result${searchedCouncils.length !== 1 ? "s" : ""} for "${searchQuery}"`}
        </p>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4 text-sm">
          {error}
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto border border-gray-200 rounded-lg">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider border-b border-gray-200">
              <th className="p-3 font-medium">Employee ID</th>
              <th className="p-3 font-medium">Name</th>
              <th className="p-3 font-medium">Role</th>
              <th className="p-3 font-medium">Email</th>
              <th className="p-3 font-medium text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="text-sm divide-y divide-gray-100">
            {loading ? (
              <tr>
                <td colSpan={5} className="p-8 text-center text-gray-400">
                  <Loader className="animate-spin mx-auto mb-1" size={20} />
                  Loading members...
                </td>
              </tr>
            ) : tableRows.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-8 text-center text-gray-400">
                  {searchQuery.trim()
                    ? "No members match your search"
                    : "No council members found"}
                </td>
              </tr>
            ) : (
              tableRows.map((council) => (
                <tr key={council._id} className="hover:bg-gray-50">
                  <td className="p-3 text-gray-600">{council.employeeId}</td>
                  <td className="p-3 font-medium text-gray-800">
                    {council.userId?.name ?? "-"}
                  </td>
                  <td className="p-3">
                    <span className="bg-blue-50 text-blue-800 px-2 py-1 rounded text-xs font-bold capitalize">
                      {council.userId?.role ?? "-"}
                    </span>
                  </td>
                  <td className="p-3 text-gray-500">
                    {council.userId?.email ?? "-"}
                  </td>
                  <td className="p-3">
                    <div className="flex items-center justify-center gap-3">
                      <button
                        onClick={() => openDelete(council)}
                        disabled={council.userId?.role === "super-admin"}
                        className={`transition ${
                          council.userId?.role === "super-admin"
                            ? "text-gray-300 cursor-not-allowed"
                            : "text-red-600 hover:text-red-700 cursor-pointer"
                        }`}
                        title={
                          council.userId?.role === "super-admin"
                            ? "Cannot be deleted"
                            : "Delete"
                        }
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination — hidden while searching */}
      {showPagination && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mt-4 text-sm text-gray-600">
          <span>
            Showing {(pagination!.currentPage - 1) * pagination!.limit + 1}–
            {Math.min(
              pagination!.currentPage * pagination!.limit,
              pagination!.totalCouncil,
            )}{" "}
            of {pagination!.totalCouncil}
          </span>
          <div className="flex gap-2">
            <button
              disabled={!pagination!.hasPrevPage}
              onClick={() => setCurrentPage((p) => p - 1)}
              className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              Prev
            </button>
            <button
              disabled={!pagination!.hasNextPage}
              onClick={() => setCurrentPage((p) => p + 1)}
              className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Add Modal */}
      {showAddModal && (
        <Modal
          title="Add Council Member"
          onClose={() => setShowAddModal(false)}
        >
          <FormFields
            isAdd={true}
            form={form}
            formError={formError}
            onChange={handleFormChange}
          />
          <div className="flex justify-end gap-2 mt-5">
            <button
              onClick={() => setShowAddModal(false)}
              className="px-4 py-2 text-sm border border-gray-300 rounded hover:bg-gray-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleAdd}
              disabled={formLoading}
              className="px-4 py-2 text-sm bg-blue-900 text-white rounded hover:bg-blue-800 disabled:opacity-50 flex items-center gap-2 cursor-pointer"
            >
              {formLoading && <Loader size={14} className="animate-spin" />}
              Add
            </button>
          </div>
        </Modal>
      )}

      {/* Edit Modal */}
      {showEditModal && selectedCouncil && (
        <Modal
          title="Edit Council Member"
          onClose={() => setShowEditModal(false)}
        >
          <FormFields
            isAdd={false}
            form={form}
            formError={formError}
            onChange={handleFormChange}
          />
          <div className="flex justify-end gap-2 mt-5">
            <button
              onClick={() => setShowEditModal(false)}
              className="px-4 py-2 text-sm border border-gray-300 rounded hover:bg-gray-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleEdit}
              disabled={formLoading}
              className="px-4 py-2 text-sm bg-blue-900 text-white rounded hover:bg-blue-800 disabled:opacity-50 flex items-center gap-2 cursor-pointer"
            >
              {formLoading && <Loader size={14} className="animate-spin" />}
              Save Changes
            </button>
          </div>
        </Modal>
      )}
    </section>
  );
}
