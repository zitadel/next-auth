---
title: NextAuth Factory
group: OAuth Provider
---

# NextAuth Factory

The `NextAuth()` factory wires up the auth handler and returns helpers
bound to your config. Call it once in `src/lib/auth.ts`:

```ts
import { NextAuth } from '@zitadel/next-auth';

export const {
  handlers,     // { GET, POST } for the catch-all route
  GET, POST,    // top-level aliases
  getSession,   // server-side session reader
  signIn,       // 302 Response to signin URL
  signInUrl,    // signin URL string
  signOut,      // 302 Response to signout URL
  signOutUrl,   // signout URL string
  auth,         // deprecated alias for getSession
} = NextAuth({
  secret: process.env.AUTH_SECRET,
  providers: [/* ... */],
});
```

## Return values

| Key | Type | Use |
|---|---|---|
| `handlers` | `{ GET, POST }` | Mount in the catch-all route file |
| `getSession` | `(req: Request) => Promise<Session \| null>` | Read the session in server contexts |
| `signIn` | `(provider?, options?) => Promise<Response>` | Returns a 302 to the signin URL |
| `signInUrl` | `(options?) => string` | Compute the signin URL without redirecting |
| `signOut` | `(options?) => Promise<Response>` | Returns a 302 to the signout URL |
| `signOutUrl` | `(options?) => string` | Compute the signout URL without redirecting |

## Mounting the handlers

```ts
// src/app/api/auth/[...nextauth]/route.ts
export { GET, POST } from '~/lib/auth';
```

## Server-side reads

See [Server-side session access](./server-side/session-access.md).
