/** Middleware-protected endpoint — auth enforced by middleware.ts. */
// noinspection JSUnusedGlobalSymbols
export async function GET() {
  return Response.json({ ok: true });
}
