# ── Fase 1: build de Angular ──────────────────────────────────────────────────
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci --quiet
COPY . .
RUN npx ng build --configuration production

# ── Fase 2: nginx sirve los estáticos ────────────────────────────────────────
FROM nginx:alpine
COPY --from=build /app/dist/axis-garage-app/browser /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
