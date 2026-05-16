"use client";

import React from "react";
import { Mail, Phone, Smartphone } from "lucide-react";

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Top Banner (Hero Section) with Medicine Background */}
      <div
        className="relative h-48 md:h-56 flex items-center justify-center overflow-hidden"
        style={{
          // Professional medicine/pharmacy background image
          backgroundImage:
            "url('https://images.unsplash.com/photo-1585435557343-3b092031a831?q=80&w=2070&auto=format&fit=crop')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        {/* Dark slate overlay to make text readable and give it that corporate council look */}
        <div className="absolute inset-0 bg-[#1e293b]/85 mix-blend-multiply"></div>

        {/* Contact Title with Red Lines */}
        <h1 className="text-white text-3xl md:text-4xl font-semibold tracking-wider z-10 flex items-center gap-4 drop-shadow-md">
          <span className="w-10 md:w-16 h-0.5 bg-[#e74c3c]"></span>
          CONTACT
          <span className="w-10 md:w-16 h-0.5 bg-[#e74c3c]"></span>
        </h1>
      </div>

      {/* Main Content Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
        {/* Top Row - 3 Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Card 1: The Registrar */}
          <div className="bg-white border border-gray-200 rounded shadow-sm p-6 flex flex-col hover:shadow-md transition-shadow">
            <h2 className="text-xl text-[#0a3675] mb-2 font-medium">
              The Registrar
            </h2>
            <div className="text-gray-700 text-sm leading-relaxed mb-4 grow">
              <p>Arunachal Pradesh State Pharmacy Council,</p>
              <p>Directorate of Health Services,</p>
              <p>Naharlagun,</p>
              <p>Arunachal Pradesh – 791110</p>
            </div>
            <div>
              <h3 className="text-[#0a3675] text-lg mb-2 font-medium">
                E-mail:
              </h3>
              <div className="space-y-1 text-sm text-gray-700">
                <p className="flex items-center gap-2">
                  Administration & Accounts:
                  <span className="flex items-center text-[#0a3675]">
                    <Mail size={14} className="mr-1" /> admin@apspc.demo.in
                  </span>
                </p>
                <p className="flex items-center gap-2">
                  Registration & Renewals:
                  <span className="flex items-center text-[#0a3675]">
                    <Mail size={14} className="mr-1" /> reg@apspc.demo.in
                  </span>
                </p>
              </div>
            </div>
          </div>

          {/* Card 2: Information Center */}
          <div className="bg-white border border-gray-200 rounded shadow-sm p-6 flex flex-col hover:shadow-md transition-shadow">
            <h2 className="text-xl text-[#0a3675] mb-2 font-medium">
              Pharmacy Information & Education Center
            </h2>
            <div className="grow">
              <h3 className="text-[#0a3675] text-lg mb-2 mt-4 font-medium">
                E-mail:
              </h3>
              <p className="text-sm text-gray-700 mb-1">General enquiries</p>
              <p className="flex items-center text-[#0a3675] text-sm mb-4">
                <Mail size={14} className="mr-2" /> info@apspc.demo.in
              </p>

              <p className="text-sm text-gray-700 mb-1">
                Continuing Pharmacy Education
              </p>
              <p className="flex items-center text-[#0a3675] text-sm">
                <Mail size={14} className="mr-2" /> cpe@apspc.demo.in
              </p>
            </div>
          </div>

          {/* Card 3: Office Timings & Phone */}
          <div className="bg-white border border-gray-200 rounded shadow-sm p-6 flex flex-col hover:shadow-md transition-shadow">
            <h2 className="text-xl text-[#0a3675] mb-2 font-medium">
              Office Timings
            </h2>
            <div className="text-gray-700 text-sm leading-relaxed mb-6 grow">
              <p>10.00 A.M. to 4.00 P.M.</p>
              <p className="mt-2 text-gray-500">
                Closed on all 2nd and 4th Saturdays, <br />
                Sundays and all Government holidays.
              </p>
            </div>
            <div>
              <h3 className="text-[#0a3675] text-lg mb-2 font-medium">
                Telephone Numbers:
              </h3>
              <p className="flex items-center text-gray-700 text-sm">
                <Phone size={14} className="mr-2 text-[#0a3675]" />
                +91-360-2244222 / 2244333
              </p>
            </div>
          </div>
        </div>

        {/* Section Heading */}
        <div className="pt-4 pb-2 border-b border-gray-200">
          <h2 className="text-2xl text-[#0a3675] font-medium">
            For Any Other Enquiry
          </h2>
        </div>

        {/* Bottom Row - Enquiries lists */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Enquiry Box 1 */}
          <div className="bg-white border border-gray-200 rounded shadow-sm p-6 flex flex-col justify-between hover:shadow-md transition-shadow">
            <ol className="list-decimal list-inside text-gray-700 text-sm space-y-3 mb-6">
              <li>APSPC-A - Fresh Registration</li>
              <li>
                APSPC-Welfare Trust Certificate – Fresh, Duplicate, Change of
                Nominee
              </li>
              <li>APSPC-D - Additional Qualification</li>
              <li>Printing of Certificates</li>
              <li>Dispatch of Certificates</li>
            </ol>
            <div className="mt-auto pt-4 border-t border-gray-100 flex items-center text-[#0a3675] font-semibold italic tracking-wide">
              <Smartphone size={16} className="mr-2" />
              94360XXXX1
            </div>
          </div>

          {/* Enquiry Box 2 */}
          <div className="bg-white border border-gray-200 rounded shadow-sm p-6 flex flex-col justify-between hover:shadow-md transition-shadow">
            <ol className="list-decimal list-inside text-gray-700 text-sm space-y-3 mb-6">
              <li>APSPC-B - Transfer of Registration from other states</li>
              <li>APSPC-I - Change of Name</li>
              <li>Good Standing Certificate</li>
              <li>Renewal of Registration</li>
            </ol>
            <div className="mt-auto pt-4 border-t border-gray-100 flex items-center text-[#0a3675] font-semibold italic tracking-wide">
              <Smartphone size={16} className="mr-2" />
              94360XXXX2
            </div>
          </div>

          {/* Enquiry Box 3 */}
          <div className="bg-white border border-gray-200 rounded shadow-sm p-6 flex flex-col justify-between hover:shadow-md transition-shadow">
            <ol className="list-decimal list-inside text-gray-700 text-sm space-y-3 mb-6">
              <li>Approval of Payments</li>
              <li>Refunds / Failed Transactions</li>
              <li>Fees Payments & Refund status</li>
              <li>Inward Entry - Application & Originals received</li>
            </ol>
            <div className="mt-auto pt-4 border-t border-gray-100 flex items-center text-[#0a3675] font-semibold italic tracking-wide">
              <Smartphone size={16} className="mr-2" />
              94360XXXX3
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
