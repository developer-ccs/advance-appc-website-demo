"use client";

import { useState, useEffect, useCallback, useRef, memo } from "react";
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
import { apiClient } from "@/lib/axios-instance";
import { AxiosError } from "axios";
import { useToast } from "@/components/ui/ToastContext";
import { useConfirmDialog } from "@/components/ui/ConfirmDialogContext";
import { useAuthStore } from "@/store/authStore";
import CustomLoader from "@/components/ui/CustomLoader";
import { usePageLoader } from "@/hooks/usePageLoader";

// Types

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

type RawCouncil = {
  _id: string;
  employeeId: string;
  userId: { _id: string; name: string; role: string; email?: string };
};

// Constants
const GROUP_MAP: Record<string, string[]> = {
  "Tender Management": [
    "UPLOAD_TENDER",
    "UPDATE_TENDER",
    "DELETE_TENDER",
    "UPDATE_TENEDER_STATUS",
  ],
  "Forms & Notices Management": ["UPLOAD_PDF", "DELETE_PDF", "UPDATE_PDF"],
  "Certificate Management": [
    "UPLOAD_CERTIFICATE",
    "DELETE_CERTIFICATE",
    "UPDATE_CERTIFICATE",
  ],
  "Add Council Image": [
    "UPLOAD_ADMINISTRATIVE_IMAGE",
    "UPDATE_ADMINISTRATIVE_IMAGE",
    "DELETE_ADMINISTRATIVE_IMAGE",
  ],
  "User Management": ["ADD_COUNSELLOR", "DELETE_USER"],
  Settings: ["GENERAL_SETTINGS"],
  "Admin Controls": ["MANAGE_ROLES", "MANAGE_PERMISSIONS"],
};

const COUNCIL_RESTRICTED_GROUPS = new Set([
  "Add Council Image",
  "Admin Controls",
  "User Management",
  "Settings",
]);

const ACTION_LABELS: Record<string, string> = {
  ADD_COUNSELLOR: "Add Counsellor",
  DELETE_USER: "Delete User",

  UPLOAD_TENDER: "Upload Tender",
  UPDATE_TENDER: "Update Tender",
  DELETE_TENDER: "Delete Tender",
  UPDATE_TENEDER_STATUS: "Update Tender Status",

  UPLOAD_PDF: "Upload PDF",
  DELETE_PDF: "Delete PDF",
  UPDATE_PDF: "Update PDF",

  UPLOAD_CERTIFICATE: "Upload Certificate",
  DELETE_CERTIFICATE: "Delete Certificate",
  UPDATE_CERTIFICATE: "Update Certificate",

  DELETE_ADMINISTRATIVE_IMAGE: "Delete administrative image",
  UPLOAD_ADMINISTRATIVE_IMAGE: "Upload administrative image",
  UPDATE_ADMINISTRATIVE_IMAGE: "Update administrative image",

  MANAGE_ROLES: "Manage Roles",
  MANAGE_PERMISSIONS: "Manage Perms",
  GENERAL_SETTINGS: "General Setting",
};

const GROUP_COLORS: Record<string, string> = {
  "User Management": "bg-blue-50 text-blue-700",
  "Tender Management": "bg-teal-50 text-teal-700",
  "Forms & Notices Management": "bg-purple-50 text-purple-700",
  Downloads: "bg-green-50 text-green-700",
  "Certificate Management": "bg-amber-50 text-amber-700",
  "Add Council Image": "bg-cyan-50 text-cyan-700",
  "Admin Controls": "bg-red-50 text-red-700",
  Settings: "bg-gray-100 text-gray-600",
  Other: "bg-gray-100 text-gray-600",
};

const USER_COL_WIDTH = 200;
const ROLE_COL_WIDTH = 160;
const ROLE_COL_LEFT = USER_COL_WIDTH;

const FIXED_COL_COUNT = 3;

// Pure helpers
function getGroupForAction(action: string): string {
  for (const [group, actions] of Object.entries(GROUP_MAP)) {
    if (actions.includes(action)) return group;
  }
  return "Other";
}

function computeGroupSpans(
  perms: Permission[],
): { group: string; count: number }[] {
  const spans: { group: string; count: number }[] = [];
  for (const perm of perms) {
    const group = getGroupForAction(perm.action);
    const last = spans[spans.length - 1];
    if (last?.group === group) {
      last.count++;
    } else {
      spans.push({ group, count: 1 });
    }
  }
  return spans;
}

function getRoleStyle(role: string): {
  icon: React.ReactNode;
  color: string;
  label: string;
} {
  const r = role.toLowerCase();

  if (r === "super-admin" || r === "superadmin" || r === "super admin")
    return {
      icon: <ShieldCheck size={11} />,
      color: "bg-amber-100 text-amber-800",
      label: "Super Admin",
    };

  if (r === "admin")
    return {
      icon: <Shield size={11} />,
      color: "bg-purple-100 text-purple-800",
      label: "Admin",
    };

  if (r.includes("executive"))
    return {
      icon: <User size={11} />,
      color: "bg-blue-100 text-blue-700",
      label: "Executive",
    };

  if (r.includes("hr") || r.includes("human resource"))
    return {
      icon: <Users size={11} />,
      color: "bg-green-100 text-green-700",
      label: "HR",
    };

  if (r.includes("account"))
    return {
      icon: <Calculator size={11} />,
      color: "bg-orange-100 text-orange-700",
      label: "Accounts",
    };

  if (r.includes("issuing") || r.includes("authority"))
    return {
      icon: <Signature size={11} />,
      color: "bg-rose-100 text-rose-700",
      label: "Issuing Authority",
    };

  // Generic fallback
  const label = role
    .replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
  return {
    icon: <User size={11} />,
    color: "bg-gray-100 text-gray-600",
    label,
  };
}

function isGhostAccount(council: {
  employeeId: string;
  userId?: { name?: string; email?: string } | null;
}): boolean {
  const empId = (council.employeeId ?? "").toLowerCase();
  const name = (council.userId?.name ?? "").toLowerCase();
  return empId.startsWith("ghost") || name.includes("ghost");
}

//SVG micro-icons

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

const LockIcon = ({
  stroke = "#a78bfa",
  size = 12,
}: {
  stroke?: string;
  size?: number;
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={stroke}
    strokeWidth="2.2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

const InfoIcon = () => (
  <svg
    width="15"
    height="15"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="shrink-0"
  >
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="12" />
    <line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
);

// Checkbox

interface CheckboxProps {
  checked: boolean;
  indeterminate?: boolean;
  loading?: boolean;
  onClick: () => void;
  title?: string;
  variant?: "blue" | "green" | "red";
  disabled?: boolean;
}

const Checkbox = memo(function Checkbox({
  checked,
  indeterminate = false,
  loading = false,
  onClick,
  title,
  variant = "blue",
  disabled = false,
}: CheckboxProps) {
  const colorMap: Record<
    "blue" | "green" | "red",
    { on: string; hover: string }
  > = {
    blue: {
      on: "bg-blue-900 border-blue-900",
      hover: "hover:border-blue-400",
    },
    green: {
      on: "bg-green-600 border-green-600",
      hover: "hover:border-green-400",
    },
    red: {
      on: "bg-red-500 border-red-500",
      hover: "hover:border-red-400",
    },
  };
  const c = colorMap[variant];

  if (loading) {
    return <Loader2 size={15} className="animate-spin text-gray-400 mx-auto" />;
  }

  const isActive = checked || indeterminate;

  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      disabled={disabled}
      className="mx-auto cursor-pointer flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed"
    >
      <div
        className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
          isActive ? c.on : `bg-white border-gray-300 ${c.hover}`
        }`}
      >
        {indeterminate && !checked ? <Dash /> : checked ? <Tick /> : null}
      </div>
    </button>
  );
});

// AccessCheckbox

interface AccessCheckboxProps {
  allGranted: boolean;
  partial: boolean;
  loadingGrant: boolean;
  loadingReset: boolean;
  onGrantAll: () => void;
  onReset: () => void;
}

const AccessCheckbox = memo(function AccessCheckbox({
  allGranted,
  partial,
  loadingGrant,
  loadingReset,
  onGrantAll,
  onReset,
}: AccessCheckboxProps) {
  if (loadingGrant || loadingReset) {
    return <Loader2 size={15} className="animate-spin text-gray-400 mx-auto" />;
  }

  const isActive = allGranted || partial;
  const boxClass = isActive
    ? "bg-green-600 border-green-600"
    : "bg-white border-red-400 hover:border-red-500";

  const title = allGranted
    ? "All permissions granted — click to reset"
    : partial
      ? "Some permissions granted — click to grant all"
      : "No permissions — click to grant all";

  return (
    <button
      type="button"
      onClick={allGranted ? onReset : onGrantAll}
      title={title}
      className="mx-auto cursor-pointer flex items-center justify-center"
    >
      <div
        className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${boxClass}`}
      >
        {allGranted ? <Tick /> : partial ? <Dash /> : null}
      </div>
    </button>
  );
});

// Sticky row hover
function useStickyRowHover(defaultBg: string, hoverBg: string) {
  const rowRef = useRef<HTMLTableRowElement>(null);

  const syncBg = useCallback((bg: string) => {
    rowRef.current
      ?.querySelectorAll<HTMLElement>("[data-sticky]")
      .forEach((el) => {
        el.style.backgroundColor = bg;
      });
  }, []);

  const onMouseEnter = useCallback(() => syncBg(hoverBg), [syncBg, hoverBg]);
  const onMouseLeave = useCallback(
    () => syncBg(defaultBg),
    [syncBg, defaultBg],
  );

  return { rowRef, onMouseEnter, onMouseLeave };
}

// Main Component

export default function AccessControlTab() {
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [search, setSearch] = useState<string>("");

  const [toggling, setToggling] = useState<Set<string>>(new Set());
  const [grantingAll, setGrantingAll] = useState<Set<string>>(new Set());
  const [resetting, setResetting] = useState<Set<string>>(new Set());

  const { showToast } = useToast();
  const { showConfirm } = useConfirmDialog();
  const currentUserRole = useAuthStore((s) => s.user?.role ?? "");

  // Page loader setup
  const isInitialLoad = useRef(true);
  const { isLoading: isPageLoading } = usePageLoader([
    isInitialLoad.current ? loading : false,
  ]);

  //Data fetching
  const fetchAll = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const [councilRes, permsRes] = await Promise.all([
        apiClient.get<{ data: { councils: RawCouncil[] } }>(
          "/admin/get-all-council?limit=100",
        ),
        apiClient.get<{ data: Permission[] }>("/admin/permissions"),
      ]);

      const councils = councilRes.data.data.councils;

      setUsers(
        councils
          .filter((c) => !isGhostAccount(c))
          .map((c) => ({
            _id: c.userId._id,
            name: c.userId.name,
            employeeId: c.employeeId,
            role: c.userId.role,
          })),
      );

      setPermissions(permsRes.data.data);
    } catch (err) {
      const e = err as AxiosError<{ message: string }>;
      setError(e.response?.data?.message ?? "Failed to load data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  // Stop the full-page loader once initial data finishes fetching
  useEffect(() => {
    if (!loading && isInitialLoad.current) {
      isInitialLoad.current = false;
    }
  }, [loading]);

  // Derived permission state
  const isGranted = useCallback(
    (perm: Permission, uid: string): boolean =>
      perm.grantedUsers.some((u) => u._id === uid),
    [],
  );

  const getGrantCount = useCallback(
    (uid: string): number =>
      permissions.filter((p) => isGranted(p, uid)).length,
    [permissions, isGranted],
  );

  const isAllGranted = useCallback(
    (uid: string): boolean => getGrantCount(uid) === permissions.length,
    [getGrantCount, permissions.length],
  );

  const isNoneGranted = useCallback(
    (uid: string): boolean => getGrantCount(uid) === 0,
    [getGrantCount],
  );

  const isPartial = useCallback(
    (uid: string): boolean => !isAllGranted(uid) && !isNoneGranted(uid),
    [isAllGranted, isNoneGranted],
  );

  // Sorted / filtered permission lists
  const groupOrder = Object.keys(GROUP_MAP);

  const sortedPerms = [...permissions].sort(
    (a, b) =>
      groupOrder.indexOf(getGroupForAction(a.action)) -
      groupOrder.indexOf(getGroupForAction(b.action)),
  );

  const councilAccessiblePermIds = new Set(
    sortedPerms
      .filter(
        (p) => !COUNCIL_RESTRICTED_GROUPS.has(getGroupForAction(p.action)),
      )
      .map((p) => p._id),
  );

  const groupSpans = computeGroupSpans(sortedPerms);
  const totalCols = sortedPerms.length + FIXED_COL_COUNT;

  // User lists

  const filterBySearch = useCallback(
    (list: UserRecord[]): UserRecord[] =>
      list.filter(
        (u) =>
          u.name.toLowerCase().includes(search.toLowerCase()) ||
          u.employeeId.toLowerCase().includes(search.toLowerCase()),
      ),
    [search],
  );

  const isSuperAdmin =
    currentUserRole === "super-admin" || currentUserRole === "superadmin";

  const superAdmins = isSuperAdmin
    ? filterBySearch(
        users.filter(
          (u) => u.role === "super-admin" || u.role === "superadmin",
        ),
      )
    : [];

  const admins = filterBySearch(users.filter((u) => u.role === "admin"));

  const councillors = filterBySearch(
    users.filter(
      (u) =>
        u.role !== "super-admin" &&
        u.role !== "superadmin" &&
        u.role !== "admin",
    ),
  );

  // Toggle handlers
  const handleToggle = useCallback(
    (action: string, userId: string) => {
      const perm = permissions.find((p) => p.action === action);
      if (!perm) return;

      const granted = isGranted(perm, userId);
      const targetUser = users.find((u) => u._id === userId);

      showConfirm(
        () => performToggle(action, userId, granted),
        `${granted ? "Revoke" : "Grant"} "${action.replace(/_/g, " ")}" for ${targetUser?.name ?? "this user"}?`,
        "Confirm",
        "Cancel",
      );
    },
    [permissions, users, isGranted, showConfirm],
  );

  const performToggle = useCallback(
    async (action: string, userId: string, wasGranted: boolean) => {
      const key = `${action}:${userId}`;

      setToggling((prev) => new Set(prev).add(key));

      const placeholder: GrantedUser = { _id: userId, name: "", email: "" };

      setPermissions((prev) =>
        prev.map((p) =>
          p.action !== action
            ? p
            : {
                ...p,
                grantedUsers: wasGranted
                  ? p.grantedUsers.filter((u) => u._id !== userId)
                  : [...p.grantedUsers, placeholder],
              },
        ),
      );

      try {
        const endpoint = wasGranted
          ? `/admin/permissions/${action}/revoke-user`
          : `/admin/permissions/${action}/grant-user`;

        await apiClient.patch(endpoint, { userId });

        const targetUser = users.find((u) => u._id === userId);
        showToast(
          `"${action.replace(/_/g, " ")}" ${wasGranted ? "revoked from" : "granted to"} ${targetUser?.name ?? "user"}`,
          "success",
        );
      } catch (err) {
        setPermissions((prev) =>
          prev.map((p) =>
            p.action !== action
              ? p
              : {
                  ...p,
                  grantedUsers: wasGranted
                    ? [...p.grantedUsers, placeholder]
                    : p.grantedUsers.filter((u) => u._id !== userId),
                },
          ),
        );

        const e = err as AxiosError<{ message: string }>;
        showToast(e.response?.data?.message ?? "Toggle failed", "error");
      } finally {
        setToggling((prev) => {
          const next = new Set(prev);
          next.delete(key);
          return next;
        });
      }
    },
    [users, showToast],
  );

  const handleGrantAll = useCallback(
    (userId: string) => {
      const targetUser = users.find((u) => u._id === userId);
      showConfirm(
        () => performGrantAll(userId),
        `Grant ALL permissions to ${targetUser?.name ?? "this user"}?`,
        "Grant All",
        "Cancel",
      );
    },
    [users, showConfirm],
  );

  const performGrantAll = useCallback(
    async (userId: string) => {
      setGrantingAll((prev) => new Set(prev).add(userId));

      const placeholder: GrantedUser = { _id: userId, name: "", email: "" };

      setPermissions((prev) =>
        prev.map((p) => ({
          ...p,
          grantedUsers: p.grantedUsers.some((u) => u._id === userId)
            ? p.grantedUsers
            : [...p.grantedUsers, placeholder],
        })),
      );

      try {
        await apiClient.patch(`/admin/permissions/user/${userId}/access-all`);
        const targetUser = users.find((u) => u._id === userId);
        showToast(
          `All permissions granted to ${targetUser?.name ?? "user"}`,
          "success",
        );
      } catch (err) {
        await fetchAll();
        const e = err as AxiosError<{ message: string }>;
        showToast(e.response?.data?.message ?? "Grant all failed", "error");
      } finally {
        setGrantingAll((prev) => {
          const next = new Set(prev);
          next.delete(userId);
          return next;
        });
      }
    },
    [users, showToast, fetchAll],
  );

  const handleReset = useCallback(
    (userId: string) => {
      const targetUser = users.find((u) => u._id === userId);
      showConfirm(
        () => performReset(userId),
        `Reset ALL permissions for ${targetUser?.name ?? "this user"}? They will lose all access.`,
        "Reset",
        "Cancel",
      );
    },
    [users, showConfirm],
  );

  const performReset = useCallback(
    async (userId: string) => {
      setResetting((prev) => new Set(prev).add(userId));

      setPermissions((prev) =>
        prev.map((p) => ({
          ...p,
          grantedUsers: p.grantedUsers.filter((u) => u._id !== userId),
        })),
      );

      try {
        await apiClient.patch(`/admin/permissions/user/${userId}/reset`);
        const targetUser = users.find((u) => u._id === userId);
        showToast(
          `All permissions cleared for ${targetUser?.name ?? "user"}`,
          "success",
        );
      } catch (err) {
        await fetchAll();
        const e = err as AxiosError<{ message: string }>;
        showToast(e.response?.data?.message ?? "Reset failed", "error");
      } finally {
        setResetting((prev) => {
          const next = new Set(prev);
          next.delete(userId);
          return next;
        });
      }
    },
    [users, showToast, fetchAll],
  );

  //Sub-components (defined outside render loop via props)

  // Table Header
  const TableHead = () => (
    <thead>
      {/* Row 1: sticky columns + group spans */}
      <tr className="border-b border-gray-200">
        <th
          rowSpan={2}
          className="sticky z-30 p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200"
          style={{
            left: 0,
            minWidth: USER_COL_WIDTH,
            width: USER_COL_WIDTH,
            backgroundColor: "#f9fafb",
          }}
        >
          User
        </th>
        <th
          rowSpan={2}
          className="sticky z-30 p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r-2 border-gray-300"
          style={{
            left: ROLE_COL_LEFT,
            minWidth: ROLE_COL_WIDTH,
            width: ROLE_COL_WIDTH,
            backgroundColor: "#f9fafb",
          }}
        >
          Role
        </th>
        <th
          rowSpan={2}
          className="p-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider bg-gray-50 border-r-2 border-gray-300"
          style={{ minWidth: 68, width: 68 }}
          title="Grant all / Reset all permissions for this user"
        >
          Access
        </th>
        {groupSpans.map(({ group, count }) => (
          <th
            key={group}
            colSpan={count}
            className={`px-3 py-2 text-center text-xs font-bold uppercase tracking-wide border-l border-gray-200 ${GROUP_COLORS[group] ?? "bg-gray-50 text-gray-500"}`}
          >
            {group}
          </th>
        ))}
      </tr>

      {/* Row 2: individual permission labels */}
      <tr
        className="border-b border-gray-200"
        style={{ backgroundColor: "#f9fafb" }}
      >
        {sortedPerms.map((perm) => (
          <th
            key={perm._id}
            className="px-2 py-2 text-center border-l border-gray-100"
            style={{ minWidth: 80 }}
            title={perm.description}
          >
            <span className="text-xs font-medium text-gray-700 leading-tight">
              {ACTION_LABELS[perm.action] ?? perm.action.replace(/_/g, " ")}
            </span>
          </th>
        ))}
      </tr>
    </thead>
  );

  // Super Admin Row — all perms always granted, not editable
  function SuperAdminRow({ user: rowUser }: { user: UserRecord }) {
    const { rowRef, onMouseEnter, onMouseLeave } = useStickyRowHover(
      "#fefce8",
      "#fef9c3",
    );
    const { icon, color, label } = getRoleStyle(rowUser.role);

    return (
      <tr
        ref={rowRef}
        style={{ backgroundColor: "#fefce8" }}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
      >
        {/* User cell */}
        <td
          data-sticky
          className="sticky z-20 p-3 border-r border-amber-100"
          style={{
            left: 0,
            minWidth: USER_COL_WIDTH,
            width: USER_COL_WIDTH,
            backgroundColor: "#fefce8",
          }}
        >
          <p className="text-sm font-medium text-gray-800 truncate">
            {rowUser.name}
          </p>
          <p className="text-xs text-gray-400 font-mono">
            {rowUser.employeeId}
          </p>
        </td>

        {/* Role cell */}
        <td
          data-sticky
          className="sticky z-20 p-3 border-r-2 border-amber-200"
          style={{
            left: ROLE_COL_LEFT,
            minWidth: ROLE_COL_WIDTH,
            width: ROLE_COL_WIDTH,
            backgroundColor: "#fefce8",
          }}
        >
          <span
            className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium ${color}`}
          >
            {icon} {label}
          </span>
        </td>

        {/* Access cell — always full, not clickable */}
        <td className="p-3 text-center border-r-2 border-amber-200">
          <div
            className="mx-auto w-5 h-5 rounded border-2 bg-green-600 border-green-600 flex items-center justify-center opacity-60 cursor-not-allowed"
            title="Super admin always has full access"
          >
            <Tick />
          </div>
        </td>

        {/* Permission cells — all granted, read-only */}
        {sortedPerms.map((perm) => (
          <td
            key={perm._id}
            className="p-3 text-center border-l border-amber-50"
          >
            <div
              className="mx-auto w-5 h-5 rounded border-2 bg-blue-900 border-blue-900 flex items-center justify-center opacity-50 cursor-not-allowed"
              title="Super admin always has this permission"
            >
              <Tick />
            </div>
          </td>
        ))}
      </tr>
    );
  }

  // Admin Row — editable only by super-admin
  function AdminRow({ user: rowUser }: { user: UserRecord }) {
    const { rowRef, onMouseEnter, onMouseLeave } = useStickyRowHover(
      "#faf5ff",
      "#f3e8ff",
    );
    const allGranted = isAllGranted(rowUser._id);
    const noneGranted = isNoneGranted(rowUser._id);
    const partial = isPartial(rowUser._id);
    const { icon, color, label } = getRoleStyle(rowUser.role);

    /**
     * Regular admins cannot edit peer admin rows — only super-admins can.
     * We check the current user's role, not the row user's role.
     */
    const isLocked = !isSuperAdmin;

    const rowBg = isLocked ? "#f3f0fa" : "#faf5ff";
    const hoverBg = isLocked ? "#ede9fb" : "#f3e8ff";

    const {
      rowRef: lockedRef,
      onMouseEnter: le,
      onMouseLeave: ll,
    } = useStickyRowHover(rowBg, hoverBg);

    // Use the correct ref based on lock state
    const activeRef = isLocked ? lockedRef : rowRef;
    const handleEnter = isLocked ? le : onMouseEnter;
    const handleLeave = isLocked ? ll : onMouseLeave;

    return (
      <tr
        ref={activeRef}
        style={{ backgroundColor: rowBg, opacity: isLocked ? 0.75 : 1 }}
        onMouseEnter={handleEnter}
        onMouseLeave={handleLeave}
        title={
          isLocked
            ? "You don't have permission to manage other admins"
            : undefined
        }
      >
        {/* User cell */}
        <td
          data-sticky
          className="sticky z-20 p-3 border-r border-purple-100"
          style={{
            left: 0,
            minWidth: USER_COL_WIDTH,
            width: USER_COL_WIDTH,
            backgroundColor: rowBg,
          }}
        >
          <div className="flex items-center gap-2 min-w-0">
            <div className="min-w-0">
              <p className="text-sm font-medium text-gray-800 truncate">
                {rowUser.name}
              </p>
              <p className="text-xs text-gray-400 font-mono">
                {rowUser.employeeId}
              </p>
            </div>
            {isLocked && <LockIcon stroke="#a78bfa" size={12} />}
          </div>
        </td>

        {/* Role cell */}
        <td
          data-sticky
          className="sticky z-20 p-3 border-r-2 border-purple-200"
          style={{
            left: ROLE_COL_LEFT,
            minWidth: ROLE_COL_WIDTH,
            width: ROLE_COL_WIDTH,
            backgroundColor: rowBg,
          }}
        >
          <span
            className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium ${color}`}
          >
            {icon} {label}
          </span>
          {isLocked && (
            <p className="text-xs text-purple-400 mt-0.5">View only</p>
          )}
        </td>

        {/* Access cell */}
        <td className="p-3 text-center border-r-2 border-purple-200">
          {isLocked ? (
            <div
              className="mx-auto w-5 h-5 rounded border-2 border-purple-200 bg-purple-50 flex items-center justify-center cursor-not-allowed"
              title="You cannot manage admin permissions"
            >
              <LockIcon stroke="#c4b5fd" size={8} />
            </div>
          ) : (
            <AccessCheckbox
              allGranted={allGranted}
              partial={partial}
              loadingGrant={grantingAll.has(rowUser._id)}
              loadingReset={resetting.has(rowUser._id)}
              onGrantAll={() => handleGrantAll(rowUser._id)}
              onReset={() => handleReset(rowUser._id)}
            />
          )}
        </td>

        {/* Permission cells */}
        {sortedPerms.map((perm) => {
          const granted = isGranted(perm, rowUser._id);
          const key = `${perm.action}:${rowUser._id}`;

          return (
            <td
              key={perm._id}
              className="p-3 text-center border-l border-purple-50"
            >
              {isLocked ? (
                <div
                  className={`mx-auto w-5 h-5 rounded border-2 flex items-center justify-center cursor-not-allowed ${
                    granted
                      ? "bg-blue-900 border-blue-900 opacity-25"
                      : "bg-white border-gray-200 opacity-40"
                  }`}
                  title="View only — you cannot change admin permissions"
                >
                  {granted && <Tick />}
                </div>
              ) : (
                <Checkbox
                  checked={granted}
                  loading={toggling.has(key)}
                  variant="blue"
                  title={granted ? "Click to revoke" : "Click to grant"}
                  onClick={() => handleToggle(perm.action, rowUser._id)}
                />
              )}
            </td>
          );
        })}
      </tr>
    );
  }

  // Council Row — restricted from admin-only permission groups
  function CouncilRow({ user: rowUser }: { user: UserRecord }) {
    const { rowRef, onMouseEnter, onMouseLeave } = useStickyRowHover(
      "#ffffff",
      "#f9fafb",
    );
    const allGranted = isAllGranted(rowUser._id);
    const partial = isPartial(rowUser._id);
    const { icon, color, label } = getRoleStyle(rowUser.role);

    return (
      <tr ref={rowRef} onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave}>
        {/* User cell */}
        <td
          data-sticky
          className="sticky z-20 p-3 border-r border-gray-100"
          style={{
            left: 0,
            minWidth: USER_COL_WIDTH,
            width: USER_COL_WIDTH,
            backgroundColor: "#ffffff",
          }}
        >
          <p className="text-sm font-medium text-gray-800 truncate">
            {rowUser.name}
          </p>
          <p className="text-xs text-gray-400 font-mono">
            {rowUser.employeeId}
          </p>
        </td>

        {/* Role cell */}
        <td
          data-sticky
          className="sticky z-20 p-3 border-r-2 border-gray-300"
          style={{
            left: ROLE_COL_LEFT,
            minWidth: ROLE_COL_WIDTH,
            width: ROLE_COL_WIDTH,
            backgroundColor: "#ffffff",
          }}
        >
          <span
            className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium ${color}`}
          >
            {icon} {label}
          </span>
        </td>

        {/* Access cell */}
        <td className="p-3 text-center border-r-2 border-gray-300">
          <AccessCheckbox
            allGranted={allGranted}
            partial={partial}
            loadingGrant={grantingAll.has(rowUser._id)}
            loadingReset={resetting.has(rowUser._id)}
            onGrantAll={() => handleGrantAll(rowUser._id)}
            onReset={() => handleReset(rowUser._id)}
          />
        </td>

        {/*
          Permission cells — iterate ALL sortedPerms so columns align with
          TableHead. Restricted-group cells render as locked (non-interactive).
        */}
        {sortedPerms.map((perm) => {
          const isRestricted = !councilAccessiblePermIds.has(perm._id);
          const granted = isGranted(perm, rowUser._id);
          const key = `${perm.action}:${rowUser._id}`;

          if (isRestricted) {
            return (
              <td
                key={perm._id}
                className="p-3 text-center border-l border-red-50 bg-red-50/30"
              >
                <div
                  className="mx-auto w-5 h-5 rounded border-2 border-gray-200 bg-gray-100 flex items-center justify-center cursor-not-allowed"
                  title="This permission is not available for this role"
                >
                  <Cross />
                </div>
              </td>
            );
          }

          return (
            <td
              key={perm._id}
              className="p-3 text-center border-l border-gray-50"
            >
              <Checkbox
                checked={granted}
                loading={toggling.has(key)}
                variant="blue"
                title={granted ? "Click to revoke" : "Click to grant"}
                onClick={() => handleToggle(perm.action, rowUser._id)}
              />
            </td>
          );
        })}
      </tr>
    );
  }

  const DividerRow = () => (
    <tr>
      <td
        colSpan={totalCols}
        style={{ height: 2, padding: 0, backgroundColor: "#e5e7eb" }}
        className="border-t-2 border-b-2 border-gray-300"
      />
    </tr>
  );

  const hasNoResults =
    superAdmins.length === 0 && admins.length === 0 && councillors.length === 0;

  // Prevent UI rendering until the loader is done
  if (isPageLoading) {
    return <CustomLoader fullPage message="Loading access controls..." />;
  }

  // ─── Render ──────────────────────────────────────────────────────────────────

  return (
    <section className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-gray-100">
        <h3 className="text-lg font-bold text-gray-800">User Access Control</h3>

        <div className="relative flex items-center border border-gray-300 rounded-md bg-white px-3 gap-2">
          <Search size={14} className="text-gray-400 shrink-0" />
          <input
            type="text"
            placeholder="Search by name or emp ID…"
            className="py-1.5 text-sm outline-none bg-transparent w-52 pr-6"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-red-600 hover:text-red-700 transition cursor-pointer"
              aria-label="Clear search"
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Info banner for plain admins */}
      {currentUserRole === "admin" && (
        <div className="flex items-center gap-2.5 bg-amber-50 border border-amber-200 text-amber-800 px-4 py-2.5 rounded-lg text-sm">
          <InfoIcon />
          <span>
            As an <strong>Admin</strong>, you can view but not modify other
            admins' permissions, but you can modify other roles if permitted.
          </span>
        </div>
      )}

      {/* Error banner */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded text-sm">
          {error}
        </div>
      )}

      {/* Loading state - kept just in case of manual fetch/refresh without unmounting */}
      {loading ? (
        <div className="flex items-center justify-center py-12 text-gray-400 gap-2">
          <Loader2 className="animate-spin" size={20} />
          <span>Loading permissions…</span>
        </div>
      ) : (
        <div className="border border-gray-200 rounded-lg overflow-hidden overflow-x-auto">
          <table
            className="text-sm border-collapse"
            style={{ minWidth: "max-content", width: "100%" }}
          >
            <TableHead />
            <tbody>
              {/* Super admin rows */}
              {superAdmins.map((u) => (
                <SuperAdminRow key={u._id} user={u} />
              ))}

              {/* Divider between super-admins and admins */}
              {superAdmins.length > 0 && admins.length > 0 && <DividerRow />}

              {/* Admin rows */}
              {admins.map((u) => (
                <AdminRow key={u._id} user={u} />
              ))}

              {/* Divider between admins/super-admins and council */}
              {(superAdmins.length > 0 || admins.length > 0) &&
                councillors.length > 0 && <DividerRow />}

              {/* Council rows */}
              {councillors.map((u) => (
                <CouncilRow key={u._id} user={u} />
              ))}

              {/* Empty state */}
              {hasNoResults && (
                <tr>
                  <td
                    colSpan={totalCols}
                    className="p-10 text-center text-sm text-gray-400"
                  >
                    {search
                      ? `No users found matching "${search}"`
                      : "No users found"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
