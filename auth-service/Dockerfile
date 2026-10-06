# Stage 1: Build
FROM node:18-alpine AS builder
RUN apk add --no-cache openssl
WORKDIR /app
COPY package*.json ./
RUN npm ci --only-production
COPY prisma ./prisma
RUN npx prisma generate

# Stage 2: Production
FROM node:18-alpine AS production
RUN apk add --no-cache openssl
WORKDIR /app
ENV NODE_ENV production
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/prisma ./prisma
COPY src ./src
COPY package.json ./

EXPOSE 3003

CMD ["sh", "-c", "npx prisma migrate deploy && node src/index.js"]