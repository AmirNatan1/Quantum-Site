import type { ProcessStage } from "../../data";

function DiagramGraphic({ diagram }: { diagram: ProcessStage["diagram"] }) {
  if (diagram === "constraints") {
    return (
      <svg viewBox="0 0 520 260" role="presentation" focusable="false" aria-hidden="true">
        <rect className="diagram-boundary boundary-outer" data-diagram-part="condition" x="48" y="28" width="424" height="204" rx="20" />
        <rect className="diagram-boundary boundary-middle" data-diagram-part="constraint" x="112" y="66" width="296" height="128" rx="16" />
        <rect className="diagram-focus" data-diagram-part="question" x="206" y="104" width="108" height="52" rx="10" />
        <path className="diagram-live-line" data-diagram-part="handoff" pathLength="1" d="M70 130 H190 M330 130 H450" />
      </svg>
    );
  }
  if (diagram === "scouting") {
    return (
      <svg viewBox="0 0 520 260" role="presentation" focusable="false" aria-hidden="true">
        <path className="diagram-scan-field" data-diagram-part="field" d="M58 190 Q260 24 462 190" />
        <path className="diagram-candidate-field" data-diagram-part="field" d="M82 184h10m28-36h8m32 22h12m34-48h8m31 54h10m30-66h12m29 42h9m35-27h11m26 57h10m24-39h8m-314 72h9m50-8h12m55 15h8m62-20h13m58 9h9" />
        <path className="diagram-shortlist-field" data-diagram-part="shortlist" d="M270 150h18m12-16h22m-8 32h26" />
        <path className="diagram-live-line diagram-scan-line" data-diagram-part="scan" pathLength="1" d="M260 216 L338 150" />
        <path className="diagram-selection" data-diagram-part="assessment" d="M246 116 H368 V182 H246 Z" />
      </svg>
    );
  }
  if (diagram === "alignment") {
    return (
      <svg viewBox="0 0 520 260" role="presentation" focusable="false" aria-hidden="true">
        <circle className="diagram-source" data-diagram-part="requirement" cx="86" cy="82" r="28" />
        <circle className="diagram-source" data-diagram-part="requirement" cx="86" cy="178" r="28" />
        <circle className="diagram-source" data-diagram-part="requirement" cx="434" cy="82" r="28" />
        <circle className="diagram-source" data-diagram-part="requirement" cx="434" cy="178" r="28" />
        <path className="diagram-live-line" data-diagram-part="alignment" pathLength="1" d="M114 82 C188 82 188 130 236 130 M114 178 C188 178 188 130 236 130 M406 82 C332 82 332 130 284 130 M406 178 C332 178 332 130 284 130" />
        <rect className="diagram-focus" data-diagram-part="shared-frame" x="236" y="106" width="48" height="48" rx="10" />
      </svg>
    );
  }
  if (diagram === "evidence") {
    return (
      <svg viewBox="0 0 520 260" role="presentation" focusable="false" aria-hidden="true">
        <rect className="diagram-criteria-frame" data-diagram-part="criteria" x="48" y="52" width="424" height="156" rx="18" />
        {[70, 154, 238, 322, 406].map((x) => <rect key={x} className="diagram-method-block" data-diagram-part="method" x={x} y="94" width="58" height="72" rx="8" />)}
        <path className="diagram-method-flow" data-diagram-part="method-flow" pathLength="1" d="M128 130 H154 M212 130 H238 M296 130 H322 M380 130 H406" />
        <path className="diagram-instrumentation" data-diagram-part="instrumentation" d="M99 94V76m84 18V76m84 18V76m84 18V76m84 18V76" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 520 260" role="presentation" focusable="false" aria-hidden="true">
      <path className="diagram-live-line" data-diagram-part="decision-entry" pathLength="1" d="M62 130 H222" />
      <circle className="diagram-resolution-node" data-diagram-part="decision" cx="246" cy="130" r="20" />
      <path className="diagram-resolution is-scale" data-diagram-part="outcome" pathLength="1" d="M266 130 C330 130 326 48 448 48" />
      <path className="diagram-resolution is-retest" data-diagram-part="outcome" pathLength="1" d="M266 130 H448" />
      <path className="diagram-resolution is-no" data-diagram-part="outcome" pathLength="1" d="M266 130 C330 130 326 212 448 212" />
      <circle className="diagram-resolution-end is-scale" cx="454" cy="48" r="8" />
      <circle className="diagram-resolution-end is-retest" cx="454" cy="130" r="8" />
      <rect className="diagram-resolution-end is-no" x="446" y="204" width="16" height="16" rx="3" />
    </svg>
  );
}

export function SignalStageDiagram({ stage, compact = false }: { stage: ProcessStage; compact?: boolean }) {
  return (
    <div className={`signal-stage-diagram diagram-${stage.diagram}${compact ? " is-compact" : ""}`} data-diagram={stage.diagram}>
      <DiagramGraphic diagram={stage.diagram} />
      {!compact && stage.resolutionLabels ? (
        <ul className="signal-resolution-labels">
          {stage.resolutionLabels.map((label, index) => <li key={label} className={`resolution-${index}`}>{label}</li>)}
        </ul>
      ) : !compact ? (
        <ul className="signal-diagram-labels">
          {stage.diagramLabels.map((label) => <li key={label}>{label}</li>)}
        </ul>
      ) : null}
    </div>
  );
}
