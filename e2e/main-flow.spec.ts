import { test, expect } from '@playwright/test';

test.describe('Main User Flow', () => {
  test('should complete full shift cycle', async ({ page }) => {
    // 1. Переходим на главную
    await page.goto('/');
    await expect(page).toHaveTitle(/Шеф-Монтаж|ШЕФ-МОНТАЖ/);

    // 2. Регистрация (или логин)
    // ПРИМЕЧАНИЕ: Для теста лучше использовать тестового пользователя
    await page.goto('/login');
    await page.fill('input[name="email"]', 'test-worker@example.com');
    await page.fill('input[name="password"]', 'testpass123');
    await page.click('button[type="submit"]');

    // Ждем редиректа
    await page.waitForURL('/worker/shifts');

    // 3. Worker: просмотр доступных смен
    await expect(page.locator('h1')).toContainText('Доступные смены');

    // Кликаем на первую смену
    const firstShift = page.locator('[data-testid="shift-card"]').first();
    await firstShift.click();

    // 4. Worker: откликаемся на смену
    await page.waitForURL(/\/shifts\/[^/]+$/);
    await page.click('button:has-text("Откликнуться")');

    // Проверяем уведомление
    await expect(page.locator('text=Отклик отправлен')).toBeVisible();

    // 5. Логаут и логин как client
    await page.goto('/logout');
    await page.goto('/login');
    await page.fill('input[name="email"]', 'test-client@example.com');
    await page.fill('input[name="password"]', 'testpass123');
    await page.click('button[type="submit"]');

    await page.waitForURL('/client/shifts');

    // 6. Client: одобряем отклик
    await page.goto('/client/shifts'); // Мои смены
    const myShift = page.locator('[data-testid="shift-card"]').first();
    await myShift.click();

    // Открываем список откликов
    await page.click('button:has-text("Отклики")');

    // Одобряем первого
    await page.locator('button:has-text("Одобрить")').first().click();
    await expect(page.locator('text=Отклик одобрен')).toBeVisible();

    // 7. Завершаем смену (упрощенно)
    await page.click('button:has-text("Завершить смену")');
    await expect(page.locator('text=Смена завершена')).toBeVisible();
  });

  test('should handle worker check-in', async ({ page, context }) => {
    // Включаем геолокацию
    await context.grantPermissions(['geolocation']);
    await context.setGeolocation({ latitude: 55.7558, longitude: 37.6173 });

    await page.goto('/login');
    await page.fill('input[name="email"]', 'test-worker@example.com');
    await page.fill('input[name="password"]', 'testpass123');
    await page.click('button[type="submit"]');

    // Переходим на смену
    await page.goto('/worker/shifts/active');
    const activeShift = page.locator('[data-testid="shift-card"]').first();
    await activeShift.click();

    // Кликаем "Я вышел на объект"
    await page.click('button:has-text("Я вышел на объект")');

    // Загружаем фото (mock)
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles({
      name: 'photo.jpg',
      mimeType: 'image/jpeg',
      buffer: Buffer.from('fake image content'),
    });

    // Подтверждаем
    await page.click('button:has-text("Подтвердить выход")');

    await expect(page.locator('text=Выход подтвержден')).toBeVisible();
  });
});
