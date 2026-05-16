"use client";

import { ArrowRight, Megaphone } from "lucide-react";
import Link from "next/link";
import NewBadge from "../ui/NewBadge";

// --- DEMO DATA ---
const DEMO_NOTICES = [
  {
    _id: "1",
    createdAt: "2024-05-15T10:00:00Z",
    title: "Registration Renewal Process for 2024-2025",
    isNew: true,
    fileUrl: "#",
  },
  {
    _id: "2",
    createdAt: "2024-05-10T14:30:00Z",
    title: "Updated Guidelines for Pharmacy Setup in Rural Areas",
    isNew: false,
    fileUrl: "#",
  },
  {
    _id: "3",
    createdAt: "2024-04-28T09:15:00Z",
    title: "Schedule for the Upcoming Pharmacist Certification Exam",
    isNew: true,
    fileUrl: "#",
  },
  {
    _id: "4",
    createdAt: "2024-04-10T11:00:00Z",
    title: "Notice Regarding Submission of Continuing Education Credits",
    isNew: false,
    fileUrl: "#",
  },
];
// -----------------

export default function NoticeSection() {
  // Replace API state with demo data
  const notices = DEMO_NOTICES;
  const loadingNotices = false;

  const handleDownload = async (fileUrl: string, fileName: string) => {
    // For demo purposes, show an alert instead of opening an empty URL
    if (fileUrl === "#") {
      alert(`Demo: Would open PDF for "${fileName}"`);
      return;
    }
    window.open(fileUrl, "_blank");
  };

  return (
    <section className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="bg-blue-900 text-white p-4 flex justify-between items-center">
        <h2 className="text-lg flex font-bold">
          <Megaphone className="mr-2" /> Notice Board
        </h2>
      </div>
      <div className="p-0">
        <ul className="divide-y divide-gray-200">
          {loadingNotices ? (
            <li className="p-4 text-center text-sm text-gray-400">
              Loading notices...
            </li>
          ) : notices.length === 0 ? (
            <li className="p-4 text-center text-sm text-gray-400">
              No notices available
            </li>
          ) : (
            notices.slice(0, 4).map((notice) => {
              const date = new Date(notice.createdAt);
              const day = date.getDate();
              const month = date.toLocaleString("en-IN", { month: "short" });

              return (
                <li
                  key={notice._id}
                  className="p-4 hover:bg-gray-50 transition"
                >
                  <div className="flex items-center gap-3">
                    {/* Date box */}
                    <div className="bg-gray-100 text-blue-800 text-center rounded-md px-3 py-2 min-w-15 border border-gray-200 shrink-0">
                      <div className="text-[11px] font-bold uppercase leading-none">
                        {month}
                      </div>
                      <div className="text-lg font-bold leading-tight mt-1">
                        {day}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-gray-800 leading-snug line-clamp-2">
                          {notice.title}
                        </p>
                        {notice.isNew && <NewBadge />}
                      </div>

                      <button
                        onClick={() =>
                          handleDownload(notice.fileUrl, notice.title)
                        }
                        className="text-xs text-red-800 inline-flex items-center hover:text-red-700 cursor-pointer"
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                </li>
              );
            })
          )}
        </ul>
      </div>
      <div className="bg-gray-50 p-3 text-center border-t border-gray-200">
        <Link
          href="/notices"
          className="inline-flex items-center text-blue-800 font-bold text-sm hover:text-red-800 hover:cursor-pointer transition"
        >
          View All
          <ArrowRight className="ml-2" size={16} />
        </Link>
      </div>
    </section>
  );
}
