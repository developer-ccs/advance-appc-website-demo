"use client";

import { useState, useEffect, useRef } from "react";

/**
 * Shows a full-page loader while the page's data is being fetched.
 *
 * Usage:
 *   const { isLoading } = usePageLoader([certLoading, noticesLoading, statsLoading]);
 *   if (isLoading) return <CustomLoader fullPage message="Loading dashboard..." />;
 *
 * @param loadingFlags  - Array of boolean loading states from your store
 * @param minDuration   - Minimum ms to show the loader (prevents flash), default 400
 */
export function usePageLoader(
  loadingFlags: boolean[],
  minDuration = 600,
): { isLoading: boolean } {
  const [isLoading, setIsLoading] = useState(true);
  const startTime = useRef(Date.now());

  const anyLoading = loadingFlags.some(Boolean);

  useEffect(() => {
    if (anyLoading) {
      // Data is still loading — keep loader visible
      setIsLoading(true);
      startTime.current = Date.now();
      return;
    }

    // All done — enforce minimum display duration to avoid flash
    const elapsed = Date.now() - startTime.current;
    const remaining = Math.max(0, minDuration - elapsed);

    const timer = setTimeout(() => setIsLoading(false), remaining);
    return () => clearTimeout(timer);
  }, [anyLoading, minDuration]);

  return { isLoading };
}
