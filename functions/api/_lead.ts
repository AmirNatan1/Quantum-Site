type PagesContext = { request: Request; env: Record<string, unknown> };

const unavailable = () => new Response(
  JSON.stringify({ ok: false, formError: "Submission is not open. No information has been received or sent." }),
  {
    status: 503,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
    },
  },
);

export async function handleLead(context: PagesContext, kind: "contact" | "spark-register") {
  void context;
  void kind;
  return unavailable();
}
