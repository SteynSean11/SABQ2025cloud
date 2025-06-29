# Tech Stack for SA Budget Queen (SABQ2025)

This document is the single source of truth for the technologies, libraries, and services used in the SA Budget Queen project.

## I. Project Management & AI

* **AI Context Documents**:
  * `PLANNING-SABQ2025.md`: High-level vision, architecture, and constraints.
  * `TASK.md`: Live sprint board and task tracking.
  * `TECH-STACK-SABQ2025.md`: This document.
* **AI Development Environment**:
  * **IDE**: VS Code is preferred.
  * **AI Assistant**: Gemini Code Assist.
  * **Workflow**: The development process follows the structured approach outlined in the project's documentation, emphasizing planning, modularity, and frequent testing.

## II. Core Application Stack

### 1. Frontend

* **Framework**: React 18+ with TypeScript.
* **Meta-Framework**: Next.js 14+ (using the App Router).
* **Styling**: Tailwind CSS.
* **UI Components**: shadcn/ui.
* **Icons**: `lucide-react`.
* **State Management**: Zustand for client-side state and React Query for server state.
* **Forms**: React Hook Form with Zod for validation.
* **PWA**: Workbox for service workers and offline capabilities.

### 2. Backend

* **Runtime**: Node.js 20+ LTS.
* **Language**: TypeScript.
* **Framework**: Express.js.
* **API**: REST endpoints, with plans for a future GraphQL gateway.
* **ORM**: Prisma.
* **Validation**: Zod.
* **Authentication**: JWTs with a refresh token strategy and bcrypt for password hashing.

### 3. Database & Storage

* **Primary Database**: PostgreSQL 15+.
* **Caching**: Redis 7+.
* **File Storage**: Google Cloud Storage for user-uploaded files like receipts.

## III. Infrastructure & DevOps

* **Cloud Provider**: Google Cloud (GCP), with a preference for the Johannesburg `africa-south1` region.
* **Containerization**: Docker and Docker Compose.
* **Deployment Target**: Google Cloud Run for serverless application hosting.
* **CI/CD**: GitHub Actions or Google Cloud Build.
* **Monitoring**: Google Cloud's Operations Suite.
* **Error Tracking**: Sentry.

## IV. Development & Testing

* **Package Manager**: pnpm.
* **Version Control**: Git, hosted on GitHub.
* **Code Quality**: ESLint and Prettier.
* **Git Hooks**: Husky and lint-staged.
* **Component Documentation**: Storybook.
* **Testing**:
  * **Unit/Integration**: **Vitest** with **React Testing Library** (Frontend) and for the (Backend).
  * **E2E**: Playwright or Cypress.
  * **Practice**: All new features must be accompanied by tests, mocking external services like databases.

## V. Security & Compliance

* **Data Protection**: Adherence to POPIA is mandatory. This includes AES-256 encryption at rest, TLS in transit, and clear data handling policies.
* **Secrets Management**: Environment variables (`.env`) must be used for all secrets. Secrets are never to be committed to version control.
* **Input Validation**: All API inputs must be validated with Zod schemas to prevent injection attacks.
