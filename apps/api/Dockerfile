# Dockerfile

# 1. Builder Stage: Build the api application
FROM node:20-slim AS builder
WORKDIR /app

# Copy all source files (respecting .dockerignore)
COPY . .

# Install dependencies and build the api app
RUN npm install -g pnpm
RUN pnpm install
RUN pnpm --filter @sabq/validation build
RUN pnpm exec prisma generate
RUN pnpm --filter api build

# 3. Runner Stage: Run the application
FROM node:20-slim AS runner
WORKDIR /app

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

ENV NODE_ENV=production

# Copy the built output from the builder stage
COPY --from=builder /app/apps/api/dist ./dist
COPY --from=builder /app/node_modules/.prisma/client ./node_modules/.prisma/client

USER nextjs

EXPOSE 3000
ENV PORT=3000

CMD ["node", "dist/index.js"]