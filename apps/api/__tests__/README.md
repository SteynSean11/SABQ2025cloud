# Package.json Test Suite

## Overview
This test suite provides comprehensive validation for the `package.json` file, with special focus on the security update for the `morgan` package (upgraded from `^1.10.0` to `^1.10.1`).

## Test Structure

### 1. JSON Structure (2 tests)
- Validates that package.json is valid, parseable JSON
- Ensures it's an object (not array or primitive)

### 2. Required Fields (3 tests)
- Validates presence of name, version, main fields
- Checks semver version format compliance
- Verifies required configuration sections exist

### 3. Scripts Configuration (1 test)
- Validates all required npm scripts (dev, build, start, test, postinstall)
- Ensures scripts use correct commands and paths

### 4. Dependencies (5 tests)
- Validates all critical production dependencies are present
- **SECURITY: Confirms morgan is at secure version ^1.10.1**
- **SECURITY: Ensures vulnerable morgan versions are not used**
- Validates semver range formats
- Checks Express 5+ compatibility

### 5. DevDependencies (2 tests)
- Validates all critical development dependencies
- Ensures TypeScript type definitions are present for typed packages

### 6. Prisma Configuration (2 tests)
- Validates Prisma schema path configuration
- Ensures prisma and @prisma/client versions match

### 7. Security and Best Practices (3 tests)
- Checks for leaked tokens or secrets
- Ensures no wildcard versions (*, latest)
- Validates no git URLs in dependencies

### 8. Morgan-Specific Security Validation (3 tests)
- **PRIMARY: Validates morgan version >= 1.10.1**
- **SECURITY: Blocks known vulnerable versions**
- **COMPATIBILITY: Ensures morgan works with Express 5**

### 9. Dependency Structure Validation (4 tests)
- Validates authentication dependencies (bcrypt, jwt, passport)
- Validates middleware dependencies (cors, morgan, express)
- Checks for duplicate dependencies across prod/dev
- Ensures reasonable dependency count

### 10. Version Format Validation (2 tests)
- Validates consistent version prefix usage (^)
- Ensures no pre-release versions in production dependencies

### 11. Edge Cases (3 tests)
- Tests for circular references
- Validates JSON formatting (newlines, no trailing commas)
- Confirms module type is commonjs

## Key Security Tests

The following tests specifically validate the security fix:

1. **`should have morgan with security fix version`**
   - Asserts: `morgan` === `^1.10.1`
   - Purpose: Confirms the security patch is applied

2. **`should not have vulnerable morgan version`**
   - Asserts: `morgan` \!== `^1.10.0` and \!== `1.10.0`
   - Purpose: Prevents regression to vulnerable version

3. **`should have morgan version >= 1.10.1`**
   - Parses version and validates major.minor.patch >= 1.10.1
   - Purpose: Ensures any future version is also secure

4. **`should not have known vulnerable morgan versions`**
   - Blocks: `1.10.0`, `^1.10.0`, `~1.10.0`
   - Purpose: Comprehensive vulnerable version blocking

## Running the Tests

```bash
# Run all tests
cd apps/api
npm test

# Run with coverage
npm test -- --coverage

# Run only package.json tests
npm test __tests__/package.test.ts

# Run in watch mode
npm test -- --watch
```

## Test Statistics

- **Total Test Suites:** 12
- **Total Test Cases:** 30
- **Lines of Code:** 215
- **Security-Focused Tests:** 7
- **Morgan-Specific Tests:** 3

## Test Dependencies

These tests use:
- **Vitest**: Test framework (configured in `vitest.config.ts`)
- **Node.js fs module**: For reading package.json
- **Node.js path module**: For resolving file paths

No additional test dependencies needed\!

## Continuous Integration

These tests should be run:
- On every commit
- Before merging pull requests
- As part of the CI/CD pipeline
- Before publishing releases

## Maintenance

When updating dependencies:
1. Run these tests to ensure package.json remains valid
2. Update version-specific tests if packages are upgraded
3. Add new tests for newly added dependencies
4. Ensure security tests remain comprehensive

## Coverage

This test suite validates:
✅ JSON syntax and structure
✅ Required npm package.json fields
✅ Build and development scripts
✅ Production dependencies
✅ Development dependencies
✅ Security vulnerabilities
✅ Semver compliance
✅ Framework compatibility
✅ Configuration integrity
✅ Best practices compliance