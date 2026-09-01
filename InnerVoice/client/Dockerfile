# ── Stage 1: Build the React/Vite app ───────────────────────────────────────
FROM node:20-alpine AS builder
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

# ── Stage 2: Serve with Nginx ────────────────────────────────────────────────
FROM nginx:1.27-alpine AS runner

# Remove default Nginx config
RUN rm /etc/nginx/conf.d/default.conf

# Copy our custom Nginx config as a template (uses $BACKEND_URL)
COPY nginx.conf /etc/nginx/templates/app.conf.template

# Copy the built Vite output
COPY --from=builder /app/dist /usr/share/nginx/html

# Default backend URL (Docker Compose). Override on Railway via env var.
ENV BACKEND_URL=http://server:5000

EXPOSE 80

# envsubst replaces ${BACKEND_URL} in the template, then starts nginx
CMD ["/bin/sh", "-c", "envsubst '${BACKEND_URL}' < /etc/nginx/templates/app.conf.template > /etc/nginx/conf.d/app.conf && nginx -g 'daemon off;'"]

