"use client";
import { useEffect, useRef, useState, useCallback } from "react";

const INACTIVE_MS = 15 * 60 * 1000; // 15 minutes — auto-logout
const WARN_MS     = 14 * 60 * 1000; // warn at 14 minutes (1 min before)

export function useInactivityLogout(onLogout: () => void) {
  const [showWarning, setShowWarning] = useState(false);
  const logoutTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const warnTimer   = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const reset = useCallback(() => {
    clearTimeout(logoutTimer.current);
    clearTimeout(warnTimer.current);
    setShowWarning(false);
    warnTimer.current   = setTimeout(() => setShowWarning(true), WARN_MS);
    logoutTimer.current = setTimeout(() => onLogout(), INACTIVE_MS);
  }, [onLogout]);

  useEffect(() => {
    const events = ["mousedown", "mousemove", "keydown", "touchstart", "click", "scroll"] as const;
    events.forEach((e) => window.addEventListener(e, reset, { passive: true }));
    reset();
    return () => {
      events.forEach((e) => window.removeEventListener(e, reset));
      clearTimeout(logoutTimer.current);
      clearTimeout(warnTimer.current);
    };
  }, [reset]);

  const dismissWarning = useCallback(() => reset(), [reset]);

  return { showWarning, dismissWarning };
}
