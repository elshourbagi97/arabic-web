FROM node:20-slim
WORKDIR /app

# Copy project files necessary for frontend build
COPY package.json package-lock.json* ./
COPY src ./src
COPY index.html ./
COPY vite.config.ts ./
COPY tsconfig.json* ./

RUN npm ci || npm install

EXPOSE 5173

CMD ["sh", "-c", "npm run dev -- --host 0.0.0.0"]
