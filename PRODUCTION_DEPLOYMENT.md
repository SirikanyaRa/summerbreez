# 🚀 Enhanced Production Deployment Guide

## 🎯 Production-Ready Enhancements

### ✅ What's New in This Version
- **Security**: Helmet.js, CSP, CORS configuration
- **Performance**: Compression, keep-alive connections
- **Monitoring**: Health checks, graceful shutdown
- **Reliability**: Error handling, session management
- **Production**: Environment configuration, logging

## 🔧 Prerequisites

- Node.js 18+
- npm 8+
- Git
- Docker (optional)

## 📦 Quick Start

### 1. Install Enhanced Dependencies
```bash
npm install
```

New production dependencies added:
- `helmet` - Security headers
- `compression` - Response compression  
- `dotenv` - Environment configuration

### 2. Environment Setup
```bash
# Copy environment template
cp .env.example .env

# Edit for production
# NODE_ENV=production
# PORT=3000
# CORS_ORIGIN=https://yourdomain.com
```

### 3. Pre-deployment Checks
```bash
# Run enhanced preparation script
npm run deploy:prepare

# Or manual checks:
npm run prestart  # syntax check
npm test         # run tests
npm run health   # health check
```

## 🌐 Deployment Options

### Option 1: Railway (Fastest)
1. Push to GitHub
2. Connect at [railway.app](https://railway.app)
3. Auto-deploy in 2-3 minutes

### Option 2: Heroku (Traditional)
```bash
heroku create your-app-name
heroku config:set NODE_ENV=production
git push heroku main
```

### Option 3: Docker (Production)
```bash
# Single container
npm run docker:build
npm run docker:run

# Full stack with nginx
docker-compose --profile with-nginx up -d

# With monitoring
docker-compose --profile with-monitoring up -d
```

### Option 4: Digital Ocean
```bash
# App Platform deployment
# Connect GitHub repo
# Build: npm ci --production
# Run: npm start
```

## 🔒 Security Features

### Enhanced Security Headers
```javascript
// Automatically applied in production
helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"]
    }
  }
})
```

### CORS Configuration
```bash
# Production environment variable
CORS_ORIGIN=https://yourdomain.com
```

## ⚡ Performance Features

### Automatic Optimizations
- **Gzip compression** for all responses
- **Keep-alive connections** for better throughput
- **Graceful shutdown** handling
- **Memory management** with limits

### Health Monitoring
```bash
# Health check endpoint
curl http://localhost:3000/health

# Response includes:
# - Status, uptime, version
# - Environment info
# - System health
```

## 🛠 Production Scripts

```bash
# Start production server
npm start

# Run health check
npm run health

# Diagnose issues  
npm run diagnose

# Docker operations
npm run docker:build
npm run docker:run
npm run docker:compose
npm run docker:stop
npm run docker:logs

# Heroku operations
npm run deploy:heroku
npm run logs:heroku
```

## 🔍 Monitoring & Debugging

### Debug Endpoints
```bash
# Application health
GET /health

# Active scraping sessions
GET /api/debug/sessions

# Available data files
GET /api/data-files
```

### Production Logging
```javascript
// Automatic request logging
[2024-01-15T10:30:45.123Z] GET /health - 192.168.1.1
[2024-01-15T10:30:46.456Z] POST /api/scrape - 192.168.1.1
```

## 🐳 Docker Production Setup

### Enhanced Dockerfile Features
- **Multi-layer optimization** for faster builds
- **Non-root user** for security
- **Signal handling** with dumb-init
- **Health checks** built-in

### Docker Compose Profiles
```bash
# Basic deployment
docker-compose up -d

# With nginx reverse proxy
docker-compose --profile with-nginx up -d

# With auto-updates monitoring
docker-compose --profile with-monitoring up -d
```

## 🔧 Environment Variables

### Required
```bash
NODE_ENV=production
PORT=3000
```

### Optional
```bash
CORS_ORIGIN=https://yourdomain.com
MAX_RETRIES=3
CAPTCHA_TIMEOUT=300000
REQUEST_DELAY=2000
LOG_LEVEL=info
```

## 🚨 Troubleshooting

### Common Issues

1. **Port conflicts**
   ```bash
   PORT=8080 npm start
   ```

2. **Memory issues**
   ```bash
   # Increase Docker limits
   deploy:
     resources:
       limits:
         memory: 1G
   ```

3. **Health check failures**
   ```bash
   # Test health endpoint
   curl http://localhost:3000/health
   
   # Check application logs
   npm run docker:logs
   ```

### Debug Commands
```bash
# Test all endpoints
curl http://localhost:3000/health
curl http://localhost:3000/api/data-files
curl http://localhost:3000/api/debug/sessions

# Monitor Docker health
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
```

## 📊 Production Best Practices

### 1. Process Management
```bash
# Use PM2 for production
npm install -g pm2
pm2 start server.js --name postcode-scraper
pm2 save && pm2 startup
```

### 2. SSL/TLS Setup
```bash
# Let's Encrypt with nginx
certbot --nginx -d yourdomain.com
```

### 3. Monitoring Setup
- Health check monitoring (Uptime Robot)
- Log aggregation (ELK stack)
- Performance monitoring (New Relic/DataDog)

### 4. Backup Strategy
```bash
# Automated data backups
tar -czf backup-$(date +%Y%m%d).tar.gz data/
```

## ✅ Deployment Checklist

- [ ] **Dependencies**: npm ci --production ✅
- [ ] **Tests**: All tests passing ✅
- [ ] **Environment**: Production variables set ✅
- [ ] **Security**: Helmet & CORS configured ✅
- [ ] **Health**: Health checks working ✅
- [ ] **Monitoring**: Endpoints accessible ✅
- [ ] **Performance**: Compression enabled ✅
- [ ] **Logging**: Request logging active ✅
- [ ] **Graceful**: Shutdown handling ✅
- [ ] **Docker**: Health checks configured ✅

## 🎉 Success!

Your enhanced postcode scraper is now **production-ready** with:

- 🔒 **Enterprise security** (Helmet, CSP, CORS)
- ⚡ **High performance** (compression, keep-alive)
- 📊 **Full monitoring** (health checks, logging)
- 🛡️ **Error resilience** (graceful shutdown, error handling)
- 🐳 **Container ready** (optimized Docker setup)

Visit your deployed app and enjoy the enhanced stability and security!
