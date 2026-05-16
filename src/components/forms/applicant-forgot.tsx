"use client";

import { useState, type SyntheticEvent } from "react";
import {
  Mail,
  ArrowRight,
  AlertCircle,
  ArrowLeft,
  KeyRound,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
} from "lucide-react";
import { AxiosError } from "axios";
import { type ViewType } from "@/utils/types";
import { apiClient } from "@/lib/axios-instance";

interface ApplicantForgotProps {
  onSwitchView: (view: ViewType) => void;
}

type Step = "email" | "otp" | "reset" | "done";

export function ApplicantForgot({ onSwitchView }: ApplicantForgotProps) {
  const [step, setStep] = useState<Step>("email");

  // step 1
  const [email, setEmail] = useState("");
  // step 2
  const [otp, setOtp] = useState("");
  const [resetToken, setResetToken] = useState("");
  // step 3
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Step 1: Send OTP
  const handleSendOtp = async (e: SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await apiClient.post("/global/forgot-password", { email });
      setStep("otp");
    } catch (err) {
      const axiosErr = err as AxiosError<{ message?: string }>;
      setError(axiosErr.response?.data?.message || "Failed to send OTP.");
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOtp = async (e: SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { data } = await apiClient.post("/global/verify-otp", {
        email,
        otp,
      });
      setResetToken(data.data.resetToken);
      setStep("reset");
    } catch (err) {
      const axiosErr = err as AxiosError<{ message?: string }>;
      setError(axiosErr.response?.data?.message || "Invalid OTP.");
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Reset Password
  const handleResetPassword = async (e: SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);

    try {
      await apiClient.post("/global/reset-password", {
        email,
        resetToken,
        newPassword,
      });
      setStep("done");
    } catch (err) {
      const axiosErr = err as AxiosError<{ message?: string }>;
      setError(axiosErr.response?.data?.message || "Failed to reset password.");
    } finally {
      setLoading(false);
    }
  };

  // Step indicator
  const steps = [
    { key: "email", label: "Email" },
    { key: "otp", label: "OTP" },
    { key: "reset", label: "Reset" },
  ];
  const currentStepIdx = steps.findIndex((s) => s.key === step);

  return (
    <div className="space-y-5">
      {/* Step indicator — hide on done */}
      {step !== "done" && (
        <div className="flex items-center justify-center gap-2 mb-2">
          {steps.map((s, idx) => (
            <div key={s.key} className="flex items-center gap-2">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border transition ${
                  idx < currentStepIdx
                    ? "bg-blue-600 border-blue-600 text-white"
                    : idx === currentStepIdx
                      ? "bg-blue-600 border-blue-600 text-white"
                      : "bg-gray-100 border-gray-300 text-gray-400"
                }`}
              >
                {idx < currentStepIdx ? "✓" : idx + 1}
              </div>
              <span
                className={`text-xs font-medium ${
                  idx <= currentStepIdx ? "text-blue-600" : "text-gray-400"
                }`}
              >
                {s.label}
              </span>
              {idx < steps.length - 1 && (
                <div
                  className={`w-6 h-px ${
                    idx < currentStepIdx ? "bg-blue-600" : "bg-gray-300"
                  }`}
                />
              )}
            </div>
          ))}
        </div>
      )}

      {/* ── Step 1: Email ── */}
      {step === "email" && (
        <form onSubmit={handleSendOtp} className="space-y-4">
          <div>
            <p className="text-sm text-gray-500 mb-4">
              Enter your registered email and we'll send you a 6-digit OTP.
            </p>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <div className="flex items-center border rounded-md bg-white">
              <div className="px-3 text-gray-400">
                <Mail size={18} />
              </div>
              <input
                type="email"
                placeholder="Enter your email"
                className="w-full px-2 py-2 outline-none text-sm"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value.toLowerCase());
                  setError("");
                }}
                required
              />
            </div>
          </div>

          {error && <ErrorBox message={error} />}

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-md cursor-pointer transition disabled:opacity-50"
          >
            {loading ? (
              "Sending..."
            ) : (
              <>
                <span>Send OTP</span>
                <ArrowRight size={18} />
              </>
            )}
          </button>

          <BackToLogin onSwitchView={onSwitchView} />
        </form>
      )}

      {/* ── Step 2: OTP ── */}
      {step === "otp" && (
        <form onSubmit={handleVerifyOtp} className="space-y-4">
          <div className="bg-blue-50 border border-blue-100 rounded-md px-4 py-3 text-sm text-blue-700">
            OTP sent to <span className="font-semibold">{email}</span>. Check
            your inbox.
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Enter 6-digit OTP
            </label>
            <div className="flex items-center border rounded-md bg-white">
              <div className="px-3 text-gray-400">
                <KeyRound size={18} />
              </div>
              <input
                type="text"
                placeholder="e.g. 482910"
                maxLength={6}
                className="w-full px-2 py-2 outline-none text-sm tracking-widest font-mono"
                value={otp}
                onChange={(e) => {
                  setOtp(e.target.value.replace(/\D/g, ""));
                  setError("");
                }}
                required
              />
            </div>
          </div>

          {error && <ErrorBox message={error} />}

          <button
            type="submit"
            disabled={loading || otp.length < 6}
            className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-md cursor-pointer transition disabled:opacity-50"
          >
            {loading ? (
              "Verifying..."
            ) : (
              <>
                <span>Verify OTP</span>
                <ArrowRight size={18} />
              </>
            )}
          </button>

          {/* Resend OTP */}
          <p className="text-center text-sm text-gray-500">
            Didn't receive it?{" "}
            <button
              type="button"
              onClick={() => {
                setStep("email");
                setOtp("");
                setError("");
              }}
              className="text-blue-600 hover:underline cursor-pointer"
            >
              Resend OTP
            </button>
          </p>

          <BackToLogin onSwitchView={onSwitchView} />
        </form>
      )}

      {/* ── Step 3: New Password ── */}
      {step === "reset" && (
        <form onSubmit={handleResetPassword} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              New Password
            </label>
            <div className="flex items-center border rounded-md bg-white">
              <div className="px-3 text-gray-400">
                <Lock size={18} />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter new password"
                className="w-full px-2 py-2 outline-none text-sm"
                value={newPassword}
                onChange={(e) => {
                  setNewPassword(e.target.value);
                  setError("");
                }}
                autoComplete="new-password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((p) => !p)}
                className="px-3 text-gray-400 hover:text-gray-600 transition cursor-pointer"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Confirm Password
            </label>
            <div className="flex items-center border rounded-md bg-white">
              <div className="px-3 text-gray-400">
                <Lock size={18} />
              </div>
              <input
                type="text"
                placeholder="Confirm new password"
                className="w-full px-2 py-2 outline-none text-sm"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  setError("");
                }}
                autoComplete="new-password"
                required
              />
            </div>
          </div>

          {error && <ErrorBox message={error} />}

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-md cursor-pointer transition disabled:opacity-50"
          >
            {loading ? (
              "Resetting..."
            ) : (
              <>
                <span>Reset Password</span>
                <ArrowRight size={18} />
              </>
            )}
          </button>

          <BackToLogin onSwitchView={onSwitchView} />
        </form>
      )}

      {/* ── Done ── */}
      {step === "done" && (
        <div className="text-center space-y-4 py-4">
          <div className="flex justify-center">
            <CheckCircle2 size={52} className="text-green-500" />
          </div>
          <h3 className="text-lg font-bold text-gray-800">
            Password Reset Successful
          </h3>
          <p className="text-sm text-gray-500">
            Your password has been updated. You can now sign in with your new
            password.
          </p>
          <button
            onClick={() => onSwitchView("applicant-login")}
            className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-md cursor-pointer transition"
          >
            <span>Go to Sign In</span>
            <ArrowRight size={18} />
          </button>
        </div>
      )}
    </div>
  );
}

// Small reusable sub-components
function ErrorBox({ message }: { message: string }) {
  return (
    <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 text-sm p-2 rounded">
      <AlertCircle size={16} className="mt-0.5 shrink-0" />
      <span>{message}</span>
    </div>
  );
}

function BackToLogin({
  onSwitchView,
}: {
  onSwitchView: (v: ViewType) => void;
}) {
  return (
    <div className="text-center">
      <button
        type="button"
        onClick={() => onSwitchView("applicant-login")}
        className="text-sm text-gray-500 hover:text-blue-600 flex items-center gap-1 mx-auto cursor-pointer transition"
      >
        <ArrowLeft size={14} />
        Back to Sign In
      </button>
    </div>
  );
}
