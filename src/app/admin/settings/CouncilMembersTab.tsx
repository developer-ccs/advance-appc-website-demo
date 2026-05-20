"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Trash2, Plus, X, Search, Loader } from "lucide-react";
import { useToast } from "@/components/ui/ToastContext";
import { useConfirmDialog } from "@/components/ui/ConfirmDialogContext";

// ─── Types ────────────────────────────────────────────────────────────────────

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
  createdAt: string;
}

interface FormState {
  name: string;
  email: string;
  password?: string;
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

// ─── Mock Data ───────────────────────────────────────────────────────────────

const MOCK_COUNCILS: Council[] = [
  {
    _id: "1",
    employeeId: "ADM-001",
    userId: {
      _id: "u1",
      name: "Dr. Rajesh Kumar",
      email: "rajesh.admin@appc.gov.in",
      phoneNumber: "9876543210",
      role: "super-admin",
    },
    createdAt: new Date().toISOString(),
  },
  {
    _id: "2",
    employeeId: "EMP-102",
    userId: {
      _id: "u2",
      name: "Smt. Lakshmi Priya",
      email: "lakshmi.hr@appc.gov.in",
      phoneNumber: "9888877777",
      role: "hr",
    },
    createdAt: new Date().toISOString(),
  },
  {
    _id: "3",
    employeeId: "EXE-501",
    userId: {
      _id: "u3",
      name: "Vikram Singh",
      email: "vikram.exe@appc.gov.in",
      phoneNumber: "9111122222",
      role: "executive",
    },
    createdAt: new Date().toISOString(),
  },
];

// ─── Shared Components ────────────────────────────────────────────────────────

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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4"
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
  onChange,
}: {
  isAdd: boolean;
  form: FormState;
  onChange: any;
}) {
  return (
    <div className="space-y-3">
      <div>
        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
          Full Name
        </label>
        <input
          name="name"
          value={form.name}
          onChange={onChange}
          className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
          placeholder="Full Name"
        />
      </div>
      <div>
        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
          Email
        </label>
        <input
          name="email"
          type="email"
          value={form.email}
          onChange={onChange}
          disabled={!isAdd}
          className="w-full border border-gray-300 rounded px-3 py-2 text-sm disabled:bg-gray-50"
          placeholder="email@gov.in"
        />
      </div>
      {isAdd && (
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
            Employee ID
          </label>
          <input
            name="employeeId"
            value={form.employeeId}
            onChange={onChange}
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
            placeholder="EMP001"
          />
        </div>
      )}
      <div>
        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
          Phone
        </label>
        <input
          name="phoneNumber"
          value={form.phoneNumber}
          onChange={onChange}
          className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
          placeholder="10 Digit Number"
        />
      </div>
      <div>
        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
          Role
        </label>
        <select
          name="role"
          value={form.role}
          onChange={onChange}
          className="w-full border border-gray-300 rounded px-3 py-2 text-sm bg-white"
        >
          {ROLE_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function CouncilMembersTab() {
  const [councils, setCouncils] = useState<Council[]>(MOCK_COUNCILS);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [formLoading, setFormLoading] = useState(false);

  const { showToast } = useToast();
  const { showConfirm } = useConfirmDialog();

  // Search logic
  const filteredCouncils = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return councils;
    return councils.filter(
      (c) =>
        c.userId?.name.toLowerCase().includes(q) ||
        c.employeeId.toLowerCase().includes(q) ||
        c.userId?.email.toLowerCase().includes(q),
    );
  }, [councils, searchQuery]);

  const handleFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleAdd = async () => {
    setFormLoading(true);
    await new Promise((r) => setTimeout(r, 800)); // Simulate delay

    const newMember: Council = {
      _id: Math.random().toString(36).substr(2, 9),
      employeeId: form.employeeId,
      userId: {
        _id: "u" + Math.random(),
        name: form.name,
        email: form.email,
        phoneNumber: form.phoneNumber,
        role: form.role,
      },
      createdAt: new Date().toISOString(),
    };

    setCouncils((prev) => [newMember, ...prev]);
    setFormLoading(false);
    setShowAddModal(false);
    showToast(`${form.name} added successfully (Demo)`, "success");
    setForm(EMPTY_FORM);
  };

  const handleDelete = (id: string, name: string) => {
    showConfirm(
      async () => {
        setLoading(true);
        await new Promise((r) => setTimeout(r, 600));
        setCouncils((prev) => prev.filter((c) => c._id !== id));
        setLoading(false);
        showToast(`${name} removed from council (Demo)`, "success");
      },
      `Are you sure you want to delete ${name}?`,
      "Delete",
      "Cancel",
    );
  };

  return (
    <section>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-bold text-gray-800">Council Members</h3>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search members..."
              className="w-full border border-gray-200 bg-gray-50 rounded-lg pl-8 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="bg-blue-900 text-white px-3 py-2 rounded-lg text-sm hover:bg-blue-800 flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Plus size={14} /> Add Member
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto border border-gray-200 rounded-lg">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 text-gray-500 text-[11px] uppercase tracking-wider border-b border-gray-200">
              <th className="p-3 font-bold">Employee ID</th>
              <th className="p-3 font-bold">Name</th>
              <th className="p-3 font-bold">Role</th>
              <th className="p-3 font-bold">Email</th>
              <th className="p-3 font-bold text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="text-sm divide-y divide-gray-100">
            {filteredCouncils.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="p-8 text-center text-gray-400 italic"
                >
                  No members found matching your search.
                </td>
              </tr>
            ) : (
              filteredCouncils.map((council) => (
                <tr
                  key={council._id}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="p-3 font-mono text-xs text-gray-600">
                    {council.employeeId}
                  </td>
                  <td className="p-3 font-semibold text-gray-800">
                    {council.userId?.name}
                  </td>
                  <td className="p-3">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-tighter ${
                        council.userId?.role === "super-admin"
                          ? "bg-purple-100 text-purple-700"
                          : "bg-blue-100 text-blue-700"
                      }`}
                    >
                      {council.userId?.role}
                    </span>
                  </td>
                  <td className="p-3 text-gray-500">{council.userId?.email}</td>
                  <td className="p-3 text-center">
                    <button
                      onClick={() =>
                        handleDelete(
                          council._id,
                          council.userId?.name || "Member",
                        )
                      }
                      disabled={
                        council.userId?.role === "super-admin" || loading
                      }
                      className={`p-1.5 rounded hover:bg-red-50 transition-colors ${
                        council.userId?.role === "super-admin"
                          ? "text-gray-200"
                          : "text-red-500 cursor-pointer"
                      }`}
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <Modal
          title="Add Council Member"
          onClose={() => setShowAddModal(false)}
        >
          <FormFields isAdd={true} form={form} onChange={handleFormChange} />
          <div className="flex justify-end gap-2 mt-6">
            <button
              onClick={() => setShowAddModal(false)}
              className="px-4 py-2 text-sm text-gray-500 cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleAdd}
              disabled={formLoading || !form.name || !form.email}
              className="px-6 py-2 text-sm bg-blue-900 text-white rounded-lg hover:bg-blue-800 disabled:opacity-50 flex items-center gap-2 cursor-pointer"
            >
              {formLoading && <Loader size={14} className="animate-spin" />}
              Create Account
            </button>
          </div>
        </Modal>
      )}
    </section>
  );
}
