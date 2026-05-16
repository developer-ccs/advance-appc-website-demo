"use client";

import { AlertCircle, CheckCircle, X } from "lucide-react";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import type { HTMLMotionProps } from "framer-motion";

// Lazy-load only what's needed
const MotionDiv = dynamic(
  () => import("framer-motion").then((mod) => mod.motion.div),
  { ssr: false },
);

const AnimatePresence = dynamic(
  () => import("framer-motion").then((mod) => mod.AnimatePresence),
  { ssr: false },
);

interface ToastProps {
  message: string;
  type: "success" | "error";
  onClose: () => void;
  duration?: number;
}

export function Toast({ message, type, onClose, duration = 3500 }: ToastProps) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => {
      setVisible(false);
      setTimeout(onClose, 400); // wait for exit animation
    }, duration);
    return () => clearTimeout(t);
  }, [onClose, duration]);

  const handleClose = () => {
    setVisible(false);
    setTimeout(onClose, 400);
  };

  const motionProps: HTMLMotionProps<"div"> = {
    key: "toast",
    initial: { opacity: 0, x: 80 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 80 },
    transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] },
    className: `fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-lg shadow-lg text-white text-sm font-medium ${
      type === "success" ? "bg-green-700" : "bg-red-700"
    }`,
  };

  return (
    <AnimatePresence>
      {visible && (
        <MotionDiv {...motionProps}>
          {type === "success" ? (
            <CheckCircle className="w-4 h-4" />
          ) : (
            <AlertCircle className="w-4 h-4" />
          )}
          {message}
          <button
            onClick={handleClose}
            className="ml-2 opacity-70 hover:opacity-100"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </MotionDiv>
      )}
    </AnimatePresence>
  );
}
