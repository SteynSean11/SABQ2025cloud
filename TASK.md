# TASK.md

## Development Task Management & Roadmap

**Last Updated**: 2025-07-03
**Current Sprint**: Sprint 1: Minimum Viable Deployment
**Next Review**: 2025-07-05

## 🎯 Sprint 1: Minimum Viable Deployment & Technical Excellence

**Focus**: Deploy a basic static site to Google Cloud Run to establish the full pipeline, then solidify the project's foundation with automated quality checks and testing workflows.

### 📋 Sprint Goals

- [x] **Task 1: Basic Webpage Creation** (Priority: High)
      - [x] Initialize a new project using Next.js 14+.
      - [x] Create a single page with a "Welcome to SA Budget Queen" message.
      - [x] Apply basic branding: use primary brand colors and include the logo.

- [x] **Task 2: Containerization** (Priority: High)
      - [x] Create a multi-stage Dockerfile to build and serve the static assets.
      - [x] Test the Docker container build and run it locally.
      - [x] **Update (2025-07-03):** Corrected Dockerfile to work with monorepo structure.

- [x] **Task 3: CI/CD Pipeline Setup** (Priority: High)
      - [x] Configure Google Cloud Build to connect to the source repository.
      - [x] Create a `cloudbuild.yaml` to define build, push, and deploy steps.
      - [x] Run a manual build to test the pipeline.
      - [x] **Update (2025-07-03):** Fixed build failures by creating the Artifact Registry repository and granting necessary IAM permissions to the Cloud Build service account.

- [x] **Task 4: Google Cloud Run Deployment** (Priority: High)
      - [x] Create a new service in Google Cloud Run.
      - [x] Configure the service for public access.
      - [x] Manually deploy the first container image to verify the service.
      - [x] **Update (2025-07-03):** Deployment is now automated via the Cloud Build pipeline.

- [x] **Task 5: Connect Custom Domain** (Priority: High)
      - [x] Map the custom domain to the Cloud Run service.
      - [x] Verify domain ownership and ensure SSL is provisioned.

## 📅 Sprint 2: Technical Excellence & Future-Proofing

Focus: Solidify the project's foundation by implementing our contextual sandbox, automated quality checks, and testing workflows.

- [x] **Task 6: Implement Hierarchical Context** (Priority: High)
      - [x] Create the root CONTEXTUAL-GUARDRAIL.md file with our master rules.
      - [x] Create the .gemini/settings.json file to configure the contextFileName hierarchy.
      - [x] Create an initial, focused GEMINI.md file in apps/api with backend-specific rules.
      - [x] Create an initial, focused GEMINI.md file in apps/web with frontend-specific rules.
      - [x] Document code contribution standards in `README.md`.

- [x] **Task 7: Enforce Code Quality** (Priority: High)
      - [x] Configure ESLint and Prettier for consistent code style.
      - [x] Set up Husky and lint-staged for pre-commit checks.
      - [x] Document code contribution standards in `README.md`.

- [x] **Task 8: Implement Foundational Tests** (Priority: High)
      - [x] Configure Vitest and React Testing Library for the frontend.
      - [x] Write unit tests for initial UI components.
      - [x] Set a minimum test coverage target of 80% for new code.

- [x] **Task 9: Set Up Storybook** (Priority: Medium)
      - [x] Add Storybook for component development and documentation.
      - [x] Create initial stories for reusable UI components.

- [x] **Task 10: Establish Dependency Audit Workflow** (Priority: Medium)
      - [x] Run `pnpm audit` and resolve critical vulnerabilities.
      - [x] Document a recurring process for dependency reviews.

## 📚 Ongoing Habits & Documentation

- [ ] **Update README.md**: This is a continuous task. The `README.md` should be updated after any significant changes, including new features, dependency updates, or environment variable changes to keep it a reliable source of truth for developers.

## 📅 Sprint 3: Design System, Homepage, State & UI Feedback

**Focus**: Establish a formal style guide, build a fully-featured homepage, set up global state management, and implement a toast notification system.

- [x] **Task 11: Create a Formal Style Guide** (Priority: High)
      - [x] Add a new "Style Guide" section to `PLANNING.md` under "Design Principles".
      - [x] Document primary/secondary colors, typography scales (headings, body), spacing units, and common component states (default, hover, disabled).
- [x] **Task 12: Design & Structure Homepage Layout** (Priority: High)
      - [x] Create a new, responsive layout component for the homepage using Tailwind CSS, adhering to the new style guide.
      - [x] Implement a header with the brand logo and navigation links.
      - [x] Implement a footer with essential links (About, Contact, Privacy Policy).
- [x] **Task 13: Implement Homepage Content Sections** (Priority: High)
      - [x] Develop a "Hero" section with a compelling headline and a primary call-to-action (CTA).
      - [x] Create a "Budget Templates" section to showcase available templates.
      - [x] Create a "Financial Tips" section to display a feed of articles or snippets.
      - [x] Create a "Testimonials" section to build social proof.
- [x] **Task 14: Add Functional Download Links** (Priority: High)
      - [x] Upload initial budget template files (e.g., PDF, Excel) to the `public` directory.
      - [x] Create a reusable `DownloadButton` component.
      - [x] Link the buttons in the "Budget Templates" section to the corresponding files.
- [x] **Task 15: Set Up Global State with Zustand** (Priority: High)
      - [x] Install Zustand and create an initial store for managing global UI state.
      - [x] Integrate the Zustand provider into the root layout of the application.
      - [x] Document the basic usage of the store in the `README.md`.
- [x] **Task 16: Implement UI Feedback System** (Priority: Medium)
      - [x] Integrate a toast notification library (e.g., `react-hot-toast`).
      - [x] Create a global function to trigger success, error, and info notifications from anywhere in the app.
- [x] **Task 17: Ensure Full Mobile Responsiveness** (Priority: High)
      - [x] Rigorously test and refine the homepage layout across various screen sizes.
      - [x] Ensure all images, text, and interactive elements are optimized for mobile viewing.

## 📅 Sprint 4: Backend Foundation & API Implementation

**Focus**: Establish the backend infrastructure using Express.js and Prisma, and develop the initial API endpoints required for user management.

- [x] **Task 18: Initialize Express.js Backend** (Priority: High)
      - [x] Set up a new Express.js application in the `apps/api` directory.
      - [x] Configured TypeScript, ESLint, and Prettier for the backend.
      - [x] Created a basic server structure with middleware for logging, CORS, and error handling.
- [x] **Task 19: Set Up PostgreSQL & Prisma** (Priority: High)
      - [x] **Update (2025-07-05):** Completed.
      - [x] Created a new PostgreSQL database on a local or cloud instance.
      - [x] Initialized Prisma in the `apps/api` directory and connected it to the database.
      - [x] Defined the initial `User` schema in `schema.prisma`.
      - [x] Ran the first migration to create the `users` table.
- [x] **Task 20: Implement User API Endpoints** (Priority: High)
      - [x] **Update (2025-07-05):** Completed backend implementation.
      - [x] Created a `user.controller.ts` and `user.service.ts` to handle business logic.
      - [x] Developed a `POST /api/users/register` endpoint with Zod validation for user input.
      - [x] Developed a `POST /api/users/login` endpoint.
      - [ ] Write integration tests for the new endpoints using Vitest and Supertest.

## 📅 Sprint 5: User Authentication with Passport.js

**Focus**: Implement a secure, industry-standard authentication system using Passport.js with a JWT strategy.

- [ ] **Task 21: Implement JWT Authentication with Passport.js** (Priority: High)
      - [ ] Install `passport`, `passport-jwt`, and their corresponding `@types`.
      - [ ] Configure the Passport JWT strategy to verify tokens and protect API endpoints.
      - [ ] Integrate Passport middleware into the Express app.
      - [ ] Update the `login` endpoint to generate a JWT upon successful authentication.
      - [ ] Implement password hashing using `bcrypt` during user registration.
- [ ] **Task 22: Frontend Authentication Integration** (Priority: Medium)
      - [ ] Create a `useAuth` hook and an `AuthContext` to manage authentication state in the frontend, leveraging the Zustand store.
      - [ ] Develop a login form and connect it to the `/api/users/login` endpoint.
      - [ ] Implement a secure logout function that clears the JWT from the client.
- [ ] **Task 23: Implement Token Refresh Strategy** (Priority: Medium)
      - [ ] Create an endpoint to issue a new access token using a refresh token.
      - [ ] Implement logic on the frontend to automatically refresh expired tokens.
- [ ] **Task 24: Secure Sensitive Data** (Priority: High)
      - [ ] Ensure all API keys, database credentials, and JWT secrets are stored securely in environment variables and are not exposed in the client-side code.

## 📅 Sprint 6: Advanced Features & Integrations

**Focus**: Enhance the user experience with social login options and begin work on core application features.

- [ ] **Task 25: Implement Social Login (OAuth)** (Priority: Medium)
      - [ ] Add a Passport.js strategy for a social provider (e.g., `passport-google-oauth20`).
      - [ ] Add new API endpoints to handle the OAuth flow and callback.
      - [ ] Update the frontend to include a "Login with Google" button.

## 🐛 Discovered During Development

### Technical Debt

*Items discovered during development that need attention.*

- The `storybook@latest init` command can hang or fail due to command syntax or network issues. Verbose logging (`pnpm --reporter=verbose ...`) is the first step to debug.
- [ ] **Upgrade to TypeScript 6**: Once TypeScript 6 is released as a stable version, plan and execute the upgrade to leverage new language features and improvements.

### Bug Fixes

#### Critical issues found during testing

### Performance Optimizations

#### Performance improvements identified during development

## 📈 Milestones & Deadlines

### Major Milestones

- **M1**: Basic static site live on Cloud Run (Sprint 1) - **COMPLETED**
- **M2**: CI/CD pipeline fully automated (Sprint 1) - **COMPLETED**
- **M3**: Foundational testing and quality gates established (Sprint 2)
- **M4**: Backend API and database setup initiated (Backlog)

## 📝 Notes & Considerations

### Development Priorities

1. **Speed to Live**: Establish the full deployment pipeline first.
2. **Technical Foundation**: Ensure quality gates are in place before scaling.
3. **Security First**: All financial data handling must be secure.
4. **Mobile Experience**: Primary focus on mobile usability.
5. **South African Context**: Cultural and economic relevance is crucial.

---

*This document is updated regularly during development. All team members should review current tasks before starting new work and update completed items immediately.*
