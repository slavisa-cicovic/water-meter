import { expect, test } from '@playwright/test';
import { mockAuth } from './_utils/mocks';

test('header popovers open/close and logout redirects to login', async ({ page }) => {
  await mockAuth(page);

  await page.goto('/auth/login');
  await page.getByRole('textbox', { name: 'Email or Username' }).fill('admin@example.com');
  await page.getByRole('textbox', { name: 'Password' }).fill('password');
  await page.getByLabel('Remember me').check();
  await page.getByRole('button', { name: 'Login' }).click();

  await expect(page).toHaveURL(/\/dashboard/);

  await page.getByLabel('language').click();
  await expect(page.getByRole('menuitem', { name: /english/i })).toBeVisible();
  await page.keyboard.press('Escape');

  await page.getByLabel('notifications').click();
  await expect(page.getByText('Notifications')).toBeVisible();
  await page.keyboard.press('Escape');

  await expect(page.getByLabel('settings')).toBeVisible();

  await page.getByLabel('account').click();
  await page.getByRole('menuitem', { name: /logout/i }).click();

  await expect(page).toHaveURL(/\/auth\/login/);
});
