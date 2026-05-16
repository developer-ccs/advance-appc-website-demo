"use client";

import { useRouter } from "next/navigation";
import { ShieldX } from "lucide-react";

export default function UnauthorizedPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center">
            <ShieldX className="w-10 h-10 text-red-600" />
          </div>
        </div>

        <h2 className="text-3xl font-bold text-gray-800 mb-2">Access Denied</h2>
        <p className="text-gray-500 mb-8">
          You don't have permission to view this page. Please contact your
          administrator if you think this is a mistake.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => router.back()}
            className="px-6 py-2.5 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-100 transition cursor-pointer"
          >
            Go Back
          </button>
          <button
            onClick={() => router.push("/")}
            className="px-6 py-2.5 rounded-md bg-blue-600 hover:bg-blue-700 text-white transition cursor-pointer"
          >
            Go to Home
          </button>
        </div>
      </div>
    </div>
  );
}
