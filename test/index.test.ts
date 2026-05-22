import { describe, expect, it } from '@jest/globals';

describe('Package Exports', () => {
  describe('Main Entry Point', () => {
    it('should export NextAuth function', async () => {
      const { NextAuth } = await import('../src/index.js');

      expect(NextAuth).toBeDefined();
      expect(typeof NextAuth).toBe('function');
    });

    it('should export AuthError', async () => {
      const { AuthError } = await import('../src/index.js');

      expect(AuthError).toBeDefined();
    });

    it('should export CredentialsSignin', async () => {
      const { CredentialsSignin } = await import('../src/index.js');

      expect(CredentialsSignin).toBeDefined();
    });
  });

  describe('NextAuth() return shape', () => {
    it('should return handlers with GET and POST', async () => {
      const { NextAuth } = await import('../src/index.js');
      const result = NextAuth({ providers: [] });

      expect(result).toHaveProperty('handlers');
      expect(typeof result.handlers.GET).toBe('function');
      expect(typeof result.handlers.POST).toBe('function');
    });

    it('should return flat GET and POST (deprecated)', async () => {
      const { NextAuth } = await import('../src/index.js');
      const result = NextAuth({ providers: [] });

      expect(typeof result.GET).toBe('function');
      expect(typeof result.POST).toBe('function');
    });

    it('flat GET/POST should be the same reference as handlers.GET/POST', async () => {
      const { NextAuth } = await import('../src/index.js');
      const result = NextAuth({ providers: [] });

      expect(result.GET).toBe(result.handlers.GET);
      expect(result.POST).toBe(result.handlers.POST);
    });

    it('should return getSession function', async () => {
      const { NextAuth } = await import('../src/index.js');
      const result = NextAuth({ providers: [] });

      expect(typeof result.getSession).toBe('function');
    });

    it('should return auth as deprecated alias for getSession', async () => {
      const { NextAuth } = await import('../src/index.js');
      const result = NextAuth({ providers: [] });

      expect(typeof result.auth).toBe('function');
      expect(result.auth).toBe(result.getSession);
    });

    it('should return signIn and signOut functions', async () => {
      const { NextAuth } = await import('../src/index.js');
      const result = NextAuth({ providers: [] });

      expect(typeof result.signIn).toBe('function');
      expect(typeof result.signOut).toBe('function');
    });
  });

  describe('signIn URL construction', () => {
    // Server-side signIn always routes through the chooser
    // (/api/auth/signin) regardless of whether a provider is passed:
    // the per-provider endpoint requires a POST with a CSRF token, which
    // a 302 redirect cannot produce. When `pages.signIn` is configured,
    // Auth.js bounces /api/auth/signin to the consumer's custom sign-in
    // page (which is where the POST form + CSRF live).
    it('should redirect to /api/auth/signin when a provider is given (provider ignored server-side)', async () => {
      const { NextAuth } = await import('../src/index.js');
      const { signIn } = NextAuth({ providers: [] });

      const response = await signIn('zitadel');

      expect(response.status).toBe(302);
      expect(response.headers.get('location')).toBe('/api/auth/signin');
    });

    it('should redirect to /api/auth/signin when no provider given', async () => {
      const { NextAuth } = await import('../src/index.js');
      const { signIn } = NextAuth({ providers: [] });

      const response = await signIn();

      expect(response.status).toBe(302);
      expect(response.headers.get('location')).toBe('/api/auth/signin');
    });

    it('should append callbackUrl when redirectTo is provided', async () => {
      const { NextAuth } = await import('../src/index.js');
      const { signIn } = NextAuth({ providers: [] });

      const response = await signIn('zitadel', { redirectTo: '/dashboard' });
      const location = response.headers.get('location') ?? '';

      expect(response.status).toBe(302);
      expect(location).toContain('/api/auth/signin');
      expect(location).toContain('callbackUrl=');
      expect(location).toContain('%2Fdashboard');
    });

    it('should respect custom basePath', async () => {
      const { NextAuth } = await import('../src/index.js');
      const { signIn } = NextAuth({ providers: [], basePath: '/my-auth' });

      const response = await signIn('zitadel');

      expect(response.headers.get('location')).toBe('/my-auth/signin');
    });

    it('should strip trailing slash from basePath', async () => {
      const { NextAuth } = await import('../src/index.js');
      const { signIn } = NextAuth({ providers: [], basePath: '/my-auth/' });

      const response = await signIn('zitadel');

      expect(response.headers.get('location')).toBe('/my-auth/signin');
    });
  });

  describe('signOut URL construction', () => {
    it('should redirect to /api/auth/signout', async () => {
      const { NextAuth } = await import('../src/index.js');
      const { signOut } = NextAuth({ providers: [] });

      const response = await signOut();

      expect(response.status).toBe(302);
      expect(response.headers.get('location')).toBe('/api/auth/signout');
    });

    it('should append callbackUrl when redirectTo is provided', async () => {
      const { NextAuth } = await import('../src/index.js');
      const { signOut } = NextAuth({ providers: [] });

      const response = await signOut({ redirectTo: '/' });
      const location = response.headers.get('location') ?? '';

      expect(response.status).toBe(302);
      expect(location).toContain('/api/auth/signout');
      expect(location).toContain('callbackUrl=');
    });

    it('should respect custom basePath', async () => {
      const { NextAuth } = await import('../src/index.js');
      const { signOut } = NextAuth({ providers: [], basePath: '/my-auth' });

      const response = await signOut();

      expect(response.headers.get('location')).toBe('/my-auth/signout');
    });
  });

  describe('Standalone getSession export', () => {
    it('should export getSession as a function with 2 parameters', async () => {
      const { getSession } = await import('../src/index.js');

      expect(typeof getSession).toBe('function');
      expect(getSession.length).toBe(2);
    });
  });

  describe('Adapter Entry Point', () => {
    it('should be importable', async () => {
      const module = await import('../src/adapter.js');

      expect(module).toBeDefined();
    });
  });

  describe('React Entry Point', () => {
    it('should export signIn function', async () => {
      const { signIn } = await import('../src/react.js');

      expect(signIn).toBeDefined();
      expect(typeof signIn).toBe('function');
    });

    it('should export signOut function', async () => {
      const { signOut } = await import('../src/react.js');

      expect(signOut).toBeDefined();
      expect(typeof signOut).toBe('function');
    });

    it('should export useSession function', async () => {
      const { useSession } = await import('../src/react.js');

      expect(useSession).toBeDefined();
      expect(typeof useSession).toBe('function');
    });

    it('should export getProviders function', async () => {
      const { getProviders } = await import('../src/react.js');

      expect(getProviders).toBeDefined();
      expect(typeof getProviders).toBe('function');
    });

    it('should export getCsrfToken function', async () => {
      const { getCsrfToken } = await import('../src/react.js');

      expect(getCsrfToken).toBeDefined();
      expect(typeof getCsrfToken).toBe('function');
    });

    it('should export SessionProvider function', async () => {
      const { SessionProvider } = await import('../src/react.js');

      expect(SessionProvider).toBeDefined();
      expect(typeof SessionProvider).toBe('function');
    });
  });
});
