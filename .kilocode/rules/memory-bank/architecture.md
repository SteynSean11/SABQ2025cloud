System Architecture: SA Budget Queen (SABQ2025cloud)
1. High-Level Architecture Overview
This project follows a pnpm monorepo structure with a decoupled frontend and backend, designed to be deployed as separate containerized services on Google Cloud Run. The system is designed as a Progressive Web Application (PWA) with future offline capabilities. [cite: PLANNING.md]

2. Source Code Structure
/apps/web: The Next.js 14 frontend application.

/apps/web/src/app: App Router pages and layouts.

/apps/web/src/components: Reusable React components.

/apps/web/src/hooks: Custom React hooks.

/apps/api: The Express.js backend API.

/apps/api/src/routes: API route definitions.

/apps/api/src/services: Business logic and services.

/packages/: Shared code used by multiple applications.

/packages/ui: Shared UI component library (e.g., shadcn/ui components).

/packages/validation: Shared Zod validation schemas.

3. Key Technical Decisions & Patterns
State Management: We use Zustand for client-side global state and React Query for server state to keep UI and data concerns separate. [cite: TECHSTACK.md]

Database Access: All database access is handled through the Prisma ORM. No raw SQL queries are permitted in the application code. This ensures type safety and a consistent data access layer. [cite: CONTEXTGUARD.md]

Authentication: Authentication is handled via JWTs with a refresh token rotation strategy. A Passport.js middleware layer protects sensitive API routes. [cite: PLANNING.md]

Validation: All data entering the API from external sources (e.g., client requests) must be validated using Zod schemas to ensure type safety and prevent invalid data. [cite: CONTEXTGUARD.md]

4. Data Flow
Example: User Registration Flow

User submits their details via the registration form in the Next.js frontend.

The frontend makes a POST request to the /api/users/register endpoint on the Express backend.

The register controller validates the request body using a Zod schema from the @sabq/validation package.

If valid, the user.service hashes the password with bcrypt.

The service calls prisma.user.create to save the new user to the PostgreSQL database.

The backend returns a success response.