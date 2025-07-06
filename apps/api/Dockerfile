# Dockerfile

# 1. Builder Stage: Build the api application
FROM node:20-slim AS builder
WORKDIR /app

# First, copy only the package.json and pnpm-lock.yaml to leverage Docker caching
COPY package.json pnpm-lock.yaml ./

# Install all dependencies, including devDependencies
RUN npm install -g pnpm
RUN pnpm install

# Copy the rest of the source code
COPY . .

# Build required packages and generate prisma client
RUN pnpm --filter @sabq/validation build
RUN pnpm exec prisma generate
RUN pnpm --filter api build

# 2. Runner Stage: Create the final production image
FROM node:20-slim AS runner
WORKDIR /app

# Create a non-root user for security
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

ENV NODE_ENV=production

# Copy production dependencies and built code from the builder stage
COPY --from=builder /app/apps/api/dist ./dist
COPY --from=builder /app/node_modules/.prisma/client ./node_modules/.prisma/client
COPY --from=builder /app/node_modules/@prisma/client ./node_modules/@prisma/client
# You may need to copy other production node_modules from the builder stage as well

USER nextjs

EXPOSE 3000
ENV PORT=3000

CMD ["node", "dist/index.js"]
