"use client";

import React from "react";
import {
  Building2,
  MonitorSmartphone,
  HeartHandshake,
  Microscope,
  BookOpen,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";

export default function CouncilProfilePage() {
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
          PROFILE
          <span className="hidden md:block w-8 md:w-16 h-0.5 bg-[#e74c3c]"></span>
        </h1>
      </div>

      {/* Main Content Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
        {/* 1. Introduction & Objectives Section */}
        <div className="bg-white border border-gray-200 rounded shadow-sm p-6 md:p-8">
          <h2 className="text-2xl text-[#0a3675] font-medium mb-4 flex items-center gap-3">
            <Building2 size={28} className="text-[#e74c3c]" />
            About the Council
          </h2>
          <div className="text-gray-700 leading-relaxed space-y-4 text-justify">
            <p>
              The <strong>Arunachal Pradesh Pharmacy Council (APPC)</strong> is
              a statutory body constituted under an Act of Indian parliament
              called the Pharmacy Act 1948 (Act No 8 of 1948), www.pci.nic.in/ -
              Rules & Regulation.
            </p>
            <p>
              The main objective of the Arunachal Pradesh Pharmacy Council is to
              regulate the professional practice to ensure only qualified,
              registered Pharmacists enter the profession to provide service to
              the patient.
            </p>
            <p>
              The prime responsibility of the Arunachal Pradesh Pharmacy Council
              is to grant registration to the eligible pharmacists and issue
              Registration certificates to the persons possessing requisite
              prescribed qualification as per the provisions of section 32(2) of
              the Pharmacy Act and to enforce the necessary provisions of the
              Pharmacy Act 1948.
            </p>
            <p>
              The State Pharmacy Councils are constituted by every state for the
              purpose envisaged in the Act, and each State frames its own Rules
              to govern the system without any prejudice to the Central Act.
            </p>
          </div>
        </div>

        {/* 2. Grid Layout for Digitalization & Social Welfare */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Digitalization Section */}
          <div className="bg-white border border-gray-200 rounded shadow-sm p-6 md:p-8">
            <h2 className="text-2xl text-[#0a3675] font-medium mb-4 flex items-center gap-3">
              <MonitorSmartphone size={26} className="text-[#e74c3c]" />
              Digitalization of Services
            </h2>
            <p className="text-gray-600 mb-6 italic">
              The Arunachal Pradesh Pharmacy Council, Naharlagun is unique in
              its activity and has been ahead with the time pace of technology.
            </p>
            <ul className="space-y-4">
              {[
                "Started Mobile App 'APPCDIC' - January 2018 (Available on Google Play store).",
                "Technology Enabled Registration Certificates with QR code, Micro Chip & Bar code since January 2017.",
                "UV and QR enabled Identity Cards to all Registered Pharmacists since January 2017.",
                "Started Online Registration for all the applications (fresh, transfer, additional, duplicate, change of name, good standing certificate, endorsement to foreign nationals) - January 2017.",
                "Started 'On-Line Renewal of Registration' - January 2013.",
              ].map((item, index) => (
                <li key={index} className="flex items-start gap-3">
                  <CheckCircle2
                    size={20}
                    className="text-green-600 shrink-0 mt-0.5"
                  />
                  <span className="text-gray-700 text-sm md:text-base">
                    {item}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Social Welfare Scheme Section */}
          <div className="bg-white border border-gray-200 rounded shadow-sm p-6 md:p-8">
            <h2 className="text-2xl text-[#0a3675] font-medium mb-4 flex items-center gap-3">
              <HeartHandshake size={26} className="text-[#e74c3c]" />
              Social Welfare Scheme
            </h2>
            <div className="text-gray-700 leading-relaxed space-y-4">
              <p>
                <strong>
                  'Arunachal Pradesh Pharmacy Council Registered Pharmacist
                  Welfare Trust'
                </strong>{" "}
                established in the year 1999 is a social welfare scheme for the
                benefit of the family of the registered pharmacist with a
                concern on the welfare of the pharmacist and his/her family.
                Till date, many families have been benefited by the scheme.
              </p>
              <div className="bg-blue-50 border-l-4 border-[#0a3675] p-4 rounded-r mt-4">
                <p className="text-sm">
                  The scheme is extended to the ailing Registered pharmacists
                  suffering from diseases such as Cancer, Kidney Failure, Bypass
                  Surgery, etc., and other ailments of serious nature (in case
                  the scheme is well responded by the members) as decided by the
                  trust.
                </p>
                <a
                  href="#"
                  className="inline-flex items-center text-[#e74c3c] font-medium text-sm mt-3 hover:underline"
                >
                  View More Details <ArrowRight size={16} className="ml-1" />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* 3. Other Services Section */}
        <div className="bg-white border border-gray-200 rounded shadow-sm p-6 md:p-8">
          <h2 className="text-2xl text-[#0a3675] font-medium mb-6">
            Other Key Services & Initiatives
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
            {[
              "Started 'Online Webinars' from May 2020 for pharmacists.",
              "Started 'Pharmadisha 2020' - An orientation program for 1st M. Pharmacy students (Collaborative project with State Universities).",
              "Issued 'Best Student Gold Medal' award for B. Pharm and M. Pharm course through the State University - 2019.",
              "Started 'Travel Grant' for Pharmacy teachers / Community / Hospital Pharmacist registered with APPC to attend International Conferences - 2019.",
              "Started 'Sponsorship' program for organizing a conference/seminar by Pharmacy Colleges - 2019.",
              "Started 'Scholarship' scheme for the legal heirs of Registered Pharmacists to pursue Pharmacy education - October 2018.",
              "Organized 'Inter-country Workshop on National Drug Information Services' for SARC countries sponsored by WHO, India.",
              "Set up 5 Drug Information Centers under WHO, India (2006).",
              "Consultant to the Health & FW Department, Govt. of Arunachal Pradesh (2003).",
              "Launched 'Continuing Pharmacy Education (CPE)' program to update knowledge and skills.",
              "Conduct seminars, workshops, and training programs for healthcare professionals including doctors.",
              "Launched public awareness programs on pharmacare and medication discipline through LED display units.",
            ].map((service, index) => (
              <div
                key={index}
                className="flex items-start gap-3 p-3 hover:bg-gray-50 rounded transition-colors border border-transparent hover:border-gray-100"
              >
                <div className="w-2 h-2 rounded-full bg-[#e74c3c] mt-2 shrink-0"></div>
                <p className="text-gray-700 text-sm md:text-base leading-snug">
                  {service}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* 4. DIRC & Publications Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Drug Information & Research Center */}
          <div className="bg-white border border-gray-200 rounded shadow-sm p-6 md:p-8 lg:col-span-2">
            <h2 className="text-2xl text-[#0a3675] font-medium mb-4 flex items-center gap-3">
              <Microscope size={26} className="text-[#e74c3c]" />
              Drug Information & Research Center (DIRC)
            </h2>
            <div className="text-gray-700 leading-relaxed space-y-4 text-sm md:text-base">
              <p>
                The Council started an independent Drug Information Center in
                August 1997, providing unbiased drug information to healthcare
                professionals, students, and medical practitioners. Even the lay
                public seeks information to sort out medication doubts. DIRC
                communicates vital information through SMS, Facebook, and email
                to Registered Pharmacists free of cost.
              </p>
              <p>
                <strong>
                  International Registry of Drug Information Service (IRDIS):
                </strong>{" "}
                APPC is the first council in India to start a Drug Information
                Center (DIC) independent of a hospital and get registered with
                IRDIS.
              </p>
              <p>
                <strong>DIRC Newsletter:</strong> Released first in October
                1999, the eight-page bulletin carries info on activities,
                rationale use of drugs, and expert articles. It is a member of
                the International Society of Drug Bulletins (ISDB) and includes
                a dedicated page for local languages.
              </p>
              <a
                href="#"
                className="inline-block mt-2 text-[#0a3675] font-semibold hover:text-[#e74c3c] transition-colors"
              >
                Visit apdruginfo.demo.in →
              </a>
            </div>
          </div>

          {/* Publications */}
          <div className="bg-[#0a3675] text-white rounded shadow-sm p-6 md:p-8 flex flex-col">
            <h2 className="text-2xl font-medium mb-6 flex items-center gap-3 border-b border-white/20 pb-4">
              <BookOpen size={26} className="text-[#e74c3c]" />
              Publications
            </h2>
            <ul className="space-y-4 grow">
              {[
                "Handbook of PharmaSOS - 9th Edn.",
                "Drugs Usage in Special Population - Pregnancy & Lactation - 8th Edn.",
                "Drugs Usage in Special Population - Paediatrics & Geriatrics - 8th Edn.",
                "Tobacco Free Future-Choice is Yours - 6th Edn.",
                "2 You from My Desk - 4th Edn.",
              ].map((book, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <BookOpen
                    size={16}
                    className="text-[#e74c3c] shrink-0 mt-1"
                  />
                  <span className="text-white/90 text-sm leading-snug">
                    {book}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
