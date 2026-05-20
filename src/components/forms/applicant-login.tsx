"use client";

import { useEffect, useState, type SyntheticEvent } from "react";
import Image from "next/image"; // Import Image component
import {
  Lock,
  Mail,
  ArrowRight,
  AlertCircle,
  RefreshCw,
  Eye,
  EyeOff,
} from "lucide-react";
import { UserRole, type ViewType } from "@/utils/types";
import { useRouter } from "next/navigation";
import { useAuthStore, type AuthUser } from "@/store/authStore";
import { useLoginFormStore } from "@/store/loginFormStore";
import { setAuthCookie } from "@/utils/auth";

interface ApplicantLoginProps {
  onClose: () => void;
  onSwitchView: (view: ViewType) => void;
  onLoginSuccess: (token: string, user: AuthUser) => void;
}

export function ApplicantLogin({
  onClose,
  onSwitchView,
  onLoginSuccess,
}: ApplicantLoginProps) {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);

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
        <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="monospace" font-size="20" font-weight="bold" fill="#1e3a8a" letter-spacing="4" style="user-select: none;">${text}</text>
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
      const mockToken = "demo-applicant-access-token";
      const mockUser: AuthUser = {
        _id: "demo-user-123",
        name: "Demo Applicant",
        email: email,
        role: UserRole.APPLICANT,
      };

      setAuth(mockToken, mockUser);
      setAuthCookie(mockToken);
      onLoginSuccess(mockToken, mockUser);
      resetForm();
      onClose();
      router.push("/applicant");
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
            src="/logos/appc-logo.png" // Ensure your logo is in the public folder
            alt="APPC Logo"
            fill
            className="object-contain"
            priority
          />
        </div>
        <h3 className="text-lg font-bold text-blue-950 uppercase tracking-tight">
          Applicant Portal
        </h3>
        <p className="text-xs text-gray-500">
          Sign in to manage your registration
        </p>
      </div>

      <form onSubmit={handleLogin} className="space-y-4">
        {/* Email */}
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Email
          </label>
          <div className="flex items-center border rounded-md bg-white focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500 transition-all">
            <div className="px-3 text-gray-400 border-r py-2">
              <Mail size={18} />
            </div>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="demo@example.com"
              className="w-full px-3 py-2 outline-none text-sm"
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
            htmlFor="password"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Password
          </label>
          <div className="flex items-center border rounded-md bg-white focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500 transition-all">
            <div className="px-3 text-gray-400 border-r py-2">
              <Lock size={18} />
            </div>
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="Enter password"
              className="w-full px-3 py-2 outline-none text-sm"
              value={password}
              autoComplete="current-password"
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="px-3 text-gray-400 hover:text-gray-600 transition cursor-pointer"
              aria-label={showPassword ? "Hide password" : "Show password"}
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
                className="p-1.5 rounded-full hover:bg-gray-200 text-blue-600 transition cursor-pointer"
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
              placeholder="Enter verification code"
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
          className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-70 disabled:cursor-not-allowed text-white py-2.5 rounded-md font-semibold transition mt-2 shadow-md shadow-blue-200"
        >
          {isLoading ? (
            <>
              <RefreshCw size={18} className="animate-spin" />
              <span>Signing In...</span>
            </>
          ) : (
            <>
              <span>Sign In</span>
              <ArrowRight size={18} />
            </>
          )}
        </button>

        {/* Forgot */}
        <div className="text-center">
          <button
            type="button"
            onClick={() => onSwitchView("applicant-forgot")}
            className="text-sm text-blue-600 hover:underline cursor-pointer font-medium"
          >
            Forgot password?
          </button>
        </div>

        {/* Register */}
        <div className="pt-4 border-t border-gray-100 text-center">
          <p className="text-sm text-gray-500">
            New applicant?{" "}
            <button
              type="button"
              onClick={() => onSwitchView("applicant-register")}
              className="text-blue-600 hover:underline cursor-pointer font-bold"
            >
              Register Now
            </button>
          </p>
        </div>
      </form>
    </div>
  );
}
