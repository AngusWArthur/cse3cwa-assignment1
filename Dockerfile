# -------- Deps layer --------
FROM node:20-alpine AS deps
WORKDIR /app

# Skip Prisma postinstall during this layer so "prisma generate" doesn’t run yet
ENV PRISMA_SKIP_POSTINSTALL=1

# Install deps (cache on package files)
COPY package.json package-lock.json* ./
RUN npm ci

# -------- Builder layer --------
FROM node:20-alpine AS builder
WORKDIR /app

# Bring in node_modules from deps
COPY --from=deps /app/node_modules ./node_modules

# Copy the rest of the source, including prisma/
COPY . .

# Now that schema is present, run prisma generate
# (Optional: if you build for prod, also run `npx prisma migrate deploy`)
RUN npx prisma generate

# Build Next.js
RUN npm run build

# -------- Runner layer --------
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
# Next.js required env for standalone output (if you use it)
ENV PORT=3000

# Copy the standalone/optimized build
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
# If you’re not using standalone output, adjust to copy .next, public, etc.

# Prisma engines (only if you query DB at runtime in server)
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma

# Public assets if your app serves them
COPY --from=builder /app/public ./public

EXPOSE 3000
CMD ["node", "server.js"]
