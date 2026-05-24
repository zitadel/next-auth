---
title: Server-Side Session Access
group: Auth.js Provider
category: Server Side
---

# Server-side session access

Access the current session from any server context (route handler, Server
Component, Server Action, middleware) using the factory-bound
`getSession`:

## In a route handler

```ts
// src/app/api/me/route.ts
import { getSession } from '~/lib/auth';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const session = await getSession(request);
  if (!session) {
    return NextResponse.json({ error: 'unauthorised' }, { status: 401 });
  }
  return NextResponse.json({ user: session.user });
}
```

## In a Server Component

```tsx
// src/app/profile/page.tsx
import { getSession } from '~/lib/auth';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

export default async function ProfilePage() {
  const session = await getSession(new Request('http://noop', { headers: await headers() }));
  if (!session) redirect('/auth/login');
  return <h1>Hello, {session.user?.name}</h1>;
}
```

## Return shape

`getSession()` returns the `Session` object Auth.js builds in the `session`
callback, or `null` when no valid session exists. It throws when Auth.js
returns a non-200 (e.g. on signature/decode failure).
