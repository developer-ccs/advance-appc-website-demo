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
  ChevronRight,
} from "lucide-react";
import Link from "next/link";

export default function ApplicantForm() {
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
    isEmployed: "No",
    designation: "",
    professionalAddress: "",
    academics: [
      { id: 1, qualification: "", year: "", institution: "", examination: "" },
    ],
    paymentMethod: "Online",
    transactionId: "",
  });

  const [documents, setDocuments] = useState({
    photo: null as File | null,
    signature: null as File | null,
    ageProof: null as File | null,
    classXII: null as File | null,
    pharmacyDegree: null as File | null,
    trainingCert: null as File | null,
    residentCert: null as File | null,
    affidavit: null as File | null,
    gapCert: null as File | null,
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

    // Simulate API call & generate Reference ID
    console.log("Submitting Data: ", formData, documents);
    const generatedRefId = `APPC-${new Date().getFullYear()}-${Math.floor(
      1000 + Math.random() * 9000,
    )}`;
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
          className="flex items-center hover:text-blue-600 transition-colors"
        >
          <Home className="w-4 h-4 mr-1.5 mb-0.5" />
          Home
        </Link>
        <ChevronRight className="w-4 h-4 mx-2 text-gray-400" />
        <span className="text-gray-800">New Registration</span>
      </nav>
      <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
        {/* HEADER (Shared across all views) */}
        {!isSubmitted && (
          <div className="bg-blue-900 px-8 py-8 text-white relative overflow-hidden">
            {/* Decorative background element */}
            <div className="absolute top-0 right-0 opacity-10 pointer-events-none transform translate-x-1/4 -translate-y-1/4">
              <ShieldPlus size={300} />
            </div>

            <div className="relative z-10 flex items-center space-x-5">
              <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm border border-white/30">
                <ShieldPlus className="h-10 w-10 text-white" />
              </div>
              <div>
                <h2 className="text-3xl font-extrabold tracking-tight">
                  Arunachal Pradesh Pharmacy Council
                </h2>
                <p className="mt-1.5 font-medium text-sm flex items-center">
                  <FileText className="w-4 h-4 mr-2" />
                  Application for Registration (Form-C) under Section-33 of
                  Pharmacy Act
                </p>
              </div>
            </div>

            {/* CUSTOM ICON STEPPER (Only visible when form has started) */}
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
                              ? "bg-white border-blue-300 text-blue-800 shadow-lg"
                              : isCompleted
                                ? "bg-blue-500 border-blue-500 text-white"
                                : "bg-white border-blue-300 text-blue-800"
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
                              isCompleted ? "bg-blue-500" : "bg-blue-300"
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
              <div className="bg-blue-100 p-3 rounded-full mr-4">
                <Info className="w-6 h-6 text-blue-700" />
              </div>
              <h3 className="text-2xl font-extrabold text-gray-900">
                Important Instructions Before Proceeding
              </h3>
            </div>

            <p className="text-gray-600 mb-8 text-lg leading-relaxed">
              Before you begin the application process, please ensure you have
              clear, scanned copies of the following original documents ready.
              Incomplete or incorrectly formatted documents may lead to the
              rejection of your application.
            </p>

            {/* Photo & Signature Specs Box */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
              <div className="bg-white border-2 border-blue-100 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                <div className="absolute top-0 right-0 bg-blue-50 w-24 h-24 rounded-bl-full -z-10 group-hover:bg-blue-100 transition-colors"></div>
                <div className="flex items-center mb-4">
                  <Camera className="w-6 h-6 text-blue-600 mr-3" />
                  <h4 className="text-lg font-bold text-gray-800">
                    Passport Photo
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
                    <span className="font-semibold text-gray-900">Format:</span>{" "}
                    JPG / JPEG / PNG
                  </li>
                  <li className="flex items-start">
                    <CheckCircle2 className="w-4 h-4 text-green-500 mr-2 mt-0.5 shrink-0" />{" "}
                    Must be recent, color photo with a white background.
                  </li>
                  <li className="flex items-start">
                    <CheckCircle2 className="w-4 h-4 text-green-500 mr-2 mt-0.5 shrink-0" />{" "}
                    <span className="text-red-600 font-semibold">
                      Important:
                    </span>{" "}
                    Applicant's Name and Date of Photo must be printed at the
                    bottom.
                  </li>
                </ul>
              </div>

              <div className="bg-white border-2 border-blue-100 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                <div className="absolute top-0 right-0 bg-blue-50 w-24 h-24 rounded-bl-full -z-10 group-hover:bg-blue-100 transition-colors"></div>
                <div className="flex items-center mb-4">
                  <PenTool className="w-6 h-6 text-blue-600 mr-3" />
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
                    <span className="font-semibold text-gray-900">Format:</span>{" "}
                    JPG / JPEG / PNG
                  </li>
                  <li className="flex items-start">
                    <CheckCircle2 className="w-4 h-4 text-green-500 mr-2 mt-0.5 shrink-0" />{" "}
                    Must be signed on a plain white paper using Black or Dark
                    Blue ink pen.
                  </li>
                  <li className="flex items-start">
                    <CheckCircle2 className="w-4 h-4 text-green-500 mr-2 mt-0.5 shrink-0" />{" "}
                    Ensure the signature is clear and not blurry.
                  </li>
                </ul>
              </div>
            </div>

            {/* Other Documents List */}
            <div className="bg-gray-50 rounded-xl p-6 border border-gray-200 mb-8">
              <div className="flex items-center mb-4 border-b border-gray-200 pb-3">
                <ListChecks className="w-5 h-5 text-gray-700 mr-2" />
                <h4 className="text-md font-bold text-gray-800 uppercase tracking-wide">
                  Other Required Documents (PDF/JPG, Max 2MB each)
                </h4>
              </div>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3 text-sm text-gray-700">
                <li className="flex items-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mr-2"></div>{" "}
                  Class X Certificate (For Age Proof)
                </li>
                <li className="flex items-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mr-2"></div>{" "}
                  Class XII Certificate & Marksheet
                </li>
                <li className="flex items-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mr-2"></div>{" "}
                  Pharmacy Degree/Diploma & Marksheets
                </li>
                <li className="flex items-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mr-2"></div>{" "}
                  500 Hours Practical Training Certificate
                </li>
                <li className="flex items-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mr-2"></div>{" "}
                  PRC (For APST) / TRC (For Non-APST)
                </li>
                <li className="flex items-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mr-2"></div>{" "}
                  Annexure-I Notarized Affidavit
                </li>
                <li className="flex items-center text-gray-500">
                  <div className="w-1.5 h-1.5 rounded-full bg-gray-400 mr-2"></div>{" "}
                  Gap Certificate (Only if applicable)
                </li>
              </ul>
            </div>

            {/* Consent & Proceed */}
            <div className="bg-blue-50/50 p-5 rounded-xl border border-blue-100 flex flex-col md:flex-row items-center justify-between gap-6">
              <label className="flex items-start cursor-pointer group flex-1">
                <input
                  type="checkbox"
                  checked={instructionsAccepted}
                  onChange={(e) => setInstructionsAccepted(e.target.checked)}
                  className="mt-1 h-5 w-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
                />
                <span className="ml-3 text-sm font-semibold text-gray-800 group-hover:text-blue-900 transition-colors">
                  I acknowledge that I have read the instructions and have all
                  the required documents in the specified sizes and dimensions
                  ready for upload.
                </span>
              </label>

              <button
                type="button"
                onClick={() => setHasStarted(true)}
                disabled={!instructionsAccepted}
                className={`shrink-0 px-8 py-3.5 rounded-lg font-bold text-white shadow-lg transition-all duration-200 flex items-center ${
                  !instructionsAccepted
                    ? "bg-gray-400 cursor-not-allowed shadow-none"
                    : "bg-blue-600 hover:bg-blue-700 transform hover:-translate-y-0.5 hover:shadow-xl cursor-pointer"
                }`}
              >
                Proceed to Application <ArrowRight className="ml-2 w-5 h-5" />
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
                  {/* Personal Information Section */}
                  <section>
                    <h3 className="text-xl font-bold text-gray-800 flex items-center mb-6">
                      <span className="bg-blue-100 text-blue-800 w-8 h-8 rounded-full flex items-center justify-center mr-3 text-sm">
                        1
                      </span>
                      Personal Information
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
                          className="w-full rounded-lg border border-gray-300 px-4 py-2.5 uppercase transition-colors"
                          placeholder="AS PER OFFICIAL RECORDS"
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
                          className="w-full rounded-lg border border-gray-300 px-4 py-2.5 uppercase transition-colors"
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
                          className="w-full rounded-lg border border-gray-300 px-4 py-2.5 transition-colors"
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
                          readOnly
                          className="w-full rounded-lg border border-gray-200 px-4 py-2.5 bg-gray-100 text-gray-500 font-medium cursor-not-allowed focus:outline-none"
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
                          className="w-full rounded-lg border border-gray-300 px-4 py-3 transition-colors"
                          placeholder="House No, Street, Village/Town, District, Pincode"
                          required
                        />
                      </div>

                      <div className="flex flex-col">
                        <div className="flex items-center justify-between mb-1">
                          <label className="block text-sm font-bold text-gray-700">
                            Communication Address{" "}
                            <span className="text-red-500">*</span>
                          </label>
                          <label className="flex items-center cursor-pointer group">
                            <input
                              type="checkbox"
                              checked={formData.sameAsPermanent}
                              onChange={handleAddressCheckbox}
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded cursor-pointer"
                            />
                            <span className="ml-2 text-xs font-semibold text-blue-700 group-hover:text-blue-800">
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
                              ? "bg-blue-50 border-blue-100 text-blue-800"
                              : "border-gray-300"
                          }`}
                          required
                        />
                      </div>
                    </div>
                  </section>

                  {/* Professional Information */}
                  <section>
                    <h3 className="text-xl font-bold text-gray-800 flex items-center mb-6">
                      <span className="bg-blue-100 text-blue-800 w-8 h-8 rounded-full flex items-center justify-center mr-3 text-sm">
                        2
                      </span>
                      Professional Details
                    </h3>

                    <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                      <label className="block text-sm font-bold text-gray-700 mb-3">
                        Are you currently employed?
                      </label>
                      <div className="flex space-x-8 mb-6">
                        <label className="flex items-center p-3 flex-1 md:flex-none md:w-40 transition-colors">
                          <input
                            type="radio"
                            name="isEmployed"
                            value="Yes"
                            checked={formData.isEmployed === "Yes"}
                            onChange={handleChange}
                            className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 cursor-pointer"
                          />
                          <span className="ml-3 font-medium text-gray-800">
                            Yes
                          </span>
                        </label>
                        <label className="flex items-center p-3 flex-1 md:flex-none md:w-40 transition-colors">
                          <input
                            type="radio"
                            name="isEmployed"
                            value="No"
                            checked={formData.isEmployed === "No"}
                            onChange={handleChange}
                            className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 cursor-pointer"
                          />
                          <span className="ml-3 font-medium text-gray-800">
                            No
                          </span>
                        </label>
                      </div>

                      {formData.isEmployed === "Yes" && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-blue-50 rounded-xl border border-blue-100 animate-in fade-in">
                          <div>
                            <label className="text-sm font-bold text-blue-900 mb-1 flex items-center">
                              <Building2 className="w-4 h-4 mr-1.5" />{" "}
                              Designation
                            </label>
                            <input
                              type="text"
                              name="designation"
                              value={formData.designation}
                              onChange={handleChange}
                              className="w-full rounded-lg border border-gray-300 px-4 py-2.5"
                              placeholder="e.g. Chief Pharmacist"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-bold text-blue-900 mb-1">
                              Professional Address
                            </label>
                            <textarea
                              name="professionalAddress"
                              rows={2}
                              value={formData.professionalAddress}
                              onChange={handleChange}
                              className="w-full rounded-lg border border-gray-300 px-4 py-2"
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
                      <GraduationCap className="text-blue-700 w-6 h-6 mr-2" />
                      Academic & Professional Qualifications
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
                            className="block w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm font-medium"
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
                            className="block w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm"
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
                            className="block w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm"
                            required
                          />
                        </div>

                        {/* Board/University */}
                        <div className="md:col-span-3">
                          <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1">
                            Board / University
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. CBSE / Rajiv Gandhi Univ."
                            value={row.examination}
                            onChange={(e) =>
                              handleAcademicChange(
                                index,
                                "examination",
                                e.target.value,
                              )
                            }
                            className="block w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm"
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
                      className="mt-4 flex items-center justify-center w-full py-3 border-2 border-dashed border-blue-300 rounded-xl text-sm font-bold text-blue-700 hover:bg-blue-50 hover:border-blue-500 cursor-pointer transition-all"
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
                        Upload Instructions Reminder
                      </h4>
                      <p className="text-sm text-amber-700 mt-1">
                        Ensure all documents are clear and readable. Photos must
                        be 3.5x4.5cm (50-200KB) and Signature 3.5x1.5cm
                        (20-50KB). Other documents must be PDF/JPG under 2MB.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {[
                      {
                        key: "photo",
                        label: "Recent Passport Photo (with Name & Date)",
                      },
                      { key: "signature", label: "Digital Signature" },
                      {
                        key: "ageProof",
                        label: "Class X Certificate (Age Proof)",
                      },
                      {
                        key: "classXII",
                        label: "Class XII Certificate & Marksheet",
                      },
                      {
                        key: "pharmacyDegree",
                        label: "Pharmacy Degree/Diploma & Marksheet",
                      },
                      {
                        key: "trainingCert",
                        label: "500 Hours Practical Training Cert.",
                      },
                      {
                        key: "residentCert",
                        label: "PRC (APST) / TRC (Non-APST)",
                      },
                      {
                        key: "affidavit",
                        label: "Annexure-I Notarized Affidavit",
                      },
                      {
                        key: "gapCert",
                        label: "Gap Certificate (If Applicable)",
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
                              ? "border-green-500 bg-blue-50/30"
                              : "border-gray-300 bg-white hover:bg-gray-50 hover:border-blue-400"
                          }`}
                        >
                          <div className="flex flex-col items-center text-center relative z-10">
                            {isUploaded ? (
                              <CheckCircle2 className="w-10 h-10 text-green-500 mb-2" />
                            ) : (
                              <UploadCloud className="w-10 h-10 text-gray-400 group-hover:text-blue-500 mb-2 transition-colors" />
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

                          {/* Hidden File Input mapped over the entire box */}
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

              {/* STEP 4: PAYMENT & DECLARATION */}
              {step === 4 && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  {/* Payment Section */}
                  <section>
                    <h3 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">
                      Fee Payment
                    </h3>

                    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                      <div className="bg-slate-800 p-4 text-center">
                        <h4 className="text-lg font-bold text-white flex justify-center items-center">
                          Registration Fee Payable:{" "}
                          <span className="text-blue-400 ml-2 text-2xl">
                            ₹ 1,000.00
                          </span>
                        </h4>
                      </div>

                      <div className="p-6">
                        <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-6 mb-8">
                          <label
                            className={`flex-1 flex items-center p-4 rounded-xl border-2 cursor-pointer transition-all ${
                              formData.paymentMethod === "Online"
                                ? "border-blue-600 bg-blue-50"
                                : "border-gray-200 hover:border-blue-300"
                            }`}
                          >
                            <input
                              type="radio"
                              name="paymentMethod"
                              value="Online"
                              checked={formData.paymentMethod === "Online"}
                              onChange={handleChange}
                              className="h-5 w-5 text-blue-600 focus:ring-blue-500"
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
                                ? "border-blue-600 bg-blue-50"
                                : "border-gray-200 hover:border-blue-300"
                            }`}
                          >
                            <input
                              type="radio"
                              name="paymentMethod"
                              value="Manual"
                              checked={formData.paymentMethod === "Manual"}
                              onChange={handleChange}
                              className="h-5 w-5 text-blue-600 focus:ring-blue-500"
                            />
                            <div className="ml-4">
                              <span className="block font-bold text-gray-900">
                                Manual Transfer
                              </span>
                              <span className="block text-xs text-gray-500 mt-0.5">
                                NEFT/RTGS to Bank Account
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
                              <div className="flex items-center text-blue-600 font-bold animate-pulse">
                                <div className="w-6 h-6 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mr-3"></div>
                                Processing secure payment...
                              </div>
                            )}
                            {paymentStatus === "Success" && (
                              <div className="bg-blue-100 text-blue-800 p-5 rounded-xl font-bold flex items-center border border-blue-200 w-full justify-center">
                                <CheckCircle2 className="w-6 h-6 mr-2 text-blue-600" />
                                Payment Successful! TXN ID:{" "}
                                {formData.transactionId}
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
                                    Enter UTR / Reference No.{" "}
                                    <span className="text-red-500">*</span>
                                  </label>
                                  <input
                                    type="text"
                                    name="transactionId"
                                    value={formData.transactionId}
                                    onChange={handleChange}
                                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5"
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
                                    className="w-full text-sm text-gray-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-bold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
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
                    <div className="bg-blue-50 border border-blue-100 p-6 rounded-xl mt-8 relative overflow-hidden">
                      <div className="absolute top-0 left-0 w-2 h-full bg-blue-500"></div>
                      <div className="flex items-start pl-4">
                        <div className="flex items-center h-6">
                          <input
                            type="checkbox"
                            id="declaration"
                            checked={declarationAccepted}
                            onChange={(e) =>
                              setDeclarationAccepted(e.target.checked)
                            }
                            className="h-5 w-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
                          />
                        </div>
                        <div className="ml-4">
                          <label
                            htmlFor="declaration"
                            className="font-bold text-blue-900 text-lg cursor-pointer"
                          >
                            Solemn Declaration
                          </label>
                          <p className="mt-2 text-sm text-blue-800/80 leading-relaxed font-medium">
                            I solemnly declare that I reside / carry on the
                            business of the profession of Pharmacy in the state
                            of Arunachal Pradesh. I have given the particulars
                            above and I declare that these are true and correct
                            to the best of my knowledge. I understand that my
                            original documents will be verified physically
                            before final registration, and false information may
                            lead to rejection under the Pharmacy Act, 1948.
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
                    className="px-8 py-2.5 rounded-lg font-bold bg-blue-700 text-white hover:bg-blue-800 shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5 cursor-pointer flex items-center"
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
                        : "bg-blue-600 hover:bg-blue-700 transform hover:-translate-y-0.5 hover:shadow-xl cursor-pointer"
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
              Application Submitted Successfully!
            </h2>

            <p className="text-gray-500 mb-8 max-w-lg text-sm md:text-base leading-relaxed">
              Thank you,{" "}
              <strong className="text-gray-800">
                {formData.applicantName || "Applicant"}
              </strong>
              . Your application for registration under Section-33 of the
              Pharmacy Act has been securely received by the APPC system.
            </p>

            <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6 w-full max-w-md mb-10 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-2 h-full bg-blue-500"></div>
              <p className="text-xs text-blue-600 font-bold uppercase tracking-widest mb-1">
                Application Reference ID
              </p>
              <p className="text-3xl font-black text-blue-900 tracking-tight">
                {referenceId}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row w-full max-w-md space-y-4 sm:space-y-0 sm:space-x-4">
              <button
                type="button"
                className="flex-1 flex items-center justify-center px-6 py-3.5 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 cursor-pointer"
              >
                <Download className="w-5 h-5 mr-2" />
                Print Receipt
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
                <strong>Next Steps:</strong> Please keep your Reference ID safe
                to track your application status. You will receive an email/SMS
                notification when you are required to produce your original
                documents for physical verification at the APPC office.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Help Footer */}
      <p className="text-center text-sm text-gray-400 mt-8">
        Need assistance? Contact the APPC Technical Support at{" "}
        <a href="#" className="text-blue-600 hover:underline">
          support@appc.gov.in
        </a>
      </p>
    </div>
  );
}
