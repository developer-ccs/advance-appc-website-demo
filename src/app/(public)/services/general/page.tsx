"use client";

import React from "react";
import { FileText } from "lucide-react";
import Link from "next/link";

export default function GeneralInstructionsPage() {
  // Data based on your screenshot with the AP (Arunachal Pradesh) corrections applied.
  // Row 11 (Duplicate Enrollment) was skipped as it was crossed out with a blue X.
  const tableData = [
    {
      id: 1,
      formDesc: "Application form for Fresh Registration",
      formCode: "APPC A",
      pdfLink: "#",
    },
    {
      id: 2,
      formDesc:
        "Endorsement for Foreign Nationals not eligible for registration",
      formCode: "APPC A1",
      pdfLink: "#",
    },
    {
      id: 3,
      formDesc: "Application form for Re-Registration",
      formCode: "APPC B",
      pdfLink: "#",
    },
    {
      id: 4,
      formDesc: "Duplicate Registration Certificate",
      formCode: "APPC C",
      pdfLink: "#",
    },
    {
      id: 5,
      formDesc: "Application form for Additional Qualification",
      formCode: "APPC D",
      pdfLink: "#",
    },
    {
      id: 6,
      formDesc: "Application form for Renewal of Registration of Pharmacist",
      formCode: "APPC E",
      pdfLink: "#",
    },
    {
      id: 7,
      formDesc: "Good Standing Certificate",
      formCode: "APPC G",
      pdfLink: "#",
    },
    {
      id: 8,
      formDesc: "Change of RP Name, Parents Name and DOB",
      formCode: "APPC I",
      pdfLink: "#",
    },
    {
      id: 9,
      formDesc: "Arunachal Pradesh Registered Pharmacist Welfare Trust",
      formCode: "AP Welfare Trust (Fresh)",
      pdfLink: "#",
    },
    {
      id: 10,
      formDesc:
        "Change of Nominee - Arunachal Pradesh Registered Pharmacist Welfare Trust",
      formCode: "AP Welfare Trust (NC)",
      pdfLink: "#",
    },
    {
      id: 11,
      formDesc: "Scholarship",
      formCode: "APPC J",
      pdfLink: "#",
    },
    {
      id: 12,
      formDesc: "Eligibility letter",
      formCode: "APPC A2",
      pdfLink: "#",
    },
    {
      id: 13,
      formDesc: "Application form for death claim",
      formCode: "Death Claim",
      pdfLink: "#",
    },
    {
      id: 14,
      formDesc: "Research Project (Grants)",
      formCode: "APPC L",
      pdfLink: "#",
    },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Top Banner (Hero Section) */}
      <div
        className="relative h-48 md:h-56 flex items-center justify-center overflow-hidden"
        style={{
          // Professional medicine/pharmacy background
          backgroundImage:
            "url('https://images.unsplash.com/photo-1585435557343-3b092031a831?q=80&w=2070&auto=format&fit=crop')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-[#1e293b]/85 mix-blend-multiply"></div>

        {/* Title */}
        <h1 className="text-white text-2xl md:text-4xl font-semibold tracking-wider z-10 flex items-center gap-4 drop-shadow-md text-center px-4">
          <span className="hidden md:block w-8 md:w-16 h-0.5 bg-[#e74c3c]"></span>
          GENERAL INSTRUCTIONS
          <span className="hidden md:block w-8 md:w-16 h-0.5 bg-[#e74c3c]"></span>
        </h1>
      </div>

      {/* Main Content Container */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Table Header Section */}
        <div className="mb-4">
          <h2 className="text-2xl text-[#2f5597] font-medium tracking-wide">
            Application Forms
          </h2>
        </div>

        {/* Table Wrapper (allows scrolling on small screens) */}
        <div className="bg-white rounded-t-md shadow-sm border border-gray-200 overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-200">
            {/* Table Head - Matched the blue header from your screenshot */}
            <thead>
              <tr className="bg-[#3b5998] text-white">
                <th className="py-3 px-4 font-medium border-r border-white/20 w-16 text-center">
                  Sl.no
                </th>
                <th className="py-3 px-4 font-medium border-r border-white/20">
                  Application Forms
                </th>
                <th className="py-3 px-4 font-medium border-r border-white/20 w-64">
                  Form Code
                </th>
                <th className="py-3 px-4 font-medium w-48 text-center">
                  General Instructions
                </th>
              </tr>
            </thead>

            {/* Table Body - Alternating zebra stripes */}
            <tbody>
              {tableData.map((row, index) => (
                <tr
                  key={row.id}
                  // Zebra striping: even rows get a very light gray background
                  className={`border-b border-gray-200 hover:bg-blue-50 transition-colors ${
                    index % 2 !== 0 ? "bg-gray-50/70" : "bg-white"
                  }`}
                >
                  <td className="py-4 px-4 text-gray-700 text-center border-r border-gray-200">
                    {row.id}
                  </td>

                  <td className="py-4 px-4 text-gray-700 border-r border-gray-200">
                    {row.formDesc}
                  </td>

                  <td className="py-4 px-4 text-gray-700 border-r border-gray-200">
                    {row.formCode}
                  </td>

                  <td className="py-4 px-4 text-center">
                    <Link
                      href={row.pdfLink}
                      className="inline-flex items-center justify-center p-2 hover:bg-red-50 rounded transition-colors group"
                      title="Download PDF"
                    >
                      {/* Using the red document icon from Lucide to match the screenshot */}
                      <FileText
                        size={24}
                        strokeWidth={1.5}
                        className="text-[#e74c3c] group-hover:scale-110 transition-transform"
                      />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
