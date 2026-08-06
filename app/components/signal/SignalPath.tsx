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
            <path className="quantum-signal-progress" pathLength="1" d={geometry.path} />
            {geometry.points.map((point) => (
              <circle
                key={point.id}
                className="quantum-signal-node"
                data-signal-node={point.id}
                data-path-progress={point.progress.toFixed(4)}
                cx={point.x}
                cy={point.y}
                r="5"
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
