import {
  ArrowRight,
  CheckCircle2,
  FileDown,
  RefreshCw,
  UserPlus,
} from "lucide-react";

export default function ServiceSection() {
  return (
    <section>
      <h2 className="text-2xl text-blue-800 font-serif font-bold mb-6 border-b-2 border-gray-200 pb-2">
        Online Services
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-200">
          <div className="w-12 h-12 bg-blue-50 text-blue-900 rounded-full flex items-center justify-center text-xl mb-4 transition">
            <UserPlus />
          </div>
          <h2 className="font-bold text-lg mb-2 text-gray-800">
            Pharmacist Registration
          </h2>
          <p className="text-sm text-gray-600 mb-4">
            Apply for new registration as a pharmacist under the Pharmacy Act,
            1948. Eligible candidates with approved pharmacy qualifications can
            apply for fresh registration with the State Pharmacy Council.
            Registration is required to legally practice as a pharmacist and
            obtain official professional recognition.
          </p>
          {/* <a
            href="#"
            className="flex items-center text-blue-800 font-medium text-sm hover:underline"
          >
            Learn More <ArrowRight className="ml-2" size={16} />
          </a> */}
        </div>
        <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-200">
          <div className="w-12 h-12 bg-blue-50 text-blue-900 rounded-full flex items-center justify-center text-xl mb-4 transition">
            <CheckCircle2 />
          </div>
          <h2 className="font-bold text-lg mb-2 text-gray-800">
            Reciprocal Registration
          </h2>
          <p className="text-sm text-gray-600 mb-4">
            Apply for transfer of registration from another State Pharmacy
            Council under the Pharmacy Act, 1948. Registered pharmacists from
            other State Pharmacy Councils can apply for reciprocal registration
            to continue professional practice in this state. Approval is subject
            to verification of existing registration details and required
            documents.
          </p>
          {/* <a
            href="#"
            className="flex items-center text-blue-800 font-medium text-sm hover:underline"
          >
            Learn More <ArrowRight className="ml-2" size={16} />
          </a> */}
        </div>
        <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-200">
          <div className="w-12 h-12 bg-blue-50 text-blue-900 rounded-full flex items-center justify-center text-xl mb-4 transition">
            <RefreshCw />
          </div>
          <h2 className="font-bold text-lg mb-2 text-gray-800">
            Renewal of Registration
          </h2>
          <p className="text-sm text-gray-600 mb-4">
            Apply for renewal of your pharmacist registration to maintain active
            status. Registered pharmacists can renew their registration by
            submitting the required application and fees within the prescribed
            period. Timely renewal ensures continued legal eligibility to
            practice as a pharmacist.
          </p>
          {/* <a
            href="#"
            className="flex items-center text-blue-800 font-medium text-sm hover:underline"
          >
            Learn More <ArrowRight className="ml-2" size={16} />
          </a> */}
        </div>
        <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-200">
          <div className="w-12 h-12 bg-blue-50 text-blue-900 rounded-full flex items-center justify-center text-xl mb-4 transition">
            <FileDown />
          </div>
          <h2 className="font-bold text-lg mb-2 text-gray-800">
            Download Forms
          </h2>
          <p className="text-sm text-gray-600 mb-4">
            Access and download official application forms and required formats.
            Applicants and registered pharmacists can download forms for
            registration, renewal, reciprocal transfer, and other
            council-related services for offline submission and record purposes.
          </p>
          {/* <a
            href="#"
            className="flex items-center text-blue-800 font-medium text-sm hover:underline"
          >
            Learn More <ArrowRight className="ml-2" size={16} />
          </a> */}
        </div>
      </div>
    </section>
  );
}
