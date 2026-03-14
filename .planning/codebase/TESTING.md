# Testing Patterns

**Analysis Date:** 2026-03-14

## Status

**Note:** This codebase is in initial stages with no source code yet tracked. The following testing framework recommendations and patterns are provided to guide future implementation.

## Test Framework

**Recommended Runner:**
- Jest (widely used, good TypeScript support)
- Alternative: Vitest (faster, modern, ESM native)

**Config Location:**
- `jest.config.js` or `vitest.config.ts` at project root

**Assertion Library:**
- Jest built-in assertions (preferred with Jest)
- Chai (if using Mocha)

**Run Commands:**
```bash
npm test                 # Run all tests
npm run test:watch      # Watch mode for development
npm run test:coverage   # Generate coverage report
npm run test:debug      # Debug tests
```

## Test File Organization

**Location:**
- Co-located pattern: Place test files next to source files
- Directory structure mirrors `src/`:
  ```
  src/
  ├── services/
  │   ├── user-service.ts
  │   └── user-service.test.ts
  ├── controllers/
  │   ├── api-controller.ts
  │   └── api-controller.test.ts
  ```

**Naming:**
- Test files: `[module-name].test.ts` or `[module-name].spec.ts`
- Test suites: `[Feature Name]` (descriptive)
- Test cases: Should describe the scenario clearly

**Structure:**
```
tests/
├── unit/           # Unit tests
├── integration/    # Integration tests
├── fixtures/       # Test data and mocks
└── helpers/        # Test utilities
```

## Test Structure

**Suite Organization:**
```typescript
import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { UserService } from '@services/user-service';

describe('UserService', () => {
  let service: UserService;

  beforeEach(() => {
    service = new UserService();
  });

  afterEach(() => {
    // Cleanup
  });

  describe('getUserById', () => {
    it('should return user when found', async () => {
      const user = await service.getUserById('123');
      expect(user).toBeDefined();
      expect(user.id).toBe('123');
    });

    it('should throw UserNotFoundError when user does not exist', async () => {
      await expect(service.getUserById('invalid')).rejects.toThrow(UserNotFoundError);
    });
  });
});
```

**Patterns:**
- Use `describe()` to group related tests
- Use nested `describe()` blocks for method/feature organization
- Use `beforeEach()` for setup, `afterEach()` for cleanup
- Use `beforeAll()` and `afterAll()` for expensive setup/teardown
- One assertion focus per test (or related assertions for same behavior)

## Mocking

**Framework:**
- Jest Mock Functions: `jest.fn()`, `jest.spyOn()`
- Mock modules: `jest.mock('@services/external-api')`

**Patterns:**
```typescript
// Mock function
const mockFetch = jest.fn();
mockFetch.mockResolvedValue({ status: 200, data: {} });

// Spy on existing method
jest.spyOn(service, 'getUserById').mockResolvedValue(mockUser);

// Mock entire module
jest.mock('@services/database', () => ({
  connect: jest.fn().mockResolvedValue({}),
}));
```

**What to Mock:**
- External API calls
- Database queries
- File system operations
- Third-party library calls
- Time-dependent functions (use jest.useFakeTimers)

**What NOT to Mock:**
- Core business logic being tested
- Utility functions (unless they have side effects)
- Type definitions

## Fixtures and Factories

**Test Data:**
```typescript
// tests/fixtures/users.ts
export const mockUser = {
  id: '123',
  name: 'John Doe',
  email: 'john@example.com',
  role: 'user',
};

export const mockAdmin = {
  ...mockUser,
  id: '456',
  role: 'admin',
};

// Factory function for flexibility
export function createUser(overrides = {}) {
  return { ...mockUser, ...overrides };
}
```

**Location:**
- `tests/fixtures/` - Store test data and factory functions
- Create separate files per entity type (e.g., `users.ts`, `products.ts`)
- Export factories and common test objects from `index.ts`

**Usage:**
```typescript
import { createUser, mockAdmin } from 'tests/fixtures';

const testUser = createUser({ email: 'custom@example.com' });
```

## Coverage

**Requirements:**
- Target: 80%+ overall coverage
- Minimum 100% for critical business logic
- Configure in Jest config: `coverageThreshold`

**Enforce Coverage:**
```javascript
// jest.config.js
module.exports = {
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
};
```

**View Coverage:**
```bash
npm run test:coverage
# Opens coverage/lcov-report/index.html in browser
```

## Test Types

**Unit Tests:**
- Scope: Single function/method in isolation
- Approach: Mock all dependencies
- Location: Co-located with source files
- Typical file: `user-service.test.ts` for `user-service.ts`

**Integration Tests:**
- Scope: Multiple components working together
- Approach: Use real or in-memory test doubles (e.g., test database)
- Location: `tests/integration/`
- Example: Test complete user creation flow with database

**E2E Tests:**
- Framework: Cypress, Playwright, or similar
- Location: `e2e/` or `tests/e2e/`
- Scope: User workflows across full application
- Not yet applicable for this project stage

## Common Patterns

**Async Testing:**
```typescript
// Using async/await
it('should fetch user data', async () => {
  const user = await userService.getUser('123');
  expect(user.id).toBe('123');
});

// Using return promise
it('should fetch user data', () => {
  return userService.getUser('123').then(user => {
    expect(user.id).toBe('123');
  });
});

// Using done callback (avoid when possible)
it('should fetch user data', (done) => {
  userService.getUser('123').then(user => {
    expect(user.id).toBe('123');
    done();
  });
});
```

**Error Testing:**
```typescript
// Test expected errors
it('should throw UserNotFoundError for invalid ID', async () => {
  await expect(userService.getUser('invalid')).rejects.toThrow(
    UserNotFoundError
  );
});

// Test error message
it('should provide descriptive error message', async () => {
  const error = await userService.getUser('invalid').catch(e => e);
  expect(error.message).toMatch(/User not found/);
});

// Test error properties
it('should include context in error', async () => {
  const error = await userService.getUser('invalid').catch(e => e);
  expect(error.userId).toBe('invalid');
});
```

**Snapshot Testing (use sparingly):**
```typescript
it('should generate correct API response shape', () => {
  const response = apiController.formatResponse(data);
  expect(response).toMatchSnapshot();
});
```

## Pre-commit Testing

**Configure Husky + lint-staged:**
- Run tests for changed files before commit
- Configuration in `package.json`:
```json
{
  "husky": {
    "hooks": {
      "pre-commit": "lint-staged",
      "pre-push": "npm test"
    }
  },
  "lint-staged": {
    "*.ts": ["eslint", "jest --bail --findRelatedTests"]
  }
}
```

## Debugging Tests

**Run Single Test:**
```bash
npm test -- user-service.test.ts
npm test -- --testNamePattern="should return user"
```

**Debug Mode:**
```bash
node --inspect-brk node_modules/.bin/jest --runInBand
```

**VSCode Configuration:**
Add to `.vscode/launch.json`:
```json
{
  "type": "node",
  "request": "launch",
  "name": "Debug Tests",
  "program": "${workspaceFolder}/node_modules/.bin/jest",
  "args": ["--runInBand"],
  "console": "integratedTerminal",
  "internalConsoleOptions": "neverOpen"
}
```

---

*Testing analysis: 2026-03-14*
