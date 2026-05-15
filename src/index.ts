import {
  Auth,
  type AuthConfig,
  setEnvDefaults,
  createActionURL,
} from '@auth/core';
import type { Session } from '@auth/core/types';

export { AuthError, CredentialsSignin } from '@auth/core/errors';
export type {
  Account,
  DefaultSession,
  Profile,
  Session,
  User,
} from '@auth/core/types';

/**
 * Auth.js configuration for Next.js App Router applications.
 */
export type NextAuthConfig = Omit<AuthConfig, 'raw'>;

type NextRequest = Request & {
  nextUrl: URL;
};

type NextResponse = Response;

/**
 * Creates an Auth.js handler for Next.js App Router.
 *
 * @param config - Auth.js configuration
 * @returns Object containing handlers, auth, signIn, and signOut
 *
 * @example
 * ```ts
 * // src/lib/auth.ts
 * import { NextAuth } from '@zitadel/next-auth';
 * import Zitadel from '@auth/core/providers/zitadel';
 *
 * export const { handlers, auth, signIn, signOut } = NextAuth({
 *   providers: [Zitadel({ ... })],
 *   secret: process.env.AUTH_SECRET,
 * });
 * ```
 */
export function NextAuth(config: NextAuthConfig): {
  handlers: {
    GET: (req: NextRequest) => Promise<NextResponse>;
    POST: (req: NextRequest) => Promise<NextResponse>;
  };
  auth: (req: Request) => Promise<Session | null>;
  signIn: (provider?: string, options?: { redirectTo?: string }) => Promise<NextResponse>;
  signOut: (options?: { redirectTo?: string }) => Promise<NextResponse>;
} {
  setEnvDefaults(process.env, config);

  async function handler(req: NextRequest): Promise<NextResponse> {
    return Auth(req as unknown as Request, config);
  }

  async function auth(req: Request): Promise<Session | null> {
    const headers = new Headers(req.headers);
    const url = createActionURL(
      'session',
      new URL(req.url).protocol.slice(0, -1) as 'http' | 'https',
      headers,
      process.env,
      config,
    );
    const response = await Auth(
      new Request(url, { headers: { cookie: req.headers.get('cookie') ?? '' } }),
      config,
    );
    const data = await response.json();
    if (data && typeof data === 'object' && Object.keys(data).length > 0) {
      return data as Session;
    }
    return null;
  }

  async function signIn(
    provider?: string,
    options: { redirectTo?: string } = {},
  ): Promise<NextResponse> {
    const basePath = (config.basePath ?? '/api/auth').replace(/\/$/, '');
    const params = new URLSearchParams();
    if (options.redirectTo) {
      params.set('callbackUrl', options.redirectTo);
    }
    const paramStr = params.toString();
    const url = provider
      ? `${basePath}/signin/${provider}${paramStr ? `?${paramStr}` : ''}`
      : `${basePath}/signin${paramStr ? `?${paramStr}` : ''}`;
    return Response.redirect(url, 302);
  }

  async function signOut(
    options: { redirectTo?: string } = {},
  ): Promise<NextResponse> {
    const basePath = (config.basePath ?? '/api/auth').replace(/\/$/, '');
    const params = new URLSearchParams();
    if (options.redirectTo) {
      params.set('callbackUrl', options.redirectTo);
    }
    const paramStr = params.toString();
    const url = `${basePath}/signout${paramStr ? `?${paramStr}` : ''}`;
    return Response.redirect(url, 302);
  }

  return {
    handlers: { GET: handler, POST: handler },
    auth,
    signIn,
    signOut,
  };
}
