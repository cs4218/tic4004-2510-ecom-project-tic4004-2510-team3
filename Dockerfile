# Backend - Enhanced Security Dockerfile
FROM node:18-alpine AS builder

# Install security updates
RUN apk update && apk upgrade

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production && npm audit fix

FROM node:18-alpine
RUN apk update && apk upgrade

WORKDIR /app

# Create non-root user with specific UID
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001

COPY --from=builder /app/node_modules ./node_modules
COPY --chown=nextjs:nodejs . .

# Security: Run as non-root user
USER nextjs

# Security: Don't run as root
EXPOSE 6060

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node healthcheck.js

CMD ["node", "server.js"]