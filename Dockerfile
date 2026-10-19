# --- Stage 1: build the static Vite/React bundle ---
FROM node:26-alpine AS build
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

# --- Stage 2: run the Express server (serves the API + the built frontend) ---
FROM node:26-alpine
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --omit=dev

COPY server ./server
COPY --from=build /app/dist ./dist

# Jalankan sebagai user non-root bawaan image node. Direktori data harus
# dimiliki user tersebut, karena volume baru mewarisi kepemilikan dari image.
RUN mkdir -p /data && chown node:node /data

ENV PORT=3000
ENV DB_PATH=/data/db.json
VOLUME /data

USER node

EXPOSE 3000

# /api/session tidak butuh autentikasi dan selalu merespons 200 saat server hidup.
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD wget -qO- "http://127.0.0.1:${PORT}/api/session" || exit 1

CMD ["node", "server/index.js"]
