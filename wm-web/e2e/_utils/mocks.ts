import { Page, Route } from '@playwright/test';

type User = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'admin' | 'staff_backoffice';
  verificationStatus: 'verified' | 'pending' | 'rejected';
};

function base64UrlEncode(value: object) {
  return Buffer.from(JSON.stringify(value))
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

function createFakeJwt(expSeconds: number) {
  return `h.${base64UrlEncode({ exp: expSeconds })}.s`;
}

export function buildAuthFixture(overrides?: Partial<User>) {
  const nowSeconds = Math.floor(Date.now() / 1000);
  const accessToken = createFakeJwt(nowSeconds + 60 * 60);

  const user: User = {
    id: 'acc-1',
    firstName: 'Admin',
    lastName: 'User',
    email: 'admin@example.com',
    role: 'admin',
    verificationStatus: 'verified',
    ...overrides,
  };

  return { accessToken, user };
}

export async function mockAuth(page: Page, fixture = buildAuthFixture()) {
  await page.route('**/api/auth/login', async (route: Route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ success: true, data: fixture }),
    });
  });

  await page.route('**/api/auth/me', async (route: Route) => {
    const auth = route.request().headers()['authorization'];
    if (auth !== `Bearer ${fixture.accessToken}`) {
      await route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'UNAUTHORIZED' }),
      });
      return;
    }

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ user: fixture.user }),
    });
  });

  return fixture;
}

export async function mockAccountsList(page: Page, accounts: any[], total = accounts.length) {
  await page.route('**/api/accounts**', async (route: Route) => {
    if (route.request().method() !== 'GET') {
      await route.fallback();
      return;
    }

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ accounts, total }),
    });
  });
}

