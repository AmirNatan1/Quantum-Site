import { homeSignalAnchors } from "../../data";
import type { SignalGeometry } from "../../hooks/useQuantumSignalNarrative";

export function SignalPath({ geometry }: { geometry: SignalGeometry }) {
  return (
    <>
      <div className="quantum-signal-layer" aria-hidden="true">
        {geometry.path ? (
          <svg
            viewBox={`0 0 ${geometry.width} ${geometry.height}`}
            preserveAspectRatio="none"
            role="presentation"
            focusable="false"
          >
            <path className="quantum-signal-track" d={geometry.path} />
            <path className="quantum-signal-carrier" pathLength="1" d={geometry.path} />
            <path className="quantum-signal-head" pathLength="1" d={geometry.path} />
            {geometry.points.map((point) => (
              <line
                key={point.id}
                className="quantum-signal-anchor-mark"
                data-signal-mark={point.id}
                data-path-progress={point.progress.toFixed(4)}
                x1={point.x - 4}
                x2={point.x + 4}
                y1={point.y}
                y2={point.y}
              />
            ))}
          </svg>
        ) : null}
      </div>
      <div className="quantum-signal-fallback" aria-hidden="true">
        {homeSignalAnchors.map((anchor) => <i key={anchor.id} />)}
      </div>
    </>
  );
}
