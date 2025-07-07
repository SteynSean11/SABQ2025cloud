# Monorepo Integrity and Build Verification Plan

**Objective:** To systematically verify the integrity of the `SABQ2025cloud` monorepo, ensuring there are no dependency conflicts, build errors, or type mismatches between the `api` and `web` applications.

## Phase 1: Dependency & Environment Verification

*   **1.1: Audit Dependencies:** Run `pnpm list --depth=1` at the root and in `apps/api` and `apps/web` to compare dependency versions. Identify and flag any mismatches, especially for shared libraries.
*   **1.2: Check for Outdated Dependencies:** Run `pnpm outdated` at the root of the project to identify any outdated dependencies that might cause issues.
*   **1.3: Environment Variable Check:** Review `.env.example` files in both `apps/api` and `apps/web` to ensure they are up-to-date.

## Phase 2: Build & Compilation

*   **2.1: Clean Workspace:** Perform a clean install by removing all `node_modules`, `dist`, `.next`, and `.turbo` directories and then running `pnpm install`.
*   **2.2: Independent Builds:** Build each workspace package independently to isolate potential issues (`pnpm --filter <package-name> build`).
*   **2.3: Full Monorepo Build:** Run the top-level build script (`pnpm build`) to ensure the entire project builds successfully.
*   **2.4: TypeScript Validation:** Run `pnpm tsc --noEmit` from the root to catch any type errors across the entire project.

## Phase 3: Quality & Testing Gates

*   **3.1: Linting:** Run `pnpm lint` to check for code style violations and potential errors.
*   **3.2: Unit & Integration Tests:** Run `pnpm test` to ensure all existing tests are passing.