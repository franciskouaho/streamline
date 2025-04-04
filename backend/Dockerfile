FROM node:21-alpine as base

RUN corepack enable
RUN corepack prepare yarn@latest --activate

# All deps stage
FROM base AS deps
WORKDIR /app
ADD package.json yarn.lock ./
RUN yarn install

# Production only deps stage
FROM base AS production-deps
WORKDIR /app
ADD package.json yarn.lock ./
RUN yarn install

# Build stage
FROM base AS build
WORKDIR /app
COPY --from=deps /app/node_modules /app/node_modules
ADD . .
RUN node ace build

# Production stage
FROM base
ENV NODE_ENV=production
WORKDIR /app

# Installer FFmpeg avec une pause entre les commandes pour éviter les problèmes de mémoire
RUN apk update && \
    apk add --no-cache ffmpeg

COPY --from=production-deps /app/node_modules /app/node_modules
COPY --from=build /app/build /app
EXPOSE 8080
CMD ["node", "./bin/server.js"]