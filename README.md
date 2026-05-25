# Next.js Auth

A [Next.js](https://nextjs.org/) App Router integration that provides seamless authentication with
multiple providers, session management, and React client primitives.

This integration brings the power and flexibility of OAuth to Next.js App
Router applications with full TypeScript support, native Fetch API handling,
and React hooks and components for session state management.

### Why?

Modern web applications require robust, secure, and flexible authentication
systems. Integrating OAuth and session management with Next.js App Router requires
careful consideration of framework patterns, server-side rendering, and
TypeScript integration.

However, a direct integration isn't always straightforward. Different types
of applications or deployment scenarios might warrant different approaches:

- **App Router Compatibility:** OAuth and auth flows operate at the HTTP level, while
  Next.js App Router uses route handlers, server components, and React Server
  Components boundaries. A proper integration should bridge this gap by
  providing App Router-native primitives.
- **HTTP Request Handling:** Next.js route handlers expect GET and POST
  exports that accept native `Request` objects. This integration wires OAuth
  directly to these handlers with no adapter overhead.
- **Session and React Lifecycle:** Proper session handling requires both
  server-side utilities for components and layouts and client-side React
  hooks for interactive UI — `useSession`, `SessionProvider`, and imperative
  `signIn`/`signOut` helpers.
- **Route Protection:** Many applications need fine-grained authorization
  beyond simple authentication. This integration provides server-side `auth()`
  utilities suitable for middleware and server components.

This integration, `@zitadel/next-auth`, aims to provide the flexibility to
handle such scenarios. It allows you to leverage the full OAuth provider ecosystem
while maintaining Next.js best practices, ultimately leading to a more
effective and less burdensome authentication implementation.

## Installation

Install using NPM by using the following command:

```sh
npm install @zitadel/next-auth @auth/core
```

## Usage

To use this integration, call `NextAuth()` in a shared server module and
export the resulting handlers from your App Router catch-all route.

You'll need to configure it with your OAuth providers and options. The
returned `handlers`, `auth`, `signIn`, and `signOut` utilities are then
available throughout your application.

First, create your auth configuration:

```ts
// src/lib/auth.ts
import { NextAuth } from '@zitadel/next-auth';
import Zitadel from '@auth/core/providers/zitadel';

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Zitadel({
      clientId: process.env.ZITADEL_CLIENT_ID,
      clientSecret: process.env.ZITADEL_CLIENT_SECRET,
      issuer: process.env.ZITADEL_DOMAIN,
    }),
  ],
  secret: process.env.AUTH_SECRET,
  trustHost: true,
});
```

Then wire up the route handler:

```ts
// src/app/api/auth/[...nextauth]/route.ts
import { handlers } from '@/lib/auth';
export const { GET, POST } = handlers;
```

#### Using the Authentication System

The integration provides several functions and hooks for handling
authentication:

**Server Utilities:**

- `auth(request)`: Retrieves the current OAuth session server-side
- `signIn(provider?, options?)`: Server action for programmatic sign-in
- `signOut(options?)`: Server action for programmatic sign-out

**React Client Exports** (from `@zitadel/next-auth/react`):

- `<SessionProvider>`: Context provider — wrap your root layout
- `useSession()`: React hook returning `{ data, status, update }`
- `signIn(provider?, options?)`: Client helper for sign-in
- `signOut(options?)`: Client helper for sign-out
- `getProviders()`: Fetch available providers
- `getCsrfToken()`: Fetch the CSRF token

**Basic Server Component Usage:**

```tsx
// src/app/page.tsx
import { auth } from '@/lib/auth';

export default async function Page() {
  const session = await auth(/* request */);

  return (
    <main>
      {session ? (
        <>
          <p>Welcome, {session.user?.name}</p>
          <a href="/api/auth/signout">Sign out</a>
        </>
      ) : (
        <a href="/api/auth/signin">Sign in</a>
      )}
    </main>
  );
}
```

Prefer client-side session state? Use the React hooks:

```tsx
// src/app/layout.tsx
import { SessionProvider } from '@zitadel/next-auth/react';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <body>
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}
```

```tsx
// src/components/UserMenu.tsx
'use client';

import { useSession, signIn, signOut } from '@zitadel/next-auth/react';

export function UserMenu() {
  const { data: session, status } = useSession();

  if (status === 'loading') return <p>Loading…</p>;

  return session ? (
    <>
      <p>Signed in as {session.user?.email}</p>
      <button onClick={() => signOut()}>Sign out</button>
    </>
  ) : (
    <button onClick={() => signIn('zitadel')}>Sign in</button>
  );
}
```

##### Example: Advanced Configuration with Multiple Providers

This example shows how to use the integration with multiple OAuth
providers and custom session configuration:

```ts
// src/lib/auth.ts
import { NextAuth } from '@zitadel/next-auth';
import Zitadel from '@auth/core/providers/zitadel';
import Google from '@auth/core/providers/google';

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Zitadel({
      clientId: process.env.ZITADEL_CLIENT_ID,
      clientSecret: process.env.ZITADEL_CLIENT_SECRET,
      issuer: process.env.ZITADEL_DOMAIN,
    }),
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  secret: process.env.AUTH_SECRET,
  trustHost: true,
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) (token as any).roles = (user as any).roles;
      return token;
    },
    async session({ session, token }) {
      (session.user as any).roles = (token as any).roles as
        | string[]
        | undefined;
      return session;
    },
  },
});
```

## Known Issues

- **App Router Required:** This integration targets the Next.js App Router.
  Pages Router is not supported — use the official `next-auth` package for
  Pages Router projects.
- **Environment Configuration:** The integration relies on `AUTH_SECRET` and,
  in many hosting scenarios, `AUTH_TRUST_HOST`. Ensure these are correctly set
  in your environment for production.
- **Callback URLs:** OAuth providers must be configured with the correct
  callback URL: `[origin]/api/auth/callback/[provider]`.
- **Type Augmentation:** If you attach additional properties (e.g., roles) to
  the user session object, extend your app's types accordingly so consumers of
  `session.user` remain type-safe.
- **Redirect Semantics:** OAuth providers expect real browser navigations during
  sign-in. The client helpers handle this for you — avoid manual `fetch()` calls
  to provider endpoints unless you know you need credential/email flows.

## Useful links

- **[Next.js](https://nextjs.org/):** The framework this integration targets.

## Contributing

If you have suggestions for how this integration could be improved, or
want to report a bug, open an issue — we'd love all and any contributions.

## License

Apache-2.0
