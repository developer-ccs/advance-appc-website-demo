"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Lock, ShieldAlert, CheckCircle2 } from "lucide-react";
import { apiClient } from "@/lib/axios-instance";
import { useAuthStore } from "@/store/authStore";

export default function ChangePasswordPage() {
  const router = useRouter();
  const { tempPassword, setTempPassword } = useAuthStore();

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // 🔒 Block navigation away until password is changed
  useEffect(() => {
    const handlePopState = () => {
      window.history.pushState(null, "", window.location.href);
    };
    window.history.pushState(null, "", window.location.href);
    window.addEventListener("popstate", handlePopState);

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("popstate", handlePopState);
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    if (!tempPassword) {
      setError("Session expired. Please log in again.");
      router.push("/");
      return;
    }

    setLoading(true);
    try {
      // Send oldPassword (the login password) silently — user never sees this field
      await apiClient.post("/council/change-password-fisrt", {
        oldPassword: tempPassword,
        newPassword,
      });

      // Clear the temp password from store immediately after use
      setTempPassword(null);

      setSuccess(true);
      setTimeout(() => {
        router.push("/admin");
      }, 1800);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to change password.");
    } finally {
      setLoading(false);
    }
  };

  const passwordsTyped = newPassword && confirmPassword;
  const passwordsMatch = newPassword === confirmPassword;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-md mx-4 bg-white rounded-2xl shadow-2xl overflow-hidden">

        {/* Header band */}
        <div className="bg-indigo-600 px-6 py-5 flex items-center gap-3">
          <div className="bg-white/20 rounded-full p-2">
            <ShieldAlert size={20} className="text-white" />
          </div>
          <div>
            <h2 className="text-white font-semibold text-base leading-tight">
              Password Change Required
            </h2>
            <p className="text-indigo-200 text-xs mt-0.5">
              Set a new password to access the portal
            </p>
          </div>
        </div>

        {/* Body */}
        <div className="px-6 py-6">
          {success ? (
            <div className="flex flex-col items-center py-4 gap-3 text-center">
              <div className="bg-green-50 rounded-full p-4">
                <CheckCircle2 size={36} className="text-green-500" />
              </div>
              <p className="font-medium text-gray-800">Password updated!</p>
              <p className="text-sm text-gray-500">Redirecting to admin panel…</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <p className="text-sm text-gray-500 mb-2">
                Your account requires a password change before you can continue.
                This can only be done once.
              </p>

              {/* New password */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">
                  New Password
                </label>
                <div className="flex items-center border border-gray-200 rounded-lg bg-gray-50 focus-within:border-indigo-400 focus-within:bg-white transition">
                  <div className="pl-3 text-gray-400">
                    <Lock size={16} />
                  </div>
                  <input
                    type={showNew ? "text" : "password"}
                    placeholder="Enter new password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    autoComplete="new-password"
                    className="flex-1 bg-transparent px-2.5 py-2.5 text-sm outline-none text-gray-800 placeholder-gray-300"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNew((p) => !p)}
                    className="pr-3 text-gray-400 hover:text-gray-600 transition cursor-pointer"
                  >
                    {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Confirm password */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">
                  Confirm Password
                </label>
                <div className={`flex items-center border rounded-lg bg-gray-50 focus-within:bg-white transition ${
                  passwordsTyped
                    ? passwordsMatch
                      ? "border-green-400 focus-within:border-green-500"
                      : "border-red-300 focus-within:border-red-400"
                    : "border-gray-200 focus-within:border-indigo-400"
                }`}>
                  <div className="pl-3 text-gray-400">
                    <Lock size={16} />
                  </div>
                  <input
                    type={showConfirm ? "text" : "password"}
                    placeholder="Re-enter new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    autoComplete="new-password"
                    className="flex-1 bg-transparent px-2.5 py-2.5 text-sm outline-none text-gray-800 placeholder-gray-300"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm((p) => !p)}
                    className="pr-3 text-gray-400 hover:text-gray-600 transition cursor-pointer"
                  >
                    {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>

                {/* Inline match feedback */}
                {passwordsTyped && (
                  <p className={`text-xs mt-1 ${passwordsMatch ? "text-green-600" : "text-red-500"}`}>
                    {passwordsMatch ? "✓ Passwords match" : "✗ Passwords do not match"}
                  </p>
                )}
              </div>

              {/* Error */}
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-3 py-2 rounded-lg">
                  {error}
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white py-2.5 rounded-lg text-sm font-medium transition cursor-pointer mt-2"
              >
                {loading ? "Saving…" : "Set New Password"}
              </button>

              <p className="text-center text-xs text-gray-400">
                You cannot skip this step. Close the tab and log in again if needed.
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}