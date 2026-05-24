---
title: Session Access (client)
group: Application Side
---

# Client-side session access

For client components, wrap your tree with `SessionProvider` and use the
`useSession` hook from `@zitadel/next-auth/react`:

## SessionProvider

```tsx
// src/app/providers.tsx
'use client';
import { SessionProvider } from '@zitadel/next-auth/react';

export function Providers({ children }: { children: React.ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>;
}
```

Wrap your root layout in `<Providers>`.

## useSession

```tsx
'use client';
import { useSession } from '@zitadel/next-auth/react';

export function UserBadge() {
  const { data: session, status } = useSession();
  if (status === 'loading') return <span>Loading…</span>;
  if (!session) return <a href="/auth/login">Sign in</a>;
  return <span>Hello, {session.user?.name}</span>;
}
```

## signIn / signOut

```tsx
import { signIn, signOut } from '@zitadel/next-auth/react';

<button onClick={() => signIn('github')}>Sign in with GitHub</button>
<button onClick={() => signOut()}>Sign out</button>
```

For Server Components, prefer the server-side `getSession` documented in
[Server-side session access](../authjs/server-side/session-access.md) — it
avoids the client roundtrip.
