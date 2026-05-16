import React from "react";
import { BadgeCheck, ScrollText } from "lucide-react";

export const metadata = {
  title: "Pharmacist Oath | Pharmacy Council",
  description: "The official Pharmacist Oath and code of ethics.",
};

const oathPledges = [
  "I swear by the code of ethics of Pharmacy Council of India in relation with the community and shall act as an integral part of health care team.",
  "I shall uphold the laws and standards governing my profession.",
  "I shall strive to perfect and enlarge my knowledge to contribute to the advancement of pharmacy and public health.",
  "I shall follow the system, which I consider best for pharmaceutical care and counseling of patient.",
  "I shall endeavor to discover and manufacture drugs of quality to alleviate suffering of humanity.",
  "I shall hold in confidence the knowledge gained about the patients in connection with my professional practice and never divulge unless compelled to do so by the law.",
  "I shall associate with organizations having their objectives for betterment of the profession of pharmacy and make contribution to carry out the work of the organization.",
];

const concludingStatement =
  "While I continue to keep this oath unviolated, may it be granted to me to enjoy life and practice of pharmacy respected by all, in all times! But should I trespass and violate this oath, may the reverse be my lot!";

export default function PharmacistOathPage() {
  return (
    <div className="min-h-screen bg-[#f8fafc] font-sans pb-16">
      {/* HEADER SECTION */}
      {/* Kept consistent with the styling of your Council Members page */}
      <div
        className="relative h-40 md:h-56 flex items-center justify-center overflow-hidden shadow-md"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1585435557343-3b092031a831?q=80&w=2070&auto=format&fit=crop')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-[#1e293b]/85 mix-blend-multiply"></div>
        <h1 className="text-white text-2xl md:text-3xl font-semibold tracking-wider z-10 flex items-center gap-4 drop-shadow-md text-center px-4">
          <span className="hidden md:block w-8 md:w-12 h-0.5 bg-[#e74c3c]"></span>
          PHARMACIST OATH
          <span className="hidden md:block w-8 md:w-12 h-0.5 bg-[#e74c3c]"></span>
        </h1>
      </div>

      {/* CONTENT SECTION */}
      <main className="max-w-7xl mx-auto px-4 mt-8 md:mt-12">
        <div className="bg-white rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.05)] border border-gray-100 p-6 md:p-10 lg:p-14 relative overflow-hidden">
          {/* Subtle decorative background icon */}
          <ScrollText className="absolute -top-10 -right-10 w-48 h-48 text-gray-50 opacity-50 pointer-events-none rotate-12" />

          {/* Oath Pledges List */}
          <ul className="space-y-6 relative z-10">
            {oathPledges.map((pledge, index) => (
              <li key={index} className="flex items-start gap-4 group">
                <div className="mt-1 shrink-0">
                  <BadgeCheck className="w-6 h-6 text-[#0b5c3b] opacity-80 group-hover:opacity-100 transition-opacity" />
                </div>
                <p className="text-gray-700 text-base md:text-[17px] leading-relaxed">
                  {pledge}
                </p>
              </li>
            ))}
          </ul>

          {/* Divider */}
          <div className="w-full h-px bg-linear-to-r from-transparent via-gray-200 to-transparent my-10 relative z-10"></div>

          {/* Concluding Statement */}
          <div className="relative z-10 bg-[#f0f4f8] rounded-lg p-6 md:p-8 border-l-4 border-[#0a3675]">
            <p className="text-[#172b53] text-base md:text-lg italic font-medium leading-relaxed text-center md:text-left">
              "{concludingStatement}"
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
