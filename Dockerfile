# Stage 1: Dependencies and Build
FROM oven/bun:1.3-alpine AS builder
WORKDIR /app

# Install system dependencies for node-gyp and native modules
RUN apk add --no-cache python3 make g++ bash

# Copy only lockfile and manifest first to cache deps
COPY bun.lock package.json ./

# Install dependencies (cached unless lockfile changes)
RUN bun install --frozen-lockfile --ignore-scripts

# Copy the rest of the source code
COPY . .

# Build the Nuxt app
RUN bun run build

# Stage 2: Production Image
FROM oven/bun:1.3-alpine AS base
WORKDIR /app

# Copy built output only
COPY --from=builder /app/.output ./.output

# Copy only what's needed for runtime (if necessary)
COPY bun.lock package.json ./

# Install only production dependencies
RUN bun install --frozen-lockfile --ignore-scripts --production

USER bun
EXPOSE 4000
ENTRYPOINT ["bun", "--bun", ".output/server/index.mjs"]
