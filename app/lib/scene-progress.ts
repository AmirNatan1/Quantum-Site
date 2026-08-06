export type ProgressRange<T extends string = string> = {
  id: T;
  start: number;
  end: number;
};

export type ProgressTiming<T extends string = string> = {
  id: T;
  local: ProgressRange<T>;
  handoff: ProgressRange<T>;
};

export type VisibleBounds = {
  top: number;
  bottom: number;
};

export type SceneProgressState = "entry" | "progression" | "resolved";

export const SCENE_PROGRESS = {
  entryEnd: 0.14,
  buildStart: 0.12,
  buildEnd: 0.54,
  settleEnd: 0.64,
  handoffStart: 0.86,
} as const;

export const VIEWPORT_PROGRESS = {
  marker: 0.52,
  entryLine: 0.88,
  exitLine: 0.22,
  inlineExitLine: 0.52,
  consortiumExitLine: 0.32,
  audienceExitLine: 0.46,
  modelExitLine: 0.465,
  modelNarrowExitLine: 0.48,
} as const;

export function clamp01(value: number) {
  return Math.min(1, Math.max(0, value));
}

export function normalizeProgress(value: number, start: number, end: number) {
  return clamp01((value - start) / Math.max(1, end - start));
}

export function sceneProgressState(progress: number): SceneProgressState {
  if (progress < SCENE_PROGRESS.entryEnd) return "entry";
  if (progress < SCENE_PROGRESS.settleEnd) return "progression";
  return "resolved";
}

export function handoffProgress(progress: number) {
  return normalizeProgress(progress, SCENE_PROGRESS.handoffStart, 1);
}

export function progressTiming<T extends string>(range: ProgressRange<T>): ProgressTiming<T> {
  const span = Math.max(1, range.end - range.start);
  return {
    id: range.id,
    local: range,
    handoff: {
      id: range.id,
      start: range.start + span * SCENE_PROGRESS.handoffStart,
      end: range.end,
    },
  };
}

export function buildVisibleTiming<T extends string>(
  id: T,
  bounds: VisibleBounds,
  viewportHeight: number,
  options: { exitLine?: number; startMarker?: number } = {},
): ProgressTiming<T> {
  const exitLine = options.exitLine ?? VIEWPORT_PROGRESS.exitLine;
  const naturalStart = bounds.top
    + (VIEWPORT_PROGRESS.marker - VIEWPORT_PROGRESS.entryLine) * viewportHeight;
  const start = options.startMarker ?? naturalStart;
  const end = Math.max(
    start + 1,
    bounds.bottom + (VIEWPORT_PROGRESS.marker - exitLine) * viewportHeight,
  );
  return progressTiming({ id, start, end });
}

export function buildOwnershipRanges<T extends string>(
  timings: readonly ProgressTiming<T>[],
  firstMarker: number,
) {
  return timings.map((timing, index): ProgressRange<T> => {
    const start = index === 0 ? firstMarker : timings[index - 1].handoff.end;
    return { id: timing.id, start, end: Math.max(start + 1, timing.handoff.end) };
  });
}

export function sequenceCoincidentHandoffs<T extends string>(
  timings: readonly ProgressTiming<T>[],
) {
  const sequenced = [...timings];
  for (let first = 0; first < sequenced.length;) {
    let last = first + 1;
    while (
      last < sequenced.length
      && Math.abs(sequenced[last].local.start - sequenced[first].local.start) <= 1
      && Math.abs(sequenced[last].local.end - sequenced[first].local.end) <= 1
    ) last += 1;
    const count = last - first;
    if (count > 1) {
      const start = sequenced[first].handoff.start;
      const end = sequenced[first].local.end;
      const share = Math.max(1, (end - start) / count);
      for (let index = first; index < last; index += 1) {
        const offset = index - first;
        const timing = sequenced[index];
        sequenced[index] = {
          ...timing,
          handoff: {
            id: timing.id,
            start: start + share * offset,
            end: offset === count - 1 ? end : start + share * (offset + 1),
          },
        };
      }
    }
    first = last;
  }
  return sequenced;
}

export function buildPointRanges<T extends string>(
  ids: readonly T[],
  positions: ReadonlyMap<T, number>,
) {
  return ids.map((id, index): ProgressRange<T> => {
    const current = positions.get(id) ?? 0;
    const previousPosition = index > 0 ? positions.get(ids[index - 1]) ?? current : undefined;
    const nextPosition = index < ids.length - 1 ? positions.get(ids[index + 1]) ?? current : undefined;
    const previous = previousPosition ?? current - Math.max(1, (nextPosition ?? current + 1) - current);
    const next = nextPosition ?? current + Math.max(1, current - previous);
    const start = (previous + current) / 2;
    const end = (current + next) / 2;
    return { id, start, end: Math.max(start + 1, end) };
  });
}

export function activeRangeIndex<T extends string>(
  ranges: readonly ProgressRange<T>[],
  marker: number,
  previousIndex = 0,
) {
  if (ranges.length === 0) return -1;
  let index = Math.min(Math.max(previousIndex, 0), ranges.length - 1);
  while (index < ranges.length - 1 && marker >= ranges[index].end) index += 1;
  while (index > 0 && marker < ranges[index].start) index -= 1;
  return index;
}
