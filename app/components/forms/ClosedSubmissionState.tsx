import Link from "next/link";

type ClosedSubmissionKind = "contact" | "spark-register";

export function ClosedSubmissionState({ kind }: { kind: ClosedSubmissionKind }) {
  const isSpark = kind === "spark-register";

  return (
    <section className="form-status publication-state" aria-labelledby={`${kind}-availability`}>
      <span>Submission unavailable</span>
      <h3 id={`${kind}-availability`}>{isSpark ? "Applications are not open right now" : "The public contact form is unavailable"}</h3>
      <p>{isSpark
        ? "Current application dates and an approved submission route are not available. No information can be submitted through this page."
        : "Approved privacy wording is not yet in place, so no form is shown and no information can be submitted through this site."}</p>
      <nav className="form-status-links" aria-label={isSpark ? "SPARK information" : "Quantum Hub information"}>
        {isSpark ? (
          <>
            <Link href="/spark">How SPARK works</Link>
            <Link href="/for-startups">For Startups</Link>
          </>
        ) : (
          <>
            <Link href="/for-partners">For Industry</Link>
            <Link href="/for-startups">For Startups</Link>
          </>
        )}
      </nav>
    </section>
  );
}
