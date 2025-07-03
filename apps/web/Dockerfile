# Dockerfile

# 1. Installer Stage: Install dependencies for the web app
FROM node:20-slim AS installer
WORKDIR /app
# Copy package manager files
COPY apps/web/package.json apps/web/pnpm-lock.yaml ./
# Install dependencies
RUN npm install -g pnpm && pnpm install

# 2. Builder Stage: Build the application
FROM node:20-slim AS builder
WORKDIR /app
# Copy the entire monorepo source code
COPY . .
# Copy installed dependencies from the installer stage
COPY --from=installer /app/node_modules ./apps/web/node_modules
# Set the working directory to the web app
WORKDIR /app/apps/web
# Build the Next.js application
RUN npm install -g pnpm && pnpm run build

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
