"use client";

import { useEffect, useRef } from "react";

const INSPECTION_QUERY = "(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)";

export function useInspectionField<T extends HTMLElement>() {
  const targetRef = useRef<T>(null);

  useEffect(() => {
    const target = targetRef.current;
    if (!target) return;

    const capability = window.matchMedia(INSPECTION_QUERY);
    let visible = false;
    let listening = false;
    let frame = 0;
    let pointerX = 0;
    let pointerY = 0;

    const writePointer = () => {
      frame = 0;
      target.style.setProperty("--inspect-x", `${pointerX}px`);
      target.style.setProperty("--inspect-y", `${pointerY}px`);
    };

    const handlePointerMove = (event: PointerEvent) => {
      if (event.pointerType === "touch") return;
      const bounds = target.getBoundingClientRect();
      pointerX = Math.min(bounds.width, Math.max(0, event.clientX - bounds.left));
      pointerY = Math.min(bounds.height, Math.max(0, event.clientY - bounds.top));
      target.style.setProperty("--inspect-active", "1");
      target.setAttribute("data-inspection-active", "");
      if (!frame) frame = window.requestAnimationFrame(writePointer);
    };

    const handlePointerLeave = () => {
      window.cancelAnimationFrame(frame);
      frame = 0;
      target.style.setProperty("--inspect-active", "0");
      target.removeAttribute("data-inspection-active");
    };

    const addListeners = () => {
      if (listening || !visible || !capability.matches) return;
      listening = true;
      target.setAttribute("data-inspection-enabled", "");
      target.addEventListener("pointermove", handlePointerMove, { passive: true });
      target.addEventListener("pointerleave", handlePointerLeave);
    };

    const removeListeners = () => {
      if (!listening) return;
      listening = false;
      target.removeEventListener("pointermove", handlePointerMove);
      target.removeEventListener("pointerleave", handlePointerLeave);
      target.removeAttribute("data-inspection-enabled");
      handlePointerLeave();
    };

    const updateCapability = () => {
      if (capability.matches) addListeners();
      else removeListeners();
    };

    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) addListeners();
      else removeListeners();
    }, { threshold: 0.01 });

    observer.observe(target);
    capability.addEventListener("change", updateCapability);

    return () => {
      observer.disconnect();
      capability.removeEventListener("change", updateCapability);
      removeListeners();
      window.cancelAnimationFrame(frame);
      target.style.removeProperty("--inspect-x");
      target.style.removeProperty("--inspect-y");
      target.style.removeProperty("--inspect-active");
      target.removeAttribute("data-inspection-active");
      target.removeAttribute("data-inspection-enabled");
    };
  }, []);

  return targetRef;
}
