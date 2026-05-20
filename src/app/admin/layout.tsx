"use client";
import React, { useEffect, useState, useRef, useCallback, memo } from "react";
import Link from "next/link";
import appcLogo from "@/../public/logos/appc-logo.png";
import { usePathname } from "next/navigation";
import Image from "next/image";
import {
  FileText,
  LayoutDashboard,
  Loader,
  LogOut,
  Megaphone,
  Settings,
  ShieldUser,
  UsersRound,
  Key,
  Files,
  FileDown,
  Menu,
  X,
  ChevronRight,
  FolderOpen,
  FileUser,
} from "lucide-react";
import { useRouter } from "next/navigation";

interface User {
  id: number;
  name: string;
  role?: string;
  email?: string;
  userId: {
    name: string;
    role?: string;
    email?: string;
  };
}

const SIDEBAR_COLLAPSED_KEY = "appc_sidebar_collapsed";

const SmoothLabel = ({
  collapsed,
  children,
  className = "",
}: {
  collapsed: boolean;
  children: React.ReactNode;
  className?: string;
}) => (
  <span
    aria-hidden={collapsed}
    className="grid transition-all duration-300 ease-in-out"
    style={{ gridTemplateColumns: collapsed ? "0fr" : "1fr" }}
  >
    <span className={`overflow-hidden whitespace-nowrap ${className}`}>
      {children}
    </span>
  </span>
);

const CollapseTooltip = ({ label }: { label: string }) => (
  <span className="absolute left-full ml-3 px-2.5 py-1.5 bg-gray-900 text-white text-xs rounded-md whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-all duration-200 delay-75 z-50 shadow-lg translate-x-1 group-hover:translate-x-0">
    {label}
    <span className="absolute top-1/2 -left-1 -translate-y-1/2 border-4 border-transparent border-r-gray-900" />
  </span>
);

interface NavItem {
  name: string;
  href: string;
  icon: React.ElementType;
  roles: string[];
}

interface SidebarContentProps {
  collapsed: boolean;
  navItems: NavItem[];
  pathname: string;
  loggingOut: boolean;
  onLogout: () => void;
}

const SidebarContent = memo(function SidebarContent({
  collapsed,
  navItems,
  pathname,
  loggingOut,
  onLogout,
}: SidebarContentProps) {
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-3 border-b border-white/10 bg-blue-950 px-4 py-4 overflow-hidden">
        <div className="relative shrink-0 w-10 h-10">
          <span className="absolute inset-1 bg-white blur-sm opacity-90 rounded-full" />
          <Image
            src={appcLogo}
            alt="APPC Logo"
            fill
            sizes="40px"
            className="object-contain"
            priority
          />
        </div>
        <SmoothLabel collapsed={collapsed}>
          <span className="flex flex-col">
            <h1 className="font-bold text-sm text-white tracking-wide leading-tight">
              Arunachal Pradesh <br /> Pharmacy Council
            </h1>
            <p className="text-[11px] text-blue-300 mt-0.5">Council Login</p>
          </span>
        </SmoothLabel>
      </div>

      <nav className="flex-1 overflow-y-auto overflow-x-hidden py-3 px-2 space-y-0.5 scrollbar-thin scrollbar-thumb-blue-800 scrollbar-track-transparent">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/admin" && pathname.startsWith(item.href));
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              title={collapsed ? item.name : undefined}
              className={`group relative flex items-center rounded-lg gap-3 px-3 py-2.5 transition-colors duration-200 ease-in-out ${
                isActive
                  ? "bg-white text-blue-950 shadow-md font-semibold"
                  : "text-blue-100/80 hover:bg-blue-800/60 hover:text-white"
              }`}
            >
              <Icon
                className={`shrink-0 w-5 h-5 transition-colors duration-200 ${
                  isActive
                    ? "text-blue-950"
                    : "text-blue-300 group-hover:text-white"
                }`}
              />
              <SmoothLabel collapsed={collapsed} className="text-sm">
                {item.name}
              </SmoothLabel>
              {collapsed && <CollapseTooltip label={item.name} />}
            </Link>
          );
        })}
      </nav>

      <div className="p-2 border-t border-white/10">
        <button
          onClick={onLogout}
          disabled={loggingOut}
          title={collapsed ? "Logout" : undefined}
          className="group relative w-full flex items-center gap-3 justify-center rounded-lg p-2.5 transition-colors duration-200 bg-white text-red-600 hover:text-red-500 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer overflow-hidden"
        >
          {loggingOut ? (
            <Loader size={18} className="animate-spin shrink-0" />
          ) : (
            <LogOut
              size={18}
              className="shrink-0 transition-transform duration-200"
            />
          )}
          <SmoothLabel collapsed={collapsed} className="text-sm font-medium">
            {loggingOut ? "Logging out..." : "Logout"}
          </SmoothLabel>
          {collapsed && <CollapseTooltip label="Logout" />}
        </button>
      </div>
    </div>
  );
});

// Demo Data injected directly
const demoUser: User = {
  id: 1,
  name: "Jane Doe",
  role: "super-admin",
  email: "jane.doe@example.com",
  userId: {
    name: "Jane Doe",
    role: "super-admin",
    email: "jane.doe@example.com",
  },
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [data, setData] = useState<User | null>(demoUser);
  const pathname = usePathname();
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);

  // ✅ Start as false (SSR-safe), update after mount
  const [collapsed, setCollapsed] = useState<boolean>(false);
  const [mounted, setMounted] = useState(false);

  const [mobileOpen, setMobileOpen] = useState(false);
  // ✅ null = unknown (not yet measured), avoids mobile/desktop mismatch flash
  const [isMobile, setIsMobile] = useState<boolean | null>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  // Using demo mock data instead of store
  const currentUserRole = data?.role ?? "super-admin";
  const currentUserName = data?.name ?? "Jane Doe";

  const allNavItems: NavItem[] = [
    {
      name: "Dashboard",
      href: "/admin",
      icon: LayoutDashboard,
      roles: [
        "admin",
        "counsellor",
        "executive",
        "super-admin",
        "account",
        "hr",
        "issuing-authority",
      ],
    },
    {
      name: "Applicants",
      href: "/admin/applicant",
      icon: UsersRound,
      roles: ["admin", "super-admin"],
    },
    {
      name: "Pharmacists",
      href: "/admin/pharmacists",
      icon: FileUser,
      roles: [
        "admin",
        "counsellor",
        "executive",
        "super-admin",
        "account",
        "hr",
        "issuing-authority",
      ],
    },
    {
      name: "Issue Certificate",
      href: "/admin/issue-certificate",
      icon: FileText,
      roles: [
        "admin",
        "counsellor",
        "executive",
        "super-admin",
        "account",
        "hr",
        "issuing-authority",
      ],
    },
    {
      name: "Notices & Announcements",
      href: "/admin/notices",
      icon: Megaphone,
      roles: [
        "admin",
        "counsellor",
        "executive",
        "super-admin",
        "account",
        "hr",
        "issuing-authority",
      ],
    },
    {
      name: "Tenders",
      href: "/admin/tenders",
      icon: FolderOpen,
      roles: ["admin", "counsellor", "executive", "super-admin"],
    },
    {
      name: "My Access",
      href: "/admin/access",
      icon: Key,
      roles: ["counsellor", "executive", "account", "hr", "issuing-authority"],
    },
    {
      name: "My Uploads",
      href: "/admin/docs",
      icon: Files,
      roles: [
        "admin",
        "counsellor",
        "executive",
        "super-admin",
        "account",
        "hr",
        "issuing-authority",
      ],
    },
    {
      name: "Download History",
      href: "/admin/download-history",
      icon: FileDown,
      roles: [
        "admin",
        "counsellor",
        "executive",
        "super-admin",
        "account",
        "hr",
        "issuing-authority",
      ],
    },
    {
      name: "Settings",
      href: "/admin/settings",
      icon: Settings,
      roles: ["admin", "super-admin"],
    },
  ];

  const navItems = allNavItems.filter((item) =>
    item.roles.includes(currentUserRole),
  );

  // ✅ Single useEffect handles both collapsed + mounted + isMobile
  // so only ONE re-render happens after mount instead of multiple
  useEffect(() => {
    const stored = localStorage.getItem(SIDEBAR_COLLAPSED_KEY) === "true";
    const mobile = window.innerWidth < 768;
    setCollapsed(stored);
    setIsMobile(mobile);
    setMounted(true);

    const handleResize = () => {
      const m = window.innerWidth < 768;
      setIsMobile(m);
      if (m) setMobileOpen(false);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const toggleCollapsed = useCallback(() => {
    setCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem(SIDEBAR_COLLAPSED_KEY, String(next));
      return next;
    });
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const handleLogout = useCallback(async () => {
    try {
      setLoggingOut(true);
      // Mock network delay for smooth UI transition
      await new Promise((resolve) => setTimeout(resolve, 800));
    } catch (err) {
      console.error("Logout error", err);
    } finally {
      console.log("Logged out successfully");
      router.push("/");
    }
  }, [router]);

  const sidebarProps: SidebarContentProps = {
    collapsed,
    navItems,
    pathname,
    loggingOut,
    onLogout: handleLogout,
  };

  const displayRole =
    currentUserRole === "super-admin" ? "Super Admin" : currentUserRole;

  const displayName = currentUserName || data?.userId?.name || "Admin";

  // ✅ Compute sidebar width:
  // - Before mount: always 256px so content area width is stable from first render
  // - After mount: use actual collapsed state from localStorage
  const sidebarWidth = !mounted ? "256px" : collapsed ? "68px" : "256px";

  return (
    <div className="flex h-screen bg-gray-100 font-sans overflow-hidden">
      {/* ── DESKTOP SIDEBAR ──
          ✅ Always in the DOM (not conditionally rendered)
          ✅ Width reserved from first render = no CLS
          ✅ Hidden via display:none on mobile, not unmounted */}
      <aside
        className="relative shrink-0 bg-blue-950 text-white flex flex-col shadow-xl z-20"
        style={{
          width: sidebarWidth,
          // ✅ No transition before mount to prevent flash
          transition: mounted
            ? "width 300ms cubic-bezier(0.4, 0, 0.2, 1)"
            : "none",
          willChange: "width",
          // ✅ CSS display instead of conditional render
          display: isMobile ? "none" : "flex",
        }}
      >
        <SidebarContent {...sidebarProps} />

        {/* ✅ Only show toggle button after mount to avoid hydration mismatch */}
        {mounted && (
          <button
            onClick={toggleCollapsed}
            className="absolute -right-3.5 top-1/2 -translate-y-1/2 w-7 h-7 bg-white border border-gray-200 rounded-full shadow-md flex items-center justify-center text-blue-900 hover:bg-blue-50 hover:border-blue-300 hover:scale-110 active:scale-95 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400 cursor-pointer"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <ChevronRight
              className="w-4 h-4 transition-transform duration-300 ease-in-out"
              style={{
                transform: collapsed ? "rotate(0deg)" : "rotate(180deg)",
              }}
            />
          </button>
        )}
      </aside>

      {/* ── MOBILE OVERLAY ── */}
      {isMobile && (
        <div
          ref={overlayRef}
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-all duration-300 ease-in-out"
          style={{
            opacity: mobileOpen ? 1 : 0,
            pointerEvents: mobileOpen ? "auto" : "none",
          }}
        />
      )}

      {/* ── MOBILE SIDEBAR ── */}
      {isMobile && (
        <aside
          className="fixed top-0 left-0 h-full w-64 bg-blue-950 text-white flex flex-col shadow-2xl z-50"
          style={{
            transform: mobileOpen ? "translateX(0)" : "translateX(-100%)",
            transition: "transform 320ms cubic-bezier(0.32, 0.72, 0, 1)",
          }}
        >
          <button
            onClick={() => setMobileOpen(false)}
            className="fixed z-10 w-7 h-7 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 active:scale-90 text-white transition-all duration-200"
            style={{
              top: "12px",
              left: mobileOpen ? "268px" : "-48px",
              transition: "left 320ms cubic-bezier(0.32, 0.72, 0, 1)",
            }}
            aria-label="Close sidebar"
          >
            <X className="w-4 h-4" />
          </button>
          <SidebarContent {...sidebarProps} collapsed={false} />
        </aside>
      )}

      {/* ── MAIN CONTENT ──
          ✅ Width is stable from first render because sidebar is always in DOM */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <header className="h-14 md:h-16 bg-white shadow-sm flex items-center justify-between px-4 md:px-6 z-10 border-b border-gray-200 shrink-0">
          <div className="flex items-center gap-3">
            {isMobile && (
              <button
                onClick={() => setMobileOpen(true)}
                className="p-1.5 rounded-lg text-gray-500 hover:text-blue-900 hover:bg-gray-100 active:scale-90 transition-all duration-200"
                aria-label="Open sidebar"
              >
                <Menu className="w-5 h-5" />
              </button>
            )}
            <h1 className="text-base md:text-xl font-bold text-blue-900 truncate">
              {navItems.find(
                (item) =>
                  item.href === pathname ||
                  (item.href !== "/admin" && pathname.startsWith(item.href)),
              )?.name || "Dashboard"}
            </h1>
          </div>

          <div className="flex items-center gap-3 md:gap-5">
            <div className="flex items-center gap-2.5 border-l pl-3 md:pl-5 border-gray-200 hover:bg-gray-50 py-1.5 px-2 rounded-lg transition-all duration-200">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-900 border border-blue-200 shrink-0">
                <ShieldUser className="w-4 h-4" />
              </div>
              <div className="hidden sm:flex flex-col min-w-0">
                <span className="text-sm font-bold text-gray-800">
                  {displayName}
                </span>
                <span className="text-[11px] text-gray-500 capitalize truncate">
                  {displayRole}
                </span>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-gray-50">
          {children}
        </main>
      </div>
    </div>
  );
}
