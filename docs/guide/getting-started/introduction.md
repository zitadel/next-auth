---
title: Introduction
group: Getting Started
children:
  - ./installation.md
---

# Introduction

`@zitadel/next-auth` is an open source library that provides authentication for
Next.js 16 applications. It wraps auth (`@auth/core`)
to bring OAuth, credentials, and magic-link authentication to Next.js with a
native developer experience.

Through a direct integration into the Next.js App Router, you can access and
utilize user sessions within your route handlers, server components, and
client components directly.

## Features

### Authentication providers

- OAuth (eg. GitHub, Google, Twitter, Azure...)
- Custom OAuth (Add your own!)
- Credentials (username / email + password)
- Email Magic URLs

### Application Side Session Management

- Session fetching via `useSession` and `SessionProvider`
- Methods to `getSession`, `getCsrfToken`, `getProviders`, `signIn` and
  `signOut`
- Full TypeScript support for all methods and properties

### Application protection

- Route handler protection with `getSession`
- Middleware-based route protection via `middleware.ts`
- React Server Component session access
