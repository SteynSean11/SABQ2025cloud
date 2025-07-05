Naming Conventions
To maintain a clean and consistent codebase, all contributions must adhere to the following naming conventions as defined in our guardrails. [cite: CONTEXTGUARD.md]

General
Files: kebab-case (e.g., user-profile.tsx, api-client.ts)

Folders: kebab-case (e.g., src/components, src/api-services)

TypeScript / JavaScript
Variables: camelCase (e.g., const userName = '...')

Functions: camelCase (e.g., function getUserProfile() { ... })

Constants: UPPER_SNAKE_CASE (e.g., const MAX_RETRIES = 3;)

Classes/Types/Interfaces: PascalCase (e.g., class User { ... }, type UserProfile = { ... })

React Components: PascalCase (e.g., function UserProfile() { ... })

CSS
CSS Classes: This project is utility-first with Tailwind CSS. Custom CSS classes should be avoided. If absolutely necessary, they must follow kebab-case.