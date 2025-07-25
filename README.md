# SA Budget Queen 2025

SA Budget Queen's Royal Online Palace in the Google Cloud 🌥

This repository contains the source code for the SA Budget Queen web application, a personal budgeting tool designed for South Africans.

## Tech Stack

This project is a monorepo using pnpm workspaces.

- **Frontend**: Next.js 14, React 18, TypeScript, Tailwind CSS
- **Backend**: (Coming soon)
- **Database**: (Coming soon)

## Getting Started

To get a local copy up and running, follow these simple steps.

### Prerequisites

- pnpm: `npm install -g pnpm`

### Installation

1. Clone the repo

   ```sh
   git clone https://github.com/your_username_/SABQ2025cloud.git
   ```

2. Install NPM packages

   ```sh
   pnpm install
   ```

3. Run the development server

   ```sh
   pnpm dev
   ```

## State Management

This project uses Zustand for global state management. The main store is defined in `apps/web/src/store/index.ts`.

To use the store in a component:

```tsx
import { useStore } from '../store';

const MyComponent = () => {
  const { someState, someAction } = useStore();
  // ...
};
```

## Development Workflow

This project uses a set of markdown files to guide development and ensure consistency. Before starting any new work, please familiarize yourself with the following documents:

- **`CONTEXTGUARD.md`**: The master rules and guidelines for all development.
- **`PLANNING.md`**: The high-level project plan, architecture, and technology stack.
- **`TASK.md`**: The detailed list of current and upcoming development tasks.

All development should be driven by the tasks outlined in `TASK.md`.

## Contributing

Contributions are what make the open source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

### Code Quality

This project uses ESLint, Prettier, and lint-staged to enforce code quality and consistency. A pre-commit hook is configured to automatically format and lint your code before you commit. This ensures that all code in the repository adheres to the same standards.

For more details on security practices, including the dependency audit workflow, please see the [`PLANNING.md`](PLANNING.md) file.

If you have a suggestion that would make this better, please fork the repo and create a pull request. You can also simply open an issue with the tag "enhancement".

Don't forget to give the project a star! Thanks again!

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

Distributed under the MIT License. See `LICENSE` for more information.
