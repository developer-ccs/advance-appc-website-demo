"use client";

import { useEffect } from "react";

export default function DisableDevTools() {
  useEffect(() => {
    // Block right-click
    const handleContext = (e: MouseEvent) => e.preventDefault();

    // Block keyboard shortcuts
    const handleKey = (e: KeyboardEvent) => {
      const key = e.key.toUpperCase();

      // F12
      if (e.key === "F12") {
        e.preventDefault();
        return;
      }

      // Ctrl/Cmd + Shift + I / J / C / K
      if (
        (e.ctrlKey || e.metaKey) &&
        e.shiftKey &&
        ["I", "J", "C", "K"].includes(key)
      ) {
        e.preventDefault();
        return;
      }

      // Ctrl/Cmd + U  (view source)
      if ((e.ctrlKey || e.metaKey) && key === "U") {
        e.preventDefault();
        return;
      }

      // Ctrl/Cmd + S  (save page)
      if ((e.ctrlKey || e.metaKey) && key === "S") {
        e.preventDefault();
        return;
      }
    };

    document.addEventListener("contextmenu", handleContext);
    document.addEventListener("keydown", handleKey);

    // Cleanup when component unmounts
    return () => {
      document.removeEventListener("contextmenu", handleContext);
      document.removeEventListener("keydown", handleKey);
    };
  }, []);

  return null; // renders nothing
}
