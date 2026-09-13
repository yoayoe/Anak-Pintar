# --- Stage 1: build the static Vite/React bundle ---
FROM node:20-alpine AS build
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

# --- Stage 2: run the Express server (serves the API + the built frontend) ---
FROM node:20-alpine
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --omit=dev

COPY server ./server
COPY --from=build /app/dist ./dist

ENV PORT=3000
ENV DB_PATH=/data/db.json
VOLUME /data

EXPOSE 3000
CMD ["node", "server/index.js"]
