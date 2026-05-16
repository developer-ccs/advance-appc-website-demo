"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Loader, Search, RotateCcw } from "lucide-react";
import dynamic from "next/dynamic";

const MotionDiv = dynamic(
  () => import("framer-motion").then((mod) => mod.motion.div),
  { ssr: false },
);
const AnimatePresence = dynamic(
  () => import("framer-motion").then((mod) => mod.AnimatePresence),
  { ssr: false },
);

type PharmacistTab =
  | "registered"
  | "transferred"
  | "expired"
  | "cancelled"
  | "removed";

// --- DATA STRUCTURES ---
const PHARMACIST_DATA: any = {
  registered: [
    {
      slNo: 1,
      regNo: "101805",
      regDate: "16-May-2026",
      name: "NITHYASHREE J S",
      fatherName: "SIDDESH J",
      validity: "31-Dec-2027",
    },
    {
      slNo: 2,
      regNo: "101804",
      regDate: "16-May-2026",
      name: "Arpana Gopal Dhage",
      fatherName: "Gopal",
      validity: "31-Dec-2027",
    },
    {
      slNo: 3,
      regNo: "101811",
      regDate: "16-May-2026",
      name: "Prajwalnaik T K",
      fatherName: "Kumarnaik T S",
      validity: "31-Dec-2027",
    },
  ],
  transferred: [
    {
      slNo: 1,
      regNo: "96142",
      regDt: "15-Sep-2025",
      name: "J Sivakumar",
      transferDt: "04-Feb-2026",
      council: "Andhra Pradesh Pharmacy Council",
    },
    {
      slNo: 2,
      regNo: "95498",
      regDt: "26-Aug-2025",
      name: "Akshay Krishna",
      transferDt: "21-Nov-2025",
      council: "Kerala State Pharmacy Council",
    },
    {
      slNo: 3,
      regNo: "95199",
      regDt: "16-Aug-2025",
      name: "Jishnu G Krishnan",
      transferDt: "01-Dec-2025",
      council: "Kerala State Pharmacy Council",
    },
  ],
  expired: [
    {
      slNo: 1,
      regNo: "19854",
      regDate: "01-Apr-1963",
      name: "ABDUL BASHEER",
      fatherName: "A. BASITH",
      validity: "31-Dec-2016",
    },
    {
      slNo: 2,
      regNo: "18459",
      regDate: "01-Apr-1963",
      name: "ABDUL BASITH KHAN",
      fatherName: "",
      validity: "31-Dec-1987",
    },
    {
      slNo: 3,
      regNo: "10456",
      regDate: "01-Apr-1963",
      name: "ABDUL HYE SHARIFF",
      fatherName: "",
      validity: "31-Dec-2016",
    },
  ],
  cancelled: [
    { slNo: 1, regNo: "4", regDate: "01-Apr-1963", name: "H.KABDULJABBAR" },
    { slNo: 2, regNo: "8", regDate: "01-Apr-1963", name: "ABDUL LATHEEF KHAN" },
    {
      slNo: 3,
      regNo: "20",
      regDate: "01-Apr-1963",
      name: "H.N.ACHUTHA MURTHY",
    },
  ],
  removed: [
    {
      slNo: 1,
      regNo: "725",
      name: "C.R NAGAPPA SETTY",
      regDate: "01-Apr-1963",
    },
    { slNo: 2, regNo: "1108", name: "K.SOMESH SHETTY", regDate: "01-Apr-1963" },
    {
      slNo: 3,
      regNo: "1230",
      name: "S. VISWANATH BHAT",
      regDate: "01-Apr-1963",
    },
  ],
};

const TABS: { id: PharmacistTab; label: string }[] = [
  { id: "registered", label: "Registered Pharmacist" },
  { id: "transferred", label: "Transferred" },
  { id: "expired", label: "Expired" },
  { id: "cancelled", label: "Cancelled Registrations" },
  { id: "removed", label: "Name Removed (Sec.34 (2))" },
];

function PharmacistContent() {
  const searchParams = useSearchParams();
  const requestedTab = searchParams.get("tab") as PharmacistTab;

  const [activeTab, setActiveTab] = useState<PharmacistTab>("registered");
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  useEffect(() => {
    if (requestedTab && PHARMACIST_DATA[requestedTab]) {
      handleTabChange(requestedTab);
    } else {
      setLoading(false);
    }
  }, [requestedTab]);

  useEffect(() => {
    const currentRef = tabRefs.current[activeTab];
    if (currentRef) {
      setIndicatorStyle({
        left: currentRef.offsetLeft,
        width: currentRef.offsetWidth,
      });
    }
  }, [activeTab]);

  const handleTabChange = (tab: PharmacistTab) => {
    setLoading(true);
    setActiveTab(tab);
    setSearchTerm("");
    setTimeout(() => setLoading(false), 500);
  };

  const filteredData = (PHARMACIST_DATA[activeTab] || []).filter(
    (p: any) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.regNo || p.regNumber)?.includes(searchTerm),
  );

  return (
    <div className="container mx-auto px-4 py-8 grow flex flex-col gap-6">
      <div className="bg-white rounded-lg shadow-sm border-t-4 border-blue-800 overflow-hidden">
        {/* Header & Search */}
        <div className="bg-gray-50 border-b border-gray-200 p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h2 className="text-2xl font-bold text-blue-800 uppercase tracking-tight">
            Pharmacist Data
          </h2>
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={18}
            />
            <input
              type="text"
              placeholder="Search record..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#0a3675] focus:outline-none w-full md:w-80 text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Dynamic Tabs */}
        <div className="flex border-b border-gray-200 bg-white relative overflow-x-auto no-scrollbar">
          <div
            className="absolute bottom-0 h-1 bg-[#0a3675] transition-all duration-300 ease-in-out"
            style={{ left: indicatorStyle.left, width: indicatorStyle.width }}
          />
          {TABS.map((tab) => (
            <button
              key={tab.id}
              ref={(el) => {
                tabRefs.current[tab.id] = el;
              }}
              onClick={() => handleTabChange(tab.id)}
              className={`relative px-6 py-4 text-[11px] font-bold uppercase tracking-widest z-10 whitespace-nowrap cursor-pointer transition-colors ${
                activeTab === tab.id
                  ? "text-[#0a3675]"
                  : "text-gray-400 hover:text-gray-600"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Table Content */}
        <AnimatePresence mode="wait">
          <MotionDiv
            key={activeTab}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="p-4"
          >
            <div className="overflow-x-auto border border-gray-200 rounded">
              <table className="w-full text-left border-collapse bg-white">
                <thead>
                  <tr className="bg-[#0a3675] text-white text-[13px] whitespace-nowrap">
                    <th className="p-3 border-r border-white/10 w-16 text-center">
                      SI No
                    </th>

                    {/* Render Dynamic Headers based on Active Tab */}
                    {activeTab === "registered" && (
                      <>
                        <th className="p-3 border-r border-white/10">Reg#</th>
                        <th className="p-3 border-r border-white/10">
                          Reg-Date
                        </th>
                        <th className="p-3 border-r border-white/10">Name</th>
                        <th className="p-3 border-r border-white/10">
                          FatherName
                        </th>
                        <th className="p-3">validity</th>
                      </>
                    )}

                    {activeTab === "transferred" && (
                      <>
                        <th className="p-3 border-r border-white/10">Reg No</th>
                        <th className="p-3 border-r border-white/10">Reg dt</th>
                        <th className="p-3 border-r border-white/10">
                          Name of Reg Pharmacist
                        </th>
                        <th className="p-3 border-r border-white/10">
                          Transfer dt
                        </th>
                        <th className="p-3">Pharmacy Council</th>
                      </>
                    )}

                    {activeTab === "expired" && (
                      <>
                        <th className="p-3 border-r border-white/10">
                          Reg Number
                        </th>
                        <th className="p-3 border-r border-white/10">
                          Reg Date
                        </th>
                        <th className="p-3 border-r border-white/10">
                          Name of Reg Pharmacist
                        </th>
                        <th className="p-3 border-r border-white/10">
                          Father Name
                        </th>
                        <th className="p-3 border-r border-white/10">
                          validity
                        </th>
                        <th className="p-3 text-center">Restore</th>
                      </>
                    )}

                    {activeTab === "cancelled" && (
                      <>
                        <th className="p-3 border-r border-white/10">Reg No</th>
                        <th className="p-3 border-r border-white/10">
                          Date Of Reg
                        </th>
                        <th className="p-3">Name of Registered Pharmacist</th>
                      </>
                    )}

                    {activeTab === "removed" && (
                      <>
                        <th className="p-3 border-r border-white/10">
                          Reg Number
                        </th>
                        <th className="p-3 border-r border-white/10">Name</th>
                        <th className="p-3">Reg Date</th>
                      </>
                    )}
                  </tr>
                </thead>

                <tbody className="text-[13px]">
                  {loading ? (
                    <tr>
                      <td
                        colSpan={10}
                        className="p-20 text-center text-gray-400"
                      >
                        <Loader className="animate-spin mx-auto mb-2 text-[#0a3675]" />{" "}
                        Fetching Records...
                      </td>
                    </tr>
                  ) : (
                    filteredData.map((item: any, idx: number) => (
                      <tr
                        key={idx}
                        className="border-b border-gray-100 hover:bg-gray-50/80 transition-colors"
                      >
                        <td className="p-3 border-r border-gray-100 text-center text-gray-500">
                          {item.slNo}
                        </td>

                        {/* Dynamic Body Cells */}
                        {activeTab === "registered" && (
                          <>
                            <td className="p-3 border-r border-gray-100 text-[#0a3675] font-medium">
                              {item.regNo}
                            </td>
                            <td className="p-3 border-r border-gray-100">
                              {item.regDate}
                            </td>
                            <td className="p-3 border-r border-gray-100 font-medium uppercase text-gray-800">
                              {item.name}
                            </td>
                            <td className="p-3 border-r border-gray-100 uppercase text-gray-600">
                              {item.fatherName}
                            </td>
                            <td className="p-3 text-gray-500">
                              {item.validity}
                            </td>
                          </>
                        )}

                        {activeTab === "transferred" && (
                          <>
                            <td className="p-3 border-r border-gray-100 font-medium text-[#0a3675]">
                              {item.regNo}
                            </td>
                            <td className="p-3 border-r border-gray-100">
                              {item.regDt}
                            </td>
                            <td className="p-3 border-r border-gray-100 font-medium uppercase text-gray-800">
                              {item.name}
                            </td>
                            <td className="p-3 border-r border-gray-100 font-medium text-gray-700">
                              {item.transferDt}
                            </td>
                            <td className="p-3 text-gray-600">
                              {item.council}
                            </td>
                          </>
                        )}

                        {activeTab === "expired" && (
                          <>
                            <td className="p-3 border-r border-gray-100 font-medium text-[#0a3675]">
                              {item.regNo}
                            </td>
                            <td className="p-3 border-r border-gray-100">
                              {item.regDate}
                            </td>
                            <td className="p-3 border-r border-gray-100 font-medium uppercase text-gray-800">
                              {item.name}
                            </td>
                            <td className="p-3 border-r border-gray-100 uppercase text-gray-600">
                              {item.fatherName}
                            </td>
                            <td className="p-3 border-r border-gray-100 text-gray-500">
                              {item.validity}
                            </td>
                            <td className="p-3 text-center">
                              <button className="text-blue-600 hover:underline flex items-center justify-center gap-1 mx-auto cursor-pointer">
                                Click Here to Restore
                              </button>
                            </td>
                          </>
                        )}

                        {activeTab === "cancelled" && (
                          <>
                            <td className="p-3 border-r border-gray-100 font-medium text-[#0a3675]">
                              {item.regNo}
                            </td>
                            <td className="p-3 border-r border-gray-100">
                              {item.regDate}
                            </td>
                            <td className="p-3 font-medium uppercase text-gray-800">
                              {item.name}
                            </td>
                          </>
                        )}

                        {activeTab === "removed" && (
                          <>
                            <td className="p-3 border-r border-gray-100 font-medium text-[#0a3675]">
                              {item.regNo}
                            </td>
                            <td className="p-3 border-r border-gray-100 font-medium uppercase text-gray-800">
                              {item.name}
                            </td>
                            <td className="p-3 text-gray-600">
                              {item.regDate}
                            </td>
                          </>
                        )}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </MotionDiv>
        </AnimatePresence>
      </div>
    </div>
  );
}

export default function PharmacistPage() {
  return (
    <Suspense
      fallback={
        <div className="p-20 text-center">
          <Loader className="animate-spin mx-auto" />
        </div>
      }
    >
      <PharmacistContent />
    </Suspense>
  );
}
