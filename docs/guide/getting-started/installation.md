---
title: Installation
group: Getting Started
---

# Installation

Install `@zitadel/next-auth` and `@auth/core`:

```bash
# npm
npm install @zitadel/next-auth @auth/core

# pnpm
pnpm add @zitadel/next-auth @auth/core

# yarn
yarn add @zitadel/next-auth @auth/core
```

Mount the auth handler at `src/app/api/auth/[...nextauth]/route.ts`:

```ts
// src/app/api/auth/[...nextauth]/route.ts
export { GET, POST } from '~/lib/auth';
```
