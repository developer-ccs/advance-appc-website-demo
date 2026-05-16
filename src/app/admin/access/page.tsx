"use client";

import { useEffect, useState } from "react";
import { apiClient } from "@/lib/axios-instance";
import { useAuthStore } from "@/store/authStore";
import { AxiosError } from "axios";
import {
  ShieldCheck,
  ShieldX,
  Shield,
  CheckCircle2,
  XCircle,
  Info,
  Search,
} from "lucide-react";
import CustomLoader from "@/components/ui/CustomLoader";
import { usePageLoader } from "@/hooks/usePageLoader";

interface PermissionUser {
  _id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
}

interface EffectivePermission {
  action: string;
  description: string;
  hasAccess: boolean;
  source: "admin" | "admin-granted" | "student-default" | "denied";
}

interface ApiResponse {
  user: PermissionUser;
  effective: EffectivePermission[];
}

// Role-scoped permission whitelist (mirrors AccessControlTab)
const HIDDEN_PERMISSIONS = ["MANAGE_PERMISSIONS", "MANAGE_ROLES"];

const ROLE_ACCESSIBLE_PERMISSIONS: Record<string, string[]> = {
  executive: [
    "UPLOAD_PDF",
    "DELETE_PDF",
    "UPDATE_PDF",
    "UPLOAD_CERTIFICATE",
    "DELETE_CERTIFICATE",
    "UPDATE_CERTIFICATE",
    "UPLOAD_TENDER",
    "UPDATE_TENDER",
    "DELETE_TENDER",
    "UPDATE_TENEDER_STATUS",
  ],
  hr: [
    "UPLOAD_PDF",
    "DELETE_PDF",
    "UPDATE_PDF",
    "UPLOAD_CERTIFICATE",
    "DELETE_CERTIFICATE",
    "UPDATE_CERTIFICATE",
    "UPLOAD_TENDER",
    "UPDATE_TENDER",
    "DELETE_TENDER",
    "UPDATE_TENEDER_STATUS",
  ],
  account: [
    "UPLOAD_PDF",
    "DELETE_PDF",
    "UPDATE_PDF",
    "UPLOAD_CERTIFICATE",
    "DELETE_CERTIFICATE",
    "UPDATE_CERTIFICATE",
    "UPLOAD_TENDER",
    "UPDATE_TENDER",
    "DELETE_TENDER",
    "UPDATE_TENEDER_STATUS",
  ],
  "issuing-authority": [
    "UPLOAD_PDF",
    "DELETE_PDF",
    "UPDATE_PDF",
    "UPLOAD_CERTIFICATE",
    "DELETE_CERTIFICATE",
    "UPDATE_CERTIFICATE",
    "UPLOAD_TENDER",
    "UPDATE_TENDER",
    "DELETE_TENDER",
    "UPDATE_TENEDER_STATUS",
  ],
  counsellor: [
    "UPLOAD_PDF",
    "DELETE_PDF",
    "UPDATE_PDF",
    "UPLOAD_CERTIFICATE",
    "DELETE_CERTIFICATE",
    "UPDATE_CERTIFICATE",
    "UPLOAD_TENDER",
    "UPDATE_TENDER",
    "DELETE_TENDER",
    "UPDATE_TENEDER_STATUS",
  ],
};

const FULL_ACCESS_ROLES = new Set(["admin", "super-admin", "superadmin"]);

// Returns the permissions visible/relevant for a given role
function getAccessibleActions(role: string): string[] | null {
  if (FULL_ACCESS_ROLES.has(role)) return null; // null = all
  return ROLE_ACCESSIBLE_PERMISSIONS[role] ?? [];
}

export default function MyAccessPage() {
  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "granted" | "denied">("all");

  const { isLoading: isPageLoading } = usePageLoader([loading]);

  const user = useAuthStore((state) => state.user);
  const userId = user?._id ?? (user as any)?.id ?? null;
  const userRole = user?.role ?? "";

  useEffect(() => {
    const fetchPermissions = async () => {
      if (!userId) {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        setError("");
        const res = await apiClient.get(`/admin/permissions/user/${userId}`);
        setData(res.data.data);
      } catch (err) {
        const e = err as AxiosError<{ message: string }>;
        setError(
          e.response?.data?.message || "Failed to load your access info",
        );
      } finally {
        setLoading(false);
      }
    };
    fetchPermissions();
  }, [userId]);

  const accessibleActions = getAccessibleActions(userRole);

  const roleFilteredPermissions = (data?.effective ?? []).filter((p) => {
    if (HIDDEN_PERMISSIONS.includes(p.action)) return false;
    if (accessibleActions === null) return true;
    return accessibleActions.includes(p.action);
  });

  const filteredPermissions = roleFilteredPermissions.filter((p) => {
    const matchesSearch =
      p.action.toLowerCase().includes(search.toLowerCase()) ||
      p.description.toLowerCase().includes(search.toLowerCase());
    const matchesFilter =
      filter === "all"
        ? true
        : filter === "granted"
          ? p.hasAccess
          : !p.hasAccess;
    return matchesSearch && matchesFilter;
  });

  // Stats derived from role-scoped list (not full 16)
  const totalCount = roleFilteredPermissions.length;
  const grantedCount = roleFilteredPermissions.filter(
    (p) => p.hasAccess,
  ).length;
  const deniedCount = roleFilteredPermissions.filter(
    (p) => !p.hasAccess,
  ).length;

  const getSourceLabel = (source: string) => {
    switch (source) {
      case "admin":
        return {
          label: "Full Admin",
          color: "text-purple-600 bg-purple-50 border-purple-200",
        };
      case "admin-granted":
        return {
          label: "Granted by Admin",
          color: "text-blue-600 bg-blue-50 border-blue-200",
        };
      case "student-default":
        return {
          label: "Default Access",
          color: "text-green-600 bg-green-50 border-green-200",
        };
      case "denied":
        return {
          label: "Not Granted",
          color: "text-red-500 bg-red-50 border-red-200",
        };
      default:
        return {
          label: source,
          color: "text-gray-500 bg-gray-50 border-gray-200",
        };
    }
  };

  if (isPageLoading) {
    return (
      <CustomLoader fullPage message="Loading your access permissions..." />
    );
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
      {/* Page Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-serif font-bold text-blue-900">
            My Access
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            View the permissions granted to your account by the administrator.
          </p>
        </div>
      </div>

      {/* Stats Cards — counts are role-scoped */}
      <div className="grid grid-cols-3 gap-4">
        <div
          onClick={() => setFilter("all")}
          className={`cursor-pointer bg-white border rounded-lg p-4 flex items-center gap-4 shadow-sm transition hover:shadow-md ${
            filter === "all"
              ? "border-blue-900 ring-1 ring-blue-900"
              : "border-gray-200"
          }`}
        >
          <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center">
            <Shield className="w-5 h-5 text-blue-900" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-800">{totalCount}</p>
            <p className="text-xs text-gray-500">Total Permissions</p>
          </div>
        </div>

        <div
          onClick={() => setFilter("granted")}
          className={`cursor-pointer bg-white border rounded-lg p-4 flex items-center gap-4 shadow-sm transition hover:shadow-md ${
            filter === "granted"
              ? "border-green-600 ring-1 ring-green-600"
              : "border-gray-200"
          }`}
        >
          <div className="w-10 h-10 bg-green-50 rounded-full flex items-center justify-center">
            <ShieldCheck className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-green-700">{grantedCount}</p>
            <p className="text-xs text-gray-500">Access Granted</p>
          </div>
        </div>

        <div
          onClick={() => setFilter("denied")}
          className={`cursor-pointer bg-white border rounded-lg p-4 flex items-center gap-4 shadow-sm transition hover:shadow-md ${
            filter === "denied"
              ? "border-red-500 ring-1 ring-red-500"
              : "border-gray-200"
          }`}
        >
          <div className="w-10 h-10 bg-red-50 rounded-full flex items-center justify-center">
            <ShieldX className="w-5 h-5 text-red-500" />
          </div>
          <div>
            <p className="text-2xl font-bold text-red-600">{deniedCount}</p>
            <p className="text-xs text-gray-500">Access Denied</p>
          </div>
        </div>
      </div>

      {/* Info Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 flex items-start gap-3">
        <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
        <p className="text-sm text-blue-700">
          These permissions are managed by the administrator. If you need
          additional access, please contact your admin.
        </p>
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
        {/* Search + Filter */}
        <div className="p-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between gap-4">
          <div className="relative w-72">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search permissions..."
              className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:border-blue-900 focus:ring-1 focus:ring-blue-900"
            />
          </div>
          <div className="flex items-center gap-2 text-sm">
            {(["all", "granted", "denied"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded capitalize font-medium transition ${
                  filter === f
                    ? "bg-blue-900 text-white"
                    : "bg-white border border-gray-300 text-gray-600 hover:bg-gray-50"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white text-gray-500 text-xs uppercase tracking-wider border-b border-gray-200">
                <th className="px-4 py-3 font-medium">Permission</th>
                <th className="px-4 py-3 font-medium">Description</th>
                <th className="px-4 py-3 font-medium w-32 text-center">
                  Status
                </th>
                <th className="px-4 py-3 font-medium w-40">Source</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-gray-100">
              {filteredPermissions.length > 0 ? (
                filteredPermissions.map((perm) => {
                  const sourceInfo = getSourceLabel(perm.source);
                  return (
                    <tr
                      key={perm.action}
                      className="hover:bg-gray-50 transition"
                    >
                      <td className="px-4 py-3">
                        <span className="font-mono text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded border border-gray-200">
                          {perm.action}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-600 max-w-xs">
                        {perm.description}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {perm.hasAccess ? (
                          <span className="inline-flex items-center gap-1.5 bg-green-50 text-green-700 border border-green-200 px-2.5 py-1 rounded text-xs font-bold">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Granted
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 bg-red-50 text-red-600 border border-red-200 px-2.5 py-1 rounded text-xs font-bold">
                            <XCircle className="w-3.5 h-3.5" /> Denied
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-block text-xs font-medium px-2 py-1 rounded border ${sourceInfo.color}`}
                        >
                          {sourceInfo.label}
                        </span>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={4} className="px-4 py-16 text-center">
                    <div className="flex flex-col items-center gap-3 text-gray-400">
                      <ShieldX className="w-10 h-10 text-gray-300" />
                      <p className="text-sm font-medium text-gray-500">
                        No permissions have been granted yet
                      </p>
                      <p className="text-xs text-gray-400">
                        Contact your administrator to request access
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
