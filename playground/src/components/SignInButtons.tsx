'use client';

import type { FC } from 'react';
import { signIn } from '@zitadel/next-auth/react';

// noinspection JSUnusedGlobalSymbols
export const SignInButtons: FC = () => (
  <div className="mb-6 flex flex-col gap-3">
    <button
      type="button"
      onClick={() => void signIn('mock-oidc', { callbackUrl: '/profile' })}
      data-testid="signin-oauth"
      className="flex w-full cursor-pointer items-center justify-center rounded-lg bg-blue-600 px-4 py-3 font-semibold text-white transition duration-200 hover:bg-blue-700"
    >
      Sign in with OAuth
    </button>
    <button
      type="button"
      onClick={() => void signIn()}
      data-testid="signin-default"
      className="flex w-full cursor-pointer items-center justify-center rounded-lg border border-blue-600 px-4 py-3 font-semibold text-blue-600 transition duration-200 hover:bg-blue-50"
    >
      Sign in
    </button>
    <a
      href="/api/auth/signin"
      data-testid="signin-credentials"
      className="flex w-full cursor-pointer items-center justify-center text-sm font-medium text-blue-600 transition duration-200 hover:text-blue-700"
    >
      Sign in with Credentials
    </a>
  </div>
);
