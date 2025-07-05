Repetitive Task Workflows
This document outlines the established workflows for common, repetitive development tasks to ensure consistency.

Task: Add a new authenticated API Endpoint
Description
This workflow describes the process for adding a new, authenticated CRUD endpoint to the backend API. It ensures that validation, business logic, routing, and testing are handled consistently. [cite: PLANNING.md]

Files to Modify
apps/api/src/routes/[feature].ts: To define the new route.

apps/api/src/controllers/[feature].controller.ts: To handle request/response logic.

apps/api/src/services/[feature].service.ts: To implement the business logic.

packages/validation/src/index.ts: To add the Zod validation schema.

apps/api/src/__tests__/[feature].test.ts: To add the API integration tests.

Step-by-Step Workflow
Define Schema: In packages/validation/src/index.ts, create and export a new Zod schema for the request body/params.

Create Service: In apps/api/src/services/, create a new function that contains the core business logic, including the Prisma query. This layer interacts directly with the database.

Create Controller: In apps/api/src/controllers/, create a controller function that calls the service. This layer handles the HTTP request and response, but does not contain business logic.

Define Route: In apps/api/src/routes/, create a new Express router. Import the controller and schema. Define the endpoint (e.g., router.post(...)) and apply the necessary middleware.

Apply Middleware: Add the validation middleware and the requireAuth Passport.js middleware to the route.

Register Route: Import and register the new router in the main apps/api/src/index.ts file.

Write Test: In the corresponding test file, add a new describe block for the new endpoint. Write tests using Vitest and Supertest that cover success (2xx), client error (4xx), and authentication failure cases.

Important Considerations
Ensure the new route is protected by the requireAuth middleware if it handles sensitive data.

All database calls within the service must be wrapped in a try/catch block for proper error handling.

Remember to mock the Prisma client in your tests to isolate the endpoint logic.

Example Implementation
See the implementation of the POST /api/users/register endpoint and its corresponding tests for a complete reference.