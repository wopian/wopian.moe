# Stage 1: Build app
FROM oven/bun:1.3-slim as build
WORKDIR /app

COPY package.json bun.lock ./

RUN bun install --frozen-lockfile --ignore-scripts

COPY . .

RUN bun --bun run build

# Stage 2: Production image
FROM oven/bun:1.3-slim as production
WORKDIR /app

COPY --from=build /app/.output /app

EXPOSE 4000/tcp
ENTRYPOINT ["bun", "--bun", "run", "/app/server/index.mjs"]
