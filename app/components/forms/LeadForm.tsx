import type { FormKind } from "../../lib/forms/schema";

export function LeadForm({ kind }: { kind: FormKind; available?: boolean }) {
  const isSpark = kind === "spark-register";

  return (
    <section className="form-status publication-state" aria-labelledby={`${kind}-availability`}>
      <span>Submission unavailable</span>
      <h3 id={`${kind}-availability`}>{isSpark ? "Applications are not open right now" : "The public contact form is unavailable"}</h3>
      <p>{isSpark
        ? "Current application dates and an approved submission route are not available. No information can be submitted through this page."
        : "Approved privacy wording is not yet in place, so no form is shown and no information can be submitted through this site."}</p>
    </section>
  );
}
