# Gemini Code Assist for SABQ2025

## 1. Introduction

This document provides comprehensive guidelines for developers on how to effectively leverage the Gemini CLI to enhance development, improve code quality, and streamline problem-solving within the SABQ2025 project.

Gemini has been provided with specific context from our project's `PLANNING.md`, `TASK.md`, `TECH-STACK-SABQ2025.md` and `CONTEXTUAL-SANDBOX.md` files. Adhering to these guidelines will result in more accurate, context-aware, and helpful assistance.

## 2. Best Practices for Prompting

To get the most relevant responses, developers should follow these best practices when prompting Gemini:

* **Be Specific and Clear**: Instead of "fix this code," try a more specific prompt like, "In `apps/web/src/components/ui/Button.tsx`, how can I add a new 'destructive' variant using our Tailwind CSS setup?"
* **Provide File Context**: Mention relevant file paths to get context-aware answers. For example, "Considering our `apps/api/src/server.ts` file, what's the best way to add rate limiting middleware?"
* **Request Code Examples**: Ask for examples tailored to our stack. "Show me how to create a new Prisma schema migration for a 'goals' table that links to a user."
* **Utilize for Code Review**: Use Gemini as a pair programmer. "Can you review the `useAuth` hook in `apps/web/src/hooks` for potential performance improvements or cleaner code?"
* **Iterate and Refine**: If the first answer isn't perfect, provide feedback or ask follow-up questions to hone the response.

## 3. Advanced Interactions with MCP Servers

Our project can be configured to use Model Context Protocol (MCP) servers, which extend Gemini's capabilities by allowing it to interact with external tools and APIs, like GitHub.

* **Discovering MCP Tools**: To see which MCP servers are connected and what tools they provide, use the `/mcp` command. This will show the connection status and list all available tools from each server.
* **Prompting with MCP**: Once an MCP server is connected (e.g., the GitHub MCP server), you can make requests in natural language.
    * **Example Prompt**: "Using the GitHub MCP tools, get all open issues assigned to me in the 'SABQ/SABQ2025' repo and summarize them."
* **Configuration**: MCP servers are configured in the `.gemini/settings.json` file under the `mcpServers` object.

## 4. Managing Gemini's Memory & Context

Gemini uses a hierarchical system to load context, which informs its responses. You can manage this "memory" to improve the quality of its assistance.

* **Hierarchical Context**: The CLI loads `.md` files from the user's home directory (`~/.gemini/`), the project root, and sub-directories, allowing for global, project-level, and feature-specific instructions.
* **Inspecting Memory**: To see the full context that Gemini has loaded for your current session, use the `/memory show` command.
* **Refreshing Memory**: If you update any of the project's core `md` files (`PLANNING`, `TASK`, etc.), use `/memory refresh` to force the AI to reload the context.
* **Saving Facts**: For persistent, user-level information that should apply across all projects, you can use the `save_memory` tool.
    * **Example Prompt**: `save_memory(fact="My preferred testing framework is Vitest.")`

## 5. Project-Specific Assistance Examples

Frame your prompts like the examples below for the best results. These are tailored to our project's specific conventions and tech stack.

* **On Component Creation (React & Next.js)**:
    * "Generate a new functional component in `apps/web/src/components/dashboard` named `BudgetSummaryCard`. It should be a pure component that accepts `props` and does not manage its own internal state. Use plain JavaScript objects for props with a corresponding TypeScript `type` definition, not a class. It should use our existing `Card` component from `packages/ui`."

* **On Testing (Vitest)**:
    * "Write a Vitest test file for the `BudgetSummaryCard` component. Co-locate the test file next to the component. Include a test that mocks the props and asserts that the correct values are rendered. Use `vi.mock()` for any internal module dependencies."

* **On API Development (Express & Prisma)**:
    * "Create a new Express route in `apps/api/src/routes` for `POST /api/budgets`. The handler should validate the incoming body using a Zod schema, then use Prisma to create a new budget record in the database. Ensure it follows our established error handling patterns."

* **On Data Structures & Logic**:
    * "Refactor this function to use JavaScript's functional array operators like `.map()` and `.filter()` instead of a `for` loop. The function should remain immutable and not modify the original array."
    * "I need to handle an API response where the type is unknown. Show me how to use type narrowing to safely process the `unknown` type without resorting to `any` or a type assertion."

## 6. Important Guideline

As a critical best practice, all code suggested by Gemini should be reviewed and thoroughly tested by a developer before being committed. Treat the AI as an expert pair programmer that can accelerate your work, not as an infallible authority. Run `npm run preflight` to ensure all checks pass before submitting changes.