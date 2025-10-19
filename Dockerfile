# -------- Dependencies layer --------
FROM node:20-alpine AS deps
WORKDIR /app

# Install deps (cached if package*.json unchanged)
COPY package.json package-lock.json* ./
RUN npm ci --omit=dev=false

# -------- Builder layer --------
FROM node:20-alpine AS builder
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build Next.js (App Router supported). Produces .next/standalone
RUN npm run build

# -------- Runner layer (small, production-only) --------
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
# Ensure Next binds to all interfaces in containers
ENV HOSTNAME=0.0.0.0
ENV PORT=3000

# Create non-root user
RUN addgroup -g 1001 -S nodejs && adduser -S nextjs -u 1001

# Copy the standalone server and static assets
# After `output: 'standalone'`, Next puts a minimal Node server at .next/standalone/server.js
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000

# Launch the Next standalone server
CMD ["node", "server.js"]
