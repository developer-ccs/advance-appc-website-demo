"use client";

import React, { useState } from "react";
import {
  User,
  RefreshCw,
  FileCheck,
  CreditCard,
  UploadCloud,
  CheckCircle2,
  ShieldPlus,
  AlertCircle,
  FileText,
  Download,
  Home,
  Info,
  Camera,
  PenTool,
  ArrowRight,
  ListChecks,
  CalendarClock,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";

export default function RenewalForm() {
  // --- Navigation States ---
  const [hasStarted, setHasStarted] = useState(false);
  const [instructionsAccepted, setInstructionsAccepted] = useState(false);

  const [step, setStep] = useState(1);
  const totalSteps = 3; // Reduced to 3 since Step 1 & 2 are combined

  const [isSubmitted, setIsSubmitted] = useState(false);
  const [referenceId, setReferenceId] = useState("");

  // --- Form State ---
  const [formData, setFormData] = useState({
    name: "",
    registrationNo: "",
    contactNo: "",
    emailId: "",
    address: "",
    renewalPeriod: "5", // Usually renewed for 5 years, making it a default but editable
    wefDate: "",
    toDate: "",
    paymentMethod: "Online",
    transactionId: "",
    paymentDate: "",
    paymentAmount: "500", // Base fee
  });

  // --- Document State ---
  const [documents, setDocuments] = useState({
    photo: null as File | null,
    signature: null as File | null,
    previousCertificate: null as File | null,
    trainingCertificate: null as File | null,
    lifeCertificate: null as File | null, // Optional
  });

  const [declarationAccepted, setDeclarationAccepted] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState("Pending");

  // --- Handlers ---
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    docKey: keyof typeof documents,
  ) => {
    if (e.target.files && e.target.files[0]) {
      setDocuments((prev) => ({ ...prev, [docKey]: e.target.files![0] }));
    }
  };

  // --- Navigation & Submission ---
  const nextStep = () => setStep((prev) => Math.min(prev + 1, totalSteps));
  const prevStep = () => setStep((prev) => Math.max(prev - 1, 1));

  const simulateOnlinePayment = () => {
    setPaymentStatus("Processing");
    setTimeout(() => {
      setPaymentStatus("Success");
      setFormData((prev) => ({
        ...prev,
        transactionId: "TXN" + Math.floor(Math.random() * 1000000000),
        paymentDate: new Date().toISOString().split("T")[0],
      }));
    }, 1500);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!declarationAccepted) {
      alert("Please accept the declaration to submit.");
      return;
    }

    console.log("Submitting Renewal Data: ", formData, documents);
    // Generate Form No. format as per PDF: REW-2026-XXXX
    const generatedRefId = `REW-${new Date().getFullYear()}-${String(
      Math.floor(1000 + Math.random() * 9000),
    ).padStart(4, "0")}`;
    setReferenceId(generatedRefId);

    setIsSubmitted(true);
  };

  const resetForm = () => {
    window.location.reload();
  };

  const stepsList = [
    { title: "Application Details", icon: User },
    { title: "Documents", icon: FileCheck },
    { title: "Payment", icon: CreditCard },
  ];

  return (
    <div className="bg-gray-50 py-10 px-4 sm:px-6 lg:px-8 font-sans">
      {/* BREADCRUMBS */}
      <nav className="max-w-6xl mx-auto mb-6 flex items-center text-sm font-medium text-gray-500">
        <Link
          href="/applicant"
          className="flex items-center hover:text-red-600 transition-colors"
        >
          <Home className="w-4 h-4 mr-1.5 mb-0.5" />
          Home
        </Link>
        <ChevronRight className="w-4 h-4 mx-2 text-gray-400" />
        <span className="text-gray-800">Renewal</span>
      </nav>
      <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
        {/* HEADER (Shared across all views) */}
        {!isSubmitted && (
          <div className="bg-red-700 px-8 py-8 text-white relative overflow-hidden">
            {/* Decorative background element */}
            <div className="absolute top-0 right-0 opacity-10 pointer-events-none transform translate-x-1/4 -translate-y-1/4">
              <RefreshCw size={300} />
            </div>

            <div className="relative z-10 flex items-center space-x-5">
              <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm border border-white/30">
                <RefreshCw className="h-10 w-10 text-white" />
              </div>
              <div>
                <div className="flex items-center space-x-3">
                  <h2 className="text-3xl font-extrabold tracking-tight">
                    Arunachal Pradesh Pharmacy Council
                  </h2>
                </div>
                <p className="mt-1.5 font-medium text-sm flex items-center">
                  <FileText className="w-4 h-4 mr-2" />
                  Application for Renewal of Pharmacist Certificate under
                  Section-34 of the Pharmacy Act, 1948
                </p>
              </div>
            </div>

            {/* CUSTOM ICON STEPPER */}
            {hasStarted && (
              <div className="mt-10 relative z-10 animate-in fade-in slide-in-from-top-4 duration-500">
                <div className="flex justify-between max-w-4xl mx-auto">
                  {stepsList.map((stepItem, i) => {
                    const isActive = step === i + 1;
                    const isCompleted = step > i + 1;
                    const Icon = stepItem.icon;

                    return (
                      <div
                        key={i}
                        className="flex flex-col items-center relative z-10 w-1/3"
                      >
                        <div
                          className={`w-12 h-12 flex items-center justify-center rounded-full border-4 transition-all duration-300 ${
                            isActive
                              ? "bg-white border-red-300 text-red-700 shadow-lg"
                              : isCompleted
                                ? "bg-red-500 border-red-500 text-white"
                                : "bg-white border-red-300 text-red-700"
                          }`}
                        >
                          {isCompleted ? (
                            <CheckCircle2 className="w-6 h-6" />
                          ) : (
                            <Icon className="w-5 h-5" />
                          )}
                        </div>
                        <span className="mt-3 text-xs text-white md:text-sm font-semibold transition-colors duration-300">
                          {stepItem.title}
                        </span>

                        {/* Connecting Line */}
                        {i !== stepsList.length - 1 && (
                          <div
                            className={`absolute top-6 left-1/2 w-full h-1 -z-10 ${
                              isCompleted ? "bg-red-400" : "bg-red-800/50"
                            }`}
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================= */}
        {/* VIEW 1: PREREQUISITES & INSTRUCTIONS      */}
        {/* ========================================= */}
        {!hasStarted && !isSubmitted && (
          <div className="p-8 md:p-12 animate-in fade-in zoom-in-95 duration-500">
            <div className="flex items-center mb-6">
              <div className="bg-red-100 p-3 rounded-full mr-4">
                <Info className="w-6 h-6 text-red-700" />
              </div>
              <h3 className="text-2xl font-extrabold text-gray-900">
                Important Instructions Before Proceeding
              </h3>
            </div>

            <p className="text-gray-600 mb-8 text-lg leading-relaxed">
              Before beginning the renewal application, please ensure you have
              clear, scanned copies of the following original documents ready.
              <br />
              <br />
              <strong>Note:</strong> Personal appearance of the applicant is
              mandatory. If under any circumstance personal appearance is not
              possible, a "Life Certificate" must be uploaded.
            </p>

            {/* Photo & Signature Specs Box */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
              <div className="bg-white border-2 border-red-100 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                <div className="absolute top-0 right-0 bg-red-50 w-24 h-24 rounded-bl-full -z-10 group-hover:bg-red-100 transition-colors"></div>
                <div className="flex items-center mb-4">
                  <Camera className="w-6 h-6 text-red-600 mr-3" />
                  <h4 className="text-lg font-bold text-gray-800">
                    Passport Photo (2 nos)
                  </h4>
                </div>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-start">
                    <CheckCircle2 className="w-4 h-4 text-green-500 mr-2 mt-0.5 shrink-0" />{" "}
                    <span className="font-semibold text-gray-900">
                      Dimensions:
                    </span>{" "}
                    3.5 cm (Width) × 4.5 cm (Height)
                  </li>
                  <li className="flex items-start">
                    <CheckCircle2 className="w-4 h-4 text-green-500 mr-2 mt-0.5 shrink-0" />{" "}
                    <span className="font-semibold text-gray-900">
                      File Size:
                    </span>{" "}
                    50 KB to 200 KB
                  </li>
                  <li className="flex items-start">
                    <CheckCircle2 className="w-4 h-4 text-green-500 mr-2 mt-0.5 shrink-0" />{" "}
                    <span className="text-red-600 font-bold">Crucial:</span>{" "}
                    Name and Date must be inscribed on the photo.
                  </li>
                </ul>
              </div>

              <div className="bg-white border-2 border-red-100 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                <div className="absolute top-0 right-0 bg-red-50 w-24 h-24 rounded-bl-full -z-10 group-hover:bg-red-100 transition-colors"></div>
                <div className="flex items-center mb-4">
                  <PenTool className="w-6 h-6 text-red-600 mr-3" />
                  <h4 className="text-lg font-bold text-gray-800">
                    Digital Signature
                  </h4>
                </div>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-start">
                    <CheckCircle2 className="w-4 h-4 text-green-500 mr-2 mt-0.5 shrink-0" />{" "}
                    <span className="font-semibold text-gray-900">
                      Dimensions:
                    </span>{" "}
                    3.5 cm (Width) × 1.5 cm (Height)
                  </li>
                  <li className="flex items-start">
                    <CheckCircle2 className="w-4 h-4 text-green-500 mr-2 mt-0.5 shrink-0" />{" "}
                    <span className="font-semibold text-gray-900">
                      File Size:
                    </span>{" "}
                    20 KB to 50 KB
                  </li>
                  <li className="flex items-start">
                    <CheckCircle2 className="w-4 h-4 text-green-500 mr-2 mt-0.5 shrink-0" />{" "}
                    Sign on plain white paper using Black/Blue ink.
                  </li>
                </ul>
              </div>
            </div>

            {/* Other Documents List */}
            <div className="bg-gray-50 rounded-xl p-6 border border-gray-200 mb-8">
              <div className="flex items-center mb-4 border-b border-gray-200 pb-3">
                <ListChecks className="w-5 h-5 text-gray-700 mr-2" />
                <h4 className="text-md font-bold text-gray-800 uppercase tracking-wide">
                  Required Documents (PDF/JPG, Max 2MB each)
                </h4>
              </div>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3 text-sm text-gray-700">
                <li className="flex items-start">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-500 mr-2 mt-1.5 shrink-0"></div>{" "}
                  Attested xerox copy of previous renewal/pharmacist
                  registration certificate.
                </li>
                <li className="flex items-start">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-500 mr-2 mt-1.5 shrink-0"></div>{" "}
                  Copy of training certificate (Health Care Delivery & Related)
                  organized by PCI, State Pharmacy Council, IPA, etc.
                </li>
                <li className="flex items-start text-gray-500">
                  <div className="w-1.5 h-1.5 rounded-full bg-gray-400 mr-2 mt-1.5 shrink-0"></div>{" "}
                  Life Certificate (Required ONLY if personal appearance is not
                  possible).
                </li>
              </ul>
            </div>

            {/* Consent & Proceed */}
            <div className="bg-red-50/50 p-5 rounded-xl border border-red-100 flex flex-col md:flex-row items-center justify-between gap-6">
              <label className="flex items-start cursor-pointer group flex-1">
                <input
                  type="checkbox"
                  checked={instructionsAccepted}
                  onChange={(e) => setInstructionsAccepted(e.target.checked)}
                  className="mt-1 h-5 w-5 text-red-600 border-gray-300 rounded focus:ring-red-500 cursor-pointer"
                />
                <span className="ml-3 text-sm font-semibold text-gray-800 group-hover:text-red-900 transition-colors">
                  I acknowledge that I have read the instructions and have all
                  the required documents in the specified formats ready for
                  upload.
                </span>
              </label>

              <button
                type="button"
                onClick={() => setHasStarted(true)}
                disabled={!instructionsAccepted}
                className={`shrink-0 px-8 py-3.5 rounded-lg font-bold text-white shadow-lg transition-all duration-200 flex items-center ${
                  !instructionsAccepted
                    ? "bg-gray-400 cursor-not-allowed shadow-none"
                    : "bg-red-600 hover:bg-red-700 transform hover:-translate-y-0.5 hover:shadow-xl cursor-pointer"
                }`}
              >
                Start Renewal Application{" "}
                <ArrowRight className="ml-2 w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* ========================================= */}
        {/* VIEW 2: APPLICATION FORM                  */}
        {/* ========================================= */}
        {hasStarted && !isSubmitted && (
          <div className="p-8 md:p-10">
            <form
              onSubmit={
                step === totalSteps ? handleSubmit : (e) => e.preventDefault()
              }
            >
              {/* STEP 1: Application Details (Personal & Renewal Info) */}
              {step === 1 && (
                <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <section>
                    <h3 className="text-xl font-bold text-gray-800 flex items-center mb-6">
                      <span className="bg-red-100 text-red-800 w-8 h-8 rounded-full flex items-center justify-center mr-3 text-sm">
                        A
                      </span>
                      Pharmacist Details
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">
                          Applicant Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          className="w-full rounded-lg border border-gray-300 px-4 py-2.5 uppercase transition-colors focus:border-red-500 focus:ring-red-500"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">
                          Registration No.{" "}
                          <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="registrationNo"
                          value={formData.registrationNo}
                          onChange={handleChange}
                          placeholder="e.g. APPC/1234/2018"
                          className="w-full rounded-lg border border-gray-300 px-4 py-2.5 uppercase transition-colors focus:border-red-500 focus:ring-red-500"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">
                          Contact No. <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="tel"
                          name="contactNo"
                          value={formData.contactNo}
                          onChange={handleChange}
                          maxLength={10}
                          className="w-full rounded-lg border border-gray-300 px-4 py-2.5 transition-colors focus:border-red-500 focus:ring-red-500"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">
                          Email ID <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="email"
                          name="emailId"
                          value={formData.emailId}
                          onChange={handleChange}
                          className="w-full rounded-lg border border-gray-300 px-4 py-2.5 transition-colors focus:border-red-500 focus:ring-red-500"
                          required
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-bold text-gray-700 mb-1">
                          Address for Correspondence{" "}
                          <span className="text-red-500">*</span>
                        </label>
                        <textarea
                          name="address"
                          rows={3}
                          value={formData.address}
                          onChange={handleChange}
                          className="w-full rounded-lg border border-gray-300 px-4 py-3 transition-colors focus:border-red-500 focus:ring-red-500"
                          placeholder="Full address including Pincode"
                          required
                        />
                      </div>
                    </div>
                  </section>

                  <section>
                    <h3 className="text-xl font-bold text-gray-800 flex items-center mb-6">
                      <span className="bg-red-100 text-red-800 w-8 h-8 rounded-full flex items-center justify-center mr-3 text-sm">
                        B
                      </span>
                      Renewal Request Particulars
                    </h3>

                    <div className="bg-red-50 p-6 rounded-xl border border-red-100 shadow-sm text-gray-800 leading-relaxed text-lg">
                      "I would like to request you kindly renew my registration
                      certificate for a period of
                      <input
                        type="number"
                        name="renewalPeriod"
                        value={formData.renewalPeriod}
                        onChange={handleChange}
                        className="mx-3 w-16 text-center border-b-2 border-red-300 bg-transparent focus:outline-none focus:border-red-600 font-bold"
                        required
                        min="1"
                      />
                      years, w.e.f (With Effect From)
                      <input
                        type="date"
                        name="wefDate"
                        value={formData.wefDate}
                        onChange={handleChange}
                        className="mx-3 px-2 py-1 text-sm border-b-2 border-red-300 bg-transparent focus:outline-none focus:border-red-600 font-bold cursor-pointer"
                        required
                      />
                      to
                      <input
                        type="date"
                        name="toDate"
                        value={formData.toDate}
                        onChange={handleChange}
                        className="mx-3 px-2 py-1 text-sm border-b-2 border-red-300 bg-transparent focus:outline-none focus:border-red-600 font-bold cursor-pointer"
                        required
                      />
                      ."
                    </div>
                  </section>
                </div>
              )}

              {/* STEP 2: DOCUMENT UPLOAD */}
              {step === 2 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-lg mb-6 flex items-start">
                    <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 mr-3 shrink-0" />
                    <div>
                      <h4 className="text-sm font-bold text-amber-800">
                        Upload Instructions
                      </h4>
                      <p className="text-sm text-amber-700 mt-1">
                        Ensure all documents are self-attested and clear. Photos
                        must have Name & Date inscribed. Max file size: 2MB per
                        document.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {[
                      {
                        key: "previousCertificate",
                        label:
                          "Attested Xerox of Previous Registration/Renewal",
                      },
                      {
                        key: "photo",
                        label: "Passport Photo (with Name & Date)",
                      },
                      { key: "signature", label: "Digital Signature" },
                      {
                        key: "trainingCertificate",
                        label:
                          "Training Cert. (Health Care Delivery & Related)",
                      },
                      {
                        key: "lifeCertificate",
                        label:
                          "Life Certificate (If personal appearance not possible)",
                        optional: true,
                      },
                    ].map((doc) => {
                      const file = documents[
                        doc.key as keyof typeof documents
                      ] as File;
                      const isUploaded = !!file;

                      return (
                        <div
                          key={doc.key}
                          className={`relative group border-2 border-dashed rounded-xl p-5 transition-all ${
                            isUploaded
                              ? "border-green-500 bg-green-50/30"
                              : "border-gray-300 bg-white hover:bg-gray-50 hover:border-red-400"
                          }`}
                        >
                          <div className="flex flex-col items-center text-center relative z-10">
                            {isUploaded ? (
                              <CheckCircle2 className="w-10 h-10 text-green-500 mb-2" />
                            ) : (
                              <UploadCloud className="w-10 h-10 text-gray-400 group-hover:text-red-500 mb-2 transition-colors" />
                            )}

                            <label className="block text-sm font-bold text-gray-700 mb-1">
                              {doc.label}{" "}
                              {!doc.optional && (
                                <span className="text-red-500">*</span>
                              )}
                            </label>

                            {isUploaded ? (
                              <div className="mt-2 text-xs font-semibold text-green-700 bg-green-100 px-3 py-1 rounded-full truncate w-full max-w-50">
                                {file.name}
                              </div>
                            ) : (
                              <span className="text-xs text-gray-500 mt-1">
                                Click or drag file here
                              </span>
                            )}
                          </div>

                          <input
                            type="file"
                            accept=".pdf,.jpg,.jpeg,.png"
                            onChange={(e) =>
                              handleFileChange(
                                e,
                                doc.key as keyof typeof documents,
                              )
                            }
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                            required={!doc.optional && !isUploaded}
                            title={`Upload ${doc.label}`}
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* STEP 3: PAYMENT & DECLARATION */}
              {step === 3 && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <section>
                    <h3 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">
                      Fee Payment Details
                    </h3>

                    <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200 text-sm text-gray-700 flex items-start">
                      <Info className="w-5 h-5 text-gray-500 mr-2 shrink-0 mt-0.5" />
                      <p>
                        <strong>Fee Structure:</strong> Base renewal fee is Rs.
                        500/-. <br />
                        <em>Late Fee:</em> If applicable, a late fee of Rs. 10/-
                        per month will be calculated by the Council during
                        verification. Please pay the base fee now or include
                        calculated late fees if you are aware of the duration.
                      </p>
                    </div>

                    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                      <div className="bg-slate-800 p-4 flex justify-between items-center px-6">
                        <h4 className="text-lg font-bold text-white">
                          Amount Payable:
                        </h4>
                        <div className="flex items-center">
                          <span className="text-white text-lg mr-2 font-bold">
                            ₹
                          </span>
                          <input
                            type="number"
                            name="paymentAmount"
                            value={formData.paymentAmount}
                            onChange={handleChange}
                            className="bg-slate-700 text-green-400 text-xl font-bold px-3 py-1 rounded w-28 text-right outline-none focus:ring-2 focus:ring-green-400 border border-slate-600"
                          />
                        </div>
                      </div>

                      <div className="p-6">
                        <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-6 mb-8">
                          <label
                            className={`flex-1 flex items-center p-4 rounded-xl border-2 cursor-pointer transition-all ${
                              formData.paymentMethod === "Online"
                                ? "border-red-600 bg-red-50"
                                : "border-gray-200 hover:border-red-300"
                            }`}
                          >
                            <input
                              type="radio"
                              name="paymentMethod"
                              value="Online"
                              checked={formData.paymentMethod === "Online"}
                              onChange={handleChange}
                              className="h-5 w-5 text-red-600 focus:ring-red-500"
                            />
                            <div className="ml-4">
                              <span className="block font-bold text-gray-900">
                                Online Payment
                              </span>
                              <span className="block text-xs text-gray-500 mt-0.5">
                                UPI, Cards, NetBanking (Gateway)
                              </span>
                            </div>
                          </label>

                          <label
                            className={`flex-1 flex items-center p-4 rounded-xl border-2 cursor-pointer transition-all ${
                              formData.paymentMethod === "Manual"
                                ? "border-red-600 bg-red-50"
                                : "border-gray-200 hover:border-red-300"
                            }`}
                          >
                            <input
                              type="radio"
                              name="paymentMethod"
                              value="Manual"
                              checked={formData.paymentMethod === "Manual"}
                              onChange={handleChange}
                              className="h-5 w-5 text-red-600 focus:ring-red-500"
                            />
                            <div className="ml-4">
                              <span className="block font-bold text-gray-900">
                                Demand Draft / Manual
                              </span>
                              <span className="block text-xs text-gray-500 mt-0.5">
                                DD or NEFT to Council Bank A/C
                              </span>
                            </div>
                          </label>
                        </div>

                        {formData.paymentMethod === "Online" ? (
                          <div className="flex justify-center items-center py-6">
                            {paymentStatus === "Pending" && (
                              <button
                                type="button"
                                onClick={simulateOnlinePayment}
                                className="bg-slate-800 text-white px-8 py-3 rounded-lg font-bold hover:bg-slate-900 cursor-pointer transition shadow-lg flex items-center"
                              >
                                <CreditCard className="mr-2" /> Pay ₹
                                {formData.paymentAmount} Securely
                              </button>
                            )}
                            {paymentStatus === "Processing" && (
                              <div className="flex items-center text-red-600 font-bold animate-pulse">
                                <div className="w-6 h-6 border-4 border-red-600 border-t-transparent rounded-full animate-spin mr-3"></div>
                                Processing secure payment...
                              </div>
                            )}
                            {paymentStatus === "Success" && (
                              <div className="bg-green-50 text-green-800 p-5 rounded-xl font-bold flex flex-col items-center border border-green-200 w-full justify-center">
                                <div className="flex items-center">
                                  <CheckCircle2 className="w-6 h-6 mr-2 text-green-600" />
                                  Payment Successful!
                                </div>
                                <span className="text-sm font-medium mt-1 text-green-700">
                                  TXN ID: {formData.transactionId}
                                </span>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                              <div>
                                <h5 className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-3">
                                  Payment Details
                                </h5>
                                <ul className="space-y-2 text-sm text-gray-600">
                                  <li>
                                    <strong className="text-gray-800">
                                      In favor of:
                                    </strong>{" "}
                                    Registrar, APPC
                                  </li>
                                  <li>
                                    <strong className="text-gray-800">
                                      Bank:
                                    </strong>{" "}
                                    State Bank of India
                                  </li>
                                  <li>
                                    <strong className="text-gray-800">
                                      Branch:
                                    </strong>{" "}
                                    Naharlagun
                                  </li>
                                  <li>
                                    <strong className="text-gray-800">
                                      Account No:
                                    </strong>{" "}
                                    10333780667
                                  </li>
                                  <li>
                                    <strong className="text-gray-800">
                                      IFSC Code:
                                    </strong>{" "}
                                    SBIN0003232
                                  </li>
                                </ul>
                              </div>
                              <div className="space-y-4">
                                <div>
                                  <label className="block text-sm font-bold text-gray-700 mb-1">
                                    DD No. / UTR / Reference No.{" "}
                                    <span className="text-red-500">*</span>
                                  </label>
                                  <input
                                    type="text"
                                    name="transactionId"
                                    value={formData.transactionId}
                                    onChange={handleChange}
                                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-red-500 focus:ring-red-500"
                                    required
                                  />
                                </div>
                                <div>
                                  <label className="block text-sm font-bold text-gray-700 mb-1">
                                    Date of Payment/DD{" "}
                                    <span className="text-red-500">*</span>
                                  </label>
                                  <input
                                    type="date"
                                    name="paymentDate"
                                    value={formData.paymentDate}
                                    onChange={handleChange}
                                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-red-500 focus:ring-red-500"
                                    required
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </section>

                  {/* Final Declaration */}
                  <section>
                    <div className="bg-red-50 border border-red-100 p-6 rounded-xl mt-8 relative overflow-hidden">
                      <div className="absolute top-0 left-0 w-2 h-full bg-red-500"></div>
                      <div className="flex items-start pl-4">
                        <div className="flex items-center h-6">
                          <input
                            type="checkbox"
                            id="declaration"
                            checked={declarationAccepted}
                            onChange={(e) =>
                              setDeclarationAccepted(e.target.checked)
                            }
                            className="h-5 w-5 text-red-600 border-gray-300 rounded focus:ring-red-500 cursor-pointer"
                          />
                        </div>
                        <div className="ml-4">
                          <label
                            htmlFor="declaration"
                            className="font-bold text-red-900 text-lg cursor-pointer"
                          >
                            Final Declaration
                          </label>
                          <p className="mt-2 text-sm text-red-800/80 leading-relaxed font-medium">
                            I declare that the particulars given above are true
                            and correct to the best of my knowledge. I have
                            attached the necessary demand draft / payment proof
                            and requested documents. I understand that my
                            original documents will be verified, and any false
                            information may lead to rejection.
                          </p>
                        </div>
                      </div>
                    </div>
                  </section>
                </div>
              )}

              {/* ACTION BUTTONS (FOOTER) */}
              <div className="mt-12 flex items-center justify-between pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={prevStep}
                  disabled={step === 1}
                  className={`px-6 py-2.5 rounded-lg font-bold transition-all duration-200 ${
                    step === 1
                      ? "opacity-0 cursor-default"
                      : "bg-white border-2 border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-gray-900 hover:border-gray-300 shadow-sm cursor-pointer"
                  }`}
                >
                  ← Back
                </button>

                {step < totalSteps ? (
                  <button
                    type="button"
                    onClick={nextStep}
                    className="px-8 py-2.5 rounded-lg font-bold bg-red-700 text-white hover:bg-red-800 shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5 cursor-pointer flex items-center"
                  >
                    Save & Continue <ArrowRight className="ml-2 w-4 h-4" />
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={
                      (formData.paymentMethod === "Online" &&
                        paymentStatus !== "Success") ||
                      !declarationAccepted
                    }
                    className={`px-8 py-3 rounded-lg font-bold text-white shadow-lg transition-all duration-200 flex items-center ${
                      (formData.paymentMethod === "Online" &&
                        paymentStatus !== "Success") ||
                      !declarationAccepted
                        ? "bg-gray-400 cursor-not-allowed shadow-none"
                        : "bg-red-600 hover:bg-red-700 transform hover:-translate-y-0.5 hover:shadow-xl cursor-pointer"
                    }`}
                  >
                    <FileCheck className="mr-2 h-5 w-5" />
                    Submit Final Application
                  </button>
                )}
              </div>
            </form>
          </div>
        )}

        {/* ========================================= */}
        {/* VIEW 3: SUCCESS SUBMISSION SCREEN         */}
        {/* ========================================= */}
        {isSubmitted && (
          <div className="bg-white px-8 py-16 flex flex-col items-center justify-center text-center animate-in fade-in zoom-in-95 duration-500">
            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-6 shadow-sm">
              <CheckCircle2 className="w-12 h-12 text-green-600" />
            </div>

            <h2 className="text-3xl font-extrabold text-gray-900 mb-3">
              Renewal Form Submitted Successfully!
            </h2>

            <p className="text-gray-500 mb-8 max-w-lg text-sm md:text-base leading-relaxed">
              Thank you,{" "}
              <strong className="text-gray-800">
                {formData.name || "Applicant"}
              </strong>
              . Your application for Renewal of Pharmacist Certificate under
              Section-34 of the Pharmacy Act has been securely received.
            </p>

            <div className="bg-red-50 border border-red-100 rounded-2xl p-6 w-full max-w-md mb-10 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-2 h-full bg-red-500"></div>
              <p className="text-xs text-red-600 font-bold uppercase tracking-widest mb-1">
                Application Form No
              </p>
              <p className="text-3xl font-black text-red-900 tracking-tight">
                {referenceId}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row w-full max-w-md space-y-4 sm:space-y-0 sm:space-x-4">
              <button
                type="button"
                className="flex-1 flex items-center justify-center px-6 py-3.5 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 transition shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 cursor-pointer"
              >
                <Download className="w-5 h-5 mr-2" />
                Print Form
              </button>

              <button
                type="button"
                onClick={resetForm}
                className="flex-1 flex items-center justify-center px-6 py-3.5 bg-white border-2 border-gray-200 text-gray-700 font-bold rounded-lg hover:bg-gray-50 hover:border-gray-300 transition cursor-pointer"
              >
                <Home className="w-5 h-5 mr-2" />
                Return to Home
              </button>
            </div>

            <div className="mt-12 p-5 bg-amber-50 rounded-xl max-w-2xl border border-amber-200 flex text-left shadow-sm">
              <AlertCircle className="w-6 h-6 text-amber-500 shrink-0 mr-4 mt-0.5" />
              <p className="text-sm text-amber-800 leading-relaxed">
                <strong>Next Steps:</strong> Please keep your Form No safe.
                Personal appearance of the applicant is mandatory at the APPC
                office for verification, unless a Life Certificate was uploaded.
                You will be notified regarding your certificate processing.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Help Footer */}
      <p className="text-center text-sm text-gray-400 mt-8">
        Need assistance? Contact the APPC Technical Support at{" "}
        <a href="#" className="text-red-600 hover:underline">
          support@appc.gov.in
        </a>
      </p>
    </div>
  );
}
