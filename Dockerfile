# Use official Node.js LTS
FROM node:20-bullseye-slim

# Install system dependencies for canvas (used for image generation)
RUN apt-get update && apt-get install -y --no-install-recommends \
  build-essential libcairo2-dev libpango1.0-dev libjpeg-dev libgif-dev librsvg2-dev \
  && rm -rf /var/lib/apt/lists/*

# Create working directory
WORKDIR /usr/src/app

# Copy package files first for caching
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Ensure cache directory exists
RUN mkdir -p cache

# Set environment
ENV NODE_ENV=production
ENV PORT=5000

EXPOSE 5000

CMD ["node", "src/app.js"]
