FROM node:20-alpine AS deps

WORKDIR /app
COPY package*.json ./
RUN npm ci

FROM deps AS dev

COPY . .
ENV HOSTNAME=0.0.0.0
ENV PORT=3001
CMD ["npm", "run", "dev"]

FROM deps AS builder

COPY . .
RUN npm run build

FROM node:20-alpine AS production

WORKDIR /app

RUN addgroup -S appgroup && adduser -S appuser -G appgroup

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

USER appuser

ENV PORT=3001
ENV HOSTNAME=0.0.0.0

EXPOSE 3001
CMD ["node", "server.js"]
