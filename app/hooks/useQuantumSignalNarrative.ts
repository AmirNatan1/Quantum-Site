"use client";

import { RefObject, useEffect, useState } from "react";
import {
  homeSceneContract,
  processStages,
  type HomeSceneContract,
  type HomeSceneId,
  type HomeSignalAnchorId,
  type ProcessStage,
  type SignalLane,
} from "../data";
import { track } from "../lib/analytics";
import {
  activeRangeIndex,
  buildOwnershipRanges,
  buildPointRanges,
  buildVisibleTiming,
  clamp01,
  normalizeProgress,
  progressTiming,
  SCENE_PROGRESS,
  sceneProgressState,
  sequenceCoincidentHandoffs,
  VIEWPORT_PROGRESS,
  type ProgressRange,
  type ProgressTiming,
} from "../lib/scene-progress";
import { SCROLL_FRAME_EVENT } from "../lib/scroll-frame";
import { useReducedMotion } from "./useReducedMotion";

export type SignalPoint = {
  id: HomeSignalAnchorId;
  x: number;
  y: number;
  progress: number;
};

export type SignalGeometry = {
  width: number;
  height: number;
  path: string;
  points: readonly SignalPoint[];
};

type StageId = ProcessStage["id"];

type NarrativeCache = {
  sceneTimings: readonly ProgressTiming<HomeSceneId>[];
  sceneOwnership: readonly ProgressRange<HomeSceneId>[];
  stageTimings: readonly ProgressTiming<StageId>[];
  stageOwnership: readonly ProgressRange<StageId>[];
  anchorProgress: ReadonlyMap<HomeSignalAnchorId, number>;
  sceneIndex: number;
  stageIndex: number;
};

const EMPTY_GEOMETRY: SignalGeometry = { width: 1, height: 1, path: "", points: [] };
const EMPTY_CACHE: NarrativeCache = {
  sceneTimings: [],
  sceneOwnership: [],
  stageTimings: [],
  stageOwnership: [],
  anchorProgress: new Map(),
  sceneIndex: 0,
  stageIndex: 0,
};
const STAGE_IDS = processStages.map((stage) => stage.id);
const STAGE_ID_SET = new Set<StageId>(STAGE_IDS);
const WRITE_EPSILON = 0.0025;

type Cubic = {
  start: SignalPoint;
  controlOne: { x: number; y: number };
  controlTwo: { x: number; y: number };
  end: SignalPoint;
};

function cubicPosition(segment: Cubic, progress: number) {
  const inverse = 1 - progress;
  return {
    x: inverse ** 3 * segment.start.x
      + 3 * inverse ** 2 * progress * segment.controlOne.x
      + 3 * inverse * progress ** 2 * segment.controlTwo.x
      + progress ** 3 * segment.end.x,
    y: inverse ** 3 * segment.start.y
      + 3 * inverse ** 2 * progress * segment.controlOne.y
      + 3 * inverse * progress ** 2 * segment.controlTwo.y
      + progress ** 3 * segment.end.y,
  };
}

function buildPath(inputPoints: readonly Omit<SignalPoint, "progress">[]) {
  if (inputPoints.length === 0) return { path: "", points: [] as SignalPoint[] };
  const points = inputPoints.map((point) => ({ ...point, progress: 0 }));
  const segments: Cubic[] = [];
  let path = `M ${points[0].x} ${points[0].y}`;

  points.slice(1).forEach((point, index) => {
    const previous = points[index];
    const distance = Math.max(0, point.y - previous.y);
    const handle = Math.min(Math.min(Math.max(distance * 0.42, 48), 240), distance / 2);
    const segment = {
      start: previous,
      controlOne: { x: previous.x, y: previous.y + handle },
      controlTwo: { x: point.x, y: point.y - handle },
      end: point,
    };
    segments.push(segment);
    path += ` C ${segment.controlOne.x} ${segment.controlOne.y}, ${segment.controlTwo.x} ${segment.controlTwo.y}, ${point.x} ${point.y}`;
  });

  const lengths = segments.map((segment) => {
    let length = 0;
    let previous = cubicPosition(segment, 0);
    for (let sample = 1; sample <= 16; sample += 1) {
      const current = cubicPosition(segment, sample / 16);
      length += Math.hypot(current.x - previous.x, current.y - previous.y);
      previous = current;
    }
    return length;
  });
  const total = Math.max(1, lengths.reduce((sum, length) => sum + length, 0));
  let traversed = 0;
  points[0].progress = 0;
  lengths.forEach((length, index) => {
    traversed += length;
    points[index + 1].progress = traversed / total;
  });

  return { path, points };
}

function lanePosition(lane: SignalLane) {
  if (lane === "start") return 24;
  if (lane === "end") return 80;
  return 52;
}

function mix(start: number, end: number, progress: number) {
  return start + (end - start) * clamp01(progress);
}

function writeProgress(element: HTMLElement, property: string, value: number, force = false) {
  const previous = Number(element.style.getPropertyValue(property));
  if (!force && Number.isFinite(previous) && Math.abs(previous - value) < WRITE_EPSILON) return;
  element.style.setProperty(property, value.toFixed(4));
}

function documentLayoutTop(element: HTMLElement) {
  let top = 0;
  let current: HTMLElement | null = element;
  while (current) {
    top += current.offsetTop;
    current = current.offsetParent as HTMLElement | null;
  }
  return top;
}

function nextSceneEntry(sceneIndex: number) {
  return homeSceneContract[sceneIndex + 1]?.entryAnchor ?? homeSceneContract[sceneIndex].exitAnchor;
}

function signalProgressForScene(
  scene: HomeSceneContract,
  sceneIndex: number,
  localProgress: number,
  outgoingProgress: number,
  anchors: ReadonlyMap<HomeSignalAnchorId, number>,
) {
  const entry = anchors.get(scene.entryAnchor) ?? 0;
  const exit = anchors.get(scene.exitAnchor) ?? entry;
  const next = anchors.get(nextSceneEntry(sceneIndex)) ?? exit;

  if (scene.id === "consortium" || scene.id === "spark-test-transition") {
    if (outgoingProgress === 0) {
      return mix(entry, exit, normalizeProgress(localProgress, SCENE_PROGRESS.entryEnd, SCENE_PROGRESS.buildEnd));
    }
    return mix(exit, next, outgoingProgress);
  }
  if (scene.mode === "static") return mix(exit, next, outgoingProgress);
  if (scene.id === "final-conversion") return exit;
  return mix(exit, next, outgoingProgress);
}

export function useQuantumSignalNarrative(rootRef: RefObject<HTMLElement | null>) {
  const [geometry, setGeometry] = useState<SignalGeometry>(EMPTY_GEOMETRY);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const anchors = Array.from(root.querySelectorAll<HTMLElement>("[data-signal-anchor]"))
      .sort((a, b) => Number(a.dataset.signalOrder) - Number(b.dataset.signalOrder));
    const stageElements = anchors.filter((anchor) => STAGE_ID_SET.has(anchor.dataset.signalAnchor as StageId));
    const sceneElements = new Map<HomeSceneId, HTMLElement>();
    root.querySelectorAll<HTMLElement>("[data-scene-id]").forEach((element) => {
      sceneElements.set(element.dataset.sceneId as HomeSceneId, element);
    });
    const sceneVisuals = new Map<HomeSceneId, readonly HTMLElement[]>();
    homeSceneContract.forEach((scene) => {
      const sceneElement = sceneElements.get(scene.id);
      if (!sceneElement) return;
      const declared = Array.from(sceneElement.querySelectorAll<HTMLElement>("[data-scene-visual]"));
      if (sceneElement.hasAttribute("data-scene-visual")) declared.unshift(sceneElement);
      sceneVisuals.set(scene.id, declared.length > 0 ? declared : [sceneElement]);
    });
    const story = sceneElements.get("quantum-route");
    const reached = new Set<StageId>();
    const fontSet = "fonts" in document ? document.fonts : null;
    let resizeTimer = 0;
    let measureFrame = 0;
    let cancelled = false;
    let cache = EMPTY_CACHE;

    const setSceneProgress = (scene: HomeSceneContract, progress: number, force = false) => {
      const element = sceneElements.get(scene.id);
      if (!element) return;
      const visualProgress = scene.mode === "static" || reducedMotion ? 1 : progress;
      writeProgress(element, "--scene-p", visualProgress, force);
      const state = scene.mode === "static" || reducedMotion ? "resolved" : sceneProgressState(progress);
      if (element.dataset.sceneState !== state) element.dataset.sceneState = state;
    };

    const setStageProgress = (element: HTMLElement, progress: number, force = false) => {
      const value = reducedMotion ? 1 : progress;
      writeProgress(element, "--stage-p", value, force);
      const state = reducedMotion ? "resolved" : sceneProgressState(progress);
      if (element.dataset.stageState !== state) element.dataset.stageState = state;
    };

    const updateProgress = (force = false) => {
      if (cache.sceneTimings.length === 0) return;
      if (reducedMotion) {
        homeSceneContract.forEach((scene) => setSceneProgress(scene, 1, force));
        stageElements.forEach((element) => setStageProgress(element, 1, force));
        root.style.setProperty("--signal-progress", "1");
        story?.style.setProperty("--stage-p", "1");
        story?.style.setProperty("--route-progress", "1");
        if (story) story.dataset.activeStage = STAGE_IDS.at(-1) ?? STAGE_IDS[0];
        return;
      }

      const marker = window.scrollY + window.innerHeight * VIEWPORT_PROGRESS.marker;
      const sceneIndex = activeRangeIndex(cache.sceneOwnership, marker, cache.sceneIndex);
      cache.sceneIndex = sceneIndex;
      homeSceneContract.forEach((scene, index) => {
        const range = cache.sceneTimings[index].local;
        setSceneProgress(scene, normalizeProgress(marker, range.start, range.end), force);
      });

      let stageIndex = cache.stageIndex;
      let stageProgress = 0;
      let stageHandoff = 0;
      if (cache.stageTimings.length > 0) {
        stageIndex = activeRangeIndex(cache.stageOwnership, marker, cache.stageIndex);
        cache.stageIndex = stageIndex;
        cache.stageTimings.forEach((timing, index) => {
          const progress = normalizeProgress(marker, timing.local.start, timing.local.end);
          const element = stageElements[index];
          if (element) setStageProgress(element, progress, force);
          if (index === stageIndex) {
            stageProgress = progress;
            stageHandoff = normalizeProgress(marker, timing.handoff.start, timing.handoff.end);
          }
        });
        const stage = processStages[stageIndex];
        if (story && stage) {
          if (story.dataset.activeStage !== stage.id) story.dataset.activeStage = stage.id;
          story.style.setProperty("--stage-index", String(stageIndex));
          writeProgress(story, "--stage-p", stageProgress, force);
          const ownership = cache.stageOwnership[stageIndex];
          const ownershipProgress = normalizeProgress(marker, ownership.start, ownership.end);
          writeProgress(story, "--route-progress", (stageIndex + ownershipProgress) / processStages.length, force);
        }
      }

      const scene = homeSceneContract[sceneIndex];
      const sceneTiming = cache.sceneTimings[sceneIndex];
      const sceneProgress = normalizeProgress(marker, sceneTiming.local.start, sceneTiming.local.end);
      const sceneHandoff = normalizeProgress(marker, sceneTiming.handoff.start, sceneTiming.handoff.end);
      let signalProgress = signalProgressForScene(scene, sceneIndex, sceneProgress, sceneHandoff, cache.anchorProgress);
      if (scene.id === "quantum-route") {
        const source = processStages[stageIndex]?.id ?? processStages[0].id;
        const target = processStages[stageIndex + 1]?.id ?? "representative-challenges";
        const start = cache.anchorProgress.get(source) ?? signalProgress;
        const end = cache.anchorProgress.get(target) ?? start;
        signalProgress = mix(start, end, stageHandoff);
      }
      writeProgress(root, "--signal-progress", signalProgress, force);
    };

    const measure = () => {
      measureFrame = 0;
      if (cancelled || anchors.length === 0) return;
      const rootRect = root.getBoundingClientRect();
      const rootTop = documentLayoutTop(root);
      const collapsedRail = window.innerWidth <= 1320;
      const rawPoints = anchors.map((anchor) => {
        const port = anchor.querySelector<HTMLElement>(":scope > [data-signal-port]");
        const lane = (anchor.dataset.signalLane ?? "center") as SignalLane;
        return {
          id: anchor.dataset.signalAnchor as HomeSignalAnchorId,
          x: collapsedRail ? 8 : lanePosition(lane),
          y: port && port.offsetHeight > 0
            ? documentLayoutTop(port) - rootTop + port.offsetHeight / 2
            : documentLayoutTop(anchor) - rootTop + Math.min(Math.max(anchor.offsetHeight * 0.22, 34), 120),
        };
      });
      const built = buildPath(rawPoints);
      const width = Math.max(1, Math.round(rootRect.width));
      const height = Math.max(1, Math.round(root.scrollHeight));
      const anchorPositions = new Map<HomeSignalAnchorId, number>();
      const anchorProgress = new Map<HomeSignalAnchorId, number>();
      built.points.forEach((point) => {
        anchorPositions.set(point.id, rootTop + point.y);
        anchorProgress.set(point.id, point.progress);
      });
      const firstMarker = window.innerHeight * VIEWPORT_PROGRESS.marker;
      const elementBounds = (elements: readonly HTMLElement[]) => elements.reduce((bounds, element) => {
        const top = documentLayoutTop(element);
        return { top: Math.min(bounds.top, top), bottom: Math.max(bounds.bottom, top + element.offsetHeight) };
      }, { top: Number.POSITIVE_INFINITY, bottom: Number.NEGATIVE_INFINITY });
      const sceneTimings = homeSceneContract.map((scene, index) => {
        const elements = sceneVisuals.get(scene.id) ?? [];
        const fallback = anchorPositions.get(scene.entryAnchor) ?? rootTop;
        const measured = elements.length > 0 ? elementBounds(elements) : { top: fallback, bottom: fallback + 1 };
        const exitLine = scene.id === "consortium"
          ? VIEWPORT_PROGRESS.consortiumExitLine
          : scene.id === "audience"
            ? VIEWPORT_PROGRESS.audienceExitLine
            : scene.id === "operating-model"
              ? window.innerWidth <= 560
                ? VIEWPORT_PROGRESS.modelNarrowExitLine
                : VIEWPORT_PROGRESS.modelExitLine
              : scene.id === "spark-test-transition" || scene.id === "final-conversion"
                ? VIEWPORT_PROGRESS.inlineExitLine
                : undefined;
        return buildVisibleTiming(scene.id, measured, window.innerHeight, {
          exitLine,
          startMarker: index === 0 ? firstMarker : undefined,
        });
      });
      const sceneOwnership = buildOwnershipRanges(sceneTimings, firstMarker);
      const stickyEligible = window.matchMedia("(min-width: 1101px) and (min-height: 700px) and (prefers-reduced-motion: no-preference)").matches;
      const stagePositions = new Map<StageId, number>();
      stageElements.forEach((element) => {
        const id = element.dataset.signalAnchor as StageId;
        stagePositions.set(id, anchorPositions.get(id) ?? rootTop);
      });
      const stageTimings = stickyEligible
        ? buildPointRanges(STAGE_IDS, stagePositions).map(progressTiming)
        : sequenceCoincidentHandoffs(stageElements.map((element, index) => {
          const top = documentLayoutTop(element);
          return buildVisibleTiming(
            STAGE_IDS[index],
            { top, bottom: top + element.offsetHeight },
            window.innerHeight,
            { exitLine: VIEWPORT_PROGRESS.inlineExitLine },
          );
        }));
      const stageOwnership = buildOwnershipRanges(
        stageTimings,
        stageTimings[0]?.local.start ?? firstMarker,
      );

      cache = {
        sceneTimings,
        sceneOwnership,
        stageTimings,
        stageOwnership,
        anchorProgress,
        sceneIndex: cache.sceneIndex,
        stageIndex: cache.stageIndex,
      };
      setGeometry({ width, height, path: built.path, points: built.points });
      updateProgress(true);
      root.setAttribute("data-scene-enhanced", "");
    };

    const scheduleMeasure = () => {
      if (cancelled || measureFrame) return;
      measureFrame = window.requestAnimationFrame(measure);
    };
    const scheduleTrailingMeasure = () => {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(scheduleMeasure, 100);
    };
    const handleFrame = () => updateProgress();
    const stageObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const id = (entry.target as HTMLElement).dataset.signalAnchor as StageId;
        if (!STAGE_ID_SET.has(id) || reached.has(id)) return;
        reached.add(id);
        track({ event: "story_stage_reached", stage: id, route: "/" });
      });
    }, { rootMargin: "-36% 0px -46%", threshold: [0, 0.1] });

    const resizeObserver = new ResizeObserver(scheduleMeasure);
    resizeObserver.observe(root);
    anchors.forEach((anchor) => resizeObserver.observe(anchor));
    sceneVisuals.forEach((elements) => elements.forEach((element) => resizeObserver.observe(element)));
    stageElements.forEach((anchor) => stageObserver.observe(anchor));
    window.addEventListener(SCROLL_FRAME_EVENT, handleFrame);
    window.addEventListener("resize", scheduleTrailingMeasure, { passive: true });
    window.addEventListener("orientationchange", scheduleTrailingMeasure);
    fontSet?.addEventListener("loadingdone", scheduleMeasure);
    fontSet?.addEventListener("loadingerror", scheduleMeasure);
    void fontSet?.ready.then(scheduleMeasure).catch(scheduleMeasure);
    scheduleMeasure();

    return () => {
      cancelled = true;
      resizeObserver.disconnect();
      stageObserver.disconnect();
      window.removeEventListener(SCROLL_FRAME_EVENT, handleFrame);
      window.removeEventListener("resize", scheduleTrailingMeasure);
      window.removeEventListener("orientationchange", scheduleTrailingMeasure);
      fontSet?.removeEventListener("loadingdone", scheduleMeasure);
      fontSet?.removeEventListener("loadingerror", scheduleMeasure);
      window.clearTimeout(resizeTimer);
      window.cancelAnimationFrame(measureFrame);
      root.removeAttribute("data-scene-enhanced");
      root.style.removeProperty("--signal-progress");
      homeSceneContract.forEach((scene) => {
        const element = sceneElements.get(scene.id);
        element?.style.removeProperty("--scene-p");
        element?.removeAttribute("data-scene-state");
      });
      stageElements.forEach((element) => {
        element.style.removeProperty("--stage-p");
        element.removeAttribute("data-stage-state");
      });
    };
  }, [reducedMotion, rootRef]);

  return { geometry, reducedMotion };
}
