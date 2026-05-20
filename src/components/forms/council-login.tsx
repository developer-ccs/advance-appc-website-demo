"use client";

import { useEffect, useState, type SyntheticEvent } from "react";
import Image from "next/image"; // Import Image component
import {
  Lock,
  ShieldCheck,
  ArrowRight,
  AlertCircle,
  RefreshCw,
  Eye,
  EyeOff,
} from "lucide-react";
import { UserRole, type ViewType } from "@/utils/types";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { useLoginFormStore } from "@/store/loginFormStore";
import { setAuthCookie } from "@/utils/auth";

interface CouncilUser {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  [key: string]: unknown;
}

interface CouncilLoginProps {
  onClose: () => void;
  onSwitchView: (view: ViewType) => void;
  onLoginSuccess: (token: string, user: CouncilUser) => void;
}

export function CouncilLogin({
  onClose,
  onSwitchView,
  onLoginSuccess,
}: CouncilLoginProps) {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);
  const setPermissions = useAuthStore((state) => state.setPermissions);

  const {
    email,
    setEmail,
    password,
    setPassword,
    captchaInput,
    setCaptchaInput,
    captchaSvg,
    setCaptchaSvg,
    captchaId,
    setCaptchaId,
    error,
    setError,
    loadingCaptcha,
    setLoadingCaptcha,
    resetForm,
  } = useLoginFormStore();

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // --- DEMO CAPTCHA GENERATOR ---
  const fetchCaptcha = async () => {
    try {
      setLoadingCaptcha(true);
      await new Promise((resolve) => setTimeout(resolve, 300));
      const text = Math.random().toString(36).substring(2, 7).toUpperCase();
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="120" height="40" viewBox="0 0 120 40">
        <rect width="100%" height="100%" fill="#f9fafb" rx="4"/>
        <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="monospace" font-size="20" font-weight="bold" fill="#4f46e5" letter-spacing="4" style="user-select: none;">${text}</text>
        <line x1="10" y1="20" x2="110" y2="20" stroke="#94a3b8" stroke-width="1.5" stroke-dasharray="4" />
      </svg>`;
      setCaptchaId(text);
      setCaptchaSvg(svg);
    } catch (err) {
      setError("Failed to load CAPTCHA. Please refresh.");
    } finally {
      setLoadingCaptcha(false);
    }
  };

  useEffect(() => {
    fetchCaptcha();
    return () => resetForm();
  }, []);

  const generateCaptcha = () => {
    fetchCaptcha();
    setCaptchaInput("");
  };

  const handleLogin = async (e: SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    if (captchaInput.toUpperCase() !== captchaId) {
      setError("Invalid CAPTCHA. Please try again.");
      generateCaptcha();
      return;
    }

    setIsLoading(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      const mockToken = "demo-admin-access-token";
      const mockUser: CouncilUser = {
        _id: "demo-admin-123",
        name: "Demo Admin",
        email: email,
        role: UserRole.ADMIN,
      };

      setAuthCookie(mockToken);
      setAuth(mockToken, mockUser);
      setPermissions(["manage_users", "view_reports", "edit_content"]);

      onLoginSuccess(mockToken, mockUser);
      resetForm();
      onClose();

      const mustChangePassword = false;
      useAuthStore.getState().setTempPassword(password);
      router.push(mustChangePassword ? "/admin/change-password" : "/admin");
    } catch (err) {
      setError("Login failed. Check credentials.");
      generateCaptcha();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full">
      {/* Logo Section */}
      <div className="flex flex-col items-center mb-6">
        <div className="relative w-20 h-20 mb-3">
          <Image
            src="/logos/appc-logo.png" // Ensure logo.png is in your public folder
            alt="APPC Logo"
            fill
            className="object-contain"
            priority
          />
        </div>
        <h3 className="text-lg font-bold text-indigo-950 uppercase tracking-tight">
          Council Portal
        </h3>
      </div>

      <form onSubmit={handleLogin} className="space-y-4">
        {/* Restricted Access Notice */}
        <div className="bg-red-50 border-l-4 border-red-600 p-3 mb-4 text-[11px] leading-relaxed text-red-800 rounded-r-md shadow-sm">
          <strong className="block mb-0.5">Restricted Access:</strong>
          This portal is strictly for authorized APPC officials only.
          Unauthorized access is prohibited.
        </div>

        {/* Email */}
        <div>
          <label
            htmlFor="council-email"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Admin Email
          </label>
          <div className="flex items-center border rounded-md bg-white focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:border-indigo-500 transition-all">
            <div className="px-3 text-gray-400 border-r py-2">
              <ShieldCheck size={18} />
            </div>
            <input
              id="council-email"
              type="email"
              placeholder="admin@example.com"
              className="w-full px-3 py-2 text-sm outline-none"
              value={email}
              autoComplete="username"
              onChange={(e) => setEmail(e.target.value.toLowerCase())}
              required
            />
          </div>
        </div>

        {/* Password */}
        <div>
          <label
            htmlFor="council-password"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Password
          </label>
          <div className="flex items-center border rounded-md bg-white focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:border-indigo-500 transition-all">
            <div className="px-3 text-gray-400 border-r py-2">
              <Lock size={18} />
            </div>
            <input
              type={showPassword ? "text" : "password"}
              id="council-password"
              placeholder="••••••••"
              className="w-full px-3 py-2 text-sm outline-none"
              value={password}
              autoComplete="current-password"
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="px-3 text-gray-400 hover:text-indigo-600 transition cursor-pointer"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        {/* CAPTCHA */}
        <div>
          <p className="text-sm font-medium text-gray-700 mb-1">Verification</p>
          <div className="border rounded-md overflow-hidden bg-white">
            <div className="flex items-center justify-between px-4 py-2 bg-gray-50 border-b border-gray-100">
              <span className="font-mono">
                {loadingCaptcha ? (
                  <span className="text-xs text-gray-400">Loading...</span>
                ) : (
                  <div dangerouslySetInnerHTML={{ __html: captchaSvg }} />
                )}
              </span>
              <button
                type="button"
                onClick={generateCaptcha}
                className="p-1.5 rounded-full hover:bg-gray-200 text-indigo-600 transition cursor-pointer"
              >
                <RefreshCw
                  size={16}
                  className={loadingCaptcha ? "animate-spin" : ""}
                />
              </button>
            </div>
            <input
              id="captcha"
              type="text"
              placeholder="Type the verification text"
              className="w-full px-4 py-2.5 text-sm outline-none"
              value={captchaInput}
              onChange={(e) => setCaptchaInput(e.target.value)}
              required
            />
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-start gap-2 bg-red-50 border border-red-100 text-red-600 text-xs p-3 rounded-md">
            <AlertCircle size={14} className="shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-70 disabled:cursor-not-allowed text-white py-2.5 rounded-md font-semibold transition mt-2 shadow-md shadow-indigo-200"
        >
          {isLoading ? (
            <>
              <RefreshCw size={18} className="animate-spin" />
              <span>Verifying Credentials...</span>
            </>
          ) : (
            <>
              <span>Access Portal</span>
              <ArrowRight size={18} />
            </>
          )}
        </button>

        {/* Forgot Password */}
        <div className="text-center pt-2">
          <button
            type="button"
            onClick={() => onSwitchView("applicant-forgot")}
            className="text-sm text-indigo-600 hover:underline cursor-pointer font-medium"
          >
            Forgot administrative password?
          </button>
        </div>
      </form>
    </div>
  );
}
