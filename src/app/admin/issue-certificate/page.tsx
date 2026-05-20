"use client";

import { useEffect, useCallback, useState, useMemo } from "react";
import { Search, Loader, X, Trash2, Send, Printer, Award } from "lucide-react";
import { useToast } from "@/components/ui/ToastContext";
import { useConfirmDialog } from "@/components/ui/ConfirmDialogContext";

// ─── Types & Mock Data ──────────────────────────────────────────────────────
type IssueStatus = "Pending" | "Issued";

export interface Candidate {
  _id: string;
  registrationNumber: string;
  name: string;
  email: string;
  phoneNumber: string;
  course: string;
  issueDate?: string;
  status: IssueStatus;
  photoUrl?: string;
}

const pharmacyQualifications = ["B. PHARM", "D. PHARM", "PHARM. D"];

const generateMockData = (): Candidate[] =>
  Array.from({ length: 45 }).map((_, i) => ({
    _id: `cand-${i + 1}`,
    registrationNumber: `APPC/${2000 + i}/2024`,
    name: `Candidate ${i + 1}`,
    email: `candidate${i + 1}@example.com`,
    phoneNumber: `+91 94360 000${i.toString().padStart(2, "0")}`,
    course: pharmacyQualifications[i % pharmacyQualifications.length],
    status: i < 5 ? "Issued" : "Pending",
    issueDate: i < 5 ? new Date().toISOString() : undefined,
    photoUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${i}`,
  }));

let MOCK_DB = generateMockData();

// ─── Certificate Preview Modal (Fixed for Printing) ─────────────────────────
// ─── Certificate Preview Modal (Individual Data Overlay) ─────────────────
const IssuePreviewModal = ({
  candidate,
  onClose,
  onIssueSuccess,
}: {
  candidate: Candidate;
  onClose: () => void;
  onIssueSuccess: (id: string) => void;
}) => {
  const { showToast } = useToast();
  const [isIssuing, setIsIssuing] = useState(false);

  const handleIssueAction = async () => {
    setIsIssuing(true);
    setTimeout(() => {
      onIssueSuccess(candidate._id);
      showToast(`Certificate issued successfully`, "success");
      setIsIssuing(false);
      onClose();
    }, 1500);
  };

  return (
    <div className="min-h-screen fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-hidden">
      <div className="bg-white rounded-xl shadow-2xl w-fit h-fit flex flex-col overflow-hidden max-h-[98vh]">
        {/* Header UI */}
        <div className="flex items-center justify-between px-6 py-3 border-b border-gray-200 print:hidden">
          <h3 className="text-md font-bold text-blue-900 flex items-center gap-2">
            <Award size={18} className="text-green-700" /> Certificate
            Individual Overlay
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Certificate Container */}
        <div className="bg-slate-200 p-4 flex justify-center items-center overflow-hidden">
          <div
            className="relative overflow-hidden"
            style={{ width: "476px", height: "674px" }}
          >
            <div
              id="printable-certificate"
              className="absolute top-0 left-0 origin-top-left bg-white"
              style={{
                width: "794px",
                height: "1123px",
                fontFamily: "'Times New Roman', serif",
                transform: "scale(0.6)",
                WebkitPrintColorAdjust: "exact",
                printColorAdjust: "exact",
              }}
            >
              {/* 1. Background Image Template */}
              <img
                src="/images/certificate-template.png"
                alt="Template"
                className="absolute inset-0 w-full h-full object-fill z-0"
              />

              {/* 2. Photo Area (Top Right) */}
              <div
                className="absolute overflow-hidden bg-gray-50 flex items-center justify-center"
                style={{
                  top: "441px",
                  right: "77px",
                  width: "129px",
                  height: "164px",
                  zIndex: 10,
                }}
              >
                {candidate.photoUrl ? (
                  <img
                    src={candidate.photoUrl}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-[10px] text-gray-300">PHOTO</span>
                )}
              </div>

              {/* 3. Individual Data Overlays */}
              {/* Adjust 'top' and 'left' values below to match your image lines exactly */}

              {/* Name Field */}
              <div
                className="absolute text-black"
                style={{
                  top: "766px",
                  left: "300px",
                  fontSize: "22px",
                  zIndex: 10,
                }}
              >
                {candidate.name}
              </div>

              {/* Qualification Field */}
              <div
                className="absolute text-black"
                style={{
                  top: "800px",
                  left: "300px",
                  fontSize: "20px",
                  zIndex: 10,
                }}
              >
                {candidate.course}
              </div>

              {/* Registered Number Field */}
              <div
                className="absolute text-black"
                style={{
                  top: "831px",
                  left: "300px",
                  fontSize: "20px",
                  zIndex: 10,
                }}
              >
                {candidate.registrationNumber}
              </div>

              {/* Validity Field */}
              <div
                className="absolute text-black"
                style={{
                  top: "875px",
                  left: "300px",
                  fontSize: "20px",
                  zIndex: 10,
                }}
              >
                {candidate.status === "Issued"
                  ? "31st December 2029"
                  : "........................"}
              </div>

              {/* Date Field (Bottom Left) */}
              <div
                className="absolute text-black"
                style={{
                  bottom: "90px",
                  left: "163px",
                  fontSize: "18px",
                  zIndex: 10,
                }}
              >
                {candidate.issueDate
                  ? new Date(candidate.issueDate).toLocaleDateString("en-GB")
                  : ""}
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 bg-gray-50 print:hidden">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm border bg-white rounded hover:bg-gray-100 cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 px-4 py-2 text-sm bg-slate-800 text-white rounded hover:bg-black cursor-pointer"
          >
            <Printer size={16} /> Print
          </button>
          {candidate.status === "Pending" && (
            <button
              onClick={handleIssueAction}
              disabled={isIssuing}
              className="flex items-center gap-2 px-6 py-2 text-sm bg-blue-900 text-white rounded hover:bg-blue-800 disabled:opacity-50"
            >
              {isIssuing ? (
                <Loader size={16} className="animate-spin" />
              ) : (
                <Send size={16} />
              )}{" "}
              Issue
            </button>
          )}
        </div>
      </div>

      <style jsx global>{`
        @media print {
          @page {
            size: portrait;
            margin: 0;
          }
          body * {
            visibility: hidden;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          #printable-certificate,
          #printable-certificate * {
            visibility: visible;
          }
          #printable-certificate {
            position: fixed;
            left: 0;
            top: 0;
            width: 794px;
            height: 1123px;
            transform: scale(1) !important;
          }
        }
      `}</style>
    </div>
  );
};

// ─── Main Dashboard ──────────────────────────────────────────────────────────
export default function PharmacyIssuePage() {
  const { showToast } = useToast();
  const { showConfirm } = useConfirmDialog();

  const [allData, setAllData] = useState<Candidate[]>(MOCK_DB);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const [previewTarget, setPreviewTarget] = useState<Candidate | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const filteredCandidates = useMemo(() => {
    return allData.filter((c) => {
      const matchesSearch =
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.registrationNumber.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === "All" || c.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [allData, search, statusFilter]);

  const totalPages = Math.ceil(filteredCandidates.length / itemsPerPage);
  const paginatedData = filteredCandidates.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter]);

  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => setLoading(false), 400);
    return () => clearTimeout(timer);
  }, [search, statusFilter]);

  const handleIssueSuccess = (id: string) => {
    setAllData((prev) =>
      prev.map((c) =>
        c._id === id
          ? { ...c, status: "Issued", issueDate: new Date().toISOString() }
          : c,
      ),
    );
  };

  const handleDelete = (id: string) => {
    showConfirm(() => {
      setAllData((prev) => prev.filter((c) => c._id !== id));
      showToast("Candidate removed", "success");
    }, "Remove candidate?");
  };

  return (
    <div className="space-y-6 mx-auto">
      {previewTarget && (
        <IssuePreviewModal
          candidate={previewTarget}
          onClose={() => setPreviewTarget(null)}
          onIssueSuccess={handleIssueSuccess}
        />
      )}

      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-serif font-bold text-blue-900 uppercase tracking-tight">
            Pharmacy Registration
          </h2>
          <p className="text-sm text-gray-500">
            APPC Official Certificate Issuance System (
            {filteredCandidates.length} records)
          </p>
        </div>
      </div>

      <div className="bg-white p-4 rounded-lg shadow-sm flex flex-wrap gap-4 items-center">
        <div className="flex-1 min-w-75 relative">
          <Search className="absolute left-3 top-2.5 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search by name or registration number..."
            className="w-full pl-10 p-2 border border-gray-200 rounded text-sm outline-none focus:ring-1 focus:ring-blue-900"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          className="border border-gray-200 rounded px-4 py-2 text-sm outline-none bg-white"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="All">All Records</option>
          <option value="Pending">Pending</option>
          <option value="Issued">Issued</option>
        </select>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-[11px] uppercase border-b border-gray-200">
                <th className="p-4">Reg ID</th>
                <th className="p-4">Candidate</th>
                <th className="p-4">Qualification</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="p-10 text-center text-gray-400">
                    <Loader className="animate-spin inline mr-2" size={20} />
                    Loading records...
                  </td>
                </tr>
              ) : paginatedData.length > 0 ? (
                paginatedData.map((cand) => (
                  <tr
                    key={cand._id}
                    className="hover:bg-slate-50/50 transition-colors"
                  >
                    <td className="p-4 font-mono text-xs font-bold text-blue-900">
                      {cand.registrationNumber}
                    </td>
                    <td className="p-4 font-semibold">{cand.name}</td>
                    <td className="p-4 text-xs font-bold uppercase">
                      {cand.course}
                    </td>
                    <td className="p-4">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${cand.status === "Issued" ? "bg-green-50 text-green-700 border-green-100" : "bg-amber-50 text-amber-700 border-amber-100"}`}
                      >
                        {cand.status}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => setPreviewTarget(cand)}
                          className={`px-4 py-1.5 rounded text-xs font-bold transition-all cursor-pointer ${cand.status === "Pending" ? "bg-blue-900 text-white hover:bg-blue-800" : "bg-slate-100 text-slate-700 hover:bg-slate-200"}`}
                        >
                          {cand.status === "Pending" ? "Issue" : "Print"}
                        </button>
                        <button
                          onClick={() => handleDelete(cand._id)}
                          className="p-1.5 text-gray-300 hover:text-red-500 transition-colors cursor-pointer"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="p-10 text-center text-gray-500">
                    No candidates found matching your criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {!loading && filteredCandidates.length > 0 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-slate-50/50">
            <div className="text-xs text-gray-500">
              Showing{" "}
              <span className="font-bold text-gray-700">
                {(currentPage - 1) * itemsPerPage + 1}
              </span>{" "}
              to{" "}
              <span className="font-bold text-gray-700">
                {Math.min(
                  currentPage * itemsPerPage,
                  filteredCandidates.length,
                )}
              </span>{" "}
              of{" "}
              <span className="font-bold text-gray-700">
                {filteredCandidates.length}
              </span>{" "}
              entries
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 border rounded bg-white disabled:opacity-50 hover:bg-gray-50 transition-colors"
              >
                ← Prev
              </button>
              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (pageNum) => (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`w-8 h-8 text-xs font-bold rounded transition-all ${currentPage === pageNum ? "bg-blue-900 text-white shadow-md" : "bg-white text-gray-600 border hover:border-blue-900"}`}
                    >
                      {pageNum}
                    </button>
                  ),
                )}
              </div>
              <button
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
                disabled={currentPage === totalPages}
                className="px-3 py-1 border rounded bg-white disabled:opacity-50 hover:bg-gray-50 transition-colors"
              >
                Next →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
