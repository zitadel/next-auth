---
title: Caching
group: Advanced
children:
  - ./url-resolutions.md
  - ./deployment/self-hosted.md
  - ./deployment/vercel.md
  - ./deployment/netlify.md
---

# Caching content

Hosting providers often offer caching at the edge. Most sites see big
speed wins (and cost savings) by taking advantage of it — no cold
start, no request processing, no JavaScript parsing, just HTML served
straight from a CDN.

By default the user's session is read server-side and rendered into the
HTML. That's fine for personalised pages, but it's a footgun the moment
those pages are cached: a cached response containing user A's session
will be served to user B.

To add caching in Next.js, follow the
[App Router caching docs](https://nextjs.org/docs/app/building-your-application/caching).

:::warning
If you cache a route, that route MUST NOT call `getSession()` or render
session data server-side. Otherwise the first user's session leaks into
the cached HTML served to everyone else.
:::

## Page specific cache rules

For a single cached route, use route segment config to opt that page
into static rendering, and read the session on the client instead:

```ts
// src/app/page.tsx
export const dynamic = 'force-static';
export const revalidate = 86400;

export default function Home() {
  // Do not call getSession() here. Read session client-side via
  // <SessionProvider> + useSession() if you need it.
  return <main>Public landing page</main>;
}
```

## Global cache rules

To cache most pages by default, set static rendering at the layout level
and only opt specific routes (like `/profile`) back into dynamic
rendering:

```ts
// src/app/layout.tsx
export const dynamic = 'force-static';
export const revalidate = 86400;

export default function RootLayout({ children }) {
  return <html><body>{children}</body></html>;
}
```

## Combining rules

Route segment config is hierarchical — values declared on a page or
nested layout override values declared higher up. So you can flip the
default per route.

For example: cache every page except `/profile`.

```ts
// src/app/layout.tsx — global default: cached
export const dynamic = 'force-static';

// src/app/profile/page.tsx — opt this route back into dynamic rendering
export const dynamic = 'force-dynamic';

import { auth } from '@/auth';
export default async function Profile() {
  const session = await auth();
  return <pre>{JSON.stringify(session, null, 2)}</pre>;
}
```
