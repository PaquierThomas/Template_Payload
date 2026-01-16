# Utiliser l'image officielle Bun
FROM oven/bun:1 AS base

# Étape 1: Installation des dépendances du monorepo
FROM base AS deps
WORKDIR /repo

# Copier les fichiers workspace de la racine
COPY package.json ./
# Copier le lockfile (bun.lock sur Windows, bun.lockb sur Linux)
COPY bun.lock* bun.lockb* ./

# Copier les package.json de tous les workspaces
COPY apps/api/package.json ./apps/api/

# Installer toutes les dépendances du monorepo
RUN bun install --frozen-lockfile

# Étape 2: Build de l'application
FROM base AS builder
WORKDIR /repo

# Copier les node_modules depuis l'étape deps
COPY --from=deps /repo/node_modules ./node_modules
COPY --from=deps /repo/apps/api/node_modules ./apps/api/node_modules

# Copier le code source de l'API
COPY apps/api ./apps/api

# Copier aussi le package.json racine pour Next.js
COPY package.json ./

# Se placer dans le dossier API et build
WORKDIR /repo/apps/api
ENV NEXT_TELEMETRY_DISABLED=1
RUN bun run build

# Étape 3: Image de production
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Créer un utilisateur non-root
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 payloaduser

# Copier les fichiers nécessaires depuis le builder
COPY --from=builder --chown=payloaduser:nodejs /repo/apps/api/public ./public
COPY --from=builder --chown=payloaduser:nodejs /repo/apps/api/.next/standalone ./
COPY --from=builder --chown=payloaduser:nodejs /repo/apps/api/.next/static ./.next/static

USER payloaduser

# Exposer le port
EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Démarrer l'application avec Bun
CMD ["bun", "run", "server.js"]