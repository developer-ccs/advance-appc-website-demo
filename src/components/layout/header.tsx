"use client";

import { useState, useEffect } from "react";
import { Sun, Moon } from "lucide-react"; // Imported icons for the theme toggle
import digitalIndiaLogo from "@/../public/logos/digital-india.svg";
import swasthBharatLogo from "@/../public/logos/swasth-bharat.svg";
import arunachalLogo from "@/../public/logos/arunachal-logo.png";
import emblemLogo from "@/../public/logos/Emblem_of_India.svg";
import appcLogo from "@/../public/logos/appc-logo.png";
import ProtectedImage from "../ui/ProtectedImage";
import Link from "next/link";

export default function Header({
  openModal,
  changeFontSize,
}: {
  openModal: (id: string) => void;
  changeFontSize: (step: number) => void;
}) {
  const [currentTime, setCurrentTime] = useState(new Date());

  // Theme state
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [mounted, setMounted] = useState(false);

  // Initialize clock and theme on mount
  useEffect(() => {
    setMounted(true);

    // Check initial theme from document class (if you have standard Tailwind dark mode)
    if (document.documentElement.classList.contains("dark")) {
      setTheme("dark");
    }

    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => {
    let hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, "0");
    const seconds = date.getSeconds().toString().padStart(2, "0");

    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12 || 12;

    return `${hours.toString().padStart(2, "0")}:${minutes}:${seconds} ${ampm}`;
  };

  // Toggle Theme Function
  const toggleTheme = () => {
    if (theme === "light") {
      document.documentElement.classList.add("dark");
      setTheme("dark");
    } else {
      document.documentElement.classList.remove("dark");
      setTheme("light");
    }
  };

  return (
    <>
      {/* Top Government Header */}
      <div className="hidden md:flex flex-wrap w-full bg-white text-black text-[clamp(0.65rem,0.75vw,0.8rem)] px-[clamp(8px,2vw,24px)] justify-between items-center border-b border-black/10 transition-all">
        <div className="flex items-center flex-wrap gap-1">
          <Link
            href="https://arunachalpradesh.gov.in"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-red-600 whitespace-nowrap text-xs transition-colors min-h-8 flex items-center px-2"
          >
            Government of Arunachal Pradesh
          </Link>

          <span className="text-xs text-gray-400">|</span>

          <Link
            href="https://pci.gov.in"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-red-600 whitespace-nowrap text-xs transition-colors min-h-8 flex items-center px-2"
          >
            Pharmacy Council of India
          </Link>
        </div>
        {/* Left Section - Notification Marquee */}
        <div className="flex-1 overflow-hidden whitespace-nowrap flex items-center h-8 pr-4">
          <style>{`
            @keyframes marquee {
              0% { transform: translateX(100%); }
              100% { transform: translateX(-100%); }
            }
            .animate-marquee {
              display: inline-block;
              width: 100%;
              animation: marquee 80s linear infinite;
            }
            .animate-marquee:hover {
              animation-play-state: paused;
            }
          `}</style>
          <div className="animate-marquee cursor-pointer">
            <span className="text-red-600 dark:text-red-400 font-medium tracking-wide">
              Important Notification: Registration renewals for 2025 are now
              open. Please complete your KYC updates before the deadline. |
              Upcoming Council meeting is scheduled for next week. | New
              pharmacist license applications are being processed online. |
              Download updated compliance guidelines from the portal. | Helpline
              support hours have been extended this month.
            </span>
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center flex-wrap gap-1 shrink-0">
          {/* Font Controls */}
          <div className="flex items-center text-xs">
            <button
              onClick={() => changeFontSize(-1)}
              className="hover:text-red-600 dark:hover:text-red-400 cursor-pointer transition-colors min-w-8 min-h-8 flex items-center justify-center"
              title="Decrease Font Size"
            >
              A-
            </button>
            <button
              onClick={() => changeFontSize(0)}
              className="hover:text-red-600 dark:hover:text-red-400 cursor-pointer transition-colors min-w-8 min-h-8 flex items-center justify-center"
              title="Normal Font Size"
            >
              A
            </button>
            <button
              onClick={() => changeFontSize(1)}
              className="hover:text-red-600 dark:hover:text-red-400 cursor-pointer transition-colors min-w-8 min-h-8 flex items-center justify-center"
              title="Increase Font Size"
            >
              A+
            </button>
          </div>

          {/* Divider */}
          <span className="text-xs text-gray-400 dark:text-gray-500 mx-1">
            |
          </span>

          {/* Theme Toggle Button */}
          {mounted && (
            <button
              onClick={toggleTheme}
              className="hover:text-red-600 dark:hover:text-red-400 cursor-pointer transition-colors min-w-8 min-h-8 flex items-center justify-center"
              title={
                theme === "light"
                  ? "Switch to Dark Mode"
                  : "Switch to Light Mode"
              }
            >
              {theme === "light" ? <Moon size={14} /> : <Sun size={14} />}
            </button>
          )}
        </div>
      </div>

      {/* Main Header */}
      <header className="bg-[#062045] shadow-lg text-white w-full">
        <div className="max-w-full mx-auto px-4 py-3 flex items-center justify-between flex-wrap">
          {/* LEFT SECTION */}
          <div className="flex items-center gap-3 md:gap-4">
            <ProtectedImage
              src={emblemLogo}
              alt="National Emblem"
              width={80}
              height={80}
              className="hidden sm:block h-12 md:h-16 lg:h-17 w-auto shrink-0"
              priority={false}
            />

            <div className="hidden sm:block h-12 md:h-14 w-px bg-white/40"></div>

            <div className="relative w-12 h-12 md:w-16 md:h-16 lg:w-18 lg:h-18 shrink-0">
              <div className="absolute inset-1 md:inset-2 bg-white blur-sm opacity-90 rounded-full"></div>
              <ProtectedImage
                src={appcLogo}
                alt="APPC Logo"
                width={68}
                height={68}
                sizes="(max-width: 768px) 48px, (max-width: 1024px) 64px, 72px"
                quality={60}
                className="object-contain relative z-10 h-12 md:h-16 lg:h-17 w-auto"
                priority
              />
            </div>

            <div className="flex flex-col justify-center">
              <h1 className="text-base md:text-lg lg:text-xl font-semibold leading-tight">
                Arunachal Pradesh Pharmacy Council
              </h1>
              <p className="text-cyan-400 text-xs md:text-sm lg:text-md mt-0.5">
                Constituted under the Pharmacy Act 1948
              </p>
            </div>
          </div>

          {/* RIGHT SECTION */}
          <div className="flex items-center gap-4 md:gap-6 ml-auto">
            {/* DATE + TIME */}
            <div className="hidden sm:flex flex-col items-center">
              <div className="flex items-center text-[16px]">
                {[
                  currentTime.getDate().toString().padStart(2, "0"),
                  (currentTime.getMonth() + 1).toString().padStart(2, "0"),
                  currentTime.getFullYear().toString().slice(-2),
                ].map((val, index) => (
                  <div key={index} className="flex items-center">
                    <div className="px-2 py-1 rounded bg-white/10">{val}</div>
                    {index < 2 && <span className="mx-1">/</span>}
                  </div>
                ))}
              </div>

              <span className="text-[21px]" suppressHydrationWarning>
                {formatTime(currentTime)}
              </span>
            </div>

            {/* LOGOS (Only Desktop) */}
            <div className="hidden lg:flex items-center gap-4 shrink-0">
              <ProtectedImage
                src={digitalIndiaLogo}
                alt="Digital India"
                height={50}
                width={0}
                className="h-10 xl:h-13 w-auto"
              />
              <ProtectedImage
                src={swasthBharatLogo}
                alt="Swasth Bharat"
                height={50}
                width={0}
                className="h-10 xl:h-13 w-auto"
              />
              <ProtectedImage
                src={arunachalLogo}
                alt="Arunachal Pradesh Logo"
                height={50}
                width={0}
                style={{ width: "auto" }}
                className="h-10 xl:h-13 w-auto"
              />
            </div>
          </div>
        </div>
      </header>
    </>
  );
}
