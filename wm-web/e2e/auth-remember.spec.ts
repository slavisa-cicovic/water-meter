import { expect, test } from '@playwright/test';
import { mockAuth } from './_utils/mocks';

test('remember me checked persists via storageState (localStorage)', async ({ page, context, browser }) => {
  const fixture = await mockAuth(page);
  const { accessToken } = fixture;

  await page.goto('/auth/login');
  await page.getByRole('textbox', { name: 'Email or Username' }).fill('admin@example.com');
  await page.getByRole('textbox', { name: 'Password' }).fill('password');
  await page.getByLabel('Remember me').check();
  await page.getByRole('button', { name: 'Login' }).click();

  await expect(page).toHaveURL(/\/dashboard/);

  await expect
    .poll(async () => page.evaluate(() => window.localStorage.getItem('accessToken')))
    .toBe(accessToken);
  await expect
    .poll(async () => page.evaluate(() => window.sessionStorage.getItem('accessToken')))
    .toBeNull();

  const statePath = test.info().outputPath('remember.json');
  await context.storageState({ path: statePath });

  const newContext = await browser.newContext({ storageState: statePath });
  const newPage = await newContext.newPage();
  await mockAuth(newPage, fixture);
  await newPage.goto('/dashboard');

  await expect(newPage).toHaveURL(/\/dashboard/);
  await expect(newPage.getByText('Welcome to Water Meter')).toBeVisible();
  await newContext.close();
});

test('remember me unchecked does not persist via storageState (sessionStorage)', async ({ page, context, browser }) => {
  const fixture = await mockAuth(page);
  const { accessToken } = fixture;

  await page.goto('/auth/login');
  await page.getByRole('textbox', { name: 'Email or Username' }).fill('admin@example.com');
  await page.getByRole('textbox', { name: 'Password' }).fill('password');
  await page.getByRole('button', { name: 'Login' }).click();

  await expect(page).toHaveURL(/\/dashboard/);

  await expect
    .poll(async () => page.evaluate(() => window.sessionStorage.getItem('accessToken')))
    .toBe(accessToken);
  await expect
    .poll(async () => page.evaluate(() => window.localStorage.getItem('accessToken')))
    .toBeNull();

  const statePath = test.info().outputPath('session.json');
  await context.storageState({ path: statePath });

  const newContext = await browser.newContext({ storageState: statePath });
  const newPage = await newContext.newPage();
  await mockAuth(newPage, fixture);
  await newPage.goto('/dashboard');

  await expect(newPage).toHaveURL(/\/auth\/login/);
  await expect(newPage.getByRole('heading', { name: 'Sign in' })).toBeVisible();
  await newContext.close();
});
