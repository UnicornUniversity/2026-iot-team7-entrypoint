FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY src .
RUN npm run build
EXPOSE 3005
CMD ["node", "dist/main.js"]