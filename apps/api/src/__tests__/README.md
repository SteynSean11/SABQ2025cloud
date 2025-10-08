# API Test Suite

This directory contains comprehensive unit and integration tests for the SA Budget Queen API, specifically covering the morgan HTTP request logger middleware upgrade from version 1.10.0 to 1.10.1.

## Test Files

### 1. `package.validation.test.ts`
**Purpose:** Validates the package.json configuration file structure and dependencies.

**Test Coverage:**
- ✅ Package.json structure validation
- ✅ Required fields verification
- ✅ Dependencies validation (all required packages present)
- ✅ DevDependencies validation (TypeScript, testing tools, type definitions)
- ✅ Scripts validation (dev, build, start, test)
- ✅ Prisma configuration
- ✅ Dependency version compatibility (Express 5.x with Morgan 1.10.x)
- ✅ Security best practices (no wildcards, proper semver)
- ✅ Morgan version verification (1.10.1 or higher)

**Test Count:** 24 tests across 8 test suites

### 2. `morgan.integration.test.ts`
**Purpose:** Tests the Morgan middleware functionality in isolation.

**Test Coverage:**
- ✅ Basic functionality with different logging formats (dev, combined, common, short, tiny)
- ✅ HTTP method support (GET, POST, PUT, DELETE, PATCH)
- ✅ Status code logging (200, 201, 204, 400, 401, 404, 500)
- ✅ Custom format tokens
- ✅ Skip function for conditional logging
- ✅ Middleware order compatibility
- ✅ Response time logging
- ✅ Content length logging
- ✅ Error handling
- ✅ Query parameters and headers
- ✅ Version compatibility checks

**Test Count:** 34 tests across 12 test suites

### 3. `morgan.config.test.ts`
**Purpose:** Tests Morgan configuration options and advanced features.

**Test Coverage:**
- ✅ Custom stream configuration
- ✅ Immediate logging option
- ✅ Custom format strings
- ✅ Token functions (date, http-version, referrer, user-agent, remote-addr, remote-user)
- ✅ Response header logging
- ✅ Request header logging
- ✅ Edge cases (special characters, long URLs, concurrent requests)
- ✅ Empty and large response bodies
- ✅ Performance impact

**Test Count:** 22 tests across 9 test suites

### 4. `app.integration.test.ts`
**Purpose:** Tests the complete Express application integration with Morgan middleware.

**Test Coverage:**
- ✅ Complete middleware stack setup
- ✅ Root route handling
- ✅ Request logging through middleware
- ✅ CORS integration
- ✅ JSON body parsing
- ✅ URL-encoded body parsing
- ✅ Middleware execution order
- ✅ API route logging (user registration, login, errors)
- ✅ Different Morgan format options
- ✅ Production-like scenarios (high volume, various status codes, response times)
- ✅ Error handling with Morgan
- ✅ Version compatibility verification

**Test Count:** 21 tests across 8 test suites

## Running the Tests

### Run All Tests
```bash
cd apps/api
pnpm test
```

### Run Tests in Watch Mode
```bash
cd apps/api
pnpm test --watch
```

### Run Specific Test File
```bash
cd apps/api
pnpm test src/__tests__/package.validation.test.ts
```

### Run Tests with Coverage
```bash
cd apps/api
pnpm test --coverage
```

### Run Tests in UI Mode
```bash
cd apps/api
pnpm test --ui
```

## Test Statistics

- **Total Test Files:** 4
- **Total Test Cases:** 101
- **Total Test Suites:** 37
- **Lines of Test Code:** 1,667

## Test Categories Breakdown

| Category | Tests | Description |
|----------|-------|-------------|
| Package Validation | 24 | Validates package.json structure and dependencies |
| Morgan Integration | 34 | Tests Morgan middleware functionality |
| Morgan Configuration | 22 | Tests advanced Morgan options and features |
| App Integration | 21 | Tests full Express app with Morgan |

## Key Testing Patterns

### 1. Custom Stream for Log Capture
```typescript
const logs: string[] = [];
const stream = {
  write: (message: string) => {
    logs.push(message);
  }
};

app.use(morgan('dev', { stream }));
```

### 2. Supertest for HTTP Testing
```typescript
import request from 'supertest';

const response = await request(app)
  .get('/test')
  .expect(200);
```

### 3. Version Verification
```typescript
const morganPackage = require('morgan/package.json');
const version = morganPackage.version;
const [major, minor, patch] = version.split('.').map(Number);

expect(major).toBe(1);
expect(minor).toBe(10);
expect(patch).toBeGreaterThanOrEqual(1);
```

## Dependencies Used in Tests

- **vitest** - Test runner and assertion library
- **supertest** - HTTP testing library for Express
- **@types/supertest** - TypeScript definitions for supertest
- **express** - Web framework (tested dependency)
- **morgan** - HTTP request logger (primary tested dependency)
- **cors** - CORS middleware (integration testing)

## What Changed

The primary change in the codebase is the upgrade of the `morgan` package from version `1.10.0` to `1.10.1` in `apps/api/package.json`.

### Why These Tests Matter

1. **Regression Prevention:** Ensures the upgrade doesn't break existing functionality
2. **Version Compatibility:** Verifies Morgan 1.10.1 works with Express 5.x
3. **Configuration Validation:** Ensures package.json maintains correct structure
4. **Middleware Stack:** Confirms proper integration with other middleware
5. **Logging Reliability:** Validates that HTTP request logging works correctly
6. **Production Readiness:** Tests simulate real-world scenarios

## Test Coverage Areas

### Happy Paths ✅
- All HTTP methods (GET, POST, PUT, DELETE, PATCH)
- All standard logging formats
- Successful requests with various status codes
- Proper middleware chaining

### Edge Cases ✅
- Very long URLs
- Special characters in routes
- Empty response bodies
- Large response bodies
- Concurrent requests
- Missing headers

### Error Conditions ✅
- Application errors
- Network errors
- Invalid configurations
- Middleware chain interruptions

### Performance ✅
- Response time impact
- High request volume
- Concurrent request handling

## Best Practices Demonstrated

1. **Isolation:** Each test file focuses on a specific aspect
2. **Setup/Teardown:** Proper test state management
3. **Mocking:** Console output capture for testing logs
4. **Descriptive Naming:** Clear test descriptions
5. **Comprehensive Coverage:** Multiple scenarios per feature
6. **Type Safety:** Full TypeScript support
7. **Integration Testing:** Real HTTP requests via supertest

## Continuous Integration

These tests are designed to run in CI/CD pipelines. They:
- ✅ Don't require external services
- ✅ Run quickly (< 30 seconds total)
- ✅ Provide clear failure messages
- ✅ Are deterministic (no flaky tests)
- ✅ Work in headless environments

## Maintenance

When updating Morgan or Express versions:
1. Run the full test suite
2. Update version assertions in compatibility tests
3. Add new tests for new features
4. Ensure all tests pass before merging

## Contributing

When adding new features or fixing bugs:
1. Add corresponding tests
2. Follow existing test patterns
3. Ensure tests are descriptive
4. Keep tests focused and atomic
5. Run entire test suite before committing

## Additional Resources

- [Vitest Documentation](https://vitest.dev/)
- [Supertest Documentation](https://github.com/visionmedia/supertest)
- [Morgan Documentation](https://github.com/expressjs/morgan)
- [Express Testing Guide](https://expressjs.com/en/guide/testing.html)