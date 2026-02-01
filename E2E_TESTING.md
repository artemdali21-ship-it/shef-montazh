# End-to-End Testing with Playwright

## Overview

E2E тесты для критичных пользовательских сценариев с использованием Playwright. Тестируют полный цикл работы приложения от UI до базы данных.

## Setup

### Dependencies:

```json
{
  "devDependencies": {
    "@playwright/test": "^1.58.1"
  }
}
```

### Browsers Installed:

- ✅ Chromium (Desktop Chrome)
- ⚠️ Firefox (not installed)
- ⚠️ WebKit/Safari (not installed)

To install all browsers:
```bash
npx playwright install
```

## Configuration

**File**: `playwright.config.ts`

```typescript
export default defineConfig({
  testDir: './e2e',              // Test files location
  fullyParallel: true,           // Run tests in parallel
  retries: process.env.CI ? 2 : 0,  // Retry on CI
  reporter: 'html',              // HTML report
  baseURL: 'http://localhost:3000',

  webServer: {
    command: 'pnpm dev',         // Start dev server
    url: 'http://localhost:3000',
    reuseExistingServer: true,   // Don't restart if running
  },
});
```

## Test Files

### 1. Smoke Tests

**File**: `e2e/smoke.spec.ts`

Basic sanity checks:
- ✅ Home page loads
- ✅ Navigation to login works
- ✅ Responsive layout
- ✅ Service worker loads (PWA)

**Run**:
```bash
pnpm test:e2e smoke
```

### 2. Main Flow Test

**File**: `e2e/main-flow.spec.ts`

**Full shift cycle**:
1. Worker login
2. Browse available shifts
3. Apply to shift
4. Client login
5. Approve worker
6. Complete shift

**Worker check-in**:
1. Worker login
2. Navigate to active shift
3. Check-in with photo
4. Verify geolocation

**Note**: These tests require test users in database:
- `test-worker@example.com` / `testpass123`
- `test-client@example.com` / `testpass123`

## Running Tests

### All E2E tests:
```bash
pnpm test:e2e
```

### Interactive UI mode:
```bash
pnpm test:e2e:ui
```

**Features**:
- Visual test runner
- Step-by-step debugging
- Time travel debugging
- Watch mode

### Headed mode (see browser):
```bash
pnpm test:e2e:headed
```

### Specific test file:
```bash
pnpm test:e2e smoke.spec.ts
```

### View HTML report:
```bash
pnpm test:e2e:report
```

## Test Structure

### Basic Test:

```typescript
import { test, expect } from '@playwright/test';

test('should do something', async ({ page }) => {
  // Navigate
  await page.goto('/login');

  // Interact
  await page.fill('input[name="email"]', 'test@example.com');
  await page.click('button[type="submit"]');

  // Assert
  await expect(page).toHaveURL('/dashboard');
});
```

### Test with Context:

```typescript
test('should use geolocation', async ({ page, context }) => {
  // Grant permissions
  await context.grantPermissions(['geolocation']);

  // Set location
  await context.setGeolocation({
    latitude: 55.7558,
    longitude: 37.6173
  });

  await page.goto('/map');
});
```

### Test with File Upload:

```typescript
test('should upload photo', async ({ page }) => {
  const fileInput = page.locator('input[type="file"]');

  await fileInput.setInputFiles({
    name: 'photo.jpg',
    mimeType: 'image/jpeg',
    buffer: Buffer.from('fake image'),
  });
});
```

## Locators

### By test ID (recommended):
```typescript
page.locator('[data-testid="shift-card"]')
```

### By text:
```typescript
page.locator('button:has-text("Откликнуться")')
page.getByText('Доступные смены')
```

### By role:
```typescript
page.getByRole('button', { name: 'Submit' })
page.getByRole('link', { name: 'Login' })
```

### By input name:
```typescript
page.locator('input[name="email"]')
```

### Chaining:
```typescript
page.locator('.shift-card').first()
page.locator('button').nth(2)
```

## Assertions

### Page assertions:
```typescript
await expect(page).toHaveURL('/dashboard')
await expect(page).toHaveTitle(/Шеф-Монтаж/)
```

### Element assertions:
```typescript
await expect(element).toBeVisible()
await expect(element).toBeHidden()
await expect(element).toBeEnabled()
await expect(element).toBeDisabled()
await expect(element).toHaveText('Expected text')
await expect(element).toContainText('Part of text')
await expect(element).toHaveAttribute('href', '/login')
await expect(element).toHaveClass('active')
```

### Negative assertions:
```typescript
await expect(element).not.toBeVisible()
```

## Waiting

### Auto-waiting:
Playwright автоматически ждет элементы перед действиями:
```typescript
await page.click('button')  // Ждет пока кнопка станет visible и enabled
```

### Explicit waiting:
```typescript
// Wait for URL
await page.waitForURL('/dashboard')

// Wait for selector
await page.waitForSelector('.loading', { state: 'hidden' })

// Wait for timeout (avoid if possible)
await page.waitForTimeout(1000)

// Wait for function
await page.waitForFunction(() => window.dataLoaded === true)
```

## Test Data Setup

### Database Seeding:

Create test users before running E2E tests:

```sql
-- Test worker
INSERT INTO users (email, password_hash, role, full_name, phone)
VALUES (
  'test-worker@example.com',
  'hashed_password',
  'worker',
  'Test Worker',
  '+79001111111'
);

-- Test client
INSERT INTO users (email, password_hash, role, full_name, phone)
VALUES (
  'test-client@example.com',
  'hashed_password',
  'client',
  'Test Client',
  '+79002222222'
);

-- Test shift
INSERT INTO shifts (client_id, title, amount, location, start_date)
VALUES (
  'client-uuid',
  'Тестовая смена',
  10000,
  'Москва',
  NOW() + INTERVAL '1 day'
);
```

### API Seeding:

```typescript
// e2e/helpers/seed.ts
export async function seedTestData() {
  // Create test users via API
  await fetch('http://localhost:3000/api/test/seed', {
    method: 'POST',
    body: JSON.stringify({ createTestUsers: true }),
  });
}

// In test
test.beforeEach(async () => {
  await seedTestData();
});
```

## Authentication

### Login Helper:

```typescript
// e2e/helpers/auth.ts
export async function loginAsWorker(page: Page) {
  await page.goto('/login');
  await page.fill('input[name="email"]', 'test-worker@example.com');
  await page.fill('input[name="password"]', 'testpass123');
  await page.click('button[type="submit"]');
  await page.waitForURL('/worker/shifts');
}

// In test
test('worker can apply to shift', async ({ page }) => {
  await loginAsWorker(page);
  // ... rest of test
});
```

### Storage State (faster):

Save authenticated state to reuse:

```typescript
// e2e/auth.setup.ts
test('authenticate', async ({ page }) => {
  await page.goto('/login');
  await page.fill('input[name="email"]', 'test@example.com');
  await page.fill('input[name="password"]', 'testpass123');
  await page.click('button[type="submit"]');

  // Save storage state
  await page.context().storageState({ path: 'e2e/.auth/worker.json' });
});

// In playwright.config.ts
projects: [
  {
    name: 'worker',
    use: { storageState: 'e2e/.auth/worker.json' },
    dependencies: ['auth'],
  },
]
```

## Debugging

### Interactive Debug Mode:

```bash
PWDEBUG=1 pnpm test:e2e
```

Opens Playwright Inspector for step-by-step debugging.

### Screenshots on Failure:

Automatically saved in `test-results/`:
```typescript
test('failing test', async ({ page }) => {
  await page.goto('/');
  // Test fails, screenshot captured
});
```

### Video Recording:

```typescript
// playwright.config.ts
use: {
  video: 'on-first-retry',  // Record video on retry
}
```

### Trace Viewer:

```bash
npx playwright show-trace test-results/.../trace.zip
```

Visual timeline of test execution.

### Console Logs:

```typescript
page.on('console', msg => console.log(msg.text()));
page.on('pageerror', error => console.error(error));
```

## Best Practices

### 1. Use data-testid:

```typescript
// ❌ Fragile
await page.click('.btn-primary:nth-child(2)')

// ✅ Stable
await page.click('[data-testid="apply-button"]')
```

Add to components:
```tsx
<button data-testid="apply-button">Откликнуться</button>
```

### 2. Avoid Hardcoded Waits:

```typescript
// ❌ Bad
await page.waitForTimeout(3000)

// ✅ Good
await page.waitForSelector('.loading', { state: 'hidden' })
await expect(page.locator('.data')).toBeVisible()
```

### 3. Test User Flows, Not Implementation:

```typescript
// ❌ Bad - testing implementation
test('should call API correctly', async ({ page }) => {
  await page.route('/api/shifts', route => {
    expect(route.request().postDataJSON()).toEqual({ ... })
  })
})

// ✅ Good - testing user outcome
test('should create shift successfully', async ({ page }) => {
  await page.fill('[data-testid="title"]', 'New Shift')
  await page.click('[data-testid="create"]')
  await expect(page.locator('text=Смена создана')).toBeVisible()
})
```

### 4. Parallelize Independent Tests:

```typescript
// Runs in parallel with other tests
test('test 1', async ({ page }) => { ... })
test('test 2', async ({ page }) => { ... })

// Runs sequentially within group
test.describe.serial('checkout flow', () => {
  test('add to cart', ...)
  test('proceed to checkout', ...)
  test('complete payment', ...)
})
```

### 5. Clean Up After Tests:

```typescript
test.afterEach(async ({ page }) => {
  // Delete test data
  await page.request.delete('/api/test/cleanup')
})
```

## Mocking

### Network Requests:

```typescript
test('should handle API error', async ({ page }) => {
  // Mock API response
  await page.route('/api/shifts', route => {
    route.fulfill({
      status: 500,
      body: JSON.stringify({ error: 'Server error' }),
    })
  })

  await page.goto('/shifts')
  await expect(page.locator('text=Ошибка')).toBeVisible()
})
```

### Geolocation:

```typescript
await context.setGeolocation({ latitude: 55.7558, longitude: 37.6173 })
```

### Permissions:

```typescript
await context.grantPermissions(['geolocation', 'camera', 'microphone'])
```

### Date/Time:

```typescript
// Set timezone
await context.addInitScript(() => {
  Date.now = () => new Date('2025-01-15').getTime()
})
```

## CI/CD Integration

### GitHub Actions:

```yaml
# .github/workflows/e2e.yml
name: E2E Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - uses: pnpm/action-setup@v2

      - name: Install dependencies
        run: pnpm install

      - name: Install Playwright
        run: npx playwright install --with-deps chromium

      - name: Run E2E tests
        run: pnpm test:e2e

      - name: Upload report
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: playwright-report
          path: playwright-report/
```

### Docker:

```dockerfile
FROM mcr.microsoft.com/playwright:v1.58.1-focal

WORKDIR /app
COPY . .

RUN npm install
RUN npx playwright test
```

## Test Organization

### Directory Structure:

```
e2e/
├── smoke.spec.ts              # Basic sanity checks
├── main-flow.spec.ts          # Critical user flows
├── auth.spec.ts               # Authentication tests
├── shifts.spec.ts             # Shift management
├── payments.spec.ts           # Payment flow
├── helpers/
│   ├── auth.ts                # Login helpers
│   ├── seed.ts                # Test data seeding
│   └── cleanup.ts             # Cleanup utilities
└── .auth/
    ├── worker.json            # Saved worker auth
    └── client.json            # Saved client auth
```

### Test Categories:

| Category | Tests | Status |
|----------|-------|--------|
| 🟢 Smoke | 4 | ✅ Created |
| 🟡 Auth | 0 | ❌ Todo |
| 🟡 Shifts | 0 | ❌ Todo |
| 🔴 Main Flow | 2 | ⚠️ Needs test users |
| 🔴 Payments | 0 | ❌ Todo |

## Performance Testing

### Measure Load Time:

```typescript
test('should load quickly', async ({ page }) => {
  const start = Date.now()
  await page.goto('/')
  const duration = Date.now() - start

  expect(duration).toBeLessThan(2000)  // < 2 seconds
})
```

### Network Throttling:

```typescript
// Simulate slow 3G
await page.route('**/*', route => {
  setTimeout(() => route.continue(), 300)
})
```

## Accessibility Testing

### Check ARIA Attributes:

```typescript
test('should have accessible form', async ({ page }) => {
  await page.goto('/login')

  const emailInput = page.getByLabel('Email')
  await expect(emailInput).toHaveAttribute('type', 'email')
  await expect(emailInput).toHaveAttribute('required')
})
```

### Keyboard Navigation:

```typescript
test('should navigate with keyboard', async ({ page }) => {
  await page.goto('/')

  await page.keyboard.press('Tab')
  await page.keyboard.press('Enter')

  await expect(page).toHaveURL('/login')
})
```

## Visual Regression Testing

### Screenshot Comparison:

```typescript
test('should match screenshot', async ({ page }) => {
  await page.goto('/')
  await expect(page).toHaveScreenshot('homepage.png')
})
```

First run creates baseline, subsequent runs compare.

## Mobile Testing

### Mobile Devices:

```typescript
// playwright.config.ts
projects: [
  {
    name: 'Mobile Chrome',
    use: { ...devices['Pixel 5'] },
  },
  {
    name: 'Mobile Safari',
    use: { ...devices['iPhone 13'] },
  },
]
```

### Responsive Tests:

```typescript
test('should be responsive', async ({ page }) => {
  const sizes = [
    { width: 375, height: 667 },   // iPhone SE
    { width: 768, height: 1024 },  // iPad
    { width: 1920, height: 1080 }, // Desktop
  ]

  for (const size of sizes) {
    await page.setViewportSize(size)
    await page.goto('/')
    await expect(page.locator('body')).toBeVisible()
  }
})
```

## API Testing

Playwright can test APIs directly:

```typescript
test('should create shift via API', async ({ request }) => {
  const response = await request.post('/api/shifts', {
    data: {
      title: 'Test Shift',
      amount: 10000,
    },
  })

  expect(response.status()).toBe(201)
  const shift = await response.json()
  expect(shift.title).toBe('Test Shift')
})
```

## Common Patterns

### Page Object Model:

```typescript
// e2e/pages/LoginPage.ts
export class LoginPage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto('/login')
  }

  async login(email: string, password: string) {
    await this.page.fill('input[name="email"]', email)
    await this.page.fill('input[name="password"]', password)
    await this.page.click('button[type="submit"]')
  }
}

// In test
const loginPage = new LoginPage(page)
await loginPage.goto()
await loginPage.login('test@example.com', 'password')
```

### Fixtures:

```typescript
// e2e/fixtures.ts
export const test = base.extend<{ workerPage: Page }>({
  workerPage: async ({ page }, use) => {
    await loginAsWorker(page)
    await use(page)
  },
})

// In test
test('worker flow', async ({ workerPage }) => {
  // Already logged in as worker
})
```

## Troubleshooting

### Tests timeout:
```typescript
test('slow test', async ({ page }) => {
  // ...
}, { timeout: 60000 })  // 60 second timeout
```

### Element not found:
- Check selector is correct
- Wait for element to be visible
- Check if element is in iframe

### Flaky tests:
- Use auto-waiting (avoid waitForTimeout)
- Make tests independent
- Clean up data between tests

### Browser not opening:
```bash
npx playwright install --with-deps chromium
```

## Next Steps

### Priority E2E Tests:

1. **Authentication flows** - login, logout, 2FA
2. **Shift creation** - client creates shift
3. **Worker application** - worker applies to shift
4. **Shift approval** - client approves worker
5. **Payment flow** - payment and confirmation
6. **Rating system** - submit and receive ratings

### Integration with Existing Tests:

```bash
# Run all tests (unit + e2e)
pnpm test && pnpm test:e2e
```

## Commands Reference

```bash
# Run all E2E tests
pnpm test:e2e

# Interactive UI mode
pnpm test:e2e:ui

# Headed mode (see browser)
pnpm test:e2e:headed

# Specific test file
pnpm test:e2e smoke.spec.ts

# View HTML report
pnpm test:e2e:report

# Debug mode
PWDEBUG=1 pnpm test:e2e

# Update screenshots
pnpm test:e2e --update-snapshots

# Generate tests
npx playwright codegen localhost:3000
```

## Resources

- [Playwright Documentation](https://playwright.dev/docs/intro)
- [Best Practices](https://playwright.dev/docs/best-practices)
- [API Reference](https://playwright.dev/docs/api/class-playwright)
- [Examples](https://github.com/microsoft/playwright/tree/main/examples)

## Notes

- Tests run in Chromium by default
- Dev server starts automatically (webServer config)
- Tests are isolated (each gets fresh browser context)
- Screenshots/videos saved on failure
- HTML report generated after each run
- Test data should be seeded before running
- Use data-testid for stable selectors
- Avoid hardcoded waits (use auto-waiting)
- Tests should be independent and idempotent
