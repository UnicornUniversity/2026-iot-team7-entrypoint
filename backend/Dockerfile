FROM node:20-alpine AS builder
# Working directory pro builder stage
WORKDIR /app

# Kopírujeme package.json soubory (relativně k root kontextu)
COPY package*.json ./
RUN npm ci

# Kopírujeme celý backend kód (včetně src, certs atd.)
COPY . ./
RUN npm run build

# === Production stage ===
FROM node:20-alpine
WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

# Kopírujeme built aplikaci
COPY --from=builder /app/dist ./dist

# === mTLS Certificates ===
COPY certs ./certs

# Security permissions
RUN chmod -R 600 ./certs/*-key.pem && chmod -R 644 ./certs/*.pem

EXPOSE 8080
ENV PORT=8080
ENV NODE_ENV=production

CMD ["node", "dist/main.js"]