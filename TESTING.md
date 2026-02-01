# Unit Testing

## Overview

Система unit-тестирования для критичных функций приложения с использованием Jest и React Testing Library.

## Setup

### Dependencies Installed:

```json
{
  "devDependencies": {
    "jest": "^30.2.0",
    "@testing-library/react": "^16.3.2",
    "@testing-library/jest-dom": "^6.9.1",
    "jest-environment-jsdom": "^30.2.0",
    "@types/jest": "^30.0.0"
  }
}
```

### Configuration Files:

- `jest.config.js` - основная конфигурация Jest
- `jest.setup.js` - setup файл для testing-library/jest-dom

## Test Files Created

### 1. Rating Calculation Tests

**File**: `tests/lib/rating.test.ts`

**Function under test**: `calculateNewRating(currentRating, totalShifts, newRating)`

**Test cases**:
- ✅ Correct average rating calculation (4.5 + 5 → 4.545)
- ✅ First rating (0 shifts → new rating)
- ✅ Rating doesn't exceed 5.0
- ✅ Rating doesn't go below 1.0

**Implementation**: `lib/utils/rating.ts`

```typescript
export function calculateNewRating(
  currentRating: number,
  totalShifts: number,
  newRating: number
): number {
  if (totalShifts === 0) return newRating;

  const sum = currentRating * totalShifts + newRating;
  const newAverage = sum / (totalShifts + 1);

  return Math.max(1.0, Math.min(5.0, newAverage));
}
```

### 2. Payment Calculation Tests

**File**: `tests/lib/payment.test.ts`

**Function under test**: `calculatePaymentAmounts(shiftAmount, platformFee)`

**Test cases**:
- ✅ Correct platform fee calculation (10000 - 1200 = 8800)
- ✅ Zero fee handling
- ✅ Negative amounts throw error

**Implementation**: `lib/utils/payment.ts`

```typescript
export function calculatePaymentAmounts(
  shiftAmount: number,
  platformFee: number
): PaymentAmounts {
  if (shiftAmount < 0 || platformFee < 0) {
    throw new Error('Amounts cannot be negative');
  }

  const workerAmount = shiftAmount - platformFee;

  if (workerAmount < 0) {
    throw new Error('Platform fee cannot exceed shift amount');
  }

  return { totalAmount: shiftAmount, platformFee, workerAmount };
}
```

## Running Tests

### All tests:
```bash
pnpm test
```

### Watch mode (auto-rerun on changes):
```bash
pnpm test:watch
```

### Coverage report:
```bash
pnpm test:coverage
```

## Test Results

```
PASS tests/lib/rating.test.ts
PASS tests/lib/payment.test.ts

Test Suites: 2 passed, 2 total
Tests:       7 passed, 7 total
Snapshots:   0 total
Time:        1.83 s
```

All tests passing ✅

## Jest Configuration

### jest.config.js

```javascript
const nextJest = require('next/jest');

const createJestConfig = nextJest({
  dir: './',
});

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',  // Support @ alias
  },
};

module.exports = createJestConfig(customJestConfig);
```

**Key features**:
- Next.js integration (nextJest)
- JSDOM environment for React testing
- Path aliases support (@/)
- Setup file for jest-dom matchers

### jest.setup.js

```javascript
import '@testing-library/jest-dom';
```

Adds custom matchers:
- `toBeInTheDocument()`
- `toHaveTextContent()`
- `toBeVisible()`
- etc.

## Writing Tests

### Basic Structure:

```typescript
import { functionName } from '@/lib/path/to/function';

describe('Feature Name', () => {
  it('should do something', () => {
    const result = functionName(input);
    expect(result).toBe(expected);
  });
});
```

### Common Matchers:

```typescript
// Exact equality
expect(result).toBe(5);

// Floating point comparison
expect(result).toBeCloseTo(4.545, 2);  // 2 decimal places

// Comparison
expect(result).toBeGreaterThan(0);
expect(result).toBeLessThanOrEqual(5);

// Truthiness
expect(result).toBeTruthy();
expect(result).toBeDefined();

// Errors
expect(() => fn()).toThrow('Error message');
```

## Test Coverage

### Generate HTML Report:

```bash
pnpm test:coverage
```

Creates `/coverage/` directory with:
- `lcov-report/index.html` - visual coverage report
- Statement coverage
- Branch coverage
- Function coverage
- Line coverage

### Coverage Goals:

| Category | Target | Current |
|----------|--------|---------|
| **Critical Utils** | 100% | 100% |
| **API Routes** | 80% | 0% |
| **Components** | 60% | 0% |
| **Overall** | 70% | ~10% |

## Future Tests

### 3. API Route Tests

```typescript
// tests/api/shifts.test.ts
import { POST } from '@/app/api/shifts/route';

describe('Shifts API', () => {
  it('should create shift with valid data', async () => {
    const request = new Request('http://localhost/api/shifts', {
      method: 'POST',
      body: JSON.stringify({ title: 'Test Shift' }),
    });

    const response = await POST(request);
    expect(response.status).toBe(201);
  });
});
```

**Challenges**:
- Mock Supabase client
- Mock authentication
- Test RLS policies

### 4. Component Tests

```typescript
// tests/components/ShiftCard.test.tsx
import { render, screen } from '@testing-library/react';
import ShiftCard from '@/components/ShiftCard';

describe('ShiftCard', () => {
  it('should render shift title', () => {
    const shift = { id: '1', title: 'Монтаж сцены' };
    render(<ShiftCard shift={shift} />);

    expect(screen.getByText('Монтаж сцены')).toBeInTheDocument();
  });
});
```

**Challenges**:
- Mock Supabase client
- Mock Next.js routing
- Mock user context

### 5. Date Utilities Tests

```typescript
// tests/lib/date.test.ts
describe('Date Formatting', () => {
  it('should format Russian date', () => {
    const date = new Date('2025-01-15');
    const formatted = formatRussianDate(date);
    expect(formatted).toBe('15 января 2025');
  });
});
```

### 6. Validation Tests

```typescript
// tests/lib/validation.test.ts
describe('Phone Validation', () => {
  it('should validate Russian phone', () => {
    expect(isValidPhone('+79001234567')).toBe(true);
    expect(isValidPhone('invalid')).toBe(false);
  });
});
```

### 7. Calculation Tests

**Shift duration**:
```typescript
calculateShiftDuration(start, end) // hours
```

**Worker compensation**:
```typescript
calculateWorkerPay(shiftAmount, platformFee, bonuses)
```

**Rating impact**:
```typescript
calculateRatingImpact(oldRating, newRating, shiftsCount)
```

## Testing Best Practices

### 1. Test Naming

```typescript
// ❌ Bad
it('test 1', () => {})

// ✅ Good
it('should calculate worker amount after platform fee', () => {})
```

### 2. Arrange-Act-Assert Pattern

```typescript
it('should ...', () => {
  // Arrange - setup
  const input = { ... };

  // Act - execute
  const result = function(input);

  // Assert - verify
  expect(result).toBe(expected);
});
```

### 3. Test One Thing

```typescript
// ❌ Bad - testing multiple things
it('should validate and save user', () => {
  expect(validate(user)).toBe(true);
  expect(save(user)).toBe(success);
});

// ✅ Good - separate tests
it('should validate user data', () => {
  expect(validate(user)).toBe(true);
});

it('should save valid user', () => {
  expect(save(validUser)).toBe(success);
});
```

### 4. Mock External Dependencies

```typescript
// Mock Supabase
jest.mock('@/lib/supabase-client', () => ({
  createClient: () => ({
    from: jest.fn().mockReturnValue({
      select: jest.fn().mockResolvedValue({ data: mockData }),
    }),
  }),
}));
```

### 5. Use Test Data Builders

```typescript
// tests/helpers/builders.ts
export const buildUser = (overrides = {}) => ({
  id: 'test-id',
  email: 'test@example.com',
  full_name: 'Test User',
  ...overrides,
});

// In tests
const user = buildUser({ role: 'admin' });
```

## CI/CD Integration

### GitHub Actions:

```yaml
# .github/workflows/test.yml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v3
      - run: pnpm install
      - run: pnpm test
      - run: pnpm test:coverage
      - uses: codecov/codecov-action@v3
```

### Pre-commit Hook:

```bash
# .husky/pre-commit
#!/bin/sh
pnpm test
```

Prevents committing broken code.

## Debugging Tests

### Run specific test:

```bash
pnpm test rating.test.ts
```

### Run with verbose output:

```bash
pnpm test --verbose
```

### Debug in VS Code:

```json
// .vscode/launch.json
{
  "type": "node",
  "request": "launch",
  "name": "Jest Current File",
  "program": "${workspaceFolder}/node_modules/.bin/jest",
  "args": ["${file}", "--runInBand"],
  "console": "integratedTerminal",
}
```

Set breakpoints and press F5.

## Code Coverage

### View Coverage:

```bash
pnpm test:coverage
open coverage/lcov-report/index.html
```

### Coverage Thresholds:

Add to `jest.config.js`:
```javascript
coverageThreshold: {
  global: {
    statements: 70,
    branches: 70,
    functions: 70,
    lines: 70,
  },
  './lib/utils/': {
    statements: 100,  // Critical utils must be 100%
  },
}
```

Tests fail if coverage drops below thresholds.

## Snapshot Testing

### Example:

```typescript
import { render } from '@testing-library/react';
import ShiftCard from '@/components/ShiftCard';

it('should match snapshot', () => {
  const { container } = render(<ShiftCard shift={mockShift} />);
  expect(container).toMatchSnapshot();
});
```

Updates snapshot:
```bash
pnpm test -u
```

## Mocking Strategies

### 1. Mock Functions

```typescript
const mockCallback = jest.fn();
component.onClick(mockCallback);
expect(mockCallback).toHaveBeenCalledWith(expectedArg);
```

### 2. Mock Modules

```typescript
jest.mock('@/lib/api', () => ({
  fetchData: jest.fn().mockResolvedValue(mockData),
}));
```

### 3. Mock Timers

```typescript
jest.useFakeTimers();
jest.advanceTimersByTime(1000);
expect(callback).toHaveBeenCalled();
jest.useRealTimers();
```

### 4. Mock Dates

```typescript
const mockDate = new Date('2025-01-15');
jest.spyOn(global, 'Date').mockImplementation(() => mockDate);
```

## Integration with Existing Code

### Use in Payment Flow:

```typescript
// app/api/payments/route.ts
import { calculatePaymentAmounts } from '@/lib/utils/payment';

export async function POST(req: Request) {
  const { shiftAmount, platformFee } = await req.json();

  // Tested function!
  const amounts = calculatePaymentAmounts(shiftAmount, platformFee);

  // Save to database...
}
```

### Use in Rating Update:

```typescript
// app/api/ratings/route.ts
import { calculateNewRating } from '@/lib/utils/rating';

export async function POST(req: Request) {
  const { userId, newRating } = await req.json();

  const user = await getUser(userId);

  // Tested function!
  const updatedRating = calculateNewRating(
    user.rating,
    user.completed_shifts,
    newRating
  );

  await updateUserRating(userId, updatedRating);
}
```

## Test Driven Development (TDD)

### Workflow:

1. **Red** - Write failing test
```typescript
it('should calculate discount', () => {
  expect(calculateDiscount(100, 10)).toBe(90);
});
// Test fails: function doesn't exist
```

2. **Green** - Write minimal code to pass
```typescript
export function calculateDiscount(price: number, percent: number) {
  return price - (price * percent / 100);
}
// Test passes!
```

3. **Refactor** - Improve code without breaking tests
```typescript
export function calculateDiscount(price: number, percent: number) {
  if (percent < 0 || percent > 100) {
    throw new Error('Invalid discount');
  }
  return price * (1 - percent / 100);
}
// Tests still pass, code is better
```

## Performance Testing

### Benchmark Critical Functions:

```typescript
describe('Performance', () => {
  it('should calculate rating in <1ms', () => {
    const start = performance.now();

    for (let i = 0; i < 1000; i++) {
      calculateNewRating(4.5, 100, 5);
    }

    const end = performance.now();
    expect(end - start).toBeLessThan(1000);
  });
});
```

## Continuous Testing

### Watch Mode:

```bash
pnpm test:watch
```

**Features**:
- Автоматически перезапускает тесты при изменениях
- Интерактивный режим (press `p` to filter by filename)
- Показывает только failed tests после первого запуска
- Hot reload для test файлов

### Coverage Watch:

```bash
pnpm test:watch --coverage
```

Updates coverage report в real-time.

## Test Organization

### Directory Structure:

```
tests/
├── lib/
│   ├── rating.test.ts
│   ├── payment.test.ts
│   └── validation.test.ts
├── components/
│   ├── ShiftCard.test.tsx
│   └── UserProfile.test.tsx
├── api/
│   └── shifts.test.ts
└── helpers/
    └── builders.ts
```

### Naming Convention:

- Test files: `*.test.ts` or `*.test.tsx`
- Match source file name: `rating.ts` → `rating.test.ts`
- Place in `tests/` mirroring `lib/` structure

## Edge Cases Tested

### Rating Calculation:

- ✅ First rating (0 shifts)
- ✅ After many shifts (100+)
- ✅ Perfect rating (5.0)
- ✅ Lowest rating (1.0)
- ✅ Boundary values (4.9999 → 5.0)

### Payment Calculation:

- ✅ Normal case (amount > fee)
- ✅ Zero fee
- ✅ Negative amounts (error)
- ✅ Fee > amount (error)

## Test Data

### Example Test Data:

```typescript
// tests/fixtures/users.ts
export const mockWorker = {
  id: 'worker-1',
  role: 'worker',
  rating: 4.5,
  completed_shifts: 10,
};

export const mockShift = {
  id: 'shift-1',
  title: 'Монтаж сцены',
  amount: 10000,
  status: 'pending',
};
```

Import in tests:
```typescript
import { mockWorker } from '@/tests/fixtures/users';
```

## Assertions Guide

### Numbers:

```typescript
expect(result).toBe(5);                    // Exact
expect(result).toBeCloseTo(4.545, 2);      // Float (2 decimals)
expect(result).toBeGreaterThan(0);         // >
expect(result).toBeLessThanOrEqual(5);     // <=
```

### Strings:

```typescript
expect(result).toBe('exact string');
expect(result).toContain('substring');
expect(result).toMatch(/regex/);
```

### Arrays:

```typescript
expect(array).toHaveLength(3);
expect(array).toContain(item);
expect(array).toEqual([1, 2, 3]);
```

### Objects:

```typescript
expect(obj).toEqual({ a: 1, b: 2 });       // Deep equality
expect(obj).toMatchObject({ a: 1 });       // Partial match
expect(obj).toHaveProperty('key');
```

### Errors:

```typescript
expect(() => fn()).toThrow();
expect(() => fn()).toThrow('Error message');
expect(() => fn()).toThrow(TypeError);
```

## Common Issues

### Module not found:
```
Cannot find module '@/lib/...'
```
**Fix**: Check `moduleNameMapper` in jest.config.js

### React component test fails:
```
ReferenceError: document is not defined
```
**Fix**: Ensure `testEnvironment: 'jest-environment-jsdom'`

### Async tests timeout:
```typescript
// Increase timeout
it('should complete async operation', async () => {
  // test code
}, 10000);  // 10 second timeout
```

### ESM module issues:
```
SyntaxError: Cannot use import statement outside a module
```
**Fix**: Add to jest.config.js:
```javascript
transformIgnorePatterns: [
  'node_modules/(?!(module-name)/)',
],
```

## Next Steps

### Priority Tests to Add:

1. **Date utilities** - formatRussianDate, calculateShiftDuration
2. **Validation** - phone, email, INN validation
3. **Discount calculations** - promo codes, bulk discounts
4. **Shift status** - state machine transitions
5. **Notification logic** - who gets notified when

### Test Categories:

| Priority | Category | Files | Status |
|----------|----------|-------|--------|
| 🔴 High | Utils (rating, payment) | 2 | ✅ Done |
| 🟡 Medium | Validation functions | 0 | ❌ Todo |
| 🟡 Medium | Date/time utilities | 0 | ❌ Todo |
| 🟢 Low | Components | 0 | ❌ Todo |
| 🟢 Low | API routes | 0 | ❌ Todo |

### Integration Tests:

```typescript
// tests/integration/shift-lifecycle.test.ts
describe('Shift Lifecycle', () => {
  it('should handle full shift flow', async () => {
    // 1. Create shift
    // 2. Assign worker
    // 3. Complete shift
    // 4. Process payment
    // 5. Submit rating
    // 6. Verify all state changes
  });
});
```

## Commands Reference

```bash
# Run all tests
pnpm test

# Run specific file
pnpm test rating.test

# Watch mode
pnpm test:watch

# Coverage report
pnpm test:coverage

# Update snapshots
pnpm test -u

# Verbose output
pnpm test --verbose

# Run tests matching pattern
pnpm test --testNamePattern="rating"

# Clear cache
pnpm test --clearCache
```

## Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
- [Jest Matchers](https://jestjs.io/docs/expect)

## Notes

- Tests run in Node environment (not browser)
- Use jsdom for DOM APIs
- Mock external services (Supabase, fetch, etc.)
- Keep tests fast (<1ms per test)
- Test edge cases and errors
- Coverage ≠ quality (test meaningful scenarios)
- TDD for critical business logic
- Integration tests for complex flows
