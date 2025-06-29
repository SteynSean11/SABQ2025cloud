# TASK.md

*Development Task Management & Roadmap*

**Last Updated**: 2025-06-27
**Current Sprint**: Sprint 1: Minimum Viable Deployment
**Next Review**: 2025-07-05

## 🎯 Sprint 1: Minimum Viable Deployment & Technical Excellence

**Focus**: Deploy a basic static site to Google Cloud Run to establish the full pipeline, then solidify the project's foundation with automated quality checks and testing workflows.

### 📋 Sprint Goals

- [x] **Task 1: Basic Webpage Creation** (Priority: High)
      - [x] Initialize a new project using Next.js 14+.
      - [x] Create a single page with a "Welcome to SA Budget Queen" message.
      - [x] Apply basic branding: use primary brand colors and include the logo.

- [ ] **Task 2: Containerization** (Priority: High)
      - [ ] Create a multi-stage Dockerfile to build and serve the static assets.
      - [ ] Test the Docker container build and run it locally.

- [ ] **Task 3: CI/CD Pipeline Setup** (Priority: High)
      - [ ] Configure Google Cloud Build to connect to the source repository.
      - [ ] Create a `cloudbuild.yaml` to define build, push, and deploy steps.
      - [ ] Run a manual build to test the pipeline.

- [ ] **Task 4: Google Cloud Run Deployment** (Priority: High)
      - [ ] Create a new service in Google Cloud Run.
      - [ ] Configure the service for public access.
      - [ ] Manually deploy the first container image to verify the service.

- [ ] **Task 5: Connect Custom Domain** (Priority: High)
      - [ ] Map the custom domain to the Cloud Run service.
      - [ ] Verify domain ownership and ensure SSL is provisioned.

## 📅 Sprint 2: Technical Excellence & Future-Proofing

Focus: Solidify the project's foundation by implementing our contextual sandbox, automated quality checks, and testing workflows.

- [ ] **Task 6: Implement Hierarchical Context** (Priority: High)
      - [ ] Create the root CONTEXTUAL-GUARDRAIL.md file with our master rules.
      - [ ] Create the .gemini/settings.json file to configure the contextFileName hierarchy.
      - [ ] Create an initial, focused GEMINI.md file in apps/api with backend-specific rules.
      - [ ] Create an initial, focused GEMINI.md file in apps/web with frontend-specific rules.
      - [ ] Document code contribution standards in `README.md`.

- [ ] **Task 7: Enforce Code Quality** (Priority: High)
      - [ ] Configure ESLint and Prettier for consistent code style.
      - [ ] Set up Husky and lint-staged for pre-commit checks.
      - [ ] Document code contribution standards in `README.md`.

- [ ] **Task 8: Implement Foundational Tests** (Priority: High)
      - [ ] Configure Vitest and React Testing Library for the frontend.
      - [ ] Write unit tests for initial UI components.
      - [ ] Set a minimum test coverage target of 80% for new code.

- [ ] **Task 9: Set Up Storybook** (Priority: Medium)
      - [ ] Add Storybook for component development and documentation.
      - [ ] Create initial stories for reusable UI components.

- [ ] **Task 10: Establish Dependency Audit Workflow** (Priority: Medium)
      - [ ] Run `pnpm audit` and resolve critical vulnerabilities.
      - [ ] Document a recurring process for dependency reviews.

## 📚 Ongoing Habits & Documentation

- [ ] **Update README.md**: This is a continuous task. The `README.md` should be updated after any significant changes, including new features, dependency updates, or environment variable changes to keep it a reliable source of truth for developers.

## 📅 Sprint Backlog (Next Sprints)

### Content and Feature Expansion

- [ ] Implement the full homepage UI/UX with all content sections (templates, tips, testimonials).
- [ ] Add functional download links for the initial budget templates.
- [ ] Ensure all pages and components are fully mobile-responsive.

### Transition to Dynamic Application

- [ ] Design and implement the backend API using Express.js.
- [ ] Develop the user authentication system with JWTs and password hashing.
- [ ] Set up the PostgreSQL database on Cloud SQL and configure Prisma for database access.

## 🐛 Discovered During Development

### Technical Debt

*Items discovered during development that need attention*

### Bug Fixes

*Critical issues found during testing*

### Performance Optimizations

*Performance improvements identified during development*

## 📈 Milestones & Deadlines

### Major Milestones

- **M1**: Basic static site live on Cloud Run (Sprint 1)
- **M2**: CI/CD pipeline fully automated (Sprint 1)
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
