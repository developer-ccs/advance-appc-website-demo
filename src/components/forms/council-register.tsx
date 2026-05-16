"use client";

import { useState, type SyntheticEvent } from "react";
import {
  Lock,
  Mail,
  User,
  ArrowRight,
  AlertCircle,
  Phone,
  Eye,
  EyeOff,
} from "lucide-react";
import { AxiosError } from "axios";
import type { ViewType } from "@/utils/types";
import { useRegisterStore } from "@/store/userRegisterStore";
import { apiClient } from "@/lib/axios-instance";

interface CouncilRegisterProps {
  onClose: () => void;
  onSwitchView: (view: ViewType) => void;
}

// ── Validators ────────────────────────────────────────────────────────────────

const isValidEmail = (value: string): boolean =>
  /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value.trim());

const isValidPhone = (value: string): boolean => /^[6789]\d{9}$/.test(value);

const isValidPassword = (value: string): boolean =>
  value.length >= 8 &&
  /[A-Z]/.test(value) &&
  /[a-z]/.test(value) &&
  /[0-9]/.test(value) &&
  /[^a-zA-Z0-9]/.test(value);

// ── Component ─────────────────────────────────────────────────────────────────

export function CouncilRegister({
  onClose,
  onSwitchView,
}: CouncilRegisterProps) {
  const { council, setCouncilField, resetCouncil } = useRegisterStore();
  const { name, email, phone, password, confirmPassword, error } = council;

  const [showPassword, setShowPassword] = useState(false);

  // Per-field inline error state
  const [fieldErrors, setFieldErrors] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  // ── Field-level helpers ──────────────────────────────────────────────────

  const setFieldError = (field: keyof typeof fieldErrors, msg: string) =>
    setFieldErrors((prev) => ({ ...prev, [field]: msg }));

  const clearFieldError = (field: keyof typeof fieldErrors) =>
    setFieldErrors((prev) => ({ ...prev, [field]: "" }));

  // ── onChange handlers ────────────────────────────────────────────────────

  /** Allow only letters and spaces */
  const handleNameChange = (value: string) => {
    const sanitized = value.replace(/[^a-zA-Z\s]/g, "");
    setCouncilField("name", sanitized);
    if (sanitized.trim().length > 0) clearFieldError("name");
  };

  /** Allow only digits, max 10 */
  const handlePhoneChange = (value: string) => {
    const sanitized = value.replace(/\D/g, "").slice(0, 10);
    setCouncilField("phone", sanitized);
    if (sanitized.length > 0) clearFieldError("phone");
  };

  const handlePasswordChange = (value: string) => {
    setCouncilField("password", value);
    if (value.length > 0) clearFieldError("password");
  };

  const handleConfirmPasswordChange = (value: string) => {
    setCouncilField("confirmPassword", value);
    if (value.length > 0) clearFieldError("confirmPassword");
  };

  // ── onBlur validators ────────────────────────────────────────────────────

  const validateNameOnBlur = () => {
    if (!name.trim()) {
      setFieldError("name", "Full name is required.");
    } else if (!/^[a-zA-Z][a-zA-Z\s]*$/.test(name.trim())) {
      setFieldError("name", "Only letters and spaces are allowed.");
    } else {
      clearFieldError("name");
    }
  };

  const validateEmailOnBlur = () => {
    if (!email.trim()) {
      setFieldError("email", "Email is required.");
    } else if (!isValidEmail(email)) {
      setFieldError("email", "Enter a valid email address.");
    } else {
      clearFieldError("email");
    }
  };

  const validatePhoneOnBlur = () => {
    if (!phone) {
      setFieldError("phone", "Phone number is required.");
    } else if (!isValidPhone(phone)) {
      setFieldError("phone", "Must be 10 digits and start with 6, 7, 8, or 9.");
    } else {
      clearFieldError("phone");
    }
  };

  const validatePasswordOnBlur = () => {
    if (!password) {
      setFieldError("password", "Password is required.");
    } else if (!isValidPassword(password)) {
      setFieldError(
        "password",
        "Must be 8+ characters with uppercase, lowercase, number, and special character.",
      );
    } else {
      clearFieldError("password");
    }
  };

  const validateConfirmPasswordOnBlur = () => {
    if (!confirmPassword) {
      setFieldError("confirmPassword", "Please confirm your password.");
    } else if (confirmPassword !== password) {
      setFieldError("confirmPassword", "Passwords do not match.");
    } else {
      clearFieldError("confirmPassword");
    }
  };

  // ── Submit ───────────────────────────────────────────────────────────────

  const handleRegister = async (e: SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setCouncilField("error", "");

    // Run all validations before submitting
    const validName =
      name.trim().length > 0 && /^[a-zA-Z][a-zA-Z\s]*$/.test(name.trim());
    const validEmail = isValidEmail(email);
    const validPhone = isValidPhone(phone);
    const validPassword = isValidPassword(password);
    const validConfirm = confirmPassword === password;

    if (!validName) {
      setFieldError("name", "Only letters and spaces are allowed.");
    }
    if (!validEmail) {
      setFieldError("email", "Enter a valid email address.");
    }
    if (!validPhone) {
      setFieldError("phone", "Must be 10 digits and start with 6, 7, 8, or 9.");
    }
    if (!validPassword) {
      setFieldError(
        "password",
        "Must be 8+ characters with uppercase, lowercase, number, and special character.",
      );
    }
    if (!validConfirm) {
      setFieldError("confirmPassword", "Passwords do not match.");
    }

    if (
      !validName ||
      !validEmail ||
      !validPhone ||
      !validPassword ||
      !validConfirm
    ) {
      return;
    }

    try {
      const response = await apiClient.post(`/applicant/register`, {
        name,
        email,
        password,
        phoneNumber: phone,
      });

      console.log("Registered council:", response.data);

      alert("Council account registered successfully!");

      resetCouncil();

      onSwitchView("council-login");
      onClose();
    } catch (err: unknown) {
      const axiosError = err as AxiosError<{ message?: string }>;

      console.error(axiosError.response?.data || axiosError.message);

      setCouncilField(
        "error",
        axiosError.response?.data?.message || "Registration failed.",
      );
    }
  };

  // ── Render ───────────────────────────────────────────────────────────────

  return (
    <form onSubmit={handleRegister} className="space-y-4" noValidate>
      {/* Full Name */}
      <div>
        <label
          htmlFor="fullName"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Full Name
        </label>

        <div
          className={`flex items-center border rounded-md bg-white ${
            fieldErrors.name ? "border-red-400" : ""
          }`}
        >
          <span className="px-3 text-gray-400">
            <User size={18} />
          </span>

          <input
            id="fullName"
            name="fullName"
            type="text"
            className="w-full px-2 py-2 text-sm outline-none"
            placeholder="Enter name"
            value={name}
            onChange={(e) => handleNameChange(e.target.value)}
            onBlur={validateNameOnBlur}
            required
          />
        </div>

        {fieldErrors.name && (
          <p className="text-xs text-red-500 mt-1">{fieldErrors.name}</p>
        )}
      </div>

      {/* Email */}
      <div>
        <label
          htmlFor="email"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Email
        </label>

        <div
          className={`flex items-center border rounded-md bg-white ${
            fieldErrors.email ? "border-red-400" : ""
          }`}
        >
          <span className="px-3 text-gray-400">
            <Mail size={18} />
          </span>

          <input
            id="email"
            name="email"
            type="email"
            className="w-full px-2 py-2 text-sm outline-none"
            placeholder="Enter email"
            value={email}
            autoComplete="username"
            onChange={(e) => {
              setCouncilField("email", e.target.value);
              if (e.target.value) clearFieldError("email");
            }}
            onBlur={validateEmailOnBlur}
            required
          />
        </div>

        {fieldErrors.email && (
          <p className="text-xs text-red-500 mt-1">{fieldErrors.email}</p>
        )}
      </div>

      {/* Phone */}
      <div>
        <label
          htmlFor="phone"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Phone
        </label>

        <div
          className={`flex items-center border rounded-md bg-white ${
            fieldErrors.phone ? "border-red-400" : ""
          }`}
        >
          <span className="px-3 text-gray-400">
            <Phone size={18} />
          </span>

          <input
            id="phone"
            name="phone"
            type="tel"
            className="w-full px-2 py-2 text-sm outline-none"
            placeholder="10-digit mobile number"
            value={phone}
            maxLength={10}
            autoComplete="tel"
            onChange={(e) => handlePhoneChange(e.target.value)}
            onBlur={validatePhoneOnBlur}
            required
          />
        </div>

        {fieldErrors.phone && (
          <p className="text-xs text-red-500 mt-1">{fieldErrors.phone}</p>
        )}
      </div>

      {/* Password */}
      <div>
        <label
          htmlFor="password"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Password
        </label>

        <div
          className={`flex items-center border rounded-md bg-white ${
            fieldErrors.password ? "border-red-400" : ""
          }`}
        >
          <span className="px-3 text-gray-400">
            <Lock size={18} />
          </span>

          <input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            className="w-full px-2 py-2 text-sm outline-none"
            placeholder="Enter password"
            value={password}
            autoComplete="new-password"
            onChange={(e) => handlePasswordChange(e.target.value)}
            onBlur={validatePasswordOnBlur}
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

        {fieldErrors.password ? (
          <p className="text-xs text-red-500 mt-1">{fieldErrors.password}</p>
        ) : (
          <p className="text-xs text-gray-400 mt-1">
            Min 8 chars - uppercase, lowercase, number & special character.
          </p>
        )}
      </div>

      {/* Confirm Password */}
      <div className="mb-5">
        <label
          htmlFor="confirmPassword"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Confirm Password
        </label>

        <div
          className={`flex items-center border rounded-md bg-white ${
            fieldErrors.confirmPassword ? "border-red-400" : ""
          }`}
        >
          <span className="px-3 text-gray-400">
            <Lock size={18} />
          </span>

          <input
            id="confirmPassword"
            name="confirmPassword"
            type={showPassword ? "text" : "password"}
            className="w-full px-2 py-2 text-sm outline-none"
            placeholder="Confirm password"
            value={confirmPassword}
            autoComplete="new-password"
            onChange={(e) => handleConfirmPasswordChange(e.target.value)}
            onBlur={validateConfirmPasswordOnBlur}
            required
          />
        </div>

        {fieldErrors.confirmPassword && (
          <p className="text-xs text-red-500 mt-1">
            {fieldErrors.confirmPassword}
          </p>
        )}
      </div>

      {/* Global / API Error */}
      {error && (
        <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 text-sm p-2 rounded">
          <AlertCircle size={16} className="mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Submit */}
      <button
        type="submit"
        className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-md cursor-pointer transition"
      >
        <span>Register</span>
        <ArrowRight size={18} />
      </button>

      {/* Login Link */}
      <p className="text-center text-sm text-gray-500">
        Already registered?{" "}
        <button
          type="button"
          onClick={() => onSwitchView("council-login")}
          className="text-indigo-600 hover:underline cursor-pointer"
        >
          Sign In
        </button>
      </p>
    </form>
  );
}
