FROM node:20-alpine

WORKDIR /app

# Copy package files first for better caching
COPY package*.json ./

# Install dependencies (only production to keep image small)
RUN npm ci --only=production

# Copy source code
COPY src/ ./src/

# Expose port (configured via env or defaults to 5000)
EXPOSE 5000

# Set environment variable defaults
ENV NODE_ENV=production
ENV PORT=5000

# Start server
CMD ["node", "src/index.mjs"]
