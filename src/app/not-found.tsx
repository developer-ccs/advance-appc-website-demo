"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";

export default function NotFound() {
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => setMounted(true), []);

  const handleGoBack = () => {
    if (!pathname) {
      router.push("/");
      return;
    }
    const segments = pathname.split("/").filter(Boolean);
    const parentPath =
      segments.length <= 1 ? "/" : "/" + segments.slice(0, -1).join("/");

    router.push(parentPath);
    setTimeout(() => window.location.reload(), 300);
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-linear-to-br from-white to-gray-100 px-6">
      {/* Subtle background glow */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-1/2 h-125 w-125 -translate-x-1/2 -translate-y-1/2 rounded-full bg-black/5 blur-3xl" />
      </div>

      <div
        className={`text-center transition-all duration-700 ${
          mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
        }`}
      >
        <h2 className="text-[120px] font-extrabold tracking-tight text-blue-900 leading-none">
          404
        </h2>

        <h2 className="mt-4 text-2xl font-semibold text-gray-800">
          This page doesn't exist
        </h2>

        <p className="mt-2 max-w-md mx-auto text-gray-500">
          The page you're looking for might have been removed, renamed, or is
          temporarily unavailable.
        </p>

        <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <Link
            href="/"
            className="rounded-2xl bg-blue-900 px-6 py-3 text-sm font-medium text-white shadow-lg transition hover:bg-gray-800 hover:shadow-xl"
          >
            Go to Homepage
          </Link>

          <button
            onClick={handleGoBack}
            className="rounded-2xl border border-gray-300 px-6 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-100 cursor-pointer"
          >
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
}
