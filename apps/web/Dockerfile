# Dockerfile

# 1. Builder Stage: Build the web application
FROM node:20-slim AS builder
WORKDIR /app

# Copy all source files (respecting .dockerignore)
COPY . .

# Install dependencies and build the web app
RUN npm install -g pnpm
RUN pnpm install
RUN pnpm --filter web build

# 3. Runner Stage: Run the application
FROM node:20-slim AS runner
WORKDIR /app

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Copy the standalone output
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/standalone ./
# Copy the static assets
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/static ./.next/static
# Copy the public assets
COPY --from=builder /app/apps/web/public ./public

USER nextjs

EXPOSE 3000
ENV PORT=3000

CMD ["node", "server.js"]
