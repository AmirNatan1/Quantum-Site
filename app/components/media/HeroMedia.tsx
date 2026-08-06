"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "../../hooks/useReducedMotion";

type HeroMediaProps = {
  poster: string;
  webm?: string;
  mp4?: string;
};

export function HeroMedia({ poster, webm, mp4 }: HeroMediaProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const manualPlaybackRef = useRef(false);
  const reducedMotion = useReducedMotion();
  const [playing, setPlaying] = useState(false);
  const hasVideo = Boolean(webm || mp4);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    let active = true;
    let visible = true;
    const motionReduced = reducedMotion || window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const syncPlaying = () => active && setPlaying(!video.paused);
    const requestPlayback = () => {
      if (document.hidden || !visible || (motionReduced && !manualPlaybackRef.current)) {
        video.pause();
        return;
      }
      void video.play().catch(() => active && setPlaying(false));
    };
    const observer = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        if (visible) requestPlayback();
        else video.pause();
      },
      { threshold: 0.2 },
    );
    const handleVisibility = () => requestPlayback();

    video.addEventListener("play", syncPlaying);
    video.addEventListener("pause", syncPlaying);
    document.addEventListener("visibilitychange", handleVisibility);
    observer.observe(video);
    requestPlayback();

    return () => {
      active = false;
      observer.disconnect();
      document.removeEventListener("visibilitychange", handleVisibility);
      video.removeEventListener("play", syncPlaying);
      video.removeEventListener("pause", syncPlaying);
    };
  }, [hasVideo, reducedMotion]);

  const toggle = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      manualPlaybackRef.current = true;
      void video.play().catch(() => setPlaying(false));
    }
    else {
      manualPlaybackRef.current = false;
      video.pause();
    }
  };

  return (
    <div className="hero-media" aria-hidden={!hasVideo ? "true" : undefined}>
      {hasVideo ? (
        <video ref={videoRef} aria-hidden="true" muted loop playsInline preload="metadata" poster={poster}>
          {webm ? <source src={webm} type="video/webm" /> : null}
          {mp4 ? <source src={mp4} type="video/mp4" /> : null}
        </video>
      ) : (
        <img src={poster} alt="" width="1511" height="790" decoding="async" fetchPriority="high" />
      )}
      <div className="hero-media-signal" aria-hidden="true"><span /><span /><span /></div>
      <div className="home-video-shade" />
      {hasVideo ? (
        <button type="button" className="hero-media-toggle" onClick={toggle}>
          {playing ? "Pause background video" : "Play background video"}
        </button>
      ) : null}
    </div>
  );
}
