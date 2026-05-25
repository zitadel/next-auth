---
title: Custom Pages
group: OAuth Provider
---

# Custom auth pages

OAuth ships default sign-in and error pages. To use your own pages,
point `pages.signIn` and `pages.error` at your custom routes, then build
those routes in App Router:

## Config

```ts
// src/lib/auth.ts
NextAuth({
  // ...
  pages: {
    signIn: '/auth/login',
    error: '/auth/error',
  },
})
```

## Custom sign-in page

The page POSTs to `/api/auth/signin/{provider}` with a CSRF token:

```tsx
// src/app/auth/login/page.tsx
'use client';
import { useEffect, useState } from 'react';

export default function LoginPage() {
  const [csrfToken, setCsrfToken] = useState('');
  useEffect(() => {
    fetch('/api/auth/csrf').then((r) => r.json()).then((d) => setCsrfToken(d.csrfToken));
  }, []);
  return (
    <form action="/api/auth/signin/github" method="post">
      <input type="hidden" name="csrfToken" value={csrfToken} />
      <button type="submit">Sign in with GitHub</button>
    </form>
  );
}
```

## Custom error page

Renders auth error codes (`?error=Configuration`, etc.):

```tsx
// src/app/auth/error/page.tsx
'use client';
import { useSearchParams } from 'next/navigation';

export default function ErrorPage() {
  const error = useSearchParams().get('error') ?? 'default';
  return <main><h1>Sign-in error</h1><p>Code: {error}</p></main>;
}
```
