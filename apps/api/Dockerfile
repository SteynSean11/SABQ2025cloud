# Dockerfile

# 1. Builder Stage: Build the api application
FROM node:20-slim AS builder
WORKDIR /app

# Install openssl, a Prisma dependency
RUN apt-get update && apt-get install -y openssl

# Copy all source code
COPY . .

# Install all dependencies, including devDependencies
RUN npm install -g pnpm
RUN pnpm install

# Build required packages
RUN pnpm --filter @sabq/validation build
RUN pnpm --filter api build

# Generate a pruned, production-ready directory
RUN pnpm deploy --filter=api ./deploy

# 2. Runner Stage: Create the final production image
FROM node:20-slim AS runner
WORKDIR /app

# Create a non-root user for security
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

ENV NODE_ENV=production

# Copy the pruned production-ready files from the builder stage
COPY --from=builder /app/deploy .

USER nextjs

EXPOSE 3000
ENV PORT=3000

CMD ["node", "dist/index.js"]
