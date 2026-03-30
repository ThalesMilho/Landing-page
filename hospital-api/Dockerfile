FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

RUN apk add --no-cache curl openssl
RUN npm ci

COPY . .

RUN npx prisma generate
RUN npm run build

RUN mkdir -p uploads

EXPOSE 3001

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3001/health || exit 1

CMD ["node", "dist/server.js"]
