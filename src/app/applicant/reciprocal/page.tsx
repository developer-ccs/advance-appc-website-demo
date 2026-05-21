"use client";

import React, { useState } from "react";
import {
  User,
  GraduationCap,
  FileCheck,
  CreditCard,
  UploadCloud,
  PlusCircle,
  Trash2,
  CheckCircle2,
  ShieldPlus,
  Building2,
  AlertCircle,
  FileText,
  Download,
  Home,
  Info,
  Camera,
  PenTool,
  ArrowRight,
  ListChecks,
  ArrowRightLeft,
  MapPin,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";

export default function ReciprocalForm() {
  // --- Navigation States ---
  const [hasStarted, setHasStarted] = useState(false);
  const [instructionsAccepted, setInstructionsAccepted] = useState(false);

  const [step, setStep] = useState(1);
  const totalSteps = 4;

  const [isSubmitted, setIsSubmitted] = useState(false);
  const [referenceId, setReferenceId] = useState("");

  // --- Form State ---
  const [formData, setFormData] = useState({
    applicantName: "",
    fathersName: "",
    dob: "",
    nationality: "Indian",
    permanentAddress: "",
    communicationAddress: "",
    sameAsPermanent: false,
    mobileNo: "",
    previousCouncilName: "", // For reciprocal transfer
    isEmployed: "No",
    designation: "",
    professionalAddress: "",
    place: "",
    academics: [
      { id: 1, qualification: "", year: "", institution: "", examination: "" },
    ],
    paymentMethod: "Online",
    transactionId: "",
  });

  // --- Document Upload State ---
  const [documents, setDocuments] = useState({
    photo: null as File | null,
    signature: null as File | null,
    ageProof: null as File | null,
    classXII: null as File | null,
    pharmacyDegree: null as File | null,
    originalRegCert: null as File | null, // Unique to Reciprocal
    affidavit: null as File | null, // Annex-I
    paymentProof: null as File | null,
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

  const handleAddressCheckbox = (e: React.ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked;
    setFormData((prev) => ({
      ...prev,
      sameAsPermanent: checked,
      communicationAddress: checked
        ? prev.permanentAddress
        : prev.communicationAddress,
    }));
  };

  const handleAcademicChange = (
    index: number,
    field: string,
    value: string,
  ) => {
    const newAcademics = [...formData.academics];
    newAcademics[index] = { ...newAcademics[index], [field]: value };
    setFormData((prev) => ({ ...prev, academics: newAcademics }));
  };

  const addAcademicRow = () => {
    setFormData((prev) => ({
      ...prev,
      academics: [
        ...prev.academics,
        {
          id: Date.now(),
          qualification: "",
          year: "",
          institution: "",
          examination: "",
        },
      ],
    }));
  };

  const removeAcademicRow = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      academics: prev.academics.filter((_, i) => i !== index),
    }));
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
      }));
    }, 1500);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!declarationAccepted) {
      alert("Please accept the declaration to submit.");
      return;
    }

    // Simulate API call & generate Reference ID (REC-2026-XXXX format)
    console.log("Submitting Reciprocal Data: ", formData, documents);
    const generatedRefId = `REC-${new Date().getFullYear()}-${String(
      Math.floor(1000 + Math.random() * 9000),
    ).padStart(4, "0")}`;
    setReferenceId(generatedRefId);

    // Transition to success screen
    setIsSubmitted(true);
  };

  const resetForm = () => {
    window.location.reload();
  };

  const stepsList = [
    { title: "Personal Info", icon: User },
    { title: "Academics", icon: GraduationCap },
    { title: "Documents", icon: FileCheck },
    { title: "Payment", icon: CreditCard },
  ];

  return (
    <div className="bg-gray-50 py-10 px-4 sm:px-6 lg:px-8 font-sans">
      {/* BREADCRUMBS */}
      <nav className="max-w-6xl mx-auto mb-6 flex items-center text-sm font-medium text-gray-500">
        <Link
          href="/applicant"
          className="flex items-center hover:text-indigo-600 transition-colors"
        >
          <Home className="w-4 h-4 mr-1.5 mb-0.5" />
          Home
        </Link>
        <ChevronRight className="w-4 h-4 mx-2 text-gray-400" />
        <span className="text-gray-800">Reciprocal</span>
      </nav>
      <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
        {/* HEADER (Shared across all views) */}
        {!isSubmitted && (
          <div className="bg-indigo-900 px-8 py-8 text-white relative overflow-hidden">
            {/* Decorative background element */}
            <div className="absolute top-0 right-0 opacity-10 pointer-events-none transform translate-x-1/4 -translate-y-1/4">
              <ArrowRightLeft size={300} />
            </div>

            <div className="relative z-10 flex items-center space-x-5">
              <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm border border-white/30">
                <ArrowRightLeft className="h-10 w-10 text-white" />
              </div>
              <div>
                <div className="flex items-center space-x-3">
                  <h2 className="text-3xl font-extrabold tracking-tight">
                    Arunachal Pradesh Pharmacy Council
                  </h2>
                </div>
                <p className="mt-1.5 font-medium text-sm flex items-center">
                  <FileText className="w-4 h-4 mr-2" />
                  Application for Registration under Reciprocal Basis (Section
                  32(2) of Pharmacy Act 1948)
                </p>
              </div>
            </div>

            {/* CUSTOM ICON STEPPER */}
            {hasStarted && (
              <div className="mt-10 relative z-10 animate-in fade-in slide-in-from-top-4 duration-500">
                <div className="flex justify-between">
                  {stepsList.map((stepItem, i) => {
                    const isActive = step === i + 1;
                    const isCompleted = step > i + 1;
                    const Icon = stepItem.icon;

                    return (
                      <div
                        key={i}
                        className="flex flex-col items-center relative z-10 w-1/4"
                      >
                        <div
                          className={`w-12 h-12 flex items-center justify-center rounded-full border-4 transition-all duration-300 ${
                            isActive
                              ? "bg-white border-indigo-300 text-indigo-800 shadow-lg"
                              : isCompleted
                                ? "bg-indigo-500 border-indigo-500 text-white"
                                : "bg-white border-indigo-300 text-indigo-800"
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
                              isCompleted ? "bg-indigo-500" : "bg-indigo-400"
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
              <div className="bg-indigo-100 p-3 rounded-full mr-4">
                <Info className="w-6 h-6 text-indigo-700" />
              </div>
              <h3 className="text-2xl font-extrabold text-gray-900">
                Important Instructions for Reciprocal Transfer
              </h3>
            </div>

            <p className="text-gray-600 mb-8 text-lg leading-relaxed">
              If you are already registered with another State Pharmacy Council
              and wish to transfer your registration to Arunachal Pradesh,
              please ensure you have the following original documents ready for
              scanning and upload.
            </p>

            {/* Photo & Signature Specs Box */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="bg-white border-2 border-indigo-100 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                <div className="absolute top-0 right-0 bg-indigo-50 w-24 h-24 rounded-bl-full -z-10 group-hover:bg-indigo-100 transition-colors"></div>
                <div className="flex items-center mb-4">
                  <Camera className="w-6 h-6 text-indigo-600 mr-3" />
                  <h4 className="text-lg font-bold text-gray-800">
                    Passport Photo
                  </h4>
                </div>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-start">
                    <CheckCircle2 className="w-4 h-4 text-green-500 mr-2 mt-0.5 shrink-0" />{" "}
                    Upload 1 digital copy (50-200 KB, JPG/PNG).
                  </li>
                  <li className="flex items-start">
                    <CheckCircle2 className="w-4 h-4 text-green-500 mr-2 mt-0.5 shrink-0" />{" "}
                    <span className="text-red-600 font-semibold">
                      Important:
                    </span>{" "}
                    Name and Date must be inscribed on the photo.
                  </li>
                  <li className="flex items-start">
                    <CheckCircle2 className="w-4 h-4 text-green-500 mr-2 mt-0.5 shrink-0" />{" "}
                    You will need to provide <strong>3 physical copies</strong>{" "}
                    during verification.
                  </li>
                </ul>
              </div>

              <div className="bg-white border-2 border-indigo-100 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                <div className="absolute top-0 right-0 bg-indigo-50 w-24 h-24 rounded-bl-full -z-10 group-hover:bg-indigo-100 transition-colors"></div>
                <div className="flex items-center mb-4">
                  <PenTool className="w-6 h-6 text-indigo-600 mr-3" />
                  <h4 className="text-lg font-bold text-gray-800">Signature</h4>
                </div>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-start">
                    <CheckCircle2 className="w-4 h-4 text-green-500 mr-2 mt-0.5 shrink-0" />{" "}
                    Dimensions: 3.5 cm × 1.5 cm.
                  </li>
                  <li className="flex items-start">
                    <CheckCircle2 className="w-4 h-4 text-green-500 mr-2 mt-0.5 shrink-0" />{" "}
                    File Size: 20 KB to 50 KB (JPG/PNG).
                  </li>
                  <li className="flex items-start">
                    <CheckCircle2 className="w-4 h-4 text-green-500 mr-2 mt-0.5 shrink-0" />{" "}
                    Sign on a plain white paper using Black/Dark Blue ink.
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
                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mr-2 mt-1.5 shrink-0"></div>{" "}
                  <strong className="text-indigo-900">
                    Original Registration Certificate
                  </strong>{" "}
                  issued by the earlier state council.
                </li>
                <li className="flex items-start">
                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mr-2 mt-1.5 shrink-0"></div>{" "}
                  <strong className="text-indigo-900">
                    Affidavit (Annex-I)
                  </strong>{" "}
                  on Rs 20.00 Non-Judicial stamp paper.
                </li>
                <li className="flex items-start">
                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mr-2 mt-1.5 shrink-0"></div>{" "}
                  Passed Certificate & Marksheet
                  (D.Pharm/B.Pharm/M.Pharm/Pharm.D).
                </li>
                <li className="flex items-start">
                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mr-2 mt-1.5 shrink-0"></div>{" "}
                  Age proof certificate (Class X / Matriculation).
                </li>
                <li className="flex items-start">
                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mr-2 mt-1.5 shrink-0"></div>{" "}
                  Class XII Pass Certificate & Marksheet.
                </li>
              </ul>
            </div>

            {/* Consent & Proceed */}
            <div className="bg-indigo-50/50 p-5 rounded-xl border border-indigo-100 flex flex-col md:flex-row items-center justify-between gap-6">
              <label className="flex items-start cursor-pointer group flex-1">
                <input
                  type="checkbox"
                  checked={instructionsAccepted}
                  onChange={(e) => setInstructionsAccepted(e.target.checked)}
                  className="mt-1 h-5 w-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 cursor-pointer"
                />
                <span className="ml-3 text-sm font-semibold text-gray-800 group-hover:text-indigo-900 transition-colors">
                  I acknowledge that personal appearance is mandatory and I have
                  all required documents, including the Original Registration
                  Certificate and Affidavit, ready.
                </span>
              </label>

              <button
                type="button"
                onClick={() => setHasStarted(true)}
                disabled={!instructionsAccepted}
                className={`shrink-0 px-8 py-3.5 rounded-lg font-bold text-white shadow-lg transition-all duration-200 flex items-center ${
                  !instructionsAccepted
                    ? "bg-gray-400 cursor-not-allowed shadow-none"
                    : "bg-indigo-600 hover:bg-indigo-700 transform hover:-translate-y-0.5 hover:shadow-xl cursor-pointer"
                }`}
              >
                Start Reciprocal Transfer{" "}
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
              {/* STEP 1: Personal & Professional Details */}
              {step === 1 && (
                <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <section>
                    <h3 className="text-xl font-bold text-gray-800 flex items-center mb-6">
                      <span className="bg-indigo-100 text-indigo-800 w-8 h-8 rounded-full flex items-center justify-center mr-3 text-sm">
                        1
                      </span>
                      Applicant Particulars
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">
                          Applicant Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="applicantName"
                          value={formData.applicantName}
                          onChange={handleChange}
                          className="w-full rounded-lg border border-gray-300 px-4 py-2.5 uppercase transition-colors focus:border-indigo-500 focus:ring-indigo-500"
                          placeholder="IN CAPITAL LETTERS"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">
                          Father's Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="fathersName"
                          value={formData.fathersName}
                          onChange={handleChange}
                          className="w-full rounded-lg border border-gray-300 px-4 py-2.5 uppercase transition-colors focus:border-indigo-500 focus:ring-indigo-500"
                          placeholder="IN CAPITAL LETTERS"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">
                          Date of Birth <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="date"
                          name="dob"
                          value={formData.dob}
                          onChange={handleChange}
                          className="w-full rounded-lg border border-gray-300 px-4 py-2.5 transition-colors focus:border-indigo-500 focus:ring-indigo-500"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">
                          Nationality
                        </label>
                        <input
                          type="text"
                          name="nationality"
                          value={formData.nationality}
                          onChange={handleChange}
                          className="w-full rounded-lg border border-gray-300 px-4 py-2.5 transition-colors focus:border-indigo-500 focus:ring-indigo-500"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">
                          Mobile No. <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="tel"
                          name="mobileNo"
                          maxLength={10}
                          value={formData.mobileNo}
                          onChange={handleChange}
                          className="w-full rounded-lg border border-gray-300 px-4 py-2.5 transition-colors focus:border-indigo-500 focus:ring-indigo-500"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-indigo-800 mb-1">
                          Previous State Pharmacy Council{" "}
                          <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="previousCouncilName"
                          value={formData.previousCouncilName}
                          onChange={handleChange}
                          placeholder="e.g. Assam Pharmacy Council"
                          className="w-full rounded-lg border border-indigo-300 bg-indigo-50 px-4 py-2.5 transition-colors focus:border-indigo-600 focus:ring-indigo-600"
                          required
                        />
                      </div>
                    </div>

                    {/* Address Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-6 bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">
                          Permanent Address{" "}
                          <span className="text-red-500">*</span>
                        </label>
                        <textarea
                          name="permanentAddress"
                          rows={3}
                          value={formData.permanentAddress}
                          onChange={handleChange}
                          className="w-full rounded-lg border border-gray-300 px-4 py-3 transition-colors focus:border-indigo-500 focus:ring-indigo-500"
                          placeholder="House No, Street, Village/Town, District, Pincode"
                          required
                        />
                      </div>

                      <div className="flex flex-col">
                        <div className="flex items-center justify-between mb-1">
                          <label className="block text-sm font-bold text-gray-700">
                            Present Address{" "}
                            <span className="text-red-500">*</span>
                          </label>
                          <label className="flex items-center cursor-pointer group">
                            <input
                              type="checkbox"
                              checked={formData.sameAsPermanent}
                              onChange={handleAddressCheckbox}
                              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded cursor-pointer"
                            />
                            <span className="ml-2 text-xs font-semibold text-indigo-700 group-hover:text-indigo-800">
                              Same as Permanent
                            </span>
                          </label>
                        </div>
                        <textarea
                          name="communicationAddress"
                          rows={3}
                          value={formData.communicationAddress}
                          onChange={handleChange}
                          disabled={formData.sameAsPermanent}
                          className={`w-full rounded-lg border px-4 py-3 transition-colors ${
                            formData.sameAsPermanent
                              ? "bg-indigo-50 border-indigo-100 text-indigo-800"
                              : "border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                          }`}
                          required
                        />
                      </div>
                    </div>
                  </section>

                  {/* Professional Information */}
                  <section>
                    <h3 className="text-xl font-bold text-gray-800 flex items-center mb-6">
                      <span className="bg-indigo-100 text-indigo-800 w-8 h-8 rounded-full flex items-center justify-center mr-3 text-sm">
                        2
                      </span>
                      Employment Details
                    </h3>

                    <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                      <label className="block text-sm font-bold text-gray-700 mb-3">
                        Are you currently employed?
                      </label>
                      <div className="flex space-x-8 mb-6">
                        <label className="flex items-center p-3 flex-1 md:flex-none md:w-40 transition-colors cursor-pointer">
                          <input
                            type="radio"
                            name="isEmployed"
                            value="Yes"
                            checked={formData.isEmployed === "Yes"}
                            onChange={handleChange}
                            className="h-5 w-5 text-indigo-600 focus:ring-indigo-500 border-gray-300 cursor-pointer"
                          />
                          <span className="ml-3 font-medium text-gray-800">
                            Yes
                          </span>
                        </label>
                        <label className="flex items-center p-3 flex-1 md:flex-none md:w-40 transition-colors cursor-pointer">
                          <input
                            type="radio"
                            name="isEmployed"
                            value="No"
                            checked={formData.isEmployed === "No"}
                            onChange={handleChange}
                            className="h-5 w-5 text-indigo-600 focus:ring-indigo-500 border-gray-300 cursor-pointer"
                          />
                          <span className="ml-3 font-medium text-gray-800">
                            No
                          </span>
                        </label>
                      </div>

                      {formData.isEmployed === "Yes" && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-indigo-50 rounded-xl border border-indigo-100 animate-in fade-in">
                          <div>
                            <label className="text-sm font-bold text-indigo-900 mb-1 flex items-center">
                              <Building2 className="w-4 h-4 mr-1.5" />{" "}
                              Designation
                            </label>
                            <input
                              type="text"
                              name="designation"
                              value={formData.designation}
                              onChange={handleChange}
                              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-indigo-500 focus:ring-indigo-500"
                              placeholder="e.g. Pharmacist / Manager"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-bold text-indigo-900 mb-1">
                              Professional Address
                            </label>
                            <textarea
                              name="professionalAddress"
                              rows={2}
                              value={formData.professionalAddress}
                              onChange={handleChange}
                              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-indigo-500 focus:ring-indigo-500"
                              placeholder="Full address of workplace/pharmacy"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </section>
                </div>
              )}

              {/* STEP 2: Academics */}
              {step === 2 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="flex justify-between items-end mb-6">
                    <h3 className="text-xl font-bold text-gray-800 flex items-center">
                      <GraduationCap className="text-indigo-700 w-6 h-6 mr-2" />
                      Academic Qualifications (Class-X Onwards)
                    </h3>
                  </div>

                  <div className="space-y-4">
                    {formData.academics.map((row, index) => (
                      <div
                        key={row.id}
                        className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start p-5 border border-gray-200 rounded-xl bg-white shadow-sm relative group transition-colors"
                      >
                        {/* Qualification Dropdown */}
                        <div className="md:col-span-3">
                          <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1">
                            Qualification
                          </label>
                          <select
                            value={row.qualification}
                            onChange={(e) =>
                              handleAcademicChange(
                                index,
                                "qualification",
                                e.target.value,
                              )
                            }
                            className="block w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm font-medium focus:border-indigo-500 focus:ring-indigo-500"
                            required
                          >
                            <option value="">Select Level...</option>
                            <option value="Class X">
                              Class X (Matriculation)
                            </option>
                            <option value="Class XII">
                              Class XII (10+2 Science)
                            </option>
                            <option value="D.Pharm">D.Pharm (Diploma)</option>
                            <option value="B.Pharm">B.Pharm (Degree)</option>
                            <option value="M.Pharm">M.Pharm (Masters)</option>
                            <option value="Pharm.D">Pharm.D (Doctorate)</option>
                          </select>
                        </div>

                        {/* Passing Year */}
                        <div className="md:col-span-2">
                          <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1">
                            Passing Year
                          </label>
                          <input
                            type="text"
                            placeholder="YYYY"
                            maxLength={4}
                            value={row.year}
                            onChange={(e) =>
                              handleAcademicChange(
                                index,
                                "year",
                                e.target.value,
                              )
                            }
                            className="block w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-indigo-500 focus:ring-indigo-500"
                            required
                          />
                        </div>

                        {/* Institution */}
                        <div className="md:col-span-3">
                          <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1">
                            Institution Name
                          </label>
                          <input
                            type="text"
                            placeholder="School/College Name"
                            value={row.institution}
                            onChange={(e) =>
                              handleAcademicChange(
                                index,
                                "institution",
                                e.target.value,
                              )
                            }
                            className="block w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-indigo-500 focus:ring-indigo-500"
                            required
                          />
                        </div>

                        {/* Board/University */}
                        <div className="md:col-span-3">
                          <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1">
                            Name of Examination
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. CBSE / Board Name"
                            value={row.examination}
                            onChange={(e) =>
                              handleAcademicChange(
                                index,
                                "examination",
                                e.target.value,
                              )
                            }
                            className="block w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-indigo-500 focus:ring-indigo-500"
                            required
                          />
                        </div>

                        {/* Delete Button */}
                        <div className="md:col-span-1 flex justify-end md:mt-6">
                          {index > 0 && (
                            <button
                              type="button"
                              onClick={() => removeAcademicRow(index)}
                              className="text-red-400 hover:text-red-600 p-2 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
                              title="Remove Row"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}

                    <button
                      type="button"
                      onClick={addAcademicRow}
                      className="mt-4 flex items-center justify-center w-full py-3 border-2 border-dashed border-indigo-300 rounded-xl text-sm font-bold text-indigo-700 hover:bg-indigo-50 hover:border-indigo-500 cursor-pointer transition-all"
                    >
                      <PlusCircle className="w-5 h-5 mr-2" /> Add Additional
                      Qualification
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 3: DOCUMENT UPLOAD */}
              {step === 3 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-lg mb-6 flex items-start">
                    <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 mr-3 shrink-0" />
                    <div>
                      <h4 className="text-sm font-bold text-amber-800">
                        Upload Instructions
                      </h4>
                      <p className="text-sm text-amber-700 mt-1">
                        Upload clear copies of original documents. Remember, you
                        must bring the physical{" "}
                        <strong className="text-gray-900">
                          Original Registration Certificate
                        </strong>{" "}
                        and{" "}
                        <strong className="text-gray-900">
                          Annexure-I Affidavit
                        </strong>{" "}
                        during personal verification.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {[
                      {
                        key: "originalRegCert",
                        label: "Original Reg. Certificate (Earlier Council)",
                      },
                      {
                        key: "affidavit",
                        label: "Affidavit (Annexure-I) on Rs 20 Stamp Paper",
                      },
                      {
                        key: "photo",
                        label: "Passport Photo (with Name & Date)",
                      },
                      { key: "signature", label: "Signature" },
                      {
                        key: "pharmacyDegree",
                        label: "Pharmacy Degree/Diploma & Marksheet",
                      },
                      {
                        key: "ageProof",
                        label: "Class X Certificate (Age Proof)",
                      },
                      {
                        key: "classXII",
                        label: "Class XII Certificate & Marksheet",
                      },
                    ].map((doc) => {
                      const file = documents[
                        doc.key as keyof typeof documents
                      ] as File;
                      const isUploaded = !!file;
                      const isSpecial =
                        doc.key === "originalRegCert" ||
                        doc.key === "affidavit";

                      return (
                        <div
                          key={doc.key}
                          className={`relative group border-2 border-dashed rounded-xl p-5 transition-all ${
                            isUploaded
                              ? "border-green-500 bg-green-50/30"
                              : "border-gray-300 bg-white hover:bg-gray-50 hover:border-indigo-400"
                          }`}
                        >
                          <div className="flex flex-col items-center text-center relative z-10">
                            {isUploaded ? (
                              <CheckCircle2 className="w-10 h-10 text-green-500 mb-2" />
                            ) : (
                              <UploadCloud className="w-10 h-10 mb-2 transition-colors text-gray-400 group-hover:text-indigo-500" />
                            )}

                            <label className="block text-sm font-bold mb-1 text-gray-700">
                              {doc.label}{" "}
                              <span className="text-red-500">*</span>
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
                            required={!isUploaded}
                            title={`Upload ${doc.label}`}
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* STEP 4: PAYMENT & DECLARATION */}
              {step === 4 && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  {/* Payment Section */}
                  <section>
                    <h3 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">
                      Reciprocal Fee Payment
                    </h3>

                    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                      <div className="bg-slate-800 p-4 text-center">
                        <h4 className="text-lg font-bold text-white flex justify-center items-center">
                          Prescribed Fee Payable:{" "}
                          <span className="text-indigo-400 ml-2 text-2xl">
                            ₹ 1,000.00
                          </span>
                        </h4>
                      </div>

                      <div className="p-6">
                        <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-6 mb-8">
                          <label
                            className={`flex-1 flex items-center p-4 rounded-xl border-2 cursor-pointer transition-all ${
                              formData.paymentMethod === "Online"
                                ? "border-indigo-600 bg-indigo-50"
                                : "border-gray-200 hover:border-indigo-300"
                            }`}
                          >
                            <input
                              type="radio"
                              name="paymentMethod"
                              value="Online"
                              checked={formData.paymentMethod === "Online"}
                              onChange={handleChange}
                              className="h-5 w-5 text-indigo-600 focus:ring-indigo-500"
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
                                ? "border-indigo-600 bg-indigo-50"
                                : "border-gray-200 hover:border-indigo-300"
                            }`}
                          >
                            <input
                              type="radio"
                              name="paymentMethod"
                              value="Manual"
                              checked={formData.paymentMethod === "Manual"}
                              onChange={handleChange}
                              className="h-5 w-5 text-indigo-600 focus:ring-indigo-500"
                            />
                            <div className="ml-4">
                              <span className="block font-bold text-gray-900">
                                Demand Draft / Manual Transfer
                              </span>
                              <span className="block text-xs text-gray-500 mt-0.5">
                                DD/NEFT to Bank Account
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
                                <CreditCard className="mr-2" /> Pay ₹1,000
                                Securely
                              </button>
                            )}
                            {paymentStatus === "Processing" && (
                              <div className="flex items-center text-indigo-600 font-bold animate-pulse">
                                <div className="w-6 h-6 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mr-3"></div>
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
                                  Council Bank Details
                                </h5>
                                <ul className="space-y-2 text-sm text-gray-600">
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
                                      In favor of:
                                    </strong>{" "}
                                    Registrar, APPC
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
                                    Enter DD/UTR/Reference No.{" "}
                                    <span className="text-red-500">*</span>
                                  </label>
                                  <input
                                    type="text"
                                    name="transactionId"
                                    value={formData.transactionId}
                                    onChange={handleChange}
                                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-indigo-500 focus:ring-indigo-500"
                                    required
                                  />
                                </div>
                                <div>
                                  <label className="block text-sm font-bold text-gray-700 mb-1">
                                    Upload Receipt (PDF/JPG){" "}
                                    <span className="text-red-500">*</span>
                                  </label>
                                  <input
                                    type="file"
                                    onChange={(e) =>
                                      handleFileChange(e, "paymentProof")
                                    }
                                    className="w-full text-sm text-gray-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-bold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer"
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

                  {/* Submission Details & Final Declaration */}
                  <section>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">
                          Place <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <MapPin className="h-5 w-5 text-gray-400" />
                          </div>
                          <input
                            type="text"
                            name="place"
                            value={formData.place}
                            onChange={handleChange}
                            className="w-full pl-10 rounded-lg border border-gray-300 px-4 py-2.5 focus:border-indigo-500 focus:ring-indigo-500"
                            placeholder="City/Town"
                            required
                          />
                        </div>
                      </div>
                    </div>

                    <div className="bg-indigo-50 border border-indigo-200 p-6 rounded-xl relative overflow-hidden">
                      <div className="absolute top-0 left-0 w-2 h-full bg-indigo-500"></div>
                      <div className="flex items-start pl-4">
                        <div className="flex items-center h-6">
                          <input
                            type="checkbox"
                            id="declaration"
                            checked={declarationAccepted}
                            onChange={(e) =>
                              setDeclarationAccepted(e.target.checked)
                            }
                            className="h-5 w-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 cursor-pointer"
                          />
                        </div>
                        <div className="ml-4">
                          <label
                            htmlFor="declaration"
                            className="font-bold text-indigo-900 text-lg cursor-pointer"
                          >
                            Declaration for Reciprocal Entry
                          </label>
                          <p className="mt-2 text-sm text-indigo-800/80 leading-relaxed font-medium">
                            I request that my name be entered in the registrar
                            of Pharmacists maintained by the Council of the
                            Arunachal Pradesh Under Section-33 of Pharmacy Act.
                            1948. I have given the particulars required, and I
                            declare that these are correct and I reside/carry on
                            the business of profession of Pharmacy in the state
                            of Arunachal Pradesh. I have uploaded the required
                            Original Certificate & Affidavit, and understand
                            they will be physically submitted and verified.
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
                    className="px-8 py-2.5 rounded-lg font-bold bg-indigo-700 text-white hover:bg-indigo-800 shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5 cursor-pointer flex items-center"
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
                        : "bg-indigo-600 hover:bg-indigo-700 transform hover:-translate-y-0.5 hover:shadow-xl cursor-pointer"
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
              Reciprocal Application Submitted!
            </h2>

            <p className="text-gray-500 mb-8 max-w-lg text-sm md:text-base leading-relaxed">
              Thank you,{" "}
              <strong className="text-gray-800">
                {formData.applicantName || "Applicant"}
              </strong>
              . Your application for Registration under Reciprocal Basis has
              been securely received by the APPC system.
            </p>

            <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-6 w-full max-w-md mb-10 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-2 h-full bg-indigo-500"></div>
              <p className="text-xs text-indigo-600 font-bold uppercase tracking-widest mb-1">
                Application Form No
              </p>
              <p className="text-3xl font-black text-indigo-900 tracking-tight">
                {referenceId}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row w-full max-w-md space-y-4 sm:space-y-0 sm:space-x-4">
              <button
                type="button"
                className="flex-1 flex items-center justify-center px-6 py-3.5 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 transition shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 cursor-pointer"
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
                Personal appearance is mandatory. You will be required to visit
                the APPC office with your{" "}
                <strong className="text-gray-900">
                  Original Registration Certificate
                </strong>{" "}
                from the previous council and the{" "}
                <strong className="text-gray-900">Annexure-I Affidavit</strong>{" "}
                for physical verification and disposal of the case.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Help Footer */}
      <p className="text-center text-sm text-gray-400 mt-8">
        Need assistance? Contact the APPC Technical Support at{" "}
        <a href="#" className="text-indigo-600 hover:underline">
          support@appc.gov.in
        </a>
      </p>
    </div>
  );
}
