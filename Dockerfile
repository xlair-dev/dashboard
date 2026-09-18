FROM node:24-alpine@sha256:760e44b64c78674d9c79fa32e63c0ba8f817f79791e1aa32e07669bb0bfeaeaa AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN corepack enable && corepack prepare pnpm@11.24.0 --activate
RUN pnpm install --frozen-lockfile

FROM node:24-alpine@sha256:760e44b64c78674d9c79fa32e63c0ba8f817f79791e1aa32e07669bb0bfeaeaa AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN corepack enable && corepack prepare pnpm@11.24.0 --activate
RUN pnpm build

FROM node:24-alpine@sha256:760e44b64c78674d9c79fa32e63c0ba8f817f79791e1aa32e07669bb0bfeaeaa AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nextjs
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
# Uncomment when the project adds a public/ directory.
# COPY --from=builder --chown=nextjs:nodejs /app/public ./public
USER nextjs
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
CMD ["node", "server.js"]
