"use client";

import { useCallback, useEffect, useState } from "react";
import type { AudienceId } from "../data";

const STORAGE_KEY = "quantum-hub-audience";
const AUDIENCE_CHANGE_EVENT = "quantum-hub:audience-change";

function isAudienceId(value: unknown): value is AudienceId {
  return value === "partner" || value === "startup";
}

export function useAudiencePreference() {
  const [audience, setAudienceState] = useState<AudienceId | null>(null);

  useEffect(() => {
    let frame = 0;
    const handleChange = (event: Event) => {
      const value = (event as CustomEvent<AudienceId>).detail;
      if (isAudienceId(value)) setAudienceState(value);
    };

    window.addEventListener(AUDIENCE_CHANGE_EVENT, handleChange);
    try {
      const stored = window.sessionStorage.getItem(STORAGE_KEY);
      if (isAudienceId(stored)) {
        frame = window.requestAnimationFrame(() => setAudienceState(stored));
      }
    } catch {
      // The neutral state remains fully usable when storage is unavailable.
    }

    return () => {
      window.removeEventListener(AUDIENCE_CHANGE_EVENT, handleChange);
      window.cancelAnimationFrame(frame);
    };
  }, []);

  const setAudience = useCallback((value: AudienceId) => {
    setAudienceState(value);
    try {
      window.sessionStorage.setItem(STORAGE_KEY, value);
    } catch {
      // Persistence is optional; the current-page preference still applies.
    }
    window.dispatchEvent(new CustomEvent<AudienceId>(AUDIENCE_CHANGE_EVENT, { detail: value }));
  }, []);

  return [audience, setAudience] as const;
}
