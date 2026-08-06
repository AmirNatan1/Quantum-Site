import type { Partner } from "../../data";

export function ConsortiumMark({ partner }: { partner: Partner }) {
  if (partner.mark) {
    return (
      <img
        src={partner.mark.src}
        alt={partner.mark.alt}
        width={partner.mark.width}
        height={partner.mark.height}
      />
    );
  }

  return (
    <span className="consortium-wordmark" aria-label={partner.name}>
      <span aria-hidden="true">{partner.short}</span>
      <small>Consortium partner</small>
    </span>
  );
}
