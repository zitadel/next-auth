import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';

/** Protects /api/protected/* routes before the route handler runs. */
export async function middleware(request: NextRequest) {
  const session = await getSession(request);
  if (!session) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/api/protected/:path*'],
};
