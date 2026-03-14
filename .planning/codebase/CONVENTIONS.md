# Coding Conventions

**Analysis Date:** 2026-03-14

## Status

**Note:** This codebase is in initial stages with no source code yet tracked. The following conventions should be established as the project develops.

## Naming Patterns

**Files:**
- Use lowercase with hyphens for file names (e.g., `user-service.ts`, `api-controller.ts`)
- Test files use `.test.ts` or `.spec.ts` suffix (e.g., `user-service.test.ts`)
- Configuration files use dot-prefixed names (e.g., `.eslintrc.json`, `.prettierrc`)

**Functions:**
- Use camelCase for function names (e.g., `getUserById()`, `validateEmail()`)
- Prefix boolean-returning functions with `is`, `has`, `should`, `can` (e.g., `isActive()`, `hasPermission()`)
- Use verb-noun pattern for action functions (e.g., `fetchUsers()`, `createUser()`, `deleteItem()`)

**Variables:**
- Use camelCase for variable names (e.g., `userCount`, `isLoading`, `apiKey`)
- Use UPPER_SNAKE_CASE for constants (e.g., `MAX_RETRY_ATTEMPTS`, `DEFAULT_TIMEOUT`)
- Use descriptive names that indicate the variable's purpose and type (e.g., `userIds` for arrays)

**Types:**
- Use PascalCase for type/interface names (e.g., `UserService`, `ApiResponse`, `ValidationError`)
- Use PascalCase for enums (e.g., `RequestStatus`, `UserRole`)
- Prefix interfaces with `I` for distinction (optional but consider consistency)

## Code Style

**Formatting:**
- 2-space indentation
- Max line length: 100 characters (enforce via linting)
- Use semicolons at end of statements
- Single quotes for strings (unless escaping required)

**Linting:**
- Tool: ESLint (to be configured)
- Recommended rules:
  - `no-unused-vars`
  - `no-console` (in production code)
  - `eqeqeq` (strict equality)
  - `no-implicit-any` (for TypeScript)

**Prettier:**
- Configure `.prettierrc` with 2-space indentation
- Enforce formatting on pre-commit hooks

## Import Organization

**Order:**
1. External dependencies (e.g., `import express from 'express'`)
2. Internal absolute imports using aliases (e.g., `import { UserService } from '@services/user'`)
3. Relative imports (e.g., `import { Helper } from '../helpers'`)
4. Side effects (e.g., `import './styles.css'`)

**Path Aliases:**
- Use `@` prefix for common directories (to be configured in `tsconfig.json`):
  - `@services/` - service layer
  - `@controllers/` - controller layer
  - `@models/` - data models
  - `@utils/` - utility functions
  - `@types/` - TypeScript type definitions

**Guidelines:**
- Group related imports together
- Alphabetize imports within each group
- Avoid circular dependencies

## Error Handling

**Patterns:**
- Create custom error classes extending `Error` for domain-specific errors
- Example: `UserNotFoundError extends Error`
- Always include error messages with context (e.g., user ID, timestamp)
- Use try-catch blocks for async operations
- Propagate errors with context rather than silencing them

**Error Classes Location:**
- Place custom error definitions in `src/errors/` or `src/types/errors.ts`

**Async Error Handling:**
```typescript
try {
  const result = await someAsyncOperation();
  return result;
} catch (error) {
  if (error instanceof SpecificError) {
    // Handle known error
  }
  throw new CustomError('Operation failed', { cause: error });
}
```

## Logging

**Framework:** `console` (or integrate logging library like Winston/Pino later)

**Patterns:**
- Log at appropriate levels: debug, info, warn, error
- Include context: operation name, user ID, request ID where relevant
- Avoid logging sensitive data (passwords, tokens, personal info)
- Log errors with full stack traces

**Example:**
```typescript
logger.info('User created', { userId: user.id, email: user.email });
logger.error('Database connection failed', { error: err.message, code: err.code });
```

## Comments

**When to Comment:**
- Explain WHY, not WHAT (code should be self-documenting)
- Comment complex algorithms or non-obvious business logic
- Add comments for workarounds or temporary solutions with TODO tags
- Explain tricky regex patterns or mathematical operations

**Avoid:**
- Redundant comments that merely restate the code
- Commented-out code (use git history instead)

**TODO/FIXME Syntax:**
```typescript
// TODO: Implement caching here (ticket: #123)
// FIXME: Handle edge case when items array is empty
```

## JSDoc/TSDoc

**Usage Pattern:**
- Document public APIs and exported functions
- Include `@param` and `@returns` for clarity
- Include `@throws` for potential errors

**Example:**
```typescript
/**
 * Fetches a user by ID from the database.
 * @param userId - The unique identifier of the user
 * @returns Promise resolving to the user object
 * @throws {UserNotFoundError} When user with given ID doesn't exist
 */
export async function getUserById(userId: string): Promise<User> {
  // implementation
}
```

## Function Design

**Size:**
- Keep functions small and focused (aim for <30 lines)
- Break down complex logic into smaller helpers

**Parameters:**
- Maximum 3-4 parameters; use object destructuring for more
- Example: `function createUser({ name, email, role }: UserInput)`

**Return Values:**
- Prefer explicit return types in TypeScript
- Use union types for multiple return scenarios
- Return early to reduce nesting

## Module Design

**Exports:**
- Use named exports for functions and classes
- Use default export only for index files (barrel exports)
- Keep modules focused on a single responsibility

**Barrel Files:**
- Use `index.ts` files to re-export related items
- Example in `src/services/index.ts`:
```typescript
export { UserService } from './user-service';
export { AuthService } from './auth-service';
export type { ServiceConfig } from './types';
```

---

*Convention analysis: 2026-03-14*
