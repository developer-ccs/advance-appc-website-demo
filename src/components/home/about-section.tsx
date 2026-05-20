"use client";

import { Info } from "lucide-react";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import type { HTMLMotionProps } from "framer-motion";
import { shimmer, toBase64 } from "@/utils/shimmer";
import ProtectedImage from "../ui/ProtectedImage";

// Lazy-load framer-motion
const MotionDiv = dynamic(
  () => import("framer-motion").then((mod) => mod.motion.div),
  { ssr: false },
);

const AnimatePresence = dynamic(
  () => import("framer-motion").then((mod) => mod.AnimatePresence),
  { ssr: false },
);

// --- DEMO DATA ---
const DEMO_ABOUT_TEXT = `The Arunachal Pradesh Pharmacy Council serves as the statutory authority dedicated to advancing and regulating the pharmacy profession across the state. With a strong commitment to public health and professional excellence, the Council oversees pharmacy education, ensuring that institutions adhere to prescribed academic standards and produce competent, well-trained pharmacists. It plays a pivotal role in maintaining an up-to-date register of qualified professionals, thereby safeguarding the integrity of pharmacy practice. Beyond its regulatory functions, the Council actively promotes ethical standards and accountability within the profession. By setting clear guidelines for professional conduct and continuously monitoring compliance, it helps build public trust in pharmaceutical services. The Council also acts as a bridge between policymakers, educational institutions, and healthcare providers, fostering collaboration to improve healthcare outcomes. Through its efforts, the Arunachal Pradesh Pharmacy Council not only ensures that pharmacists meet the required qualifications but also encourages continuous professional development. Its vision is to create a robust and responsible pharmacy ecosystem that contributes meaningfully to the healthcare system, prioritizing patient safety, innovation, and the highest standards of pharmaceutical care.`;

const DEMO_IMAGES = [
  {
    fileUrl:
      "https://images.unsplash.com/photo-1537368910025-700350fe46c7?q=80&w=500&auto=format&fit=crop",
    name: "Dr. L. K. Sharma",
    designation: "President",
  },
  {
    fileUrl:
      "https://images.unsplash.com/photo-1594824476967-48c8b964273f?q=80&w=500&auto=format&fit=crop",
    name: "Dr. Pema Wangchu",
    designation: "Vice President",
  },
  {
    fileUrl:
      "https://images.unsplash.com/photo-1622253692010-333f2da6031d?q=80&w=500&auto=format&fit=crop",
    name: "Shri. T. Tsering",
    designation: "Registrar",
  },
];
// -----------------

export default function AboutSection() {
  const savedAbout = DEMO_ABOUT_TEXT;
  const aboutLoading = false;

  const images = DEMO_IMAGES;
  const imagesLoading = false;

  const [currentProfileIndex, setCurrentProfileIndex] = useState(0);

  // Slideshow logic
  useEffect(() => {
    if (images.length <= 1) return;

    const timer = setInterval(() => {
      setCurrentProfileIndex((prev) => (prev + 1) % images.length);
    }, 4500);

    return () => clearInterval(timer);
  }, [images.length]);

  // Reset index if images reload
  useEffect(() => {
    if (currentProfileIndex >= images.length && images.length > 0) {
      setCurrentProfileIndex(0);
    }
  }, [images.length, currentProfileIndex]);

  const currentProfile = images[currentProfileIndex];

  const motionProps: HTMLMotionProps<"div"> = {
    initial: { opacity: 0, x: 50 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -50 },
    transition: {
      duration: 0.6,
      ease: [0.22, 1, 0.36, 1],
    },
    className:
      "absolute inset-0 flex flex-col items-center justify-center z-10",
  };

  return (
    <section className="bg-white rounded-lg shadow-sm border-t-4 border-blue-800 overflow-hidden">
      <div className="flex flex-col lg:flex-row items-stretch">
        {/* Left Side: About Text */}
        <div className="flex-1 p-6 flex flex-col justify-center">
          <h2 className="text-2xl md:text-3xl font-serif font-bold text-blue-900 mb-6 flex items-center">
            <Info className="mr-3 text-blue-600" size={28} />
            Arunachal Pradesh Pharmacy Council
          </h2>
          {aboutLoading ? (
            <div className="space-y-3 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-full"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
              <div className="h-4 bg-gray-200 rounded w-4/6"></div>
            </div>
          ) : (
            <div className="text-gray-600 leading-relaxed text-justify whitespace-pre-wrap">
              {savedAbout || "No description available."}
            </div>
          )}
        </div>

        {/* DIVIDER */}
        <div className="bg-gray-200 shrink-0 h-px mx-8 my-4 lg:w-px lg:h-auto lg:mx-0 lg:my-10" />

        {/* Right Side: Slideshow Card */}
        <div className="w-full lg:w-110 flex flex-col justify-center items-center relative py-8 lg:py-0">
          {imagesLoading && (
            <div className="w-full max-w-87.5 h-100 flex flex-col items-center justify-center gap-4 animate-pulse">
              <div className="w-60 h-60 bg-gray-200 rounded-lg" />
              <div className="h-4 bg-gray-200 rounded w-40" />
              <div className="h-3 bg-gray-200 rounded w-28" />
            </div>
          )}

          {!imagesLoading && images.length > 0 && currentProfile && (
            <div className="w-full max-w-87.5 h-100 relative z-20 flex flex-col overflow-hidden">
              <div className="grow relative">
                <AnimatePresence>
                  <MotionDiv key={currentProfileIndex} {...motionProps}>
                    {/* Photo Container */}
                    <div className="w-64 h-64 bg-white rounded-lg shadow-xl mb-6 shrink-0 relative overflow-hidden border-4 border-gray-50">
                      <ProtectedImage
                        src={currentProfile.fileUrl}
                        alt={currentProfile.name}
                        fill
                        sizes="256px"
                        quality={90}
                        priority={currentProfileIndex === 0}
                        placeholder="blur"
                        blurDataURL={`data:image/svg+xml;base64,${toBase64(shimmer(256, 256))}`}
                        className="w-full h-full object-cover rounded"
                        onError={(e) => {
                          (e.target as HTMLImageElement).srcset = "";
                          (e.target as HTMLImageElement).src =
                            "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='240' height='240'%3E%3Crect width='240' height='240' fill='%23e2e8f0'/%3E%3Ctext x='120' y='120' font-family='sans-serif' font-size='48' fill='%2394a3b8' text-anchor='middle' dominant-baseline='middle'%3E?%3C/text%3E%3C/svg%3E";
                        }}
                      />
                    </div>

                    {/* Name & Designation */}
                    <div className="text-center w-full px-4">
                      <h2 className="text-xl font-bold text-blue-900 mb-1 leading-tight uppercase tracking-tight">
                        {currentProfile.name}
                      </h2>
                      <p className="text-blue-600 text-sm font-bold uppercase tracking-widest">
                        {currentProfile.designation}
                      </p>
                    </div>
                  </MotionDiv>
                </AnimatePresence>
              </div>
            </div>
          )}

          {!imagesLoading && images.length === 0 && (
            <div className="w-full max-w-87.5 h-100 flex flex-col items-center justify-center gap-2 text-gray-400">
              <p className="text-sm font-medium">
                No council members added yet.
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
