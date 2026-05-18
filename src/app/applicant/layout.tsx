"use client";

import React, { useEffect, useState, useRef } from "react";
import { usePathname } from "next/navigation";
import { ChevronDown, Loader, LogOut } from "lucide-react";
import Image from "next/image";
import appcLogo from "@/../public/logos/appc-logo.png";

// --- MOCK USER DATA ---
const DEMO_USER = {
  name: "Dr. Jane Doe",
  email: "jane.doe@example.com",
  profileImage: "", // Add a URL here to test the image, e.g., "https://i.pravatar.cc/150?img=32"
};

export default function ApplicantLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const [loggingOut, setLoggingOut] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  const navItems = [{ name: "Dashboard", href: "/applicant" }];

  // Extracts first letter of first name and first letter of surname
  const getInitials = (name: string) => {
    const cleanName = name.replace(/^(Dr\.|Mr\.|Mrs\.|Ms\.)\s+/i, "").trim();
    const parts = cleanName.split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return cleanName.substring(0, 2).toUpperCase();
  };

  /* Close menus on outside click */
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setDropdownOpen(false);
      }

      if (
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(e.target as Node)
      ) {
        setMobileMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      setLoggingOut(true);
      // Simulated API delay
      await new Promise((resolve) => setTimeout(resolve, 600));
      console.log("Logged out successfully");
      // Add redirection logic here if needed, e.g., router.push("/login")
    } catch (err) {
      console.error("Logout error", err);
    } finally {
      setLoggingOut(false);
    }
  };

  const currentPageName =
    navItems.find((item) => item.href === pathname)?.name || "Dashboard";

  return (
    <div className="flex h-screen bg-gray-100 font-sans">
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* HEADER */}
        <header className="relative h-16 bg-white shadow-sm flex items-center justify-between px-6 z-10 border-b border-gray-200">
          {/* LEFT */}
          <div className="flex items-center gap-3">
            <div className="relative w-10 h-10">
              <div className="absolute inset-1 bg-blue-900 blur-sm opacity-20 rounded-full" />

              <Image
                fill
                src={appcLogo}
                alt="APPC Logo"
                sizes="40px"
                className="object-contain"
                priority
              />
            </div>

            <h2 className="text-xl font-serif font-bold text-blue-900">
              {currentPageName}
            </h2>
          </div>

          {/* DESKTOP PROFILE */}
          <div className="hidden sm:flex items-center space-x-6">
            <div
              ref={dropdownRef}
              className="relative border-l rounded-xl pl-6 border-gray-200"
            >
              <button
                onClick={() => setDropdownOpen((prev) => !prev)}
                className="flex items-center space-x-3 cursor-pointer hover:bg-gray-50 p-2 rounded transition"
              >
                {/* Profile Image or Initials Avatar */}
                {DEMO_USER.profileImage ? (
                  <img
                    src={DEMO_USER.profileImage}
                    alt="Profile"
                    className="w-9 h-9 rounded-full object-cover border border-gray-200"
                  />
                ) : (
                  <div className="w-9 h-9 bg-blue-200 rounded-full flex items-center justify-center text-black font-bold text-sm">
                    {getInitials(DEMO_USER.name)}
                  </div>
                )}

                <div className="flex flex-col text-left">
                  <span className="text-sm font-bold text-gray-800">
                    {DEMO_USER.name}
                  </span>

                  <span className="text-xs text-gray-500">
                    {DEMO_USER.email}
                  </span>
                </div>

                <ChevronDown
                  size={16}
                  className={`text-gray-500 transition-transform duration-300 ${
                    dropdownOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {/* Desktop dropdown */}
              <div
                className={`absolute right-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50 overflow-hidden origin-top transition-all duration-300 ${
                  dropdownOpen
                    ? "opacity-100 scale-100 translate-y-0 pointer-events-auto"
                    : "opacity-0 scale-95 -translate-y-2 pointer-events-none"
                }`}
              >
                <button
                  onClick={handleLogout}
                  disabled={loggingOut}
                  className="w-full flex items-center gap-2 px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition disabled:opacity-50 cursor-pointer"
                >
                  {loggingOut ? (
                    <Loader size={16} className="animate-spin" />
                  ) : (
                    <LogOut size={16} />
                  )}

                  <span className="font-medium">
                    {loggingOut ? "Logging out..." : "Logout"}
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* MOBILE */}
          <div className="flex sm:hidden" ref={mobileMenuRef}>
            <button
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              className="relative w-10 h-10 flex items-center justify-center rounded-md hover:bg-gray-100 transition"
              aria-label="Toggle menu"
            >
              <span
                className={`absolute h-0.5 w-5 bg-gray-700 rounded transition-all duration-300 ${
                  mobileMenuOpen
                    ? "rotate-45 translate-y-0"
                    : "-translate-y-1.5"
                }`}
              />

              <span
                className={`absolute h-0.5 w-5 bg-gray-700 rounded transition-all duration-300 ${
                  mobileMenuOpen ? "opacity-0" : "opacity-100"
                }`}
              />

              <span
                className={`absolute h-0.5 w-5 bg-gray-700 rounded transition-all duration-300 ${
                  mobileMenuOpen
                    ? "-rotate-45 translate-y-0"
                    : "translate-y-1.5"
                }`}
              />
            </button>
          </div>

          {/* FULL WIDTH MOBILE MENU */}
          <div
            className={`sm:hidden absolute top-16 left-0 right-0 bg-white border-b border-gray-200 shadow-md z-50 px-6 py-4 origin-top transition-all duration-300 ease-out ${
              mobileMenuOpen
                ? "opacity-100 scale-y-100 translate-y-0 pointer-events-auto"
                : "opacity-0 scale-y-95 -translate-y-2 pointer-events-none"
            }`}
          >
            <div className="flex items-center gap-3 mb-4">
              {DEMO_USER.profileImage ? (
                <img
                  src={DEMO_USER.profileImage}
                  alt="Profile"
                  className="w-10 h-10 rounded-full object-cover border border-gray-200 shrink-0"
                />
              ) : (
                <div className="w-10 h-10 bg-blue-800 rounded-full flex items-center justify-center text-white border border-blue-600 font-bold text-sm shrink-0">
                  {getInitials(DEMO_USER.name)}
                </div>
              )}

              <div className="flex flex-col min-w-0">
                <span className="text-sm font-bold text-gray-800 truncate">
                  {DEMO_USER.name}
                </span>

                <span className="text-xs text-gray-500 truncate">
                  {DEMO_USER.email}
                </span>
              </div>
            </div>

            <hr className="border-gray-200 mb-3" />

            <button
              onClick={handleLogout}
              disabled={loggingOut}
              className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-red-600 hover:bg-red-50 rounded-md transition disabled:opacity-50 cursor-pointer"
            >
              {loggingOut ? (
                <Loader size={16} className="animate-spin" />
              ) : (
                <LogOut size={16} />
              )}

              <span className="font-medium">
                {loggingOut ? "Logging out..." : "Logout"}
              </span>
            </button>
          </div>
        </header>

        {/* MAIN */}
        <main className="flex-1 overflow-y-auto p-6 bg-gray-50 bg-opacity-50">
          {children}
        </main>
      </div>
    </div>
  );
}
