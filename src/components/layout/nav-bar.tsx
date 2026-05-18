"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { Menu, X, LogIn, ChevronDown } from "lucide-react";
import Link from "next/link";

const CustomOffcanvas = dynamic(
  () =>
    import("@/components/layout/custom-canvas").then(
      (mod) => mod.CustomOffcanvas,
    ),
  {
    ssr: false,
  },
);

// --- TypeScript Definitions ---
type DropdownItem = {
  path: string;
  label: string;
  external?: boolean;
};

type NavLinkItem = {
  path: string;
  label: string;
  twoColumns?: boolean;
  dropdown?: DropdownItem[];
};
// ------------------------------

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [openMobileDropdown, setOpenMobileDropdown] = useState<string | null>(
    null,
  );

  // State to temporarily hide the desktop dropdown to reset the CSS hover state
  const [hideDesktopDropdown, setHideDesktopDropdown] = useState(false);

  const navLinks: NavLinkItem[] = [
    { path: "/", label: "Home" },
    {
      path: "#",
      label: "About Us",
      dropdown: [
        { path: "/about/profile", label: "Profile" },
        { path: "/about/members", label: "Council Members" },
        { path: "/about/pharmacist", label: "Pharmacist Oath" },
      ],
    },
    {
      path: "#",
      label: "Act & Rules",
      dropdown: [
        {
          path: "https://kspcdic.com/pdf/PharmacyAct-1948.pdf",
          label: "Pharmacy Act",
          external: true,
        },
        {
          path: "https://kspcdic.com/sites/default/files/PharmacyPracticeRegulations.pdf",
          label: "Pharmacy Regulations",
          external: true,
        },
      ],
    },
    {
      path: "#",
      label: "Services",
      twoColumns: true,
      dropdown: [
        { path: "/applicant/registration", label: "Fresh Registration" },
        { path: "/applicant/renewal", label: "Renewal of Registration" },
        { path: "/applicant/reciprocal", label: "Transfer of Registration" },
        {
          path: "/services/foreign",
          label: "Endorsement for Foreign Nationals",
        },
        { path: "/services/e-certificate", label: "E-Certificate" },
        { path: "/services/d-certificate", label: "Duplicate Certificate" },
        { path: "/services/good-stand", label: "Good Standing Certificate" },
        { path: "/services/id-card", label: "Registration ID Card" },
        { path: "/services/name-change", label: "Change of Name" },
        { path: "/services/elgibility", label: "Eligibility Letter" },
        { path: "/services/noc", label: "NOC to Other States" },
        { path: "/services/papers", label: "Research Projects" },
        { path: "/services/inspector", label: "Pharmacy Inspector" },
        {
          path: "/services/certificate-list",
          label: "Certificate Dispatch List",
        },
        { path: "/services/job-listing", label: "Job Listing" },
        { path: "/services/general", label: "General Instructions" },
      ],
    },
    {
      path: "#",
      label: "Notifications",
      dropdown: [
        {
          path: "/notifications?tab=notices",
          label: "Notices & Circulars",
        },
        { path: "/notifications?tab=announcements", label: "Announcements" },
        { path: "/notifications?tab=tenders", label: "Tenders" },
        { path: "/notifications?tab=orders", label: "Judicial Orders" },
        {
          path: "/notifications?tab=misconduct",
          label: "Professional Misconduct",
        },
        { path: "/notifications?tab=pressnote", label: "Press Note" },
        { path: "/notifications?tab=inspector", label: "Pharmacy Inspector" },
      ],
    },
    {
      path: "#",
      label: "Pharmacist",
      dropdown: [
        {
          path: "/pharmacist?tab=registered",
          label: "Registered Pharmacist",
        },
        {
          path: "/pharmacist?tab=transferred",
          label: "Transferred",
        },
        {
          path: "/pharmacist?tab=expired",
          label: "Expired",
        },
        {
          path: "/pharmacist?tab=cancelled",
          label: "Cancelled Registrations",
        },
        {
          path: "/pharmacist?tab=removed",
          label: "Name Removed under (Sec.34 (2)Pharmacy, Act 1948)",
        },
      ],
    },
    { path: "/affidavits", label: "Affidavits" },
    { path: "/rti", label: "RTI" },
    { path: "/contact", label: "Contact Us" },
  ];

  const toggleMobileDropdown = (label: string) => {
    if (openMobileDropdown === label) {
      setOpenMobileDropdown(null);
    } else {
      setOpenMobileDropdown(label);
    }
  };

  // Helper function to close desktop dropdowns on click
  const handleDesktopLinkClick = () => {
    setHideDesktopDropdown(true);
    // Bring the dropdown capability back after a short delay so hover works again next time
    setTimeout(() => {
      setHideDesktopDropdown(false);
    }, 200);
  };

  return (
    <nav className="bg-[#0a3675] sticky top-0 z-50 shadow w-full flex h-12">
      {/* LEFT SECTION - Main Navigation */}
      <div className="flex-1 h-full flex items-center pl-2">
        {/* Mobile/Tablet menu button */}
        <button
          type="button"
          className="xl:hidden text-white p-1 rounded-md hover:bg-white/10 transition"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>

        {/* Desktop Navigation */}
        <ul className="hidden xl:flex items-center gap-1 2xl:gap-2">
          {navLinks.map((link) => (
            <li key={link.label} className="relative group">
              {link.dropdown ? (
                <button className="flex items-center gap-1 text-white px-2 2xl:px-3 py-2 rounded transition text-[13px] 2xl:text-[15px] font-medium whitespace-nowrap cursor-pointer">
                  {link.label}
                  <ChevronDown
                    size={14}
                    className="transition-transform duration-200 group-hover:rotate-180"
                  />
                </button>
              ) : (
                <Link
                  href={link.path}
                  className="flex items-center gap-1 text-white px-2 2xl:px-3 py-2 rounded transition text-[13px] 2xl:text-[15px] font-medium whitespace-nowrap"
                  onClick={handleDesktopLinkClick}
                >
                  {link.label}
                </Link>
              )}

              {/* Desktop Dropdown Content (Conditional render prevents it from staying stuck open) */}
              {!hideDesktopDropdown && link.dropdown && (
                <div className="absolute left-0 top-full pt-1 opacity-0 translate-y-2 invisible group-hover:opacity-100 group-hover:translate-y-0 group-hover:visible transition-all duration-300 z-50">
                  <ul
                    className={`bg-white rounded-md shadow-xl border border-gray-100 py-2 ${
                      link.twoColumns
                        ? "grid grid-cols-2 w-max min-w-75"
                        : "flex flex-col min-w-60"
                    }`}
                  >
                    {link.dropdown.map((subItem) => (
                      <li key={subItem.path}>
                        <Link
                          href={subItem.path}
                          target={subItem.external ? "_blank" : "_self"}
                          rel={subItem.external ? "noopener noreferrer" : ""}
                          className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-[#0a3675] transition-colors"
                          onClick={handleDesktopLinkClick}
                        >
                          {subItem.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </li>
          ))}
        </ul>
      </div>

      {/* RIGHT SECTION - Login Area */}
      <div className="group bg-[#F1F5F9] hover:bg-[#E2E8F0] rounded-l-sm h-full flex items-center shrink-0 pl-1 shadow-[-4px_0_10px_rgba(0,0,0,0.05)] transition-colors duration-200 cursor-pointer">
        <div>
          <button
            className="flex items-center gap-2 cursor-pointer text-[#0a3675] group-hover:text-[#082a5a] px-4 h-full rounded font-semibold transition-all duration-200 text-sm md:text-base whitespace-nowrap"
            onClick={() => setLoginOpen(true)}
          >
            <LogIn size={18} />
            <span>Login</span>
          </button>

          <CustomOffcanvas open={loginOpen} onOpenChange={setLoginOpen} />
        </div>
      </div>

      {/* Mobile/Tablet Menu */}
      <div
        className={`xl:hidden absolute left-0 top-12 w-full bg-[#0a3675] border-t border-white/20 overflow-y-auto transition-all duration-300 ease-in-out transform z-40 shadow-xl ${
          mobileMenuOpen ? "max-h-[80vh] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <ul className="flex flex-col p-4 space-y-1">
          {navLinks.map((link) => (
            <li key={link.label} className="flex flex-col">
              <div className="flex items-center justify-between rounded-lg hover:bg-white/10 transition-colors">
                {link.dropdown ? (
                  <button
                    className="flex-1 flex items-center justify-between text-white px-4 py-3 font-medium text-left w-full"
                    onClick={() => toggleMobileDropdown(link.label)}
                  >
                    <span>{link.label}</span>
                    <ChevronDown
                      size={20}
                      className={`transition-transform duration-300 ${
                        openMobileDropdown === link.label ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                ) : (
                  <Link
                    href={link.path}
                    className="flex-1 text-white px-4 py-3 font-medium w-full block"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {link.label}
                  </Link>
                )}
              </div>

              {/* Mobile Dropdown Content */}
              {link.dropdown && (
                <div
                  className={`overflow-hidden transition-all duration-300 ease-in-out ${
                    openMobileDropdown === link.label
                      ? "max-h-200 opacity-100 mt-1"
                      : "max-h-0 opacity-0"
                  }`}
                >
                  <ul className="bg-white/10 mx-4 rounded-md overflow-hidden py-1">
                    {link.dropdown.map((subItem) => (
                      <li key={subItem.path}>
                        <Link
                          href={subItem.path}
                          target={subItem.external ? "_blank" : "_self"}
                          rel={subItem.external ? "noopener noreferrer" : ""}
                          className="block text-white/90 px-4 py-2.5 text-sm hover:bg-white/20 hover:text-white transition-colors"
                          onClick={() => {
                            // On Mobile: Close the entire menu and reset the accordion when a link is clicked
                            if (!subItem.external) {
                              setMobileMenuOpen(false);
                              setOpenMobileDropdown(null);
                            }
                          }}
                        >
                          {subItem.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
