"use client";

import React from "react";
import { User, Scale, FileText, CreditCard, MapPin, Info } from "lucide-react";

export default function RtiPage() {
  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Top Banner (Hero Section) with Background */}
      <div
        className="relative h-48 md:h-56 flex items-center justify-center overflow-hidden"
        style={{
          // Professional background for the council page
          backgroundImage:
            "url('https://images.unsplash.com/photo-1585435557343-3b092031a831?q=80&w=2070&auto=format&fit=crop')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-[#1e293b]/85 mix-blend-multiply"></div>

        {/* Page Title with Red Lines */}
        <h1 className="text-white text-2xl md:text-4xl font-semibold tracking-wider z-10 flex items-center gap-4 drop-shadow-md text-center px-4">
          <span className="hidden md:block w-10 md:w-16 h-0.5 bg-[#e74c3c]"></span>
          RIGHT TO INFORMATION
          <span className="hidden md:block w-10 md:w-16 h-0.5 bg-[#e74c3c]"></span>
        </h1>
      </div>

      {/* Main Content Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
        {/* Introduction Section */}
        <div className="bg-white border border-gray-200 rounded shadow-sm p-6 md:p-8">
          <h2 className="text-2xl text-[#0a3675] font-medium mb-4 flex items-center gap-2">
            <Info size={24} className="text-[#e74c3c]" />
            RTI Act, 2005
          </h2>
          <p className="text-gray-700 leading-relaxed text-sm md:text-base">
            The Right to Information Act, 2005 empowers citizens to get
            information from any Public Authority. The Arunachal Pradesh State
            Pharmacy Council (APSPC) is a public authority under the RTI Act,
            2005, and is committed to transparency and accountability in its
            functioning. Any citizen of India can seek information regarding the
            activities of the Council by submitting a written request.
          </p>
        </div>

        {/* Officers Information - 2 Columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* SPIO Card */}
          <div className="bg-white border border-gray-200 rounded shadow-sm p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-4 pb-4 border-b border-gray-100">
              <div className="bg-blue-50 p-3 rounded-full text-[#0a3675]">
                <User size={24} />
              </div>
              <div>
                <h2 className="text-xl text-[#0a3675] font-medium">
                  State Public Information Officer (SPIO)
                </h2>
              </div>
            </div>
            <div className="text-gray-700 text-sm space-y-2">
              <p>
                <strong className="text-gray-900">Name:</strong> Shri [Demo
                Name]
              </p>
              <p>
                <strong className="text-gray-900">Designation:</strong>{" "}
                Registrar, APSPC
              </p>
              <p>
                <strong className="text-gray-900">Email:</strong>{" "}
                registrar@apspc.demo.in
              </p>
              <p>
                <strong className="text-gray-900">Phone:</strong>{" "}
                +91-360-2244222
              </p>
            </div>
          </div>

          {/* First Appellate Authority Card */}
          <div className="bg-white border border-gray-200 rounded shadow-sm p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-4 pb-4 border-b border-gray-100">
              <div className="bg-blue-50 p-3 rounded-full text-[#0a3675]">
                <Scale size={24} />
              </div>
              <div>
                <h2 className="text-xl text-[#0a3675] font-medium">
                  First Appellate Authority (FAA)
                </h2>
              </div>
            </div>
            <div className="text-gray-700 text-sm space-y-2">
              <p>
                <strong className="text-gray-900">Name:</strong> Dr. [Demo Name]
              </p>
              <p>
                <strong className="text-gray-900">Designation:</strong>{" "}
                President, APSPC
              </p>
              <p>
                <strong className="text-gray-900">Email:</strong>{" "}
                president@apspc.demo.in
              </p>
              <p>
                <strong className="text-gray-900">Phone:</strong>{" "}
                +91-360-2244333
              </p>
            </div>
          </div>
        </div>

        {/* How to Apply Section */}
        <div>
          <div className="pt-4 pb-2 border-b border-gray-200 mb-6">
            <h2 className="text-2xl text-[#0a3675] font-medium">
              How to apply for Information
            </h2>
          </div>

          <div className="bg-white border border-gray-200 rounded shadow-sm p-6 md:p-8">
            <ul className="space-y-6">
              {/* Step 1 */}
              <li className="flex items-start gap-4">
                <div className="mt-1 bg-gray-50 p-2 rounded text-[#0a3675] border border-gray-100">
                  <FileText size={20} />
                </div>
                <div>
                  <h3 className="text-gray-900 font-medium mb-1">
                    Application Format
                  </h3>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    A request for obtaining information under sub-section (1) of
                    section 6 of the RTI Act shall be made in writing or through
                    electronic means in English, Hindi, or the official language
                    of the area. There is no prescribed format; however, it
                    should clearly specify the information required and include
                    the applicant's contact details.
                  </p>
                </div>
              </li>

              {/* Step 2 */}
              <li className="flex items-start gap-4">
                <div className="mt-1 bg-gray-50 p-2 rounded text-[#0a3675] border border-gray-100">
                  <CreditCard size={20} />
                </div>
                <div>
                  <h3 className="text-gray-900 font-medium mb-1">
                    RTI Fee Details
                  </h3>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    An application fee of{" "}
                    <strong>Rs. 10/- (Rupees Ten only)</strong> must be
                    submitted along with the application. The payment can be
                    made via Demand Draft / Indian Postal Order (IPO) drawn in
                    favor of{" "}
                    <strong>
                      "Registrar, Arunachal Pradesh State Pharmacy Council"
                    </strong>{" "}
                    payable at Naharlagun.
                    <br />
                    <br />
                    <em className="text-gray-500">
                      (Note: Applicants belonging to Below Poverty Line (BPL)
                      category are exempted from fee payment upon production of
                      valid proof).
                    </em>
                  </p>
                </div>
              </li>

              {/* Step 3 */}
              <li className="flex items-start gap-4">
                <div className="mt-1 bg-gray-50 p-2 rounded text-[#0a3675] border border-gray-100">
                  <MapPin size={20} />
                </div>
                <div>
                  <h3 className="text-gray-900 font-medium mb-1">
                    Where to send
                  </h3>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    Send your application via speed post, registered post, or by
                    hand to the following address:
                  </p>
                  <div className="mt-2 bg-gray-50 p-4 rounded border border-gray-200 text-sm text-gray-700">
                    <strong>
                      The State Public Information Officer (SPIO),
                    </strong>
                    <br />
                    Arunachal Pradesh State Pharmacy Council,
                    <br />
                    Directorate of Health Services,
                    <br />
                    Naharlagun, Arunachal Pradesh – 791110
                  </div>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
