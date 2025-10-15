FROM node:18-alpine AS frontend-builder

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

FROM node:18-alpine AS backend

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY --from=frontend-builder /app/.next ./.next
COPY --from=frontend-builder /app/public ./public
COPY --from=frontend-builder /app/prisma ./prisma
COPY . .

EXPOSE 3000

CMD ["npm", "start"]