# ── Stage 1: 빌드 ──
FROM node:20-slim AS builder

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

# ── Stage 2: Nginx로 서빙 ──
FROM nginx:alpine

# Nginx 설정 복사
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 빌드 결과 복사
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
    CMD wget -qO- http://localhost/health || exit 1

CMD ["nginx", "-g", "daemon off;"]