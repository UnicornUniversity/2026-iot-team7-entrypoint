FROM node:20-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . ./
RUN npm run build

FROM node:20-alpine
WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY --from=builder /app/dist ./dist

RUN mkdir -p ./certs
COPY certs/ca-cert.pem ./certs/
COPY certs/server-cert.pem ./certs/
COPY certs/server-key.pem ./certs/

# Security permissions
RUN chmod 600 ./certs/*-key.pem && chmod 644 ./certs/*-cert.pem ./certs/ca-cert.pem

EXPOSE 8080
ENV PORT=8080
ENV NODE_ENV=production

CMD ["node", "dist/main.js"]