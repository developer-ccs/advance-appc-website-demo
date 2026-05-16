"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Eye, Share2, Loader } from "lucide-react";
import dynamic from "next/dynamic";
import NewBadge from "@/components/ui/NewBadge";

const MotionDiv = dynamic(
  () => import("framer-motion").then((mod) => mod.motion.div),
  { ssr: false },
);
const AnimatePresence = dynamic(
  () => import("framer-motion").then((mod) => mod.AnimatePresence),
  { ssr: false },
);

// --- TYPES ---
type TabType =
  | "notices"
  | "announcements"
  | "tenders"
  | "orders"
  | "misconduct"
  | "pressnote"
  | "inspector";

// --- DEMO DATA ---
const DATA: Record<TabType, any[]> = {
  notices: [
    {
      _id: "n1",
      title: "Renewal of Pharmacist Registration 2024-25",
      createdAt: new Date().toISOString(),
      isNew: true,
      fileUrl: "#",
    },
    {
      _id: "n2",
      title: "Notification regarding mandatory CPE credits",
      createdAt: "2024-01-15",
      isNew: false,
      fileUrl: "#",
    },
    {
      _id: "n3",
      title: "Updated guidelines for retail pharmacy inspections",
      createdAt: "2024-02-03",
      isNew: true,
      fileUrl: "#",
    },
    {
      _id: "n4",
      title: "List of approved pharmacy institutions for 2025",
      createdAt: "2024-03-11",
      isNew: false,
      fileUrl: "#",
    },
    {
      _id: "n5",
      title: "Important notice on biometric attendance compliance",
      createdAt: "2024-03-20",
      isNew: true,
      fileUrl: "#",
    },
  ],

  announcements: [
    {
      _id: "a1",
      title: "Upcoming National Pharmacy Week Celebration",
      createdAt: new Date().toISOString(),
      isNew: true,
      fileUrl: "#",
    },
    {
      _id: "a2",
      title: "Workshop on Good Pharmacy Practices scheduled next month",
      createdAt: "2024-02-12",
      isNew: false,
      fileUrl: "#",
    },
    {
      _id: "a3",
      title: "Online portal maintenance on Sunday from 10 PM",
      createdAt: "2024-03-01",
      isNew: false,
      fileUrl: "#",
    },
    {
      _id: "a4",
      title: "State-level pharmacist awareness campaign launched",
      createdAt: "2024-03-22",
      isNew: true,
      fileUrl: "#",
    },
  ],

  tenders: [
    {
      _id: "t1",
      title: "Supply of Lab Chemicals",
      category: "Procurement",
      status: "ongoing",
      createdAt: "2024-02-10",
      isNew: true,
      fileUrl: "#",
    },
    {
      _id: "t2",
      title: "Tender for Office IT Infrastructure Upgrade",
      category: "IT Services",
      status: "closed",
      createdAt: "2024-01-28",
      isNew: false,
      fileUrl: "#",
    },
    {
      _id: "t3",
      title: "Supply of Pharmacy Registration Certificates",
      category: "Printing",
      status: "ongoing",
      createdAt: "2024-03-05",
      isNew: true,
      fileUrl: "#",
    },
    {
      _id: "t4",
      title: "Hiring of Security Services for Council Office",
      category: "Administration",
      status: "upcoming",
      createdAt: "2024-03-18",
      isNew: true,
      fileUrl: "#",
    },
  ],

  orders: [
    {
      _id: "o1",
      title: "High Court Order regarding Pharmacy Practice",
      createdAt: "2024-02-05",
      isNew: false,
      fileUrl: "#",
    },
    {
      _id: "o2",
      title: "Order for revision of registration fees",
      createdAt: "2024-02-25",
      isNew: true,
      fileUrl: "#",
    },
    {
      _id: "o3",
      title: "Circular on mandatory digital record maintenance",
      createdAt: "2024-03-10",
      isNew: false,
      fileUrl: "#",
    },
    {
      _id: "o4",
      title: "Disciplinary order against unauthorized pharmacy operations",
      createdAt: "2024-03-19",
      isNew: true,
      fileUrl: "#",
    },
  ],

  misconduct: [
    {
      _id: "m1",
      title: "Notice regarding cancellation of Reg No: 1234",
      createdAt: "2024-01-20",
      isNew: false,
      fileUrl: "#",
    },
    {
      _id: "m2",
      title: "Suspension notice issued to retail pharmacy license holder",
      createdAt: "2024-02-08",
      isNew: true,
      fileUrl: "#",
    },
    {
      _id: "m3",
      title: "Investigation initiated for counterfeit medicine distribution",
      createdAt: "2024-03-02",
      isNew: true,
      fileUrl: "#",
    },
    {
      _id: "m4",
      title: "Show-cause notice to registered pharmacist",
      createdAt: "2024-03-15",
      isNew: false,
      fileUrl: "#",
    },
  ],

  pressnote: [
    {
      _id: "p1",
      title: "Council's stance on online pharmacy sales",
      createdAt: "2024-02-15",
      isNew: true,
      fileUrl: "#",
    },
    {
      _id: "p2",
      title: "Press release on anti-drug awareness initiative",
      createdAt: "2024-02-28",
      isNew: false,
      fileUrl: "#",
    },
    {
      _id: "p3",
      title: "Statement regarding rural healthcare pharmacy access",
      createdAt: "2024-03-09",
      isNew: true,
      fileUrl: "#",
    },
    {
      _id: "p4",
      title: "Media briefing on annual council performance report",
      createdAt: "2024-03-21",
      isNew: true,
      fileUrl: "#",
    },
  ],

  inspector: [
    {
      _id: "i1",
      title: "Inspection Report - Papum Pare District",
      createdAt: "2024-02-01",
      isNew: false,
      fileUrl: "#",
    },
    {
      _id: "i2",
      title: "Inspection Report - East Siang District",
      createdAt: "2024-02-14",
      isNew: true,
      fileUrl: "#",
    },
    {
      _id: "i3",
      title: "Compliance verification report for hospital pharmacies",
      createdAt: "2024-03-04",
      isNew: false,
      fileUrl: "#",
    },
    {
      _id: "i4",
      title: "Special inspection drive report on Schedule H medicines",
      createdAt: "2024-03-17",
      isNew: true,
      fileUrl: "#",
    },
  ],
};

const TABS: { id: TabType; label: string }[] = [
  {
    id: "notices",
    label: "Notices & Circulars",
  },
  {
    id: "announcements",
    label: "Announcements",
  },
  {
    id: "tenders",
    label: "Tenders",
  },
  {
    id: "orders",
    label: "Judicial Orders",
  },
  {
    id: "misconduct",
    label: "Misconduct",
  },
  {
    id: "pressnote",
    label: "Press Note",
  },
  {
    id: "inspector",
    label: "Pharmacy Inspector",
  },
];

function NotificationsContent() {
  const searchParams = useSearchParams();
  const requestedTab = searchParams.get("tab") as TabType;

  const [activeTab, setActiveTab] = useState<TabType>("notices");
  const [loading, setLoading] = useState(true);
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  // Sync tab with URL
  useEffect(() => {
    if (requestedTab && DATA[requestedTab]) {
      handleTabChange(requestedTab);
    } else {
      setLoading(false);
    }
  }, [requestedTab]);

  // Update sliding indicator
  useEffect(() => {
    const currentRef = tabRefs.current[activeTab];
    if (currentRef) {
      setIndicatorStyle({
        left: currentRef.offsetLeft,
        width: currentRef.offsetWidth,
      });
    }
  }, [activeTab]);

  const handleTabChange = (tab: TabType) => {
    setLoading(true);
    setActiveTab(tab);
    setTimeout(() => setLoading(false), 500);
  };

  const activeTabConfig = TABS.find((t) => t.id === activeTab);

  return (
    <div className="container mx-auto px-4 py-8 grow flex flex-col gap-8">
      <div className="bg-white rounded-lg shadow-sm border-t-4 border-blue-800 overflow-hidden">
        <div className="bg-gray-50 border-b border-gray-200 p-6">
          <h2 className="text-3xl font-serif font-bold text-blue-800">
            Notifications
          </h2>
          <p className="text-gray-600 mt-2">
            Official updates, circulars, and documents from the APPC.
          </p>
        </div>

        {/* Dynamic Tabs */}
        <div className="flex border-b border-gray-200 bg-white relative overflow-x-auto no-scrollbar">
          <div
            className="absolute bottom-0 h-1 transition-all duration-300 ease-in-out bg-blue-900"
            style={{ left: indicatorStyle.left, width: indicatorStyle.width }}
          />
          {TABS.map((tab) => (
            <button
              key={tab.id}
              ref={(el) => {
                tabRefs.current[tab.id] = el;
              }}
              onClick={() => handleTabChange(tab.id)}
              className={`relative px-6 py-4 text-sm font-semibold z-10 whitespace-nowrap cursor-pointer transition-colors ${
                activeTab === tab.id
                  ? "text-blue-900"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <MotionDiv
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-6"
          >
            <div className="overflow-x-auto border border-gray-200 rounded">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="text-white text-sm bg-blue-900">
                    <th className="p-4 w-20 text-center">Sl. No.</th>
                    <th className="p-4 w-32">Date</th>
                    <th className="p-4">Description</th>
                    {activeTab === "tenders" && (
                      <th className="p-4">Category</th>
                    )}
                    <th className="p-4 w-32 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {loading ? (
                    <tr>
                      <td
                        colSpan={5}
                        className="p-20 text-center text-gray-500"
                      >
                        <Loader className="animate-spin mx-auto mb-2" /> Loading{" "}
                        {activeTabConfig?.label}...
                      </td>
                    </tr>
                  ) : (
                    DATA[activeTab].map((item, index) => (
                      <tr
                        key={item._id}
                        className="border-b border-gray-200 hover:bg-gray-50 transition-colors"
                      >
                        <td className="p-4 text-center">{index + 1}</td>
                        <td className="p-4 whitespace-nowrap">
                          {new Date(item.createdAt).toLocaleDateString("en-IN")}
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{item.title}</span>
                            {item.isNew && <NewBadge />}
                          </div>
                        </td>
                        {activeTab === "tenders" && (
                          <td className="p-4">{item.category}</td>
                        )}
                        <td className="p-4 text-center">
                          <div className="flex justify-center gap-2">
                            <a
                              href={item.fileUrl}
                              className="flex items-center gap-2 p-2 rounded text-white bg-blue-900"
                            >
                              <Eye size={16} /> View
                            </a>
                            <button
                              className="p-2 rounded bg-green-700 text-white cursor-pointer"
                              onClick={() => alert("Copied!")}
                            >
                              <Share2 size={16} />
                            </button>
                          </div>
                        </td>
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

// Main page component with Suspense for SearchParams
export default function NotificationsPage() {
  return (
    <Suspense
      fallback={
        <div className="p-20 text-center">
          <Loader className="animate-spin mx-auto" />
        </div>
      }
    >
      <NotificationsContent />
    </Suspense>
  );
}
