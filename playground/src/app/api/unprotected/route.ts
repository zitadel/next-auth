/** Public endpoint — accessible without authentication. */
export async function GET() {
  return Response.json({ ok: true });
}
