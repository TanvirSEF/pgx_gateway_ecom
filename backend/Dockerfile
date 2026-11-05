FROM node:22-alpine AS builder

WORKDIR /app

# Copy package.json and lock file
COPY package*.json ./
COPY tsconfig.json ./
COPY prisma ./prisma/

# Install dependencies
RUN npm ci

# Copy the rest of the application code
COPY . .

# Build the NestJS application
RUN npx prisma generate && npm run build

# -----------------
# Production Image
# -----------------
FROM node:22-alpine

WORKDIR /app

# Copy essentially required components
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/prisma.config.ts ./prisma.config.ts
# Ensure uploads directory exists
RUN mkdir -p /app/uploads
COPY --from=builder /app/uploads ./uploads

# Prefer IPv4 for outbound connections app-wide (precautionary hardening;
# this container's own DNS resolution was confirmed IPv4-only during the
# 2026-11-05 Stripe TLS incident, so this is not that fix, just cheap
# insurance against a future broken IPv6 egress path elsewhere).
ENV NODE_OPTIONS=--dns-result-order=ipv4first

EXPOSE 4000

# Apply any pending Prisma migration before the app starts accepting
# traffic - the 2026-11-05 incident (P2021: handoff_nonces table missing)
# was exactly this step never running against production. prisma.config.ts
# (copied above) and the `prisma` CLI (devDependency, but this image never
# prunes devDependencies - see package.json) are both present in this
# image; confirmed by a manual run against this exact Dockerfile/package.json.
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/src/main.js"]
