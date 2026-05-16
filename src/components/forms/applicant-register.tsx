"use client";

import { useState, useRef, type SyntheticEvent, useEffect } from "react";
import {
  Mail,
  Lock,
  ArrowRight,
  AlertCircle,
  Phone,
  EyeOff,
  Eye,
  User,
  ShieldCheck,
  CheckCircle2,
  RefreshCw,
  Loader,
} from "lucide-react";
import { AxiosError } from "axios";
import type { ViewType } from "@/utils/types";
import { useRegisterStore } from "@/store/userRegisterStore";
import { apiClient } from "@/lib/axios-instance";
import { useToast } from "../ui/ToastContext";

interface ApplicantRegisterProps {
  onClose: () => void;
  onSwitchView: (view: ViewType) => void;
}

// Types

type Step = 1 | 2 | 3;

interface PrefillData {
  hasCertificate: boolean;
  name?: string;
  phoneNumber?: string;
  email?: string;
}

// Validators
const isValidEmail = (v: string) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim());

const isValidPhone = (v: string) => /^[6789]\d{9}$/.test(v);

const isValidPassword = (v: string) =>
  v.length >= 8 &&
  /[A-Z]/.test(v) &&
  /[a-z]/.test(v) &&
  /[0-9]/.test(v) &&
  /[^a-zA-Z0-9]/.test(v);

// Step indicator

function StepIndicator({ current }: { current: Step }) {
  const steps = [
    { n: 1, label: "Email" },
    { n: 2, label: "Verify OTP" },
    { n: 3, label: "Set Password" },
  ];

  return (
    <div className="flex items-center justify-center gap-0 mb-6 select-none">
      {steps.map((s, i) => {
        const done = current > s.n;
        const active = current === s.n;
        return (
          <div key={s.n} className="flex items-center">
            {/* Circle */}
            <div className="flex flex-col items-center gap-1">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                  done
                    ? "bg-green-500 text-white shadow-md shadow-green-200"
                    : active
                      ? "bg-blue-600 text-white shadow-md shadow-blue-200"
                      : "bg-gray-100 text-gray-400 border border-gray-200"
                }`}
              >
                {done ? <CheckCircle2 size={16} /> : s.n}
              </div>
              <span
                className={`text-[10px] font-medium transition-colors ${
                  done
                    ? "text-green-500"
                    : active
                      ? "text-blue-600"
                      : "text-gray-400"
                }`}
              >
                {s.label}
              </span>
            </div>

            {/* Connector line */}
            {i < steps.length - 1 && (
              <div
                className={`w-10 h-0.5 mb-4 mx-1 rounded transition-all duration-500 ${
                  current > s.n ? "bg-green-400" : "bg-gray-200"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

// Field wrapper

function Field({
  label,
  htmlFor,
  error,
  hint,
  children,
}: {
  label: string;
  htmlFor: string;
  error?: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label
        htmlFor={htmlFor}
        className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wide"
      >
        {label}
      </label>
      {children}
      {error ? (
        <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
          <AlertCircle size={11} className="shrink-0" />
          {error}
        </p>
      ) : hint ? (
        <p className="text-xs text-gray-400 mt-1">{hint}</p>
      ) : null}
    </div>
  );
}

// Input wrapper

function InputBox({
  hasError,
  readOnly,
  children,
}: {
  hasError?: boolean;
  readOnly?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div
      className={`flex items-center border rounded-lg bg-white transition-colors ${
        readOnly
          ? "bg-gray-50 border-gray-200"
          : hasError
            ? "border-red-400 focus-within:border-red-500"
            : "border-gray-200 focus-within:border-blue-500"
      }`}
    >
      {children}
    </div>
  );
}

// OTP Input

function OtpInput({
  value,
  onChange,
  disabled,
}: {
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
}) {
  const inputs = useRef<(HTMLInputElement | null)[]>([]);
  const digits = value.padEnd(6, "").split("").slice(0, 6);

  const handleChange = (i: number, char: string) => {
    const d = char.replace(/\D/g, "").slice(-1);
    const arr = [...digits];
    arr[i] = d;
    const next = arr.join("").slice(0, 6);
    onChange(next);
    if (d && i < 5) inputs.current[i + 1]?.focus();
  };

  const handleKeyDown = (i: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace") {
      if (!digits[i] && i > 0) {
        const arr = [...digits];
        arr[i - 1] = "";
        onChange(arr.join(""));
        inputs.current[i - 1]?.focus();
      } else {
        const arr = [...digits];
        arr[i] = "";
        onChange(arr.join(""));
      }
    }
    if (e.key === "ArrowLeft" && i > 0) inputs.current[i - 1]?.focus();
    if (e.key === "ArrowRight" && i < 5) inputs.current[i + 1]?.focus();
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 6);
    onChange(pasted);
    const focusIdx = Math.min(pasted.length, 5);
    inputs.current[focusIdx]?.focus();
  };

  return (
    <div className="flex gap-2 justify-center">
      {Array.from({ length: 6 }).map((_, i) => (
        <input
          key={i}
          ref={(el) => {
            inputs.current[i] = el;
          }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={digits[i] || ""}
          disabled={disabled}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onPaste={handlePaste}
          onFocus={(e) => e.target.select()}
          className={`w-10 h-12 text-center text-lg font-bold border-2 rounded-lg outline-none transition-all
            ${disabled ? "bg-gray-50 text-gray-400 border-gray-200" : ""}
            ${digits[i] ? "border-blue-500 bg-blue-50 text-blue-700" : "border-gray-200 focus:border-blue-400 bg-white"}
          `}
        />
      ))}
    </div>
  );
}

// Main Component

export function ApplicantRegister({
  onClose,
  onSwitchView,
}: ApplicantRegisterProps) {
  const { applicant, setApplicantField, resetApplicant } = useRegisterStore();
  const { name, email, phone, password, confirmPassword, error } = applicant;
  const { showToast } = useToast();

  const [step, setStep] = useState<Step>(1);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [otp, setOtp] = useState("");
  const [prefill, setPrefill] = useState<PrefillData | null>(null);

  const OTP_TTL = 3 * 60;
  const [otpTimer, setOtpTimer] = useState(0);
  useEffect(() => {
    if (otpTimer <= 0) return;
    const t = setTimeout(() => setOtpTimer((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [otpTimer]);

  const fmtTimer = (s: number) =>
    `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  // Per-field errors
  const [fe, setFe] = useState({
    email: "",
    otp: "",
    name: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  const setErr = (f: keyof typeof fe, msg: string) =>
    setFe((p) => ({ ...p, [f]: msg }));
  const clrErr = (f: keyof typeof fe) => setFe((p) => ({ ...p, [f]: "" }));

  // STEP 1 — Send OTP
  const handleSendOtp = async (e?: SyntheticEvent) => {
    e?.preventDefault();
    setApplicantField("error", "");

    if (!email.trim()) return setErr("email", "Email is required.");
    if (!isValidEmail(email))
      return setErr("email", "Enter a valid email address.");
    clrErr("email");

    setLoading(true);
    try {
      await apiClient.post("/applicant/send-otp", { email: email.trim() });
      setStep(2);
      setOtpTimer(OTP_TTL);
      setOtp("");
      showToast("OTP sent! Check your inbox.", "success");
    } catch (err) {
      const e = err as AxiosError<{ message?: string }>;
      setApplicantField(
        "error",
        e.response?.data?.message || "Failed to send OTP. Try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  // STEP 2 — Verify OTP
  const handleVerifyOtp = async (e: SyntheticEvent) => {
    e.preventDefault();
    setApplicantField("error", "");

    if (otp.length < 6) return setErr("otp", "Enter the full 6-digit OTP.");
    clrErr("otp");

    setLoading(true);
    try {
      const res = await apiClient.post("/applicant/verify-otp", {
        email: email.trim(),
        otp,
      });
      const data = res.data?.data as PrefillData;
      setPrefill(data);

      // Pre-populate store if certificate data returned
      if (data.hasCertificate && data.name) {
        setApplicantField("name", data.name);
        setApplicantField("phone", data.phoneNumber ?? "");
      }

      setStep(3);
    } catch (err) {
      const e = err as AxiosError<{ message?: string }>;
      setApplicantField(
        "error",
        e.response?.data?.message || "Invalid or expired OTP.",
      );
    } finally {
      setLoading(false);
    }
  };

  // STEP 3 — Register
  const handleRegister = async (e: SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setApplicantField("error", "");

    let valid = true;

    if (!prefill?.hasCertificate) {
      if (!name.trim() || !/^[a-zA-Z][a-zA-Z\s]*$/.test(name.trim())) {
        setErr("name", "Full name — letters and spaces only.");
        valid = false;
      }
      if (!isValidPhone(phone)) {
        setErr("phone", "Must be 10 digits starting with 6, 7, 8, or 9.");
        valid = false;
      }
    }

    if (!isValidPassword(password)) {
      setErr(
        "password",
        "Min 8 chars with uppercase, lowercase, number & special character.",
      );
      valid = false;
    }
    if (confirmPassword !== password) {
      setErr("confirmPassword", "Passwords do not match.");
      valid = false;
    }

    if (!valid) return;

    setLoading(true);
    try {
      const body: Record<string, string> = { email: email.trim(), password };
      if (!prefill?.hasCertificate) {
        body.name = name.trim();
        body.phoneNumber = phone.trim();
      }

      await apiClient.post("/applicant/register", body);

      showToast("Registration successful!", "success");
      resetApplicant();
      onSwitchView("applicant-login");
      onClose();
    } catch (err) {
      const e = err as AxiosError<{ message?: string }>;
      setApplicantField(
        "error",
        e.response?.data?.message || "Registration failed. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  // Render
  return (
    <div className="space-y-1">
      <StepIndicator current={step} />

      {/* ── STEP 1 — Email ── */}
      {step === 1 && (
        <form onSubmit={handleSendOtp} className="space-y-4" noValidate>
          <div className="text-center mb-4">
            <p className="text-sm text-gray-500">
              Enter valid email id to receive one-time password.
            </p>
          </div>

          <Field label="Email Address" htmlFor="reg-email" error={fe.email}>
            <InputBox hasError={!!fe.email}>
              <div className="px-3 text-gray-400">
                <Mail size={16} />
              </div>
              <input
                id="reg-email"
                type="email"
                placeholder="you@example.com"
                autoComplete="email"
                className="w-full py-2.5 pr-3 text-sm outline-none bg-transparent"
                value={email}
                onChange={(e) => {
                  setApplicantField("email", e.target.value.toLowerCase());
                  if (e.target.value) clrErr("email");
                }}
                onBlur={() => {
                  if (!email.trim()) setErr("email", "Email is required.");
                  else if (!isValidEmail(email))
                    setErr("email", "Enter a valid email address.");
                  else clrErr("email");
                }}
                required
              />
            </InputBox>
          </Field>

          {error && <ApiErrorBox message={error} />}

          <SubmitButton loading={loading} label="Send OTP" />

          <LoginLink onSwitchView={onSwitchView} />
        </form>
      )}

      {/* ── STEP 2 — OTP ── */}
      {step === 2 && (
        <form onSubmit={handleVerifyOtp} className="space-y-5" noValidate>
          <div className="text-center">
            <p className="text-sm text-gray-500">
              We sent a 6-digit code to{" "}
              <span className="font-semibold text-gray-700">{email}</span>
            </p>
          </div>

          <div className="space-y-2">
            <OtpInput value={otp} onChange={setOtp} disabled={loading} />
            {fe.otp && (
              <p className="text-xs text-red-500 text-center flex items-center justify-center gap-1">
                <AlertCircle size={11} />
                {fe.otp}
              </p>
            )}
          </div>

          {/* OTP expiry timer / Resend */}
          <div className="text-center space-y-1">
            {otpTimer > 0 ? (
              <div className="flex flex-col items-center gap-1">
                <p className="text-xs text-gray-400">OTP expires in</p>
                <span
                  className={`text-base font-bold tabular-nums tracking-widest ${
                    otpTimer <= 30 ? "text-red-500" : "text-blue-600"
                  }`}
                >
                  {fmtTimer(otpTimer)}
                </span>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-1.5">
                <p className="text-xs text-red-500 font-medium">OTP expired.</p>
                <button
                  type="button"
                  onClick={handleSendOtp}
                  disabled={loading}
                  className="text-xs text-blue-600 hover:underline flex items-center gap-1 mx-auto cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw size={11} />
                  Resend OTP
                </button>
              </div>
            )}
          </div>

          {error && <ApiErrorBox message={error} />}

          <SubmitButton
            loading={loading}
            label="Verify OTP"
            disabled={otpTimer === 0}
          />

          {/* Back */}
          <button
            type="button"
            onClick={() => {
              setStep(1);
              setOtp("");
              setApplicantField("error", "");
            }}
            className="w-full text-xs text-gray-400 hover:text-gray-600 text-center cursor-pointer"
          >
            ← Change email
          </button>
        </form>
      )}

      {/* ── STEP 3 — Complete Registration ── */}
      {step === 3 && (
        <form onSubmit={handleRegister} className="space-y-4" noValidate>
          {/* Certificate badge */}
          {prefill?.hasCertificate && (
            <div className="flex items-start gap-2 bg-green-50 border border-green-200 text-green-700 text-xs p-2.5 rounded-lg">
              <ShieldCheck size={14} className="mt-0.5 shrink-0" />
              <span>
                Your certificate was found. Name and phone are pre-filled from
                our records.
              </span>
            </div>
          )}

          {/* Name */}
          <Field label="Full Name" htmlFor="reg-name" error={fe.name}>
            <InputBox hasError={!!fe.name} readOnly={prefill?.hasCertificate}>
              <div className="px-3 text-gray-400">
                <User size={16} />
              </div>
              <input
                id="reg-name"
                type="text"
                placeholder="Your full name"
                className={`w-full py-2.5 pr-3 text-sm outline-none bg-transparent ${
                  prefill?.hasCertificate
                    ? "text-gray-500 cursor-not-allowed"
                    : ""
                }`}
                value={name}
                readOnly={prefill?.hasCertificate}
                onChange={(e) => {
                  if (prefill?.hasCertificate) return;
                  const s = e.target.value
                    .replace(/[^a-zA-Z\s]/g, "")
                    .toLowerCase()
                    .replace(/\b\w/g, (char) => char.toUpperCase());
                  setApplicantField("name", s);
                  if (s.trim()) clrErr("name");
                }}
                onBlur={() => {
                  if (prefill?.hasCertificate) return;
                  if (!name.trim()) setErr("name", "Full name is required.");
                  else if (!/^[a-zA-Z][a-zA-Z\s]*$/.test(name.trim()))
                    setErr("name", "Only letters and spaces are allowed.");
                  else clrErr("name");
                }}
              />
              {prefill?.hasCertificate && (
                <div className="px-3 text-green-500">
                  <CheckCircle2 size={14} />
                </div>
              )}
            </InputBox>
          </Field>

          {/* Phone */}
          <Field label="Phone Number" htmlFor="reg-phone" error={fe.phone}>
            <InputBox hasError={!!fe.phone} readOnly={prefill?.hasCertificate}>
              <div className="px-3 text-gray-400">
                <Phone size={16} />
              </div>
              <input
                id="reg-phone"
                type="tel"
                placeholder="10-digit mobile number"
                inputMode="numeric"
                maxLength={10}
                className={`w-full py-2.5 pr-3 text-sm outline-none bg-transparent ${
                  prefill?.hasCertificate
                    ? "text-gray-500 cursor-not-allowed"
                    : ""
                }`}
                value={phone}
                readOnly={prefill?.hasCertificate}
                onChange={(e) => {
                  if (prefill?.hasCertificate) return;
                  const s = e.target.value.replace(/\D/g, "").slice(0, 10);
                  setApplicantField("phone", s);
                  if (s) clrErr("phone");
                }}
                onBlur={() => {
                  if (prefill?.hasCertificate) return;
                  if (!isValidPhone(phone))
                    setErr(
                      "phone",
                      "Must be 10 digits starting with 6, 7, 8, or 9.",
                    );
                  else clrErr("phone");
                }}
              />
              {prefill?.hasCertificate && (
                <div className="px-3 text-green-500">
                  <CheckCircle2 size={14} />
                </div>
              )}
            </InputBox>
          </Field>

          {/* Password */}
          <Field
            label="Password"
            htmlFor="reg-password"
            error={fe.password}
            hint={
              !fe.password
                ? "Min 8 chars · uppercase · lowercase · number · special character"
                : undefined
            }
          >
            <InputBox hasError={!!fe.password}>
              <div className="px-3 text-gray-400">
                <Lock size={16} />
              </div>
              <input
                id="reg-password"
                type={showPassword ? "text" : "password"}
                placeholder="Create a strong password"
                autoComplete="new-password"
                className="w-full py-2.5 text-sm outline-none bg-transparent"
                value={password}
                onChange={(e) => {
                  setApplicantField("password", e.target.value);
                  if (e.target.value) clrErr("password");
                }}
                onBlur={() => {
                  if (!password) setErr("password", "Password is required.");
                  else if (!isValidPassword(password))
                    setErr(
                      "password",
                      "Min 8 chars with uppercase, lowercase, number & special character.",
                    );
                  else clrErr("password");
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword((p) => !p)}
                className="px-3 text-gray-400 hover:text-gray-600 transition cursor-pointer"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </InputBox>
          </Field>

          {/* Confirm Password */}
          <Field
            label="Confirm Password"
            htmlFor="reg-confirm"
            error={fe.confirmPassword}
          >
            <InputBox hasError={!!fe.confirmPassword}>
              <div className="px-3 text-gray-400">
                <Lock size={16} />
              </div>
              <input
                id="reg-confirm"
                type="text"
                placeholder="Re-enter your password"
                autoComplete="new-password"
                className="w-full py-2.5 pr-3 text-sm outline-none bg-transparent"
                value={confirmPassword}
                onChange={(e) => {
                  setApplicantField("confirmPassword", e.target.value);
                  if (e.target.value) clrErr("confirmPassword");
                }}
                onBlur={() => {
                  if (!confirmPassword)
                    setErr("confirmPassword", "Please confirm your password.");
                  else if (confirmPassword !== password)
                    setErr("confirmPassword", "Passwords do not match.");
                  else clrErr("confirmPassword");
                }}
              />
            </InputBox>
          </Field>

          {error && <ApiErrorBox message={error} />}

          <SubmitButton loading={loading} label="Create Account" />

          <LoginLink onSwitchView={onSwitchView} />
        </form>
      )}
    </div>
  );
}

// Shared sub-components
function ApiErrorBox({ message }: { message: string }) {
  return (
    <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 text-sm p-2.5 rounded-lg">
      <AlertCircle size={15} className="mt-0.5 shrink-0" />
      <span>{message}</span>
    </div>
  );
}

function SubmitButton({
  loading,
  label,
  disabled,
}: {
  loading: boolean;
  label: string;
  disabled?: boolean;
}) {
  return (
    <button
      type="submit"
      disabled={loading || disabled}
      className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white py-2.5 rounded-lg font-medium text-sm transition cursor-pointer disabled:cursor-not-allowed"
    >
      {loading ? (
        <>
          <Loader size={16} className="animate-spin" />
          <span>Please wait…</span>
        </>
      ) : (
        <>
          <span>{label}</span>
          <ArrowRight size={16} />
        </>
      )}
    </button>
  );
}

function LoginLink({ onSwitchView }: { onSwitchView: (v: ViewType) => void }) {
  return (
    <p className="text-center text-sm text-gray-500">
      Already registered?{" "}
      <button
        type="button"
        onClick={() => onSwitchView("applicant-login")}
        className="text-blue-600 hover:underline cursor-pointer font-medium"
      >
        Sign In
      </button>
    </p>
  );
}
