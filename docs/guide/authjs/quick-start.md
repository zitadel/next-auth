---
title: Quick Start
group: OAuth Provider
children:
  - ./next-auth-handler.md
  - ./session-data.md
  - ./custom-pages.md
  - ./server-side/session-access.md
  - ./server-side/rest-api.md
---

# OAuth Quick Start

This guide walks through setting up `@zitadel/next-auth` with the OAuth
provider, suitable for OAuth, magic links, and credentials sign-in.

## Installation

Install `@auth/core` alongside `@zitadel/next-auth`:

```bash
npm install @zitadel/next-auth @auth/core
```

## Configure NextAuth

Create `src/lib/auth.ts` and call the `NextAuth()` factory. Provide your
secret (or set `AUTH_SECRET`) and at least one provider:

```ts
// src/lib/auth.ts
import { NextAuth } from '@zitadel/next-auth';
import GitHub from '@auth/core/providers/github';

export const { handlers, getSession, signIn, signInUrl, signOut, signOutUrl } =
  NextAuth({
    secret: process.env.AUTH_SECRET,
    providers: [
      GitHub({
        clientId: process.env.GITHUB_ID,
        clientSecret: process.env.GITHUB_SECRET,
      }),
    ],
  });
```

## Mount the catch-all route

Create the App Router route handler. NextAuth() returns a `handlers` object
with `GET` and `POST` that bind to Next's route handler convention:

```ts
// src/app/api/auth/[...nextauth]/route.ts
export { GET, POST } from '~/lib/auth';
```

That's it — the SDK auto-mounts all the auth endpoints under
`/api/auth/*`.

## Set the secret

The `secret` is used to sign + encrypt session JWTs. In production this MUST
be set:

```bash
# generate one with:
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Set it as `AUTH_SECRET` in your environment.

## Next Steps

- [Customize session data](./session-data.md)
- [Override the default auth pages](./custom-pages.md)
- [Access the session server-side](./server-side/session-access.md)
