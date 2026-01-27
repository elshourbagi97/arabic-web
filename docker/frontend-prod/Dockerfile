FROM node:20 AS builder
WORKDIR /app

COPY package.json package-lock.json* ./
COPY index.html ./
COPY vite.config.ts ./
COPY tsconfig.json* ./
COPY src ./src

RUN npm ci --no-audit --no-fund
RUN npm run build

FROM nginx:stable-alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY docker/frontend-prod/default.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
