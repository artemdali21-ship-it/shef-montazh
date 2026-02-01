import { test, expect } from '@playwright/test';

test.describe('Smoke Tests', () => {
  test('should load home page', async ({ page }) => {
    await page.goto('/');

    // Проверяем что страница загрузилась
    await expect(page).toHaveTitle(/Шеф-Монтаж|ШЕФ-МОНТАЖ/);
  });

  test('should navigate to login page', async ({ page }) => {
    await page.goto('/');

    // Ищем ссылку на логин (может быть в навигации)
    const loginLink = page.locator('a[href*="login"], button:has-text("Войти")').first();

    if (await loginLink.isVisible()) {
      await loginLink.click();
      await expect(page).toHaveURL(/login/);
    } else {
      // Если нет кнопки логина, переходим напрямую
      await page.goto('/login');
      await expect(page).toHaveURL(/login/);
    }
  });

  test('should have responsive layout', async ({ page }) => {
    // Тест на мобильном размере
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');

    // Проверяем что страница корректно отображается
    await expect(page.locator('body')).toBeVisible();
  });

  test('should load service worker for PWA', async ({ page }) => {
    await page.goto('/');

    // Ждем регистрации service worker
    await page.waitForTimeout(1000);

    // Проверяем что sw.js доступен
    const response = await page.goto('/sw.js');
    expect(response?.status()).toBe(200);
  });
});
