# Frontend Development Context (apps/web)

This is the Next.js 14 frontend application for SABQ2025.

## Core Principles & Rules

- **Framework:** All code must use React 18+ with the Next.js App Router.
- **Components:**
  - Always create Functional Components with Hooks. Do not use class components.
  - Components must be kept pure. Side effects are only permitted in event handlers or `useEffect`.
  - New reusable components should be placed in `src/components`.
- **Styling:** All styling must be done using Tailwind CSS utility classes. Do not write custom CSS files unless absolutely necessary.
- **State Management:**
  - Use Zustand for client-side global state.
  - Use React Query for managing server state, caching, and mutations.
- **Testing:**
  - The testing framework is Vitest with React Testing Library.
  - Component tests should be co-located with the component file they are testing.
- **Data Structures:** Prefer plain objects with TypeScript `type` or `interface` declarations over JavaScript `class` syntax.
