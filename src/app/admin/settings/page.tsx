"use client";

import { useState, useEffect } from "react";
import { useAuthStore } from "@/store/authStore";
import GeneralTab from "./GeneralTab";
import CouncilMembersTab from "./CouncilMembersTab";
import AccessControlTab from "./AccessControlTab";
import CouncilImagesTab from "./CouncilGallery";

// Adjust these imports based on where you saved the files
import CustomLoader from "@/components/ui/CustomLoader";
import { usePageLoader } from "@/hooks/usePageLoader";

const TAB_PERMISSIONS: Record<string, string> = {
  General: "GENERAL_SETTINGS",
  "Council Members": "VIEW_ALL_COUNSELLORS",
  "Access Control": "MANAGE_PERMISSIONS",
};

const ALL_TABS = [
  "General",
  "Council Gallery",
  "Council Members",
  "Access Control",
];

export default function SettingsPage() {
  const user = useAuthStore((s) => s.user);
  const hasPermission = useAuthStore((s) => s.hasPermission);

  // If your authStore has an `isLoading` state, you can pull it here:
  // const isAuthLoading = useAuthStore((s) => s.isLoading);

  const [hydrated, setHydrated] = useState(false);
  const [activeTab, setActiveTab] = useState("");

  // Use the custom page loader.
  // Add any other loading states (like data fetching) into this array.
  const { isLoading } = usePageLoader([!hydrated]);

  useEffect(() => {
    setHydrated(true);
  }, []);

  const tabs = hydrated
    ? ALL_TABS.filter((tab) => {
        if (tab === "Access Control") return true;
        if (tab === "Council Gallery") return true;
        if (tab === "General") return true;
        if (tab === "Council Members") return true;
        return hasPermission(TAB_PERMISSIONS[tab]);
      })
    : [];

  useEffect(() => {
    if (!hydrated || tabs.length === 0) return;
    const hash = decodeURIComponent(window.location.hash.replace("#", ""));
    if (tabs.includes(hash)) {
      setActiveTab(hash);
    } else {
      setActiveTab(tabs[0]);
    }
  }, [hydrated]);

  // Handle hash changes
  useEffect(() => {
    const handleHashChange = () => {
      const hash = decodeURIComponent(window.location.hash.replace("#", ""));
      if (tabs.includes(hash)) setActiveTab(hash);
    };
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, [tabs]);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    window.location.hash = encodeURIComponent(tab);
  };

  // 1. Show the CustomLoader if the page is still loading/hydrating
  if (isLoading) {
    return <CustomLoader fullPage message="Loading settings..." />;
  }

  // 2. Show no permissions message if applicable
  if (tabs.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-gray-400 text-sm">
        You don't have permission to access any settings.
      </div>
    );
  }

  // 3. Render Settings UI
  return (
    <div className="space-y-6 max-w">
      <div className="pb-1">
        <h2 className="text-2xl font-bold text-blue-900 tracking-tight">
          Portal Settings
        </h2>
        <p className="text-sm text-slate-500 mt-0.5">
          Manage and customize key portal preferences, access controls,
          branding, and system configurations.
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="flex border-b border-gray-200 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => handleTabChange(tab)}
              className={`px-6 py-3 text-sm font-medium whitespace-nowrap transition cursor-pointer ${
                activeTab === tab
                  ? "text-blue-900 border-b-2 border-blue-900 bg-blue-50/50 font-bold"
                  : "text-gray-500 hover:text-blue-900 hover:bg-gray-50"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="p-6 space-y-8">
          {activeTab === "General" && <GeneralTab user={user} />}
          {activeTab === "Council Gallery" && <CouncilImagesTab />}
          {activeTab === "Council Members" && <CouncilMembersTab />}
          {activeTab === "Access Control" && <AccessControlTab />}
        </div>
      </div>
    </div>
  );
}
