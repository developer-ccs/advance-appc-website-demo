"use client";

import { useState, useEffect, useCallback, useMemo, memo } from "react";
import {
  Loader2,
  Search,
  ShieldCheck,
  Shield,
  Signature,
  User,
  Calculator,
  Users,
  X,
} from "lucide-react";
import { useToast } from "@/components/ui/ToastContext";
import { useConfirmDialog } from "@/components/ui/ConfirmDialogContext";

// ─── Mock Data ───────────────────────────────────────────────────────────────

const MOCK_USERS: UserRecord[] = [
  {
    _id: "u1",
    name: "Dr. Rajesh Kumar",
    employeeId: "ADM-001",
    role: "super-admin",
  },
  {
    _id: "u2",
    name: "Smt. Lakshmi Priya",
    employeeId: "ADM-002",
    role: "admin",
  },
  { _id: "u3", name: "Vikram Singh", employeeId: "EXE-501", role: "executive" },
  { _id: "u4", name: "Ananya Sharma", employeeId: "ACC-202", role: "account" },
];

const INITIAL_PERMISSIONS: Permission[] = [
  {
    _id: "p1",
    action: "UPLOAD_TENDER",
    description: "Can upload new tenders",
    grantedUsers: [{ _id: "u1", name: "Dr. Rajesh Kumar", email: "" }],
  },
  {
    _id: "p2",
    action: "DELETE_TENDER",
    description: "Can remove tenders",
    grantedUsers: [{ _id: "u1", name: "Dr. Rajesh Kumar", email: "" }],
  },
  {
    _id: "p3",
    action: "ADD_COUNSELLOR",
    description: "Can add new members",
    grantedUsers: [
      { _id: "u1", name: "Dr. Rajesh Kumar", email: "" },
      { _id: "u2", name: "Smt. Lakshmi Priya", email: "" },
    ],
  },
  {
    _id: "p4",
    action: "GENERAL_SETTINGS",
    description: "Can edit portal settings",
    grantedUsers: [{ _id: "u1", name: "Dr. Rajesh Kumar", email: "" }],
  },
  {
    _id: "p5",
    action: "UPLOAD_PDF",
    description: "Can upload notices",
    grantedUsers: [
      { _id: "u1", name: "Dr. Rajesh Kumar", email: "" },
      { _id: "u3", name: "Vikram Singh", email: "" },
    ],
  },
];

// ─── Constants & Helpers (Retained from original) ────────────────────────────

const GROUP_MAP: Record<string, string[]> = {
  "Tender Management": [
    "UPLOAD_TENDER",
    "UPDATE_TENDER",
    "DELETE_TENDER",
    "UPDATE_TENEDER_STATUS",
  ],
  "Forms & Notices Management": ["UPLOAD_PDF", "DELETE_PDF", "UPDATE_PDF"],
  "User Management": ["ADD_COUNSELLOR", "DELETE_USER"],
  Settings: ["GENERAL_SETTINGS"],
};

const COUNCIL_RESTRICTED_GROUPS = new Set(["User Management", "Settings"]);

const ACTION_LABELS: Record<string, string> = {
  ADD_COUNSELLOR: "Add Counsellor",
  DELETE_USER: "Delete User",
  UPLOAD_TENDER: "Upload Tender",
  DELETE_TENDER: "Delete Tender",
  UPLOAD_PDF: "Upload PDF",
  GENERAL_SETTINGS: "General Settings",
};

const GROUP_COLORS: Record<string, string> = {
  "User Management": "bg-blue-50 text-blue-700",
  "Tender Management": "bg-teal-50 text-teal-700",
  "Forms & Notices Management": "bg-purple-50 text-purple-700",
  Settings: "bg-gray-100 text-gray-600",
};

// ─── Types ────────────────────────────────────────────────────────────────────

interface UserRecord {
  _id: string;
  name: string;
  employeeId: string;
  role: string;
}
interface GrantedUser {
  _id: string;
  name: string;
  email: string;
}
interface Permission {
  _id: string;
  action: string;
  description: string;
  grantedUsers: GrantedUser[];
}

const USER_COL_WIDTH = 180;
const ROLE_COL_WIDTH = 150;

// ─── Micro Components ────────────────────────────────────────────────────────

const Tick = () => (
  <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
    <path
      d="M1 4L3.5 6.5L9 1"
      stroke="white"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
const Dash = () => (
  <svg width="10" height="2" viewBox="0 0 10 2" fill="none">
    <path d="M1 1H9" stroke="white" strokeWidth="2" strokeLinecap="round" />
  </svg>
);
const Cross = () => (
  <svg width="8" height="8" viewBox="0 0 10 10" fill="none">
    <path
      d="M2 2L8 8M8 2L2 8"
      stroke="#d1d5db"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
);

const Checkbox = memo(
  ({ checked, indeterminate, loading, onClick, disabled }: any) => {
    if (loading)
      return (
        <Loader2 size={14} className="animate-spin text-gray-300 mx-auto" />
      );
    const active = checked || indeterminate;
    return (
      <button
        onClick={onClick}
        disabled={disabled}
        className="mx-auto block cursor-pointer disabled:opacity-30"
      >
        <div
          className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${active ? "bg-blue-900 border-blue-900" : "bg-white border-gray-300 hover:border-blue-400"}`}
        >
          {checked ? <Tick /> : indeterminate ? <Dash /> : null}
        </div>
      </button>
    );
  },
);

// ─── Main Component ───────────────────────────────────────────────────────────

export default function AccessControlTab() {
  const [permissions, setPermissions] =
    useState<Permission[]>(INITIAL_PERMISSIONS);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);

  const { showToast } = useToast();
  const { showConfirm } = useConfirmDialog();

  // Simulate initial fetch
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  const isSuperAdmin = true; // Hardcoded for Demo

  // Permission logic
  const isGranted = (perm: Permission, uid: string) =>
    perm.grantedUsers.some((u) => u._id === uid);

  const handleToggle = (action: string, userId: string, userName: string) => {
    const perm = permissions.find((p) => p.action === action);
    const currentlyGranted = perm ? isGranted(perm, userId) : false;

    showConfirm(
      async () => {
        const procKey = `${action}-${userId}`;
        setProcessing(procKey);
        await new Promise((r) => setTimeout(r, 600)); // Simulate API delay

        setPermissions((prev) =>
          prev.map((p) => {
            if (p.action !== action) return p;
            return {
              ...p,
              grantedUsers: currentlyGranted
                ? p.grantedUsers.filter((u) => u._id !== userId)
                : [
                    ...p.grantedUsers,
                    { _id: userId, name: userName, email: "" },
                  ],
            };
          }),
        );

        setProcessing(null);
        showToast(
          `Permission ${currentlyGranted ? "revoked from" : "granted to"} ${userName}`,
          "success",
        );
      },
      `${currentlyGranted ? "Revoke" : "Grant"} ${action.replace(/_/g, " ")} for ${userName}?`,
      "Confirm",
      "Cancel",
    );
  };

  const filteredUsers = useMemo(() => {
    const q = search.toLowerCase();
    return MOCK_USERS.filter(
      (u) =>
        u.name.toLowerCase().includes(q) ||
        u.employeeId.toLowerCase().includes(q),
    );
  }, [search]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-gray-400">
        <Loader2 className="animate-spin mb-2" />
        <p className="text-sm">Loading Access Matrix...</p>
      </div>
    );
  }

  return (
    <section className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-3">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-bold text-gray-800">
            User Access Control
          </h3>
        </div>
        <div className="relative">
          <Search size={14} className="absolute left-3 top-2.5 text-gray-400" />
          <input
            type="text"
            placeholder="Search users..."
            className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm w-full sm:w-64 focus:outline-none focus:ring-2 focus:ring-blue-100"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="border border-gray-200 rounded-lg overflow-x-auto shadow-sm">
        <table className="w-full text-sm border-collapse min-w-200">
          <thead>
            {/* Group Headers */}
            <tr className="bg-gray-50 border-b border-gray-200">
              <th
                className="sticky left-0 z-20 bg-gray-50 p-3 text-left text-[10px] font-bold uppercase text-gray-400 border-r"
                style={{ width: USER_COL_WIDTH }}
              >
                User Details
              </th>
              <th
                className="p-3 text-left text-[10px] font-bold uppercase text-gray-400 border-r"
                style={{ width: ROLE_COL_WIDTH }}
              >
                Role
              </th>
              {Object.keys(GROUP_MAP).map((group) => (
                <th
                  key={group}
                  colSpan={GROUP_MAP[group].length}
                  className={`p-2 text-center text-[10px] font-bold uppercase border-r last:border-r-0 ${GROUP_COLORS[group]}`}
                >
                  {group}
                </th>
              ))}
            </tr>
            {/* Action Headers */}
            <tr className="bg-white border-b border-gray-200">
              <th className="sticky left-0 z-20 bg-white border-r"></th>
              <th className="border-r"></th>
              {Object.entries(GROUP_MAP).map(([group, actions]) =>
                actions.map((action) => (
                  <th
                    key={action}
                    className="p-2 text-[10px] font-semibold text-gray-600 border-r last:border-r-0 min-w-25 text-center"
                  >
                    {ACTION_LABELS[action] || action.replace(/_/g, " ")}
                  </th>
                )),
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredUsers.map((user) => {
              const isCouncil =
                user.role !== "admin" && user.role !== "super-admin";

              return (
                <tr
                  key={user._id}
                  className="hover:bg-gray-50 transition-colors"
                >
                  {/* Sticky User Cell */}
                  <td className="sticky left-0 z-10 bg-white p-3 border-r group-hover:bg-gray-50">
                    <p className="font-bold text-gray-800 truncate">
                      {user.name}
                    </p>
                    <p className="text-[10px] text-gray-400 font-mono uppercase tracking-tighter">
                      {user.employeeId}
                    </p>
                  </td>

                  {/* Role Cell */}
                  <td className="p-3 border-r">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-tighter ${
                        user.role === "super-admin"
                          ? "bg-amber-100 text-amber-800"
                          : user.role === "admin"
                            ? "bg-purple-100 text-purple-800"
                            : "bg-blue-100 text-blue-700"
                      }`}
                    >
                      {user.role}
                    </span>
                  </td>

                  {/* Permission Cells */}
                  {Object.entries(GROUP_MAP).map(([group, actions]) =>
                    actions.map((action) => {
                      const isRestricted =
                        isCouncil && COUNCIL_RESTRICTED_GROUPS.has(group);
                      const perm = permissions.find((p) => p.action === action);
                      const granted = perm ? isGranted(perm, user._id) : false;
                      const isToggling = processing === `${action}-${user._id}`;

                      if (isRestricted) {
                        return (
                          <td
                            key={action}
                            className="p-3 text-center border-r last:border-r-0 bg-red-50/30"
                          >
                            <div className="mx-auto flex items-center justify-center opacity-20">
                              <Cross />
                            </div>
                          </td>
                        );
                      }

                      return (
                        <td
                          key={action}
                          className="p-3 text-center border-r last:border-r-0"
                        >
                          <Checkbox
                            checked={user.role === "super-admin" || granted}
                            loading={isToggling}
                            disabled={user.role === "super-admin"}
                            onClick={() =>
                              handleToggle(action, user._id, user.name)
                            }
                          />
                        </td>
                      );
                    }),
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="p-3 bg-blue-50 border border-blue-100 rounded-lg flex items-start gap-3">
        <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center shrink-0 mt-0.5">
          <span className="text-white text-[10px] font-bold">i</span>
        </div>
        <p className="text-xs text-blue-800 leading-relaxed">
          In this demo, <strong>Super Admins</strong> are granted all
          permissions by default and cannot be edited.
          <strong>Council members</strong> (Executive, Account, etc.) are
          restricted from accessing "User Management" and "Settings" groups.
        </p>
      </div>
    </section>
  );
}
