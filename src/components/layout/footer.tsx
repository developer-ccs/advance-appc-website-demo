"use client";

import { Mail, MapPin, Phone } from "lucide-react";
// Import brand icons from react-icons/fa6
import {
  FaFacebookF,
  FaXTwitter,
  FaInstagram,
  FaLinkedinIn,
  FaYoutube,
} from "react-icons/fa6";

import ccsLogo from "@/../public/logos/small-ccs-logo.png";
import appcLogo from "@/../public/logos/appc-logo.png";
import FooterMap from "../ui/FooterMap";
import ProtectedImage from "../ui/ProtectedImage";

// --- DATA ---
const DEMO_ADDRESS = {
  officeAddress:
    "Directorate of Health Services, Naharlagun, Arunachal Pradesh - 791110",
  officePhone: "+91 360 2244123",
  email: "demo-registrar@arunachal.gov.in",
};

const SOCIAL_LINKS = [
  {
    name: "Facebook",
    icon: FaFacebookF,
    href: "#",
    color: "hover:bg-[#1877F2]",
  },
  { name: "Twitter", icon: FaXTwitter, href: "#", color: "hover:bg-black" },
  {
    name: "LinkedIn",
    icon: FaLinkedinIn,
    href: "#",
    color: "hover:bg-[#0A66C2]",
  },
  { name: "YouTube", icon: FaYoutube, href: "#", color: "hover:bg-[#FF0000]" },
  {
    name: "Instagram",
    icon: FaInstagram,
    href: "#",
    color: "hover:bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7]",
  },
];

export default function Footer() {
  const address = DEMO_ADDRESS;

  return (
    <footer
      id="contact"
      className="bg-[#062045] text-white border-t-4 border-cyan-400 mt-auto"
    >
      <div className="max-w-full px-4 sm:px-6 md:px-10 lg:px-12 xl:px-14 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* ABOUT & SOCIALS */}
          <div className="space-y-6">
            <div>
              <div className="flex items-center mb-4 gap-2">
                <div className="relative w-14 h-14">
                  <div className="absolute inset-2 bg-white blur-sm opacity-90 rounded-full"></div>
                  <ProtectedImage
                    src={appcLogo}
                    alt="APPC Logo"
                    width={56}
                    height={56}
                    className="object-contain relative z-10"
                  />
                </div>
                <h2 className="text-lg font-bold text-cyan-400 leading-tight">
                  Arunachal Pradesh <br /> Pharmacy Council
                </h2>
              </div>
              <p className="text-sm text-gray-300 leading-relaxed">
                A statutory body constituted by the Government of Arunachal
                Pradesh under the Pharmacy Act, 1948 to regulate the profession
                of pharmacy.
              </p>
            </div>

            {/* SOCIAL LINKS */}
            <div className="space-y-3">
              <h3 className="text-xs font-semibold text-cyan-400 uppercase tracking-widest">
                Follow Us
              </h3>
              <div className="flex items-center gap-3">
                {SOCIAL_LINKS.map((social) => (
                  <a
                    key={social.name}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`w-9 h-9 rounded-full bg-white/5 flex items-center justify-center transition-all duration-300 border border-white/10 text-gray-300 hover:text-white ${social.color} hover:scale-110`}
                  >
                    <social.icon size={16} />
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* QUICK LINKS */}
          <div className="flex lg:justify-center">
            <div className="w-fit">
              <h2 className="text-lg font-bold text-cyan-400 mb-4 border-b border-white/10 pb-2">
                Quick Links
              </h2>
              <ul className="space-y-2 text-sm text-gray-300">
                <li>
                  <a
                    href="https://arunachalpradesh.gov.in/"
                    className="hover:text-cyan-400 transition"
                  >
                    Govt. of Arunachal Pradesh
                  </a>
                </li>
                <li>
                  <a
                    href="https://pci.gov.in/en/"
                    className="hover:text-cyan-400 transition"
                  >
                    Pharmacy Council of India
                  </a>
                </li>
                <li>
                  <a href="/notices" className="hover:text-cyan-400 transition">
                    Notices & Announcements
                  </a>
                </li>
                <li>
                  <a
                    href="/tenders-list"
                    className="hover:text-cyan-400 transition"
                  >
                    Tenders
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* CONTACT */}
          <div>
            <h2 className="text-lg font-bold text-cyan-400 mb-4 border-b border-white/10 pb-2 w-fit">
              Contact Us
            </h2>
            <address className="not-italic text-sm text-gray-300 space-y-4">
              <div className="flex items-start gap-3">
                <MapPin size={18} className="mt-1 shrink-0 text-cyan-400" />
                <span>{address.officeAddress}</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone size={18} className="shrink-0 text-cyan-400" />
                <a
                  href={`tel:${address.officePhone}`}
                  className="hover:text-cyan-400 transition"
                >
                  {address.officePhone}
                </a>
              </div>
              <div className="flex items-center gap-3">
                <Mail size={18} className="shrink-0 text-cyan-400" />
                <a
                  href={`mailto:${address.email}`}
                  className="hover:text-cyan-400 transition"
                >
                  {address.email}
                </a>
              </div>
            </address>
          </div>

          {/* MAP */}
          <FooterMap />
        </div>
      </div>

      {/* BOTTOM BAR */}
      <div className="bg-[#041631] border-t border-white/5 py-3 text-[11px] text-gray-400">
        <div className="max-w-full px-4 flex flex-col md:flex-row items-center justify-center gap-2">
          <p>
            © {new Date().getFullYear()} Arunachal Pradesh Pharmacy Council.
          </p>
          <span className="hidden md:inline">|</span>
          <div className="flex items-center gap-2">
            <span>Designed & Developed by</span>
            <a
              href="https://www.ccscorporate.com/"
              className="flex items-center gap-1 text-cyan-500 hover:underline"
            >
              <ProtectedImage
                src={ccsLogo}
                alt="CCS Logo"
                height={12}
                className="h-3 w-auto"
              />
              <span>Crew Captivators Solutions Pvt. Ltd.</span>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
