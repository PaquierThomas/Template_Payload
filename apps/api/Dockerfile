# Utiliser l'image officielle Bun
FROM oven/bun:1 AS base

# Étape 1: Installation des dépendances
FROM base AS deps
WORKDIR /app

# Copier SEULEMENT les fichiers de l'app API
COPY apps/api/package.json ./
COPY apps/api/bun.lock* ./

# Installer les dépendances
RUN bun install --frozen-lockfile

# Étape 2: Build de l'application
FROM base AS builder
WORKDIR /app

# Copier les node_modules depuis l'étape deps
COPY --from=deps /app/node_modules ./node_modules

# Copier tout le code source de l'API
COPY apps/api ./

# Build de l'application Next.js/Payload
ENV NEXT_TELEMETRY_DISABLED=1
RUN bun run build

# Étape 3: Image de production
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Créer un utilisateur non-root (syntaxe Debian)
RUN groupadd --system --gid 1001 nodejs && \
    useradd --system --uid 1001 --gid nodejs payloaduser

# Copier les fichiers nécessaires depuis le builder
COPY --from=builder --chown=payloaduser:nodejs /app/public ./public
COPY --from=builder --chown=payloaduser:nodejs /app/.next/standalone ./
COPY --from=builder --chown=payloaduser:nodejs /app/.next/static ./.next/static

USER payloaduser

# Exposer le port
EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Démarrer l'application avec Bun
CMD ["bun", "run", "server.js"]