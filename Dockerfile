FROM node:18-alpine

# Install security updates and required packages
RUN apk update && apk upgrade && \
    apk add --no-cache dumb-init

# Set working directory
WORKDIR /app

# Create non-root user early
RUN addgroup -g 1001 -S nodejs && \
    adduser -S scraper -u 1001 -G nodejs

# Copy package files first for better caching
COPY --chown=scraper:nodejs package*.json ./

# Create a special deployment-only package.json without Puppeteer
RUN echo '{"name":"postcode-scraper-app","version":"1.0.0","type":"module","dependencies":{"express":"^4.18.2","axios":"^1.6.0","cheerio":"^1.0.0-rc.12","fs-extra":"^11.1.1","cors":"^2.8.5"}}' > deployment-package.json && \
    mv deployment-package.json package.json

# Install dependencies without Puppeteer
RUN npm install && \
    npm cache clean --force && \
    rm -rf /tmp/*

# Copy application code
COPY --chown=scraper:nodejs . .

# Create necessary directories
RUN mkdir -p data logs temp && \
    chown -R scraper:nodejs /app

# Switch to non-root user
USER scraper

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD node healthcheck.js

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Start application
CMD ["npm", "start"]
