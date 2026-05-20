"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";

import { ApplicantLogin } from "@/components/forms/applicant-login";
import { ApplicantRegister } from "@/components/forms/applicant-register";
import { CouncilLogin } from "@/components/forms/council-login";
import { ApplicantForgot } from "@/components/forms/applicant-forgot";

import { useToast } from "../ui/ToastContext";
import type { ViewType } from "@/utils/types";

const CURRENT_YEAR = 2026;

interface LoginOffcanvasProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialView?: ViewType;
}

export function CustomOffcanvas({
  open,
  onOpenChange,
  initialView,
}: LoginOffcanvasProps) {
  const { showToast } = useToast();

  // Track only the current view
  const [currentView, setCurrentView] = useState<ViewType>(
    initialView ?? "applicant-login",
  );

  // Helper to determine if we are in a council-related view for styling
  const isCouncil = currentView.startsWith("council");

  const handleSwitchView = (view: ViewType) => {
    setCurrentView(view);
  };

  const renderContent = () => {
    switch (currentView) {
      case "applicant-login":
        return (
          <ApplicantLogin
            onClose={() => onOpenChange(false)}
            onSwitchView={handleSwitchView}
            onLoginSuccess={(_token, user) => {
              showToast("Successfully Login", "success");
            }}
          />
        );

      case "applicant-register":
        return (
          <ApplicantRegister
            onClose={() => onOpenChange(false)}
            onSwitchView={handleSwitchView}
          />
        );

      case "applicant-forgot":
        return <ApplicantForgot onSwitchView={handleSwitchView} />;

      case "council-login":
        return (
          <CouncilLogin
            onClose={() => onOpenChange(false)}
            onSwitchView={handleSwitchView}
            onLoginSuccess={(_token, user) => {
              showToast("Successfully Login", "success");
            }}
          />
        );

      case "council-forgot":
        return (
          <div className="text-center py-6">
            <p className="mb-3 text-gray-600">
              Council forgot password form coming soon...
            </p>
            <button
              onClick={() => handleSwitchView("council-login")}
              className="text-blue-600 hover:underline"
            >
              Back to Login
            </button>
          </div>
        );

      default:
        return null;
    }
  };

  // Sync view when the offcanvas is opened from the Navbar
  useEffect(() => {
    if (open && initialView) {
      setCurrentView(initialView);
    }
  }, [open, initialView]);

  return (
    <>
      {/* Offcanvas */}
      <div
        className={`fixed top-0 right-0 h-full w-full sm:w-105 bg-white shadow-xl z-50 transform transition-transform duration-300 ${
          open ? "translate-x-0" : "translate-x-full"
        } flex flex-col`}
      >
        {/* Header */}
        <div className="bg-blue-950 text-white p-4 flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-semibold">Welcome</h2>
            <p className="text-sm opacity-90">
              Secure access to APPC portal services
            </p>
          </div>
          <button
            onClick={() => onOpenChange(false)}
            aria-label="Close menu"
            className="text-white hover:text-gray-200 cursor-pointer"
          >
            <X size={22} />
          </button>
        </div>

        {/* Body */}
        <div
          className={`flex-1 overflow-y-auto px-6 py-6 flex flex-col items-center justify-center transition-colors duration-300 ${
            isCouncil
              ? "bg-linear-to-b from-gray-50 to-gray-100"
              : "bg-linear-to-b from-white to-gray-50"
          }`}
        >
          {/* Content */}
          <div className="max-w-md mx-auto w-full">{renderContent()}</div>
        </div>

        {/* Footer */}
        <div className="bg-blue-950 text-white text-center py-3 text-xs">
          &copy; {CURRENT_YEAR} Arunachal Pradesh Pharmacy Council. All rights
          reserved.
        </div>
      </div>

      {/* Backdrop */}
      {open && (
        <div
          onClick={() => onOpenChange(false)}
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
        />
      )}
    </>
  );
}
