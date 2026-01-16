# Utiliser l'image officielle Bun
FROM oven/bun:1 AS base

# Étape 1: Installation des dépendances
FROM base AS deps
WORKDIR /app

# Copier les fichiers de dépendances
COPY package.json bun.lockb ./

# Installer les dépendances
RUN bun install --frozen-lockfile

# Étape 2: Build de l'application
FROM base AS builder
WORKDIR /app

# Copier les node_modules depuis l'étape deps
COPY --from=deps /app/node_modules ./node_modules

# Copier tout le code source
COPY . .

# Build de l'application Next.js/Payload
RUN bun run build

# Étape 3: Image de production
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

# Créer un utilisateur non-root
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 payloaduser

# Copier les fichiers nécessaires
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Donner les permissions
RUN chown -R payloaduser:nodejs /app

USER payloaduser

# Exposer le port
EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Démarrer l'application
CMD ["node", "server.js"]