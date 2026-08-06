import type { Partner } from "../../data";
import type { CSSProperties } from "react";

export function ConsortiumMark({ partner, sceneIndex }: { partner: Partner; sceneIndex?: number }) {
  const sceneProps = sceneIndex === undefined ? {} : {
    "data-scene-part": "partner",
    style: { "--scene-order": sceneIndex } as CSSProperties,
  };
  if (partner.mark) {
    return (
      <img
        {...sceneProps}
        src={partner.mark.src}
        alt={partner.mark.alt}
        width={partner.mark.width}
        height={partner.mark.height}
      />
    );
  }

  return (
    <span {...sceneProps} className="consortium-wordmark" aria-label={partner.name}>
      <span aria-hidden="true">{partner.short}</span>
      <small>Consortium partner</small>
    </span>
  );
}
