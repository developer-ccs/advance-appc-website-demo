"use client";

import React, { useEffect, useState, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { apiClient } from "@/lib/axios-instance";
import { ChevronDown, Loader, LogOut } from "lucide-react";
import Image from "next/image";
import appcLogo from "@/../public/logos/appc-logo.png";
import { useUserProfileStore } from "@/store/userProfileStore";
import { UserRole } from "@/utils/types";

export default function ApplicantLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  const { clearAuth, _hasHydrated, user } = useAuthStore();
  const { user: profileUser, loading, fetchUser } = useUserProfileStore();

  const [loggingOut, setLoggingOut] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  const navItems = [{ name: "Dashboard", href: "/applicant" }];

  const getInitials = (name: string) =>
    name
      .trim()
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase();

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

  /* Auth guard */
  useEffect(() => {
    if (!_hasHydrated) return;

    if (!user || user.role !== UserRole.APPLICANT) {
      router.replace("/");
    }
  }, [_hasHydrated, user, router]);

  useEffect(() => {
    if (!profileUser) fetchUser();
  }, [profileUser, fetchUser]);

  if (!_hasHydrated) return null;
  if (!user || user.role !== UserRole.APPLICANT) return null;

  const handleLogout = async () => {
    try {
      setLoggingOut(true);
      await new Promise((resolve) => setTimeout(resolve, 600));
      await apiClient.post("/applicant/logout");
    } catch (err) {
      console.error("Logout error", err);
    } finally {
      clearAuth();
      router.push("/");
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
                <div className="w-9 h-9 bg-blue-800 rounded-full flex items-center justify-center text-white border border-blue-600 font-bold text-sm">
                  {getInitials(profileUser?.userId?.name || "")}
                </div>

                <div className="flex flex-col text-left">
                  <span className="text-sm font-bold text-gray-800">
                    {loading ? "Loading..." : profileUser?.userId?.name}
                  </span>

                  <span className="text-xs text-gray-500">
                    {profileUser?.userId?.email}
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
              {/* top line */}
              <span
                className={`absolute h-0.5 w-5 bg-gray-700 rounded transition-all duration-300 ${
                  mobileMenuOpen
                    ? "rotate-45 translate-y-0"
                    : "-translate-y-1.5"
                }`}
              />

              {/* middle line */}
              <span
                className={`absolute h-0.5 w-5 bg-gray-700 rounded transition-all duration-300 ${
                  mobileMenuOpen ? "opacity-0" : "opacity-100"
                }`}
              />

              {/* bottom line */}
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
            {/* Profile */}
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-blue-800 rounded-full flex items-center justify-center text-white border border-blue-600 font-bold text-sm shrink-0">
                {getInitials(profileUser?.userId?.name || "")}
              </div>

              <div className="flex flex-col min-w-0">
                <span className="text-sm font-bold text-gray-800 truncate">
                  {loading ? "Loading..." : profileUser?.userId?.name}
                </span>

                <span className="text-xs text-gray-500 truncate">
                  {profileUser?.userId?.email}
                </span>
              </div>
            </div>

            <hr className="border-gray-200 mb-3" />

            {/* Logout */}
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
