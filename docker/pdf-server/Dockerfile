FROM node:20-slim
WORKDIR /app

# Install dependencies and copy only necessary files
COPY package.json package-lock.json* ./
COPY scripts ./scripts
COPY src/styles ./src/styles
COPY src/app/components/printable-table.css ./src/app/components/

RUN npm ci --omit=dev || npm install --no-audit --no-fund

EXPOSE 3001
ENV PORT=3001

CMD ["node", "scripts/pdf-server.js"]
