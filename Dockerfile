# ── Etapa 1: build Angular ────────────────────────────────────────────────────
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build -- --configuration=production

# ── Etapa 2: nginx sirve los estáticos ────────────────────────────────────────
FROM nginx:alpine
COPY --from=builder /app/dist/axis-garage-app/browser /usr/share/nginx/html
COPY nginx.docker.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
