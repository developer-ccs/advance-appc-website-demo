"use client";

import { useEffect, useState, type SyntheticEvent } from "react";
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
      // Simulate network delay
      await new Promise((resolve) => setTimeout(resolve, 300));

      // Generate random 5-character string
      const text = Math.random().toString(36).substring(2, 7).toUpperCase();

      // Mock SVG for the captcha (indigo themed for admin)
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="120" height="40" viewBox="0 0 120 40">
        <rect width="100%" height="100%" fill="#f9fafb" rx="4"/>
        <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="monospace" font-size="20" font-weight="bold" fill="#4f46e5" letter-spacing="4" style="user-select: none;">${text}</text>
        <line x1="10" y1="20" x2="110" y2="20" stroke="#94a3b8" stroke-width="1.5" stroke-dasharray="4" />
      </svg>`;

      setCaptchaId(text); // Storing the answer as the ID for demo validation
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

    // 1. Verify Demo Captcha
    if (captchaInput.toUpperCase() !== captchaId) {
      setError("Invalid CAPTCHA. Please try again.");
      generateCaptcha();
      return;
    }

    setIsLoading(true);

    try {
      // 2. Simulate API request delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // 3. Create Mock Admin User
      const mockToken = "demo-admin-access-token";
      const mockUser: CouncilUser = {
        _id: "demo-admin-123",
        name: "Demo Admin",
        email: email, // Use the email they typed in
        role: UserRole.ADMIN,
      };

      // For demo, we assume they don't need to change password
      const mustChangePassword = false;

      // 4. Set state and cookies
      setAuthCookie(mockToken);
      setAuth(mockToken, mockUser);

      // Assign fake demo permissions
      setPermissions(["manage_users", "view_reports", "edit_content"]);

      onLoginSuccess(mockToken, mockUser);
      resetForm();
      onClose();

      // 5. Navigate based on mock flags
      const needsPasswordChange =
        mockUser.role !== UserRole.SUPER_ADMIN && mustChangePassword;
      useAuthStore.getState().setTempPassword(password);
      router.push(needsPasswordChange ? "/admin/change-password" : "/admin");
    } catch (err) {
      setError("Login failed. Check credentials.");
      generateCaptcha();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleLogin} className="space-y-4">
      {/* Restricted Access Notice */}
      <div className="bg-red-50 border-l-4 border-red-700 p-3 mb-2 text-xs text-gray-700">
        <strong>Restricted Access:</strong> This portal is strictly for
        authorized APPC officials only.
      </div>

      {/* Email */}
      <div>
        <label
          htmlFor="council-email"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Admin Email
        </label>
        <div className="flex items-center border rounded-md bg-white">
          <div className="px-3 text-gray-400">
            <ShieldCheck size={18} />
          </div>
          <input
            id="council-email"
            type="email"
            placeholder="Enter email (admin@example.com)"
            className="w-full px-2 py-2 text-sm outline-none"
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
        <div className="flex items-center border rounded-md bg-white">
          <div className="px-3 text-gray-400">
            <Lock size={18} />
          </div>
          <input
            type={showPassword ? "text" : "password"}
            id="council-password"
            placeholder="Enter password"
            className="w-full px-2 py-2 text-sm outline-none"
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
        <div className="border rounded-md overflow-hidden">
          <div className="flex items-center justify-between px-4 py-2.5 bg-gray-50 border-b border-gray-200">
            <span className="font-mono text-xl font-medium tracking-wide text-gray-800">
              {loadingCaptcha ? (
                <span className="after:content-['.'] after:animate-[dots_1.2s_steps(3,end)_infinite]">
                  Loading
                </span>
              ) : (
                <div dangerouslySetInnerHTML={{ __html: captchaSvg }} />
              )}
            </span>
            <button
              type="button"
              onClick={generateCaptcha}
              title="Refresh"
              className="w-7 h-7 flex items-center justify-center rounded-md border border-gray-200 bg-white text-indigo-600 hover:text-indigo-700 hover:bg-gray-50 cursor-pointer transition"
            >
              <RefreshCw
                size={16}
                className={loadingCaptcha ? "animate-spin" : ""}
              />
            </button>
          </div>
          <input
            id="captcha"
            name="captcha"
            type="text"
            placeholder="Type the text above..."
            className="w-full px-4 py-2.5 text-sm outline-none bg-white placeholder-gray-300"
            value={captchaInput}
            onChange={(e) => setCaptchaInput(e.target.value)}
            required
          />
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="flex justify-center gap-2 bg-red-50 border border-red-200 text-red-700 text-sm p-2 rounded">
          <AlertCircle size={16} className="mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={isLoading}
        className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-70 disabled:cursor-not-allowed text-white py-2 rounded-md cursor-pointer transition mt-2"
      >
        {isLoading ? (
          <>
            <RefreshCw size={18} className="animate-spin" />
            <span>Accessing...</span>
          </>
        ) : (
          <>
            <span>Access Portal</span>
            <ArrowRight size={18} />
          </>
        )}
      </button>

      {/* Forgot Password */}
      <div className="text-center">
        <button
          type="button"
          onClick={() => onSwitchView("applicant-forgot")}
          className="text-sm text-indigo-600 hover:underline cursor-pointer"
        >
          Forgot password?
        </button>
      </div>
    </form>
  );
}
