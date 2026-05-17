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

export type NextRequest = Request & {
  nextUrl: URL;
};

type NextResponse = Response;

/**
 * Creates an Auth.js handler for Next.js App Router.
 *
 * @param config - Auth.js configuration
 * @returns Object containing handlers, getSession, signIn, and signOut
 *
 * @example
 * ```ts
 * // src/lib/auth.ts
 * import { NextAuth } from '@zitadel/next-auth';
 * import Zitadel from '@auth/core/providers/zitadel';
 *
 * export const { handlers, getSession } = NextAuth({
 *   providers: [Zitadel({ ... })],
 *   secret: process.env.AUTH_SECRET,
 * });
 * ```
 *
 * @example
 * ```ts
 * // src/app/api/auth/[...nextauth]/route.ts
 * import { handlers } from '@/lib/auth';
 * export const { GET, POST } = handlers;
 * ```
 */
export function NextAuth(config: NextAuthConfig): {
  handlers: {
    GET: (req: NextRequest) => Promise<NextResponse>;
    POST: (req: NextRequest) => Promise<NextResponse>;
  };
  /** @deprecated Use `handlers.GET` instead */
  GET: (req: NextRequest) => Promise<NextResponse>;
  /** @deprecated Use `handlers.POST` instead */
  POST: (req: NextRequest) => Promise<NextResponse>;
  getSession: (req: Request) => Promise<Session | null>;
  /** @deprecated Use `getSession` instead */
  auth: (req: Request) => Promise<Session | null>;
  signIn: (
    provider?: string,
    options?: { redirectTo?: string },
  ) => Promise<NextResponse>;
  signOut: (options?: { redirectTo?: string }) => Promise<NextResponse>;
} {
  config.basePath ??= '/api/auth';
  setEnvDefaults(process.env, config);

  async function handler(req: NextRequest): Promise<NextResponse> {
    return Auth(req as unknown as Request, config);
  }

  async function getSession(req: Request): Promise<Session | null> {
    const headers = new Headers(req.headers);
    const url = createActionURL(
      'session',
      new URL(req.url).protocol.slice(0, -1) as 'http' | 'https',
      headers,
      process.env,
      config,
    );
    const response = await Auth(
      new Request(url, {
        headers: { cookie: req.headers.get('cookie') ?? '' },
      }),
      config,
    );
    const { status } = response;
    const data = (await response.json()) as Record<string, unknown> | null;
    if (!data || !Object.keys(data).length) return null;
    if (status === 200) return data as unknown as Session;
    throw new Error((data as { message?: string }).message ?? 'Session error');
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
    GET: handler,
    POST: handler,
    getSession,
    auth: getSession,
    signIn,
    signOut,
  };
}

/**
 * Retrieves the current session on the server side.
 *
 * Standalone two-argument form — use this when you don't have a factory instance
 * but have a request and config available directly.
 *
 * @param req - The current Request object
 * @param config - Auth.js configuration
 * @returns The session object or null
 *
 * @example
 * ```ts
 * import { getSession } from '@zitadel/next-auth';
 * import { authOptions } from '@/lib/auth';
 *
 * const session = await getSession(request, authOptions);
 * ```
 */
export async function getSession(
  req: Request,
  config: NextAuthConfig,
): Promise<Session | null> {
  config.basePath ??= '/api/auth';
  setEnvDefaults(process.env, config);

  const url = createActionURL(
    'session',
    new URL(req.url).protocol.slice(0, -1) as 'http' | 'https',
    new Headers(req.headers),
    process.env,
    config,
  );

  const response = await Auth(
    new Request(url, {
      headers: { cookie: req.headers.get('cookie') ?? '' },
    }),
    config,
  );

  const { status } = response;
  const data = (await response.json()) as Record<string, unknown> | null;
  if (!data || !Object.keys(data).length) return null;
  if (status === 200) return data as unknown as Session;
  throw new Error((data as { message?: string }).message ?? 'Session error');
}
