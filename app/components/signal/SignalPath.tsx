import type { ProcessStage } from "../../data";

export function SignalPath({ stages, activeStage }: { stages: readonly ProcessStage[]; activeStage: number }) {
  return (
    <div className="signal-path" aria-hidden="true">
      <svg viewBox="0 0 360 560" role="presentation" focusable="false">
        <path className="signal-path-base" d="M70 24 C70 118 286 104 286 198 C286 292 70 272 70 366 C70 454 286 442 286 536" />
        <path className="signal-path-live" pathLength="1" d="M70 24 C70 118 286 104 286 198 C286 292 70 272 70 366 C70 454 286 442 286 536" />
        {stages.map((stage, index) => {
          const points = [[70, 24], [286, 150], [178, 280], [70, 410], [286, 536]];
          const [cx, cy] = points[index] ?? points[0];
          return <circle key={stage.id} className={`signal-node signal-node-${stage.state}${index === activeStage ? " is-active" : ""}`} cx={cx} cy={cy} r={index === activeStage ? 9 : 6} />;
        })}
      </svg>
      <div className="signal-path-legend"><span><i className="is-live" />Live / unresolved</span><span><i className="is-proven" />Proven outcome</span></div>
    </div>
  );
}
