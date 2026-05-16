"use client";

import { useState, useEffect } from "react";

export default function UniversalLoader() {
  const [show, setShow] = useState(true);
  const [fade, setFade] = useState(false);

  useEffect(() => {
    // 1. After 800ms, start fading out the loader
    const fadeTimer = setTimeout(() => {
      setFade(true);
    }, 800);

    // 2. After 1100ms (800ms + 300ms fade transition), remove from DOM completely
    const removeTimer = setTimeout(() => {
      setShow(false);
    }, 1100);

    // Cleanup timers
    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(removeTimer);
    };
  }, []);

  // If the timer is done, don't render anything
  if (!show) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        backgroundColor: "#ffffff", // Loader background color
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 999999,
        transition: "opacity 0.3s ease",
        opacity: fade ? 0 : 1,
        pointerEvents: fade ? "none" : "auto",
      }}
    >
      <div
        style={{
          width: "60px",
          height: "60px",
          border: "6px solid #f3f3f3",
          borderTop: "6px solid #3498db", // Spinner color
          borderRadius: "50%",
          animation: "spin 1s linear infinite",
        }}
      ></div>

      {/* Keyframes for the spinner */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
