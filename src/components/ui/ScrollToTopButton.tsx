"use client";

import { useEffect, useState } from "react";
import { MoveUp } from "lucide-react";

export default function ScrollToTopButton() {
  const [visible, setVisible] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight =
        document.documentElement.scrollHeight - window.innerHeight;

      const progress = docHeight > 0 ? scrollTop / docHeight : 0;

      setScrollProgress(progress);
      setVisible(scrollTop > 300);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const size = 40;

  // 🔽 SMALLER PROGRESS STROKE
  const stroke = 2;

  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - scrollProgress * circumference;

  return (
    <button
      onClick={scrollToTop}
      className={`fixed bottom-5 right-5 z-50 flex items-center justify-center rounded-full bg-white/85 backdrop-blur-md shadow-md border border-gray-200 transition-all duration-300 hover:scale-105 cursor-pointer ${
        visible
          ? "opacity-100 translate-y-0"
          : "opacity-0 translate-y-3 pointer-events-none"
      }`}
      aria-label="Scroll to top"
    >
      {/* Progress Ring */}
      <svg width={size} height={size} className="rotate-90">
        {/* Background ring */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="rgba(148, 163, 184, 0.25)"
          strokeWidth={stroke}
          fill="none"
        />

        {/* Progress ring (thin + subtle) */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="rgb(30, 58, 138)"
          strokeWidth={stroke}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
        />
      </svg>

      {/* Icon */}
      <div className="absolute flex items-center justify-center text-blue-900">
        <MoveUp size={20} />
      </div>
    </button>
  );
}
