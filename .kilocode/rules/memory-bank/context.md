Current Development Context
Last Updated: 2025-07-04

1. Current Work Focus
Primary Goal:
Establish the backend infrastructure and implement the initial API endpoints required for user management. [cite: TASK.md]

Active Task(s):

Task 19: Set Up PostgreSQL & Prisma.

Task 20: Implement User API Endpoints (Register/Login).

2. Recent Changes & Decisions
Completed Sprint 3: Successfully established the project's design system, built the full homepage layout, set up global state with Zustand, and implemented a UI feedback system. [cite: TASK.md]

Confirmed Testing Framework: Vitest is the official testing framework for the entire project, replacing earlier considerations of Jest. [cite: TECHSTACK.md]

Established AI Workflow: Implemented a hierarchical context system for the AI assistant using a root CONTEXTUAL-GUARDRAIL.md and app-specific GEMINI.md files. [cite: CONTEXTUAL-SANDBOX.md.md]

3. Next Steps
Immediate Next Step: Complete the setup of the PostgreSQL database and define the initial User schema with Prisma.

Upcoming Tasks:

Implement a secure, JWT-based authentication system using Passport.js.

Develop a token refresh strategy.

Integrate the frontend authentication state with the backend. [cite: TASK.md]

4. Blockers / Open Questions
Question: What are the exact expiration times for the access and refresh tokens? Decision: Propose standard times (e.g., access: 15 mins, refresh: 7 days) and confirm. [cite: PLANNING.md]

Risk: Incorrectly configured CORS could block frontend requests. Mitigation: Ensure the backend CORS policy explicitly allows the frontend's origin URL. [cite: PLANNING.md]

This file should be updated frequently to reflect the current state of development. It should be concise and factual.