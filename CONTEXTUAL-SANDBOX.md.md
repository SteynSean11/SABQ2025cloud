---
title: Conextual Sandbox SABQ2025cloud
tags: [context, sandbox, ai agents, cloud, SABQ2025cloud]

---

# CONTEXTUAL-SANDBOX.md

## 1. The Purpose of Contextual Sandboxing

In the SABQ2025 project, a "Contextual Sandbox" is our strategy for guiding and constraining the Gemini CLI to ensure its assistance is always highly relevant, consistent, and aligned with our specific architecture and quality standards.

It is a "guardrail" system, not a technical execution environment like Docker. Its purpose is to isolate and focus the AI's knowledge and behavior by providing it with a "Hierarchical Instructional Context" through our key project documents. This ensures all development, whether human or AI-assisted, adheres to the same set of rules and passes the same quality gates.

## 2. The Hierarchy of Context

The Gemini CLI intelligently loads our markdown files to build its understanding, following a specific hierarchy where more specific files can supplement or override more general ones.

This allows us to set broad project rules at the root level while providing fine-tuned instructions within specific application or feature directories.

## 3. Core Project Context Files & Their Roles

Our contextual sandbox is built from the following documents. Each has a distinct role in guiding the AI.

### `CONTEXTUAL-GUARDRAIL.md` - The Master Rulebook

* **Role**: This is the most important document for constraining the AI's behavior. It contains explicit, non-negotiable rules, from code style and structure to security practices and architectural patterns.
* **Usage**: This file defines the strict "dos and don'ts" for all code generation and modification tasks. It is the primary source for all quality gate checks.

### `PLANNING.md` - The Architectural Blueprint

* **Role**: Defines the high-level "what" and "why" of our project: the core vision, system architecture (monorepo, Next.js App Router), and primary technology choices.
* **Usage**: Gemini references this to understand the foundational pillars of the project, ensuring all suggestions align with our chosen architecture.

### `TECHSTACK.md` - The Approved Toolbox

* **Role**: Provides a detailed list of all approved technologies, frameworks, and libraries.
* **Usage**: This acts as a strict guardrail, preventing Gemini from suggesting unapproved packages and ensuring all generated code is compatible with our stack (e.g., using `Zustand` for state, not `Redux`).

### `TASK.md` - The Current Roadmap

* **Role**: Provides immediate, short-term context on the current sprint goal.
* **Usage**: Focuses the AI's assistance on the specific task at hand, preventing irrelevant suggestions.

## 4. Key Sandboxing Rules in Practice

The following are examples of critical rules enforced by our contextual sandbox, derived primarily from `CONTEXTUAL-GUARDRAIL.md`.

* **Code Structure**:
  * Files must **never exceed 500 lines**.
  * Business logic must **never be placed in UI components**.
  * Naming conventions (`camelCase`, `PascalCase`, `kebab-case`) must be followed.

* **Technology Standards**:
  * **Frontend**: Must use React Functional Components with hooks and the Next.js App Router.
  * **Backend**: Must use Express.js with Prisma as the ORM for all database operations.
  * **Validation**: All user-facing inputs must be validated with Zod.

* **Testing**:
  * All new features **must** be accompanied by tests.
  * Tests must cover the happy path, an edge case, and a failure case.
  * The testing frameworks are **Jest** with **React Testing Library** for the frontend and **Supertest** for the backend.

* **Security & "Never Do This"**:
  * **Never hardcode secrets**; always use environment variables.
  * **Never commit secrets** to version control.
  * **Never bypass the established authentication system**.
  * **Never add a dependency** without first checking if it's already available or approved.
  * Adherence to **POPIA compliance** for all personal data is mandatory.

## 5. Practical Workflow & Commands

To effectively manage our contextual sandbox, all developers should adhere to the following workflow:

1. **Keep Documents Updated**: Any change in architecture, dependencies, or major tasks must be reflected immediately in the corresponding markdown files.
2. **Refresh Context**: After updating any of the context files, use the `/memory refresh` command in the Gemini CLI to force a re-scan and reload of the instructional context.
3. **Verify Context**: If you are unsure what information the AI is operating with, use the `/memory show` command. This will display the full, concatenated context currently loaded into the AI's memory.
