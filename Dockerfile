FROM node:18

# Install required libs for Chromium
RUN apt-get update && apt-get install -y \
  libnspr4 \
  libnss3 \
  libatk1.0-0 \
  libatk-bridge2.0-0 \
  libcups2 \
  libxkbcommon0 \
  libxcomposite1 \
  libxrandr2 \
  libgbm1 \
  libasound2 \
  libpangocairo-1.0-0 \
  libgtk-3-0 \
  libx11-xcb1 \
  libxcb-dri3-0 \
  libdrm2 \
  libxdamage1 \
  libxfixes3 \
  libxext6 \
  libxrender1 \
  libxi6 \
  ca-certificates \
  fonts-liberation \
  wget \
  --no-install-recommends

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

CMD ["node", "server.js"]