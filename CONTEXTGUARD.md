---
title: Contextual Guardrail SABQ2025cloud
tags: [context, guardrail, ai, cloud, SABQ2025cloud]

# AI Development Assistant Guidelines & Constraints

## 🔄 Project Awareness & Context

### Essential Reading

- **Always**, read `PLANNING.md` at the start of any new conversation, to understand the project's architecture, goals, technology stack, and constraints.
- **Check**, the `TASK.md`, before starting any new task. If the task isn't listed, add it with a brief description and today's date.
- **Reference project vision**: Personal budgeting web app, for middle-aged South Africans facing economic pressures.
- **Use**, Consistent naming conventions, file structure and architecture patterns, as described in `PLANNING.md`

### Context Validation

- **Never**, assume missing context. Ask questions if uncertain.
- **Always**, confirm file paths and module names exist before referencing them in code or tests.
- **Verify**, dependencies are listed in package.json before using them in code.
- **Check**, existing code patterns and maintain consistency with established conventions.

## 🧱 Code Structure & Modularity

### File Size & Organization

> :warning: **Never** create a file longer than 500 lines of code!

- If a file approaches this limit, refactor by splitting it into
- Feature-specific modules
- Helper utility files
- Separate concerns (business logic, UI components, API handlers)
- Configuration files

### Project Structure

> :bulb: Organize code into clearly separated modules, grouped by feature or responsibility.

```markdown

src/

├── components/          # Reusable UI components
├── pages/              # Next.js pages/routes
├── features/           # Feature-specific modules
├── lib/                # Utility functions and configurations
├── hooks/              # Custom React hooks
├── types/              # TypeScript type definitions
├── styles/             # CSS and styling files
└── __tests__/          # Test files

```markdowmn

### Import Standards

Use consistent imports with clear hierarchies:

 ```typescript
 // External libraries first
 import React from 'react'
 import { NextPage } from 'next'
 
 // Internal imports - absolute paths from project root
 import { Button } from '@/components/ui/button'
 import { useAuth } from '@/hooks/use-auth'
 
 // Relative imports for same directory or close modules
 import { BudgetForm } from './budget-form'
 import { calculateBudget } from '../utils/budget-calculations'
 ```

## 🔧 Technology Standards

### Frontend Development (React/Next.js)

- **Use TypeScript** for all new files with strict type checking
- **Functional components** with hooks (no class components)
- **Next.js App Router** for routing (not Pages Router)
- **Tailwind CSS** for styling with consistent design system
- **React Hook Form** for form handling with Zod validation
- **Zustand** for state management (not Redux)

### Backend Development (Node.js/Express)

- **TypeScript** for all backend code
- **Express.js** with proper middleware structure
- **Prisma ORM** for database operations
- **Zod** for input validation and type safety
- **JWT** for authentication with refresh token strategy

### Database Standards

- **Prisma** as the primary ORM
- **PostgreSQL** for primary data storage
- **Redis** for caching and session management
- **Proper indexing** for performance-critical queries
- **Migration-first** approach for schema changes

## 🧪 Testing & Reliability

### Test Requirements

* ** Always**: Create tests for new features (functions, components, API routes, etc.)
* ** After updating any logic**: Check whether existing tests need updates
* ** Minimum test coverage**: Aim for 80% code coverage
* ** Test file naming**: filename.test.ts` or `filename.spec.ts`

### Test Structure

* ** Tests**: Should be co-located with the source files they test.

### Test Types & Coverage

Include at least:

* ** 1 test**: for expected use case** (happy path)
* ** 1 edge case test**: (boundary conditions)
* ** 1 failure case test**: (error handling)
* **Integration tests**: for API endpoints
* **Component tests**: for React components

### Testing Frameworks

* ** Primary Framework**: **Vitest**.
* ** Component Testing**: **React** (Testing Library).
* ** E2E**: Playwright for critical user journeys.

## ✅ Task Management & Completion

### Task Workflow

* ** Mark completed tasks in `TASK.md`** immediately after finishing them.
* ** Add new sub-tasks or TODOs** discovered during development to `TASK.md` under "Discovered During Development".
* ** Update task status** with brief completion notes.
* ** Create new tasks** for any bugs or improvements found during development.

### Documentation Updates

* **Update** **`README.md`** **when**:

- New features are added
- Dependencies change
- Setup steps are modified
- Environment variables are added
- **Update**, API documentation for any new endpoints or changes

## 📚 Code Quality & Style

### TypeScript Standards

- **Strict**, TypeScript configuration** enabled
- **Type**, definitions** for all function parameters and return values
- **Interface**, definitions** for all data structures
- **Avoid**, **`any`**, **type**,: use proper typing or `unknown`
- **Generic** **types**,: where appropriate for reusability

## Code Style

### ESLint + Prettier configuration enforced
  
* __Consistent naming conventions__:
* `camelCase`,: for variables and functions
* `PascalCase`,: for components and classes
* `UPPER_SNAKE_CASE`,: for constants
* `kebab-case`,: for file names
* __Clear__: Variable names that explain purpose.
* __Small__: Focused functions (max 20-30 lines).

### Documentation Standards

**JSDoc comments** for all exported functions:

```typescript
/**
* Calculates monthly budget allocation based on income and priorities
* @param income - Monthly gross income in ZAR
* @param priorities - Array of budget priorities with percentages
* @returns Calculated budget allocation per category
*/
export function calculateBudgetAllocation(
  income: number,
  priorities: BudgetPriority[]
): BudgetAllocation {
  // Implementation...
}
```typescript

- **Inline comments** for complex logic explaining the "why", not the "what"
- **README updates** for new features or setup changes

## 🔒 Security & Privacy Guidelines

### Data Protection

- **Never log sensitive data** (passwords, tokens, financial information)
- **Validate all inputs** using Zod schemas
- **Sanitize user inputs** to prevent XSS attacks
- **Use parameterized queries** to prevent SQL injection
- **Implement rate limiting** on API endpoints

### Authentication & Authorization

- **JWT tokens** with proper expiration times
- **Refresh token rotation** for security
- **Role-based access control** where needed
- **Secure password hashing** using bcrypt
- **Input validation** on all authentication endpoints

### South African Compliance

- **POPIA compliance** for personal data handling
- **Financial regulation compliance** for banking integrations
- **Data residency** requirements consideration
- **Audit logging** for financial transactions

## 🌍 South African Context Requirements

### Localization

- **Currency formatting** in South African Rand (ZAR)
- **Date formatting** in South African format (DD/MM/YYYY)
- **SA ID number validation** using proper algorithms
- **Banking details validation** for South African account numbers
- **Tax number formatting** and validation

### Cultural Sensitivity

- **Load shedding considerations** in all offline features
- **Stokvel terminology** and cultural understanding
- **Economic volatility** awareness in financial calculations
- **Multi-language support** preparation for Afrikaans and African languages

## 🚫 Never Do This

### Code Practices to Avoid

- **Never delete or overwrite existing code** unless explicitly instructed or part of a task from `TASK.md`
- **Never use `any` type** in TypeScript without justification
- **Never hardcode sensitive values** - use environment variables
- **Never skip input validation** on user-facing endpoints
- **Never commit secrets** to version control

### Architecture Violations

- **Never create circular dependencies** between modules
- **Never put business logic in UI components**
- **Never bypass the established authentication system**
- **Never create direct database connections** outside of the ORM layer
- **Never ignore error handling** in async operations

### Library & Dependency Rules

- **Never add dependencies** without checking if they're already available
- **Never use deprecated libraries** or methods
- **Never import entire libraries** when only specific functions are needed
- **Never use different libraries** for the same purpose without justification

## 🔄 Development Workflow

### Before Starting Work

1. Read `PLANNING.md` to understand current project state
2. Check `TASK.md` for assigned tasks and priorities
3. Verify the task is clearly defined and understood
4. Confirm all dependencies and requirements are available

### During Development

1. Follow established patterns and conventions
2. Write tests alongside code development
3. Update documentation as you work
4. Commit frequently with clear messages
5. Ask for clarification if requirements are unclear

### After Completing Work

1. Run all tests and ensure they pass
2. Update `TASK.md` with completion status
3. Add any discovered tasks or improvements
4. Update relevant documentation
5. Ensure code follows all style guidelines

## 🎯 Quality Gates

### Before Code Submission

- [ ] All tests pass (unit, integration, linting)
- [ ] TypeScript compilation successful with no errors
- [ ] Code follows established style guidelines
- [ ] Documentation updated where necessary
- [ ] Security considerations addressed
- [ ] Performance implications considered

### Code Review Checklist

- [ ] Follows architectural patterns from `PLANNING.md`
- [ ] Includes appropriate tests with good coverage
- [ ] Handles errors gracefully
- [ ] Uses proper TypeScript typing
- [ ] Considers South African context requirements
- [ ] No security vulnerabilities introduced

---

*These guidelines ensure consistent, high-quality code that aligns with the project's goals and constraints. All AI development assistants must follow these rules to maintain project integrity and progress.*
