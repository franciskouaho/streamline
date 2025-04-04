FROM node:21-alpine as base

# Configurer l'environnement pour limiter la mémoire
ENV NODE_OPTIONS="--max-old-space-size=512"

# Activer corepack sans verbosité excessive
RUN corepack enable && corepack prepare yarn@stable --activate

# Stage de build unique
FROM base as build
WORKDIR /app

# Copier uniquement les fichiers nécessaires pour installer les dépendances
COPY package.json yarn.lock ./

# Installer les dépendances avec des options pour économiser la mémoire
RUN yarn install --immutable --network-concurrency=1 --network-timeout=100000

# Copier le reste des fichiers
COPY . .

# Build de l'application
RUN node ace build

# Stage de production
FROM base as production
ENV NODE_ENV=production
WORKDIR /app

RUN apk update && apk add --no-cache ffmpeg

COPY --from=build /app/build .
COPY --from=build /app/node_modules ./node_modules

EXPOSE 8080
CMD ["node", "./bin/server.js"]