FROM node:21-alpine as base

# Configurer l'environnement pour limiter la mémoire
ENV NODE_OPTIONS="--max-old-space-size=256"

# Activer corepack avec une version spécifique plus stable
RUN corepack enable && corepack prepare yarn@1.22.19 --activate

# Stage de build unique
FROM base as build
WORKDIR /app

# Copier uniquement les fichiers nécessaires pour installer les dépendances
COPY package.json yarn.lock ./

# Installer les dépendances incluant les dépendances de développement
RUN yarn install --frozen-lockfile --network-timeout 100000

# Installer spécifiquement ts-node-maintained si nécessaire
RUN yarn add ts-node-maintained --dev

# Copier le reste des fichiers
COPY . .

# Build de l'application avec les variables d'environnement nécessaires
RUN NODE_ENV=development node ace build

# Stage de production
FROM base as production
ENV NODE_ENV=production
WORKDIR /app

# Augmenter la limite de mémoire disponible pour apk
RUN apk update && \
    apk add --no-cache ffmpeg

COPY --from=build /app/build .
COPY --from=build /app/node_modules ./node_modules

EXPOSE 8080
CMD ["node", "./bin/server.js"]