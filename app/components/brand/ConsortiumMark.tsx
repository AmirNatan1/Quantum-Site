import type { Partner } from "../../data";
import type { CSSProperties } from "react";

export function ConsortiumMark({ partner, sceneIndex, displayName }: { partner: Partner; sceneIndex?: number; displayName?: string }) {
  const sceneProps = sceneIndex === undefined ? {} : {
    "data-scene-part": "partner",
    style: { "--scene-order": sceneIndex } as CSSProperties,
  };
  if (partner.mark) {
    return (
      <img
        {...sceneProps}
        src={partner.mark.src}
        alt={partner.name}
        width={partner.mark.width}
        height={partner.mark.height}
      />
    );
  }

  return (
    <span {...sceneProps} className="consortium-wordmark" aria-label={partner.name}>
      <span aria-hidden="true">{displayName ?? partner.short}</span>
      <small>Consortium partner</small>
    </span>
  );
}
