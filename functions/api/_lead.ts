type LeadEnvironment = { LEAD_WEBHOOK_URL?: string; LEAD_WEBHOOK_SECRET?: string };
type PagesContext = { request: Request; env: LeadEnvironment };

const json = (body: unknown, status: number) => new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" } });

export async function handleLead(context: PagesContext, kind: "contact" | "spark-register") {
  const { request, env } = context;
  if (!request.headers.get("content-type")?.toLowerCase().includes("application/json")) return json({ ok: false, formError: "Expected a JSON request." }, 400);
  const length = Number(request.headers.get("content-length") ?? 0);
  if (length > 16_384) return json({ ok: false, formError: "The submission is too large." }, 400);
  let body: Record<string, unknown>;
  try { body = await request.json() as Record<string, unknown>; } catch { return json({ ok: false, formError: "The submission could not be read." }, 400); }
  if (body.website_confirm) return json({ ok: true, referenceId: crypto.randomUUID() }, 200);
  const required = kind === "contact" ? ["email", "message", "consent"] : ["name", "email", "company", "website", "product", "field", "consent"];
  const fieldErrors = Object.fromEntries(required.filter((field) => typeof body[field] !== "string" || !(body[field] as string).trim()).map((field) => [field, "This field is required."]));
  if (Object.keys(fieldErrors).length) return json({ ok: false, fieldErrors, formError: "Complete the required fields." }, 400);
  if (!env.LEAD_WEBHOOK_URL || !env.LEAD_WEBHOOK_SECRET) return json({ ok: false, formError: "Submission is not open yet. No information has been sent." }, 503);
  const referenceId = crypto.randomUUID();
  const forwarded = await fetch(env.LEAD_WEBHOOK_URL, { method: "POST", headers: { "content-type": "application/json", authorization: `Bearer ${env.LEAD_WEBHOOK_SECRET}` }, body: JSON.stringify({ kind, referenceId, submittedAt: new Date().toISOString(), fields: body }) });
  if (!forwarded.ok) return json({ ok: false, formError: "The service could not accept the submission." }, 503);
  return json({ ok: true, referenceId }, 200);
}
