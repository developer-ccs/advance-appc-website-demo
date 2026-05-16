"use client";

import { Mail, MapPin, Phone } from "lucide-react";
import ccsLogo from "@/../public/logos/small-ccs-logo.png";
import appcLogo from "@/../public/logos/appc-logo.png";
import FooterMap from "../ui/FooterMap";
import ProtectedImage from "../ui/ProtectedImage";

// --- DEMO DATA ---
const DEMO_ADDRESS = {
  officeAddress:
    "Directorate of Health Services, Naharlagun, Arunachal Pradesh - 791110",
  officePhone: "+91 360 2244123",
  email: "demo-registrar@arunachal.gov.in",
};
// -----------------

export default function Footer() {
  // Replace API state with demo data
  const address = DEMO_ADDRESS;

  return (
    <footer
      id="contact"
      className="bg-[#062045] text-white border-t-4 border-cyan-400 mt-auto"
    >
      {/* MAIN CONTAINER */}
      <div className="max-w-full px-4 sm:px-6 md:px-10 lg:px-12 xl:px-14 py-10">
        {/* GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* ABOUT */}
          <div>
            <div className="flex items-center mb-4 gap-2">
              <div className="relative w-14 h-14">
                <div className="absolute inset-2 bg-white blur-sm opacity-90 rounded-full"></div>
                <ProtectedImage
                  src={appcLogo}
                  alt="APPC Logo"
                  width={56}
                  height={56}
                  sizes="56px"
                  quality={60}
                  loading="lazy"
                  className="object-contain relative z-10"
                />
              </div>

              <h2 className="text-lg font-bold text-cyan-400">
                Arunachal Pradesh <br /> Pharmacy Council
              </h2>
            </div>

            <p className="text-sm text-gray-300 leading-relaxed">
              The Arunachal Pradesh Pharmacy Council is a statutory body
              constituted by the Government of Arunachal Pradesh under the
              provisions of the Pharmacy Act, 1948 to regulate the profession
              and practice of pharmacy in the state.
            </p>
          </div>

          {/* QUICK LINKS */}
          <div className="flex justify-start lg:justify-center">
            <div className="w-fit text-left">
              <h2 className="text-lg font-bold text-cyan-400 mb-4 border-b border-white/20 pb-2">
                Quick Links
              </h2>

              <ul className="space-y-2 text-sm text-gray-300">
                <li>
                  <a
                    href="https://arunachalpradesh.gov.in/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-cyan-400 transition"
                  >
                    Government of Arunachal Pradesh
                  </a>
                </li>
                <li>
                  <a
                    href="https://pci.gov.in/en/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-cyan-400 transition"
                  >
                    Pharmacy Council of India
                  </a>
                </li>
                <li>
                  <a
                    href="/#main-content"
                    className="hover:text-cyan-400 transition"
                  >
                    Certificate Verification
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
            <h2 className="text-lg font-bold text-cyan-400 mb-4 border-b border-white/20 pb-2 w-fit">
              Contact Us
            </h2>

            <address className="not-italic text-sm text-gray-300 space-y-4">
              <div className="flex items-start gap-3">
                <MapPin size={18} className="mt-1 shrink-0" />
                <span>
                  {address?.officeAddress || (
                    <>
                      Directorate of Health Services, Naharlagun,
                      <br />
                      Arunachal Pradesh - 791110
                    </>
                  )}
                </span>
              </div>

              <div className="flex items-center gap-3">
                <Phone size={18} className="shrink-0" />
                {address?.officePhone ? (
                  <a
                    href={`tel:${address.officePhone}`}
                    className="hover:text-cyan-400 transition"
                  >
                    {address.officePhone}
                  </a>
                ) : (
                  <span>+91 360 2244XXX</span>
                )}
              </div>

              <div className="flex items-center gap-3">
                <Mail size={18} className="shrink-0" />
                {address?.email ? (
                  <a
                    href={`mailto:${address.email}`}
                    className="hover:text-cyan-400 transition"
                  >
                    {address.email}
                  </a>
                ) : (
                  <span>registrar-appc@gov.in</span>
                )}
              </div>
            </address>
          </div>

          {/* MAP */}
          <FooterMap />
        </div>
      </div>

      {/* BOTTOM BAR */}
      <div className="bg-gray-800 border-t border-gray-500/30 py-2 text-xs text-gray-300">
        <div className="max-w-full px-4 sm:px-6 md:px-10 lg:px-16 xl:px-24 flex flex-col md:flex-row items-center justify-center gap-2 text-center">
          <p>
            © {new Date().getFullYear()} Arunachal Pradesh Pharmacy Council. All
            rights reserved.
          </p>

          <span className="hidden md:inline">|</span>

          <div className="flex items-center gap-2 flex-wrap justify-center">
            <span>Designed & Developed by</span>

            <a
              href="https://www.ccscorporate.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-blue-400 hover:text-blue-500 transition"
            >
              <ProtectedImage
                draggable={false}
                src={ccsLogo}
                alt="Crew Captivators Solution Logo"
                height={14}
                className="h-3 w-auto"
              />
              <span>Crew Captivators Solution Pvt. Ltd.</span>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
