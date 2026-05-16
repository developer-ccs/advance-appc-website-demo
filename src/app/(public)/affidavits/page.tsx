"use client";

import React from "react";
import { FileText, Download } from "lucide-react";
import Link from "next/link";

export default function AffidavitsPage() {
  // Demo data for the affidavits based on your screenshot (excluding the crossed-out one)
  const affidavitsList = [
    {
      id: 1,
      title:
        "Indemnity bond for Death claim by the Legal Heirs of the Registered Pharmacists in case Registered Pharmacists and Nominee has Expired",
      fileUrl: "#", // Replace with actual PDF path, e.g., "/documents/affidavit-1.pdf"
    },
    {
      id: 2,
      title: "Death Claim benefit when Enrollment Certificate is lost",
      fileUrl: "#",
    },
    {
      id: 3,
      title:
        "Affidavit for Exemption of Yearly Renewal for Registered Pharmacist those who are above 70 years",
      fileUrl: "#",
    },
    {
      id: 4,
      title: "Affidavit for Change of Name of the Registered Pharmacist",
      fileUrl: "#",
    },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Top Banner (Hero Section) with Medicine Background */}
      <div
        className="relative h-48 md:h-56 flex items-center justify-center overflow-hidden"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1585435557343-3b092031a831?q=80&w=2070&auto=format&fit=crop')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-[#1e293b]/85 mix-blend-multiply"></div>

        {/* Contact Title with Red Lines */}
        <h1 className="text-white text-2xl md:text-4xl font-semibold tracking-wider z-10 flex items-center gap-4 drop-shadow-md">
          <span className="w-10 md:w-16 h-0.5 bg-[#e74c3c]"></span>
          AFFIDAVITS
          <span className="w-10 md:w-16 h-0.5 bg-[#e74c3c]"></span>
        </h1>
      </div>

      {/* Main Content Container */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Affidavits List */}
        <div className="space-y-4">
          {affidavitsList.map((item) => (
            <div
              key={item.id}
              className="bg-white border border-gray-200 rounded shadow-sm hover:shadow-md transition-all duration-200 flex items-stretch min-h-20"
            >
              {/* Number Column */}
              <div className="w-12 md:w-16 flex items-center justify-center border-r border-gray-100 text-gray-500 font-medium text-lg shrink-0">
                {item.id}
              </div>

              {/* Title Column */}
              <div className="flex-1 flex items-center px-4 md:px-6 py-4">
                <p className="text-gray-700 text-sm md:text-base leading-relaxed">
                  {item.title}
                </p>
              </div>

              {/* Action/Icon Column */}
              <div className="w-16 md:w-20 flex items-center justify-center shrink-0 border-l border-gray-100">
                <Link
                  href={item.fileUrl}
                  className="group p-3 hover:bg-red-50 rounded-full transition-colors duration-200 flex flex-col items-center justify-center"
                  title="Download PDF"
                  // target="_blank" // Uncomment this to open PDFs in a new tab
                >
                  <FileText
                    strokeWidth={1.5}
                    size={28}
                    className="text-[#e74c3c] group-hover:scale-110 transition-transform duration-200"
                  />
                  {/* Optional: Tiny download icon overlaying the file icon for extra clarity */}
                  <Download
                    size={12}
                    strokeWidth={3}
                    className="text-[#e74c3c] absolute mt-2 ml-2 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
