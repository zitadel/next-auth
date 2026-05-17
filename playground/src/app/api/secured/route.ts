import { NextRequest } from 'next/server';
import { getSession } from '@/lib/auth';

/** Protected endpoint — returns 403 when the request is unauthenticated. */
export async function GET(request: NextRequest) {
  const session = await getSession(request);
  if (!session) {
    return Response.json({ error: 'Forbidden' }, { status: 403 });
  }
  return Response.json({ ok: true });
}
