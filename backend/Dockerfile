FROM node:22-bookworm-slim

# Chromium precisa destas bibliotecas nativas para iniciar no Linux.
RUN apt-get update \
  && apt-get install -y --no-install-recommends \
    ca-certificates \
    ghostscript \
    fonts-liberation \
    libasound2 \
    libatk-bridge2.0-0 \
    libatk1.0-0 \
    libc6 \
    libcairo2 \
    libcups2 \
    libdbus-1-3 \
    libexpat1 \
    libfontconfig1 \
    libgbm1 \
    libgcc-s1 \
    libglib2.0-0 \
    libgtk-3-0 \
    libnspr4 \
    libnss3 \
    libpango-1.0-0 \
    libx11-6 \
    libx11-xcb1 \
    libxcb1 \
    libxcomposite1 \
    libxdamage1 \
    libxext6 \
    libxfixes3 \
    libxkbcommon0 \
    libxrandr2 \
    libxss1 \
    libxtst6 \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package*.json ./
# A compilação TypeScript precisa das devDependencies (@types/*, tsc, Prisma).
# Elas são removidas somente depois que a imagem foi compilada.
RUN npm ci --include=dev

COPY prisma ./prisma
COPY src ./src
COPY tsconfig.json ./

RUN npm run build
RUN npm prune --omit=dev

ENV NODE_ENV=production

EXPOSE 4000

CMD ["npm", "start"]
