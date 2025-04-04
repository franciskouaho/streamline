FROM node:21-alpine as base

RUN corepack enable
RUN corepack prepare yarn@latest --activate

# All deps stage
FROM base AS deps
WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn install --verbose && ls -la /app

# Production only deps stage
FROM base AS production-deps
WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn install --verbose && ls -la /app

# Build stage
FROM base AS build
WORKDIR /app
COPY package.json yarn.lock ./
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN node ace build

# Production stage
FROM base
ENV NODE_ENV=production
WORKDIR /app

# Installer FFmpeg avec une pause entre les commandes pour éviter les problèmes de mémoire
RUN apk update && \
    apk add --no-cache ffmpeg

COPY --from=production-deps /app/node_modules ./node_modules
COPY --from=build /app/build .
EXPOSE 8080
CMD ["node", "./bin/server.js"]