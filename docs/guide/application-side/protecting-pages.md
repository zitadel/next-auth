---
title: Protecting Pages
group: Application Side
---

# Protecting pages

In Next.js App Router, the canonical place to gate routes is `middleware.ts`
at the project root. It runs before any route handler/Server Component.

## middleware.ts

```ts
// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getSession } from '~/lib/auth';

export async function middleware(request: NextRequest) {
  const session = await getSession(request);
  if (!session) {
    const url = new URL('/auth/login', request.url);
    url.searchParams.set('callbackUrl', request.nextUrl.pathname);
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/profile/:path*', '/dashboard/:path*'],
};
```

## In a Server Component

For per-page checks (without middleware):

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

## In a route handler

```ts
import { getSession } from '~/lib/auth';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const session = await getSession(request);
  if (!session) return NextResponse.json({ error: 'unauthorised' }, { status: 401 });
  // ... handler logic
}
```
