# =========================
# BUILD STAGE
# =========================
FROM node:20-alpine AS builder

WORKDIR /app


COPY package*.json ./

RUN npm ci

COPY . .

RUN npm run build

# =========================
# DISTROLESS PRODUCTION
# =========================
FROM gcr.io/distroless/nodejs20-debian12

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Distroless already has nonroot user
USER nonroot:nonroot

# Copy standalone production files
COPY --from=builder --chown=nonroot:nonroot /app/.next/standalone ./
COPY --from=builder --chown=nonroot:nonroot /app/.next/static ./.next/static
COPY --from=builder --chown=nonroot:nonroot /app/public ./public

EXPOSE 3002

CMD ["server.js"]