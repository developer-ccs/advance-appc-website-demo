"use client";

import { useState, useEffect } from "react";
import GeneralTab from "./GeneralTab";
import CouncilMembersTab from "./CouncilMembersTab";
import AccessControlTab from "./AccessControlTab";
import CouncilImagesTab from "./CouncilGallery";

const ALL_TABS = [
  "General",
  "Council Gallery",
  "Council Members",
  "Access Control",
];

export default function SettingsPage() {
  const [hydrated, setHydrated] = useState(false);
  const [activeTab, setActiveTab] = useState("General");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setHydrated(true);
    const timer = setTimeout(() => setIsLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    const hash = decodeURIComponent(window.location.hash.replace("#", ""));
    if (ALL_TABS.includes(hash)) {
      setActiveTab(hash);
    }
  }, [hydrated]);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    window.location.hash = encodeURIComponent(tab);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <div className="w-8 h-8 border-4 border-blue-900 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-slate-500 animate-pulse">Loading Demo Settings...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w">
      <div className="pb-1">
        <div className="flex items-center gap-2">
          <h2 className="text-2xl font-bold text-blue-900 tracking-tight">
            Portal Settings
          </h2>
        </div>
        <p className="text-sm text-slate-500 mt-0.5">
          Manage and customize key portal preferences, access controls,
          branding, and system configurations.
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="flex border-b border-gray-200 overflow-x-auto bg-gray-50/50">
          {ALL_TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => handleTabChange(tab)}
              className={`px-6 py-3 text-sm font-medium whitespace-nowrap transition cursor-pointer ${
                activeTab === tab
                  ? "text-blue-900 border-b-2 border-blue-900 bg-white font-bold"
                  : "text-gray-500 hover:text-blue-900 hover:bg-gray-100"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="p-6 space-y-8">
          {/* REMOVED user={DEMO_USER} HERE */}
          {activeTab === "General" && <GeneralTab />}
          {activeTab === "Council Gallery" && <CouncilImagesTab />}
          {activeTab === "Council Members" && <CouncilMembersTab />}
          {activeTab === "Access Control" && <AccessControlTab />}
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 p-4 rounded-md">
        <p className="text-xs text-blue-700">
          <strong>Note:</strong> You are viewing the settings in{" "}
          <strong>Demo Mode</strong>. Changes made here will not persist.
        </p>
      </div>
    </div>
  );
}
