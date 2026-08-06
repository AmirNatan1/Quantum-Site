"use client";

import { RefObject, useEffect, useState } from "react";
import { useReducedMotion } from "./useReducedMotion";

export function useSignalProgress(
  rootRef: RefObject<HTMLElement | null>,
  stageSelector = "[data-signal-stage]",
) {
  const [activeStage, setActiveStage] = useState(0);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const stages = Array.from(root.querySelectorAll<HTMLElement>(stageSelector));
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (!visible) return;
        const index = stages.indexOf(visible.target as HTMLElement);
        if (index >= 0) setActiveStage(index);
      },
      { rootMargin: "-28% 0px -48%", threshold: [0.15, 0.4, 0.7] },
    );
    stages.forEach((stage) => observer.observe(stage));
    return () => observer.disconnect();
  }, [rootRef, stageSelector]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root || reducedMotion) {
      root?.style.setProperty("--signal-progress", `${activeStage / 4}`);
      return;
    }
    let frame = 0;
    const update = () => {
      frame = 0;
      const box = root.getBoundingClientRect();
      const span = Math.max(1, box.height - window.innerHeight);
      const progress = Math.max(0, Math.min(1, -box.top / span));
      root.style.setProperty("--signal-progress", `${progress}`);
    };
    const onScroll = () => {
      if (!frame) frame = window.requestAnimationFrame(update);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    update();
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.cancelAnimationFrame(frame);
    };
  }, [activeStage, reducedMotion, rootRef]);

  return activeStage;
}
