import { expect, test } from '@playwright/test';
import { mockAccountsList, mockAuth } from './_utils/mocks';

test('accounts list shows avatar as first column (image for staff, fallback for consumer)', async ({ page }) => {
  await mockAuth(page);
  const avatarDataUrl =
    'data:image/svg+xml;utf8,' +
    encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32"><rect width="32" height="32" fill="#1976d2"/></svg>');
  await mockAccountsList(page, [
    {
      id: 's1',
      type: 'staff_backoffice',
      verificationStatus: 'verified',
      avatar: avatarDataUrl,
      createdAt: new Date().toISOString(),
      data: {
        firstName: 'Staff',
        lastName: 'User',
        email: 'staff@example.com',
        address: 'Addr',
        staffRole: 'backoffice',
      },
    },
    {
      id: 'c1',
      type: 'consumer',
      verificationStatus: 'pending',
      createdAt: new Date().toISOString(),
      data: {
        firstName: 'Consumer',
        lastName: 'User',
        email: 'cons@example.com',
        address: 'Addr',
        householdSize: 3,
      },
    },
  ]);

  await page.goto('/auth/login');
  await page.getByRole('textbox', { name: 'Email or Username' }).fill('admin@example.com');
  await page.getByRole('textbox', { name: 'Password' }).fill('password');
  await page.getByLabel('Remember me').check();
  await page.getByRole('button', { name: 'Login' }).click();
  await expect(page).toHaveURL(/\/dashboard/);

  await page.goto('/dashboard/accounts');
  await expect(page.getByRole('heading', { name: 'Accounts' })).toBeVisible();

  await expect(page.locator('tbody tr').first()).toContainText('Staff User');

  const staffImg = page.locator('tbody tr').first().locator('img[alt="Staff User"]');
  await expect(staffImg).toHaveAttribute('src', avatarDataUrl);

  const consumerRow = page.locator('tbody tr').nth(1);
  await expect(consumerRow).toContainText('Consumer User');
  await expect(consumerRow.locator('img[alt="Consumer User"]')).toHaveCount(0);
  await expect(consumerRow.getByText('CU')).toBeVisible();
});
