import { test, expect, type Page } from '@playwright/test';
import { GenericContainer, Wait } from 'testcontainers';
import { spawn, type ChildProcess } from 'child_process';
import path from 'path';

const OAUTH_PORT = 3851;
const BASE_URL = `http://localhost:${OAUTH_PORT}`;
const AUTH_SIGNIN_URL = '/api/auth/signin';

let container: Awaited<
  ReturnType<InstanceType<typeof GenericContainer>['start']>
>;
let devServer: ChildProcess;

test.use({ baseURL: BASE_URL });

async function signInWithOAuth(page: Page): Promise<void> {
  await page.goto(AUTH_SIGNIN_URL);
  await page.waitForSelector('text=Mock OIDC', { timeout: 15_000 });
  await page.click('text=Mock OIDC');
  await page.waitForSelector('input[name="username"]', { timeout: 15_000 });
  await page.fill('input[name="username"]', 'testuser');
  await page.locator('[type="submit"]').first().click();
  await page.waitForURL(/\/profile/, { timeout: 30_000 });
}

test.beforeAll(
  async () => {
    container = await new GenericContainer(
      'ghcr.io/navikt/mock-oauth2-server:2.1.10',
    )
      .withEnvironment({
        JSON_CONFIG: JSON.stringify({ interactiveLogin: true }),
      })
      .withExposedPorts(8080)
      .withWaitStrategy(
        Wait.forHttp('/default/.well-known/openid-configuration', 8080),
      )
      .start();

    const issuerUrl = `http://${container.getHost()}:${container.getMappedPort(8080)}/default`;
    const playgroundDir = path.resolve(import.meta.dirname, '../../playground');

    // Shared env for both build and serve steps.
    const commonEnv = {
      ...process.env,
      AUTH_SECRET: 'test-secret-for-e2e-testing-only-32ch',
      AUTH_URL: `http://localhost:${OAUTH_PORT}`,
      OAUTH_ISSUER_URL: issuerUrl,
      OAUTH_CLIENT_ID: 'test-client',
      OAUTH_CLIENT_SECRET: 'test-secret',
      // Use a separate output directory so this build does not clash with the
      // credentials-test dev server which owns the default .next directory.
      NEXT_DIST_DIR: '.next-oauth',
      NEXT_TELEMETRY_DISABLED: '1',
    };

    // Build the app ahead of time so `next start` boots in ~2 s instead of 90 s.
    await new Promise<void>((resolve, reject) => {
      const build = spawn('npm', ['run', 'build'], {
        cwd: playgroundDir,
        env: commonEnv,
        stdio: 'pipe',
      });
      build.on('close', (code) =>
        code === 0
          ? resolve()
          : reject(new Error(`next build exited with code ${code}`)),
      );
      build.on('error', reject);
    });

    devServer = spawn('npm', ['run', 'preview'], {
      cwd: playgroundDir,
      env: { ...commonEnv, PORT: String(OAUTH_PORT) },
      detached: true,
      stdio: 'pipe',
    });

    await new Promise<void>((resolve, reject) => {
      const timeout = setTimeout(
        () => reject(new Error('Server startup timeout')),
        30_000,
      );
      const check = async () => {
        try {
          const res = await fetch(`${BASE_URL}/`);
          if (res.ok || res.status < 500) {
            clearTimeout(timeout);
            resolve();
            return;
          }
        } catch {
          // Server not ready yet.
        }
        setTimeout(check, 1000);
      };
      devServer.on('error', reject);
      setTimeout(check, 2000);
    });
  },
  { timeout: 240_000 },
);

test.afterAll(async () => {
  if (devServer.pid != null) process.kill(-devServer.pid, 'SIGTERM');
  await container.stop();
});

test('homepage shows unauthenticated state', async ({ page }) => {
  await page.goto('/');
  await expect(
    page.locator('[data-testid="signin-credentials"]'),
  ).toBeVisible();
  await expect(page.locator('[data-testid="signin-oauth"]')).toBeVisible();
});

test('OAuth sign-in via signin-oauth button', async ({ page }) => {
  await page.goto('/');
  await page.click('[data-testid="signin-oauth"]');
  // Auth.js renders a provider confirmation page for GET /signin/:provider;
  // click through it to initiate the actual OAuth flow.
  await page.waitForSelector('text=Mock OIDC', { timeout: 10_000 });
  await page.click('text=Mock OIDC');
  await page.waitForSelector('input[name="username"]', { timeout: 15_000 });
  await page.fill('input[name="username"]', 'testuser');
  await page.locator('[type="submit"]').first().click();
  await page.waitForURL(/\/profile/, { timeout: 30_000 });
  await expect(page.locator('[data-testid="signout-button"]')).toBeVisible();
});

test('full OAuth flow via Auth.js sign-in page', async ({ page }) => {
  await signInWithOAuth(page);
  await expect(page).toHaveURL('/profile');
});

test('full sign-in and sign-out cycle', async ({ page }) => {
  await signInWithOAuth(page);
  await page.goto('/');
  await page.click('[data-testid="signout-button"]');
  await page.locator('button[type="submit"]').click();
  await page.waitForURL((url) => !url.pathname.startsWith('/api/auth/'), {
    timeout: 10_000,
  });
  await expect(
    page.locator('[data-testid="signin-credentials"]'),
  ).toBeVisible();
});
