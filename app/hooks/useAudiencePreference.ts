"use client";

import { useEffect, useState } from "react";
import type { AudienceCta } from "../data";

const STORAGE_KEY = "quantum-hub-audience";

export function useAudiencePreference(defaultValue: AudienceCta["id"] = "partner") {
  const [audience, setAudienceState] = useState<AudienceCta["id"]>(defaultValue);

  useEffect(() => {
    const stored = window.sessionStorage.getItem(STORAGE_KEY);
    let frame = 0;
    if (stored === "partner" || stored === "startup") {
      frame = window.requestAnimationFrame(() => setAudienceState(stored));
    }
    return () => window.cancelAnimationFrame(frame);
  }, []);

  const setAudience = (value: AudienceCta["id"]) => {
    setAudienceState(value);
    window.sessionStorage.setItem(STORAGE_KEY, value);
  };

  return [audience, setAudience] as const;
}
