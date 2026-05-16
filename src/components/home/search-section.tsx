"use client";

import { useState } from "react";
import {
  Search,
  X,
  CalendarDays,
  BadgeCheck,
  Loader,
  AlertCircle,
  BookOpen,
} from "lucide-react";
import { AxiosError } from "axios";
import { apiClient } from "@/lib/axios-instance";

type CertificateResult = {
  registrationNumber: string;
  ownerName: string;
  issueDate: string;
  expiryDate: string;
  computedStatus: "Active" | "Expired" | "Revoked";
  degree: string;
};

export default function SearchSection() {
  const [regNo, setRegNo] = useState("");
  const [result, setResult] = useState<CertificateResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regNo.trim()) return;
    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 600));
    setError("");
    setResult(null);
    setSearched(false);

    try {
      const trimmed = regNo.trim();
      const { data } = await apiClient.get(
        `/global/certificate/${encodeURIComponent(trimmed)}`,
      );

      setResult(data.data);
      setSearched(true);
    } catch (err) {
      const axiosErr = err as AxiosError<{ message?: string }>;
      setError(
        axiosErr.response?.status === 404
          ? "No record found for this registration number."
          : axiosErr.response?.data?.message ||
              "Something went wrong. Please try again.",
      );
      setSearched(true);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setRegNo("");
    setResult(null);
    setError("");
    setSearched(false);
  };

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

  const initials = (name: string) =>
    name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();

  const statusStyles = {
    Active: {
      badge: "bg-green-50 text-green-700 border-green-100",
      dot: "bg-green-500",
    },
    Expired: {
      badge: "bg-red-50 text-red-700 border-red-100",
      dot: "bg-red-500",
    },
    Revoked: {
      badge: "bg-gray-100 text-gray-600 border-gray-200",
      dot: "bg-gray-400",
    },
  };

  return (
    <section className="bg-white p-6 rounded-lg shadow-sm h-full flex flex-col border-t-4 border-blue-800">
      <h2 className="text-2xl font-serif font-bold text-blue-800 mb-4">
        Certificate Search
      </h2>

      {/* Search Form */}
      <div className="bg-gray-50 p-4 rounded border border-gray-200 mb-6 shrink-0">
        <form onSubmit={handleSearch} className="grid grid-cols-1 gap-4">
          <div>
            <label
              htmlFor="registrationNumber"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Registration Number
            </label>
            <input
              id="registrationNumber"
              name="registrationNumber"
              type="text"
              value={regNo}
              onChange={(e) => setRegNo(e.target.value)}
              autoComplete="off"
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-900 focus:ring-1 focus:ring-blue-900"
              placeholder="e.g. XXXX/XXXX/XXXX"
            />
            {/* <div className="mt-2 p-3 rounded-md bg-green-50 border border-green-200">
              <p className="text-xs font-medium text-green-700 mb-1">
                You can search using any of these formats:
              </p>
              <ul className="text-xs text-green-800 space-y-0.5 list-disc list-inside">
                <li>APPC/2026/100002</li>
                <li>APPC-2026-100002</li>
                <li>APPC2026100002</li>
                <li>2026100002</li>
                <li>100002</li>
              </ul>
            </div> */}
          </div>

          <div className="flex justify-end mt-2 gap-2">
            <button
              type="submit"
              disabled={loading || !regNo.trim()}
              className="bg-blue-900 hover:bg-blue-800 text-white px-4 py-2 rounded font-medium transition shadow flex items-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <Loader size={16} className="animate-spin" />
              ) : (
                <Search size={16} />
              )}
              {loading ? "Searching..." : "Search"}
            </button>
            <button
              type="button"
              onClick={handleClear}
              className="bg-red-800 hover:bg-red-700 text-white px-4 py-2 rounded font-medium transition shadow flex items-center gap-2 cursor-pointer"
            >
              <X size={16} /> Clear
            </button>
          </div>
        </form>
      </div>

      {/* Results Box */}
      <div className="border border-gray-200 rounded flex flex-col flex-1 min-h-0">
        {/* Initial state */}
        {!searched && !loading && (
          <div className="flex-1 flex items-center justify-center text-gray-500 text-sm p-6">
            Enter a registration number to search records
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex-1 flex items-center justify-center gap-2 text-gray-400 text-sm p-6">
            <Loader size={16} className="animate-spin" />
            Searching...
          </div>
        )}

        {/* Error / Not found */}
        {!loading && searched && error && (
          <div className="flex-1 flex flex-col items-center justify-center gap-2 p-6">
            <AlertCircle size={24} className="text-red-400" />
            <p className="text-red-500 text-sm text-center">{error}</p>
          </div>
        )}

        {/* ✅ Result — shown for ALL statuses including Expired */}
        {!loading && searched && result && (
          <>
            {/* Header */}
            <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100 shrink-0">
              <div className="w-11 h-11 rounded-full bg-blue-50 flex items-center justify-center text-sm font-semibold text-blue-600 shrink-0">
                {initials(result.ownerName)}
              </div>
              <div>
                <p className="font-semibold text-gray-900 leading-tight">
                  {result.ownerName}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {result.registrationNumber}
                </p>
              </div>
            </div>

            {/* Body */}
            <div className="px-5 py-4 flex flex-col gap-3 flex-1">
              {/* Expired warning banner */}
              {result.computedStatus === "Expired" && (
                <div className="flex items-center gap-2 bg-red-50 border border-red-100 text-red-700 text-xs px-3 py-2 rounded-lg">
                  <AlertCircle size={14} className="shrink-0" />
                  This certificate has expired.
                </div>
              )}

              {/* Dates Row */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-50 border border-gray-100 rounded-lg px-4 py-3 flex items-start gap-3">
                  <CalendarDays
                    size={16}
                    className="text-gray-400 mt-0.5 shrink-0"
                  />
                  <div>
                    <p className="text-xs text-gray-400 mb-0.5">Issue date</p>
                    <p className="text-sm font-semibold text-gray-800">
                      {formatDate(result.issueDate)}
                    </p>
                  </div>
                </div>
                <div className="bg-gray-50 border border-gray-100 rounded-lg px-4 py-3 flex items-start gap-3">
                  <CalendarDays
                    size={16}
                    className="text-gray-400 mt-0.5 shrink-0"
                  />
                  <div>
                    <p className="text-xs text-gray-400 mb-0.5">Expiry date</p>
                    <p
                      className={`text-sm font-semibold ${
                        result.computedStatus === "Expired"
                          ? "text-red-600"
                          : "text-gray-800"
                      }`}
                    >
                      {formatDate(result.expiryDate)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Course Row */}
              <div className="bg-gray-50 border border-gray-100 rounded-lg px-4 py-3 flex items-center gap-3">
                <BookOpen size={16} className="text-gray-400 shrink-0" />
                <div className="flex items-center justify-between w-full">
                  <p className="text-xs text-gray-400">Course</p>
                  <p className="text-sm font-semibold text-gray-800 text-right">
                    {result.degree}
                  </p>
                </div>
              </div>

              {/* Status Row */}
              <div className="bg-gray-50 border border-gray-100 rounded-lg px-4 py-3 flex items-center gap-3">
                <BadgeCheck size={16} className="text-gray-400 shrink-0" />
                <div className="flex items-center justify-between w-full">
                  <p className="text-xs text-gray-400">Status</p>
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                      statusStyles[result.computedStatus].badge
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        statusStyles[result.computedStatus].dot
                      }`}
                    />
                    {result.computedStatus}
                  </span>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-5 py-3 border-t border-gray-100 flex justify-end shrink-0">
              <p className="text-xs text-gray-400 italic self-center mr-auto">
                Verified from APPC registry
              </p>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
