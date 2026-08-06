"use client";

import { FormEvent, useState } from "react";
import { FormErrorSummary } from "./FormErrorSummary";
import { formEndpoints, type FormApiResponse, type FormKind } from "../../lib/forms/schema";

export function LeadForm({ kind, available = false }: { kind: FormKind; available?: boolean }) {
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [response, setResponse] = useState<FormApiResponse | null>(null);
  const isSpark = kind === "spark-register";

  const showUnavailable = () => {
    setStatus("error");
    setResponse({ ok: false, formError: "Submission is not open yet. No information has been sent." });
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!available) {
      showUnavailable();
      return;
    }
    setStatus("submitting");
    const form = event.currentTarget;
    const payload = Object.fromEntries(new FormData(form).entries());
    try {
      const request = await fetch(formEndpoints[kind], { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(payload) });
      const result = await request.json() as FormApiResponse;
      setResponse(result);
      setStatus(request.ok && result.ok ? "success" : "error");
      if (request.ok && result.ok) form.reset();
    } catch {
      setResponse({ ok: false, formError: "The service could not be reached. Nothing was submitted." });
      setStatus("error");
    }
  };

  if (status === "success") {
    return <div className="form-status" role="status"><span>Received</span><h3>Thank you. Your reference is {response?.referenceId}.</h3><p>Keep this reference if you need to follow up.</p></div>;
  }

  return (
    <form onSubmit={submit} className={isSpark ? "application-form" : undefined} noValidate={false}>
      {!available ? <div className="form-availability" role="status"><strong>{isSpark ? "Applications are not currently open." : "The public contact endpoint is awaiting approval."}</strong><span>You can review the fields, but the site will not claim to send them.</span></div> : null}
      {status === "error" ? <FormErrorSummary message={response?.formError ?? "Please review the form."} errors={response?.fieldErrors} /> : null}
      <label className="honeypot" aria-hidden="true">Leave this field blank<input name="website_confirm" tabIndex={-1} autoComplete="off" /></label>
      {isSpark ? <label>Full name<input id="name" name="name" autoComplete="name" required /></label> : null}
      <label>Work email<input id="email" type="email" name="email" autoComplete="email" required placeholder="you@company.com" /></label>
      {isSpark ? <><label>Company<input id="company" name="company" autoComplete="organization" required /></label><label>Company website<input id="website" type="url" name="website" placeholder="https://" required /></label><label className="field-wide">What does the product do today?<textarea id="product" name="product" rows={5} required /></label><label className="field-wide">Where has it already run?<textarea id="field" name="field" rows={4} required /></label></> : <label>Message<textarea id="message" name="message" required rows={7} placeholder="What are you trying to test?" /></label>}
      <label className="field-wide checkbox-field"><input id="consent" name="consent" type="checkbox" value="yes" required /><span>I confirm this information is accurate and may be reviewed by Quantum-hub for this enquiry.</span></label>
      <button className="form-submit field-wide" type={available ? "submit" : "button"} onClick={available ? undefined : showUnavailable} disabled={status === "submitting"}>{status === "submitting" ? "Submitting…" : available ? (isSpark ? "Submit application" : "Send message") : "Check submission status"}<span className="arrow-line" aria-hidden="true" /></button>
    </form>
  );
}
