"use client";

import { useState, useEffect } from "react";
import { Sun, Moon, Search, Volume2, Globe } from "lucide-react";
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

  const formatDateForPill = (date: Date) => {
    const d = date.getDate().toString().padStart(2, "0");
    const m = (date.getMonth() + 1).toString().padStart(2, "0");
    const y = date.getFullYear();
    return `${d}/${m}/${y}`;
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
    <header className="w-full flex flex-col font-sans shadow-md transition-colors duration-300">
      {/* --- UTILITY BAR (Light Gray Strip below Main Header) --- */}
      <div className="w-full bg-[#f4f6f9] border-b border-gray-300 text-[#062045] text-[clamp(0.65rem,0.75vw,0.8rem)] px-[clamp(8px,2vw,24px)] flex items-center justify-between transition-colors duration-300">
        {/* Left Section: Government Links */}
        <div className="hidden md:flex items-center flex-wrap gap-1 shrink-0 font-medium">
          <Link
            href="https://arunachalpradesh.gov.in"
            target="_blank"
            rel="noopener noreferrer"
            className=" hover:text-red-600 whitespace-nowrap transition-colors min-h-8 flex items-center px-2"
          >
            Government of Arunachal Pradesh
          </Link>
          <span className="text-gray-400">|</span>
          <Link
            href="https://pci.gov.in"
            target="_blank"
            rel="noopener noreferrer"
            className=" hover:text-red-600 whitespace-nowrap transition-colors min-h-8 flex items-center px-2"
          >
            Pharmacy Council of India
          </Link>
        </div>

        {/* Center Section: Marquee */}
        <div className="flex-1 overflow-hidden whitespace-nowrap flex items-center h-8 px-4 mx-2">
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
            <span className="text-red-600 font-medium tracking-wide">
              Important Notification: Registration renewals for 2025 are now
              open. Please complete your KYC updates before the deadline. |
              Upcoming Council meeting is scheduled for next week. | New
              pharmacist license applications are being processed online. |
              Download updated compliance guidelines from the portal. | Helpline
              support hours have been extended this month.
            </span>
          </div>
        </div>

        {/* Right Section: Controls */}
        <div className="flex items-center flex-wrap gap-2 shrink-0 font-medium">
          {/* Screen Reader Access */}
          <button
            className="hover:text-red-600 cursor-pointer transition-colors flex items-center gap-1 h-8"
            title="Screen Reader Access"
            aria-label="Screen Reader Access"
            onClick={() => {
              // Add your screen reader logic here
              console.log("Screen reader activated");
            }}
          >
            <Volume2 size={16} />
            <span className="hidden lg:block text-xs">Screen Reader</span>
          </button>

          <span className="text-gray-400 hidden sm:block">|</span>

          {/* Font Controls */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => changeFontSize(-1)}
              className="hover:text-red-600 cursor-pointer transition-colors w-7 h-8 flex items-center justify-center"
              title="Decrease Font Size"
            >
              A-
            </button>
            <button
              onClick={() => changeFontSize(0)}
              className="hover:text-red-600 cursor-pointer transition-colors w-7 h-8 flex items-center justify-center"
              title="Normal Font Size"
            >
              A
            </button>
            <button
              onClick={() => changeFontSize(1)}
              className="hover:text-red-600 cursor-pointer transition-colors w-7 h-8 flex items-center justify-center"
              title="Increase Font Size"
            >
              A+
            </button>
          </div>

          <span className="text-gray-400 hidden sm:block">|</span>

          {/* Theme Toggle Button */}
          {mounted && (
            <button
              onClick={toggleTheme}
              className="hover:text-red-600 cursor-pointer transition-colors w-7 h-8 flex items-center justify-center"
              title={
                theme === "light"
                  ? "Switch to Dark Mode"
                  : "Switch to Light Mode"
              }
            >
              {theme === "light" ? <Moon size={16} /> : <Sun size={16} />}
            </button>
          )}

          <span className="text-gray-400 hidden sm:block">|</span>

          {/* Language Selector */}
          <div className="flex items-center gap-1 h-8 cursor-pointer hover:text-red-600 transition-colors">
            <Globe size={14} className="hidden sm:block" />
            <select
              className="bg-transparent border-none outline-none cursor-pointer text-inherit font-medium appearance-none pr-1"
              title="Select Language"
              onChange={(e) => {
                // Add your language change logic here
                console.log("Language changed to:", e.target.value);
              }}
            >
              <option value="en" className="text-black">
                English
              </option>
              <option value="hi" className="text-black">
                हिन्दी
              </option>
            </select>
          </div>
        </div>
      </div>
      {/* --- TOP MAIN SECTION (Slanted Design) --- */}
      <div className="relative w-full bg-[#062045] overflow-hidden min-h-25 md:min-h-30 flex items-center transition-colors duration-300">
        {/* Slanted Background */}
        <div className="absolute top-0 left-0 h-full w-full md:w-[70%] lg:w-[70%] xl:w-[60%] 2xl:w-[55%] bg-blue-100 md:[clip-path:polygon(0_0,100%_0,calc(100%-4rem)_100%,0_100%)]"></div>

        <div className="relative z-10 w-full max-w-full mx-auto px-3 flex flex-col md:flex-row justify-between items-center">
          {/* LEFT: Logos & Titles (Kept side-by-side with strict items-center) */}
          <div className="flex items-center gap-2 md:gap-4 w-full md:w-auto">
            <ProtectedImage
              src={emblemLogo}
              alt="National Emblem"
              width={80}
              height={80}
              className="hidden md:block h-10 md:h-16 lg:h-20 w-auto shrink-0 brightness-0"
              priority
            />

            <div className="hidden md:block h-10 md:h-16 w-px bg-gray-400 shrink-0"></div>

            <div className="relative w-14 h-14 md:w-16 md:h-16 lg:w-20 lg:h-20 shrink-0">
              <ProtectedImage
                src={appcLogo}
                alt="APPC Logo"
                width={80}
                height={80}
                sizes="(max-width: 768px) 40px, (max-width: 1024px) 64px, 80px"
                quality={80}
                className="h-14 md:h-16 lg:h-20 w-auto shrink-0 object-contain relative z-10"
                priority
              />
            </div>

            {/* Text perfectly vertically centered next to the logos */}
            <div className="flex flex-col justify-center flex-1">
              <h1 className="text-lg md:text-xl lg:text-[24px] font-bold leading-tight text-[#062045] tracking-wide">
                Arunachal Pradesh Pharmacy Council
              </h1>
              <p className="text-[#475569] text-[10px] md:text-xs lg:text-sm font-medium uppercase tracking-wider">
                Constituted under the Pharmacy Act 1948
              </p>
            </div>
          </div>

          {/* RIGHT: Buttons, Search, Time Pill, Logos */}
          <div className="flex flex-col items-center md:items-end gap-3 w-full md:w-auto">
            {/* Top Row: Skip Content, Search, Time */}
            <div className="flex flex-wrap justify-center md:justify-end items-center gap-3 w-full">
              <div className="hidden lg:flex items-center gap-3 shrink-0">
                <div className="flex items-center bg-[#152e55] border border-[#2a4575] rounded px-2 py-1.5">
                  <Search size={14} className="text-gray-400 mr-2" />
                  <input
                    type="text"
                    placeholder="Search..."
                    className="bg-transparent text-white text-[11px] outline-none w-28 placeholder-gray-400"
                  />
                </div>
              </div>

              {/* YELLOW TIME PILL */}
              <div className="hidden md:block bg-[#ffcc00] text-[12px] md:text-[13px] font-bold px-3 py-1.5 rounded shrink-0 shadow-sm">
                <span suppressHydrationWarning>
                  {formatDateForPill(currentTime)}, {formatTime(currentTime)}
                </span>
              </div>
            </div>

            {/* Bottom Row: Right-aligned Govt Logos */}
            <div className="hidden md:flex items-center gap-4 shrink-0 justify-end mt-1">
              <ProtectedImage
                src={digitalIndiaLogo}
                alt="Digital India"
                height={40}
                width={0}
                className="h-8 md:h-10 lg:h-11 w-auto object-contain"
              />
              <ProtectedImage
                src={swasthBharatLogo}
                alt="Swasth Bharat"
                height={40}
                width={0}
                className="h-8 md:h-10 lg:h-11 w-auto object-contain"
              />
              <ProtectedImage
                src={arunachalLogo}
                alt="Arunachal Pradesh Logo"
                height={40}
                width={0}
                className="h-8 md:h-10 lg:h-11 w-auto object-contain"
              />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
