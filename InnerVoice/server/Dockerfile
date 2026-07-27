# ── Stage 1: Base image ─────────────────────────────────────────────────────
FROM node:20-alpine AS base
WORKDIR /app

# ── Stage 2: Install dependencies ───────────────────────────────────────────
FROM base AS deps
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# ── Stage 3: Final production image ─────────────────────────────────────────
FROM base AS runner
ENV NODE_ENV=production

# Copy installed production dependencies
COPY --from=deps /app/node_modules ./node_modules

# Copy all application source files
COPY . .

EXPOSE 5000

CMD ["node", "server.js"]
