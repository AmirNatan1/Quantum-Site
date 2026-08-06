"use client";

import { useEffect } from "react";

const BLOCK_SELECTOR = '[data-reveal="block"]';
const HEADING_SELECTOR = "[data-heading-reveal]";
const STATE_ATTRIBUTE = "data-reveal-state";

type RevealState = "prepared" | "visible";

function setRevealState(element: HTMLElement, state: RevealState) {
  element.setAttribute(STATE_ATTRIBUTE, state);
}

export function useRevealFoundation(route: string) {
  useEffect(() => {
    const blocks = Array.from(document.querySelectorAll<HTMLElement>(BLOCK_SELECTOR));
    const headings = Array.from(document.querySelectorAll<HTMLElement>(HEADING_SELECTOR));
    const roots = Array.from(new Set([...blocks, ...headings]));

    if (roots.length === 0) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const fontSet = "fonts" in document ? document.fonts : null;
    let intersectionObserver: IntersectionObserver | null = null;
    let resizeObserver: ResizeObserver | null = null;
    let measurementFrame = 0;
    let cancelled = false;

    const revealAll = () => {
      roots.forEach((element) => setRevealState(element, "visible"));
    };

    const measureHeadings = () => {
      const measurements = headings.map((heading) => {
        const words = Array.from(heading.querySelectorAll<HTMLElement>(".title-word"));
        return { words, tops: words.map((word) => word.getBoundingClientRect().top) };
      });

      measurements.forEach(({ words, tops }) => {
        let line = 0;
        let previousTop: number | null = null;

        words.forEach((word, index) => {
          const top = tops[index];
          if (previousTop !== null && Math.abs(top - previousTop) > 1) line += 1;
          word.style.setProperty("--reveal-line", String(line));
          previousTop = top;
        });
      });
    };

    const scheduleMeasurements = () => {
      if (cancelled || measurementFrame) return;
      measurementFrame = window.requestAnimationFrame(() => {
        measurementFrame = 0;
        measureHeadings();
      });
    };

    const failOpen = () => {
      intersectionObserver?.disconnect();
      revealAll();
    };

    const handleMotionPreference = () => {
      if (reducedMotion.matches) failOpen();
    };

    const initialize = () => {
      if (cancelled) return;

      if (
        reducedMotion.matches
        || !("IntersectionObserver" in window)
        || !("ResizeObserver" in window)
      ) {
        revealAll();
        return;
      }

      try {
        measureHeadings();

        intersectionObserver = new IntersectionObserver((entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            const element = entry.target as HTMLElement;
            setRevealState(element, "visible");
            intersectionObserver?.unobserve(element);
          });
        }, { rootMargin: "0px 0px -12%", threshold: 0.12 });

        resizeObserver = new ResizeObserver(scheduleMeasurements);
        headings.forEach((heading) => resizeObserver?.observe(heading));

        const immediateThreshold = window.innerHeight * 0.92;
        roots.forEach((element) => {
          const bounds = element.getBoundingClientRect();
          if (bounds.top <= immediateThreshold) {
            setRevealState(element, "visible");
          } else {
            setRevealState(element, "prepared");
            intersectionObserver?.observe(element);
          }
        });
      } catch {
        failOpen();
      }
    };

    reducedMotion.addEventListener("change", handleMotionPreference);
    fontSet?.addEventListener("loadingdone", scheduleMeasurements);
    fontSet?.addEventListener("loadingerror", failOpen);

    if (fontSet) {
      void fontSet.ready.then(initialize).catch(failOpen);
    } else {
      initialize();
    }

    return () => {
      cancelled = true;
      intersectionObserver?.disconnect();
      resizeObserver?.disconnect();
      reducedMotion.removeEventListener("change", handleMotionPreference);
      fontSet?.removeEventListener("loadingdone", scheduleMeasurements);
      fontSet?.removeEventListener("loadingerror", failOpen);
      if (measurementFrame) window.cancelAnimationFrame(measurementFrame);
      revealAll();
    };
  }, [route]);
}
