Technology Stack: SA Budget Queen (SABQ2025cloud)
1. Core Technologies
Frontend:

Framework: React 18+ with Next.js 14+ (App Router)

Language: TypeScript

Styling: Tailwind CSS

Backend:

Runtime: Node.js 20+ LTS

Framework: Express.js

Language: TypeScript

Database:

Primary: PostgreSQL 15+

Caching: Redis 7+

2. Key Libraries & Dependencies
Package Manager: pnpm

State Management: Zustand, React Query

UI Components: shadcn/ui

Forms & Validation: React Hook Form, Zod

Database ORM: Prisma

Testing: Vitest, React Testing Library

Authentication: Passport.js, JWT, bcrypt

3. Development Setup
Prerequisites
Node.js v20+

pnpm

Docker

Installation & Running
Clone the repository.

Run pnpm install to install dependencies.

Set up your .env and apps/web/.env.local files based on the .example files.

Run pnpm dev to start the development servers for both the web and api apps.

4. Technical Constraints
Test Coverage: All new code must have a minimum of 80% test coverage. [cite: PLANNING.md]

File Size: No single file should exceed 500 lines of code. [cite: CONTEXTGUARD.md]

Deployment: The application must be deployable as a Docker container to Google Cloud Run. [cite: PLANNING.md]

Dependencies: Never add new dependencies without checking for existing solutions. Never use deprecated libraries. [cite: CONTEXTGUARD.md]