'use client';

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import type { Session } from '@auth/core/types';

export type { Session };

/**
 * Reactive session context value returned by `useSession`.
 *
 * @public
 */
export interface SessionContextValue {
  data: Session | null;
  status: 'loading' | 'authenticated' | 'unauthenticated';
  update: () => Promise<Session | null>;
}

const SessionContext = createContext<SessionContextValue | null>(null);

/**
 * Props for {@link SessionProvider}.
 *
 * @public
 */
export interface SessionProviderProps {
  children: ReactNode;
  session?: Session | null;
  basePath?: string;
}

/**
 * Provides session context to your application.
 * Wrap your root layout with this component.
 *
 * @public
 */
export function SessionProvider({
  children,
  session: initialSession,
  basePath = '/api/auth',
}: SessionProviderProps) {
  const [session, setSession] = useState<Session | null>(
    initialSession !== undefined ? (initialSession ?? null) : null,
  );
  const [status, setStatus] = useState<
    'loading' | 'authenticated' | 'unauthenticated'
  >(
    initialSession !== undefined
      ? initialSession
        ? 'authenticated'
        : 'unauthenticated'
      : 'loading',
  );

  useEffect(() => {
    if (initialSession !== undefined) return;

    fetch(`${basePath}/session`)
      .then((res) => res.json())
      .then((data: unknown) => {
        if (data && typeof data === 'object' && Object.keys(data).length > 0) {
          setSession(data as Session);
          setStatus('authenticated');
        } else {
          setSession(null);
          setStatus('unauthenticated');
        }
      })
      .catch(() => {
        setSession(null);
        setStatus('unauthenticated');
      });
  }, [initialSession, basePath]);

  const update = async (): Promise<Session | null> => {
    try {
      const res = await fetch(`${basePath}/session`);
      const data: unknown = await res.json();
      if (data && typeof data === 'object' && Object.keys(data).length > 0) {
        setSession(data as Session);
        setStatus('authenticated');
        return data as Session;
      } else {
        setSession(null);
        setStatus('unauthenticated');
        return null;
      }
    } catch {
      return null;
    }
  };

  return React.createElement(
    SessionContext.Provider,
    { value: { data: session, status, update } },
    children,
  );
}

/**
 * Returns the current session data and status.
 * Must be used inside a SessionProvider.
 *
 * @public
 */
export function useSession(): SessionContextValue {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error('useSession must be used within a SessionProvider');
  }
  return context;
}

/**
 * Submits a CSRF-protected POST form to an Auth.js action endpoint.
 *
 * Auth.js v5 only accepts POST requests carrying a CSRF token at its action
 * endpoints; a plain GET navigation is rejected as an `UnknownAction` and
 * redirects to the Configuration error page. We fetch the current CSRF token
 * and submit a hidden form so the browser performs a real POST navigation.
 *
 * @param action - The Auth.js endpoint to post to
 * @param fields - Extra hidden fields to include alongside the CSRF token
 */
async function postToAuth(
  action: string,
  fields: Record<string, string>,
): Promise<void> {
  const csrfToken = await getCsrfToken();

  const form = document.createElement('form');
  form.method = 'POST';
  form.action = action;

  for (const [name, value] of Object.entries({ csrfToken, ...fields })) {
    const input = document.createElement('input');
    input.type = 'hidden';
    input.name = name;
    input.value = value;
    form.appendChild(input);
  }

  document.body.appendChild(form);
  form.submit();
}

/**
 * Initiates the sign-in flow by submitting a CSRF-protected POST to the
 * provider's auth endpoint.
 *
 * @param provider - The provider ID to sign in with. When omitted, the request
 *   targets the provider chooser page.
 * @param options - Sign-in options
 *
 * @public
 */
export async function signIn(
  provider?: string,
  options: { callbackUrl?: string } = {},
): Promise<void> {
  const basePath = '/api/auth';
  const action = provider
    ? `${basePath}/signin/${provider}`
    : `${basePath}/signin`;
  const fields: Record<string, string> = {};
  if (options.callbackUrl) {
    fields.callbackUrl = options.callbackUrl;
  }
  await postToAuth(action, fields);
}

/**
 * Signs the user out by submitting a CSRF-protected POST to the sign-out
 * endpoint.
 *
 * @param options - Sign-out options
 *
 * @public
 */
export async function signOut(
  options: { callbackUrl?: string } = {},
): Promise<void> {
  const fields: Record<string, string> = {};
  if (options.callbackUrl) {
    fields.callbackUrl = options.callbackUrl;
  }
  await postToAuth('/api/auth/signout', fields);
}

/**
 * Fetches available authentication providers.
 *
 * @public
 */
export async function getProviders(): Promise<Record<
  string,
  {
    id: string;
    name: string;
    type: string;
    signinUrl: string;
    callbackUrl: string;
  }
> | null> {
  try {
    const res = await fetch('/api/auth/providers');
    return res.json();
  } catch {
    return null;
  }
}

/**
 * Fetches the CSRF token for form submissions.
 *
 * @public
 */
export async function getCsrfToken(): Promise<string> {
  try {
    const res = await fetch('/api/auth/csrf');
    const data = (await res.json()) as { csrfToken?: string };
    return data.csrfToken ?? '';
  } catch {
    return '';
  }
}

/**
 * Provider information returned by {@link getProviders}.
 *
 * @public
 */
export type ClientSafeProvider = {
  id: string;
  name: string;
  type: string;
  signinUrl: string;
  callbackUrl: string;
};
