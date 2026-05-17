import { NextRequest, NextResponse } from 'next/server';

// noinspection JSUnusedGlobalSymbols
/**
 * Handles the logout callback by unconditionally clearing all Auth.js session
 * cookies and redirecting to the success page. This endpoint is used by
 * Playwright tests to verify that session cookies are properly cleared on
 * logout. In a production ZITADEL integration, this would also validate a
 * state parameter for CSRF protection.
 *
 * @param request - The incoming Next.js request object.
 * @returns A redirect response to /logout/success with authjs.* cookies cleared.
 */
export async function GET(request: NextRequest) {
  const successUrl = new URL('/', request.url);
  const response = NextResponse.redirect(successUrl, 302);

  for (const name of request.cookies.getAll().map((c) => c.name)) {
    if (name.startsWith('authjs.')) {
      response.cookies.delete({ name, path: '/' });
    }
  }

  return response;
}
